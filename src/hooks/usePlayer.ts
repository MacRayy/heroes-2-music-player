import { type RefObject, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { resolveAudioUrl } from '@/data/manifest'
import { type Scope, type Track, TRACKS } from '@/data/tracks'

import { usePlayerEngine } from './usePlayerEngine'

export type RepeatMode = 'off' | 'all' | 'one'

const VOLUME_STORAGE_KEY = 'h2mp-volume'
const DEFAULT_VOLUME = 0.7

export const tracksInScope = (scope: Scope): readonly string[] =>
  TRACKS.filter((track) =>
    scope === 'all' ? track.category !== 'sting' : track.category === scope,
  ).map((track) => track.id)

export type PlayerState = {
  readonly scope: Scope
  readonly order: readonly string[]
  readonly currentId: string | null
  readonly isPlaying: boolean
  readonly isShuffle: boolean
  readonly repeat: RepeatMode
  readonly volume: number
  readonly epoch: number
}

export type PlayerAction =
  | { readonly type: 'togglePlay' }
  | { readonly type: 'next' }
  | { readonly type: 'prev' }
  | { readonly type: 'ended' }
  | { readonly type: 'setShuffle'; readonly isShuffle: boolean; readonly order: readonly string[] }
  | {
      readonly type: 'setScope'
      readonly value: Scope
      readonly order: readonly string[]
      readonly currentId: string | null
      readonly shouldRestart: boolean
    }
  | { readonly type: 'cycleRepeat' }
  | { readonly type: 'setVolume'; readonly value: number }

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

const nextRepeat = (mode: RepeatMode): RepeatMode => {
  switch (mode) {
    case 'off':
      return 'all'
    case 'all':
      return 'one'
    case 'one':
      return 'off'
    default:
      return 'off'
  }
}

const advance = (state: PlayerState, delta: number, isCircular: boolean): PlayerState => {
  const { order, currentId, repeat } = state
  if (order.length === 0) {
    return state
  }
  const shouldWrap = isCircular || repeat === 'all'
  const idx = currentId === null ? -1 : order.indexOf(currentId)
  const rawNext = idx + delta
  const isPastEnd = rawNext >= order.length
  const isBeforeStart = rawNext < 0
  if (isPastEnd && !shouldWrap) {
    return { ...state, isPlaying: false }
  }
  const nextIdx = isPastEnd ? 0 : isBeforeStart ? (shouldWrap ? order.length - 1 : 0) : rawNext
  const nextId = order[nextIdx] ?? currentId
  return { ...state, currentId: nextId, isPlaying: true, epoch: state.epoch + 1 }
}

export const createInitialState = (volume: number = DEFAULT_VOLUME): PlayerState => {
  const order = tracksInScope('all')
  return {
    scope: 'all',
    order,
    currentId: order[0] ?? null,
    isPlaying: false,
    isShuffle: false,
    repeat: 'off',
    volume: clamp01(volume),
    epoch: 0,
  }
}

export const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'togglePlay':
      return state.currentId === null ? state : { ...state, isPlaying: !state.isPlaying }
    case 'next':
      return advance(state, 1, true)
    case 'prev':
      return advance(state, -1, true)
    case 'ended':
      return advance(state, 1, false)
    case 'setShuffle':
      return { ...state, isShuffle: action.isShuffle, order: action.order }
    case 'setScope':
      return {
        ...state,
        scope: action.value,
        order: action.order,
        currentId: action.currentId,
        epoch: action.shouldRestart ? state.epoch + 1 : state.epoch,
      }
    case 'cycleRepeat':
      return { ...state, repeat: nextRepeat(state.repeat) }
    case 'setVolume':
      return { ...state, volume: clamp01(action.value) }
    default:
      return state
  }
}

export const shuffledOrder = (ids: readonly string[], first: string | null): readonly string[] => {
  const shuffled = ids
    .filter((id) => id !== first)
    .map((id) => ({ id, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.id)
  return first === null ? shuffled : [first, ...shuffled]
}

export const planScopeChange = (
  nextScope: Scope,
  currentId: string | null,
  isShuffle: boolean,
): { order: readonly string[]; currentId: string | null; shouldRestart: boolean } => {
  const ids = tracksInScope(nextScope)
  const isKept = currentId !== null && ids.includes(currentId)
  const nextId = isKept ? currentId : (ids[0] ?? null)
  const order = isShuffle ? shuffledOrder(ids, nextId) : ids
  return { order, currentId: nextId, shouldRestart: !isKept }
}

const readStoredVolume = (): number => {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY)
    if (raw === null) {
      return DEFAULT_VOLUME
    }
    const parsed = Number.parseFloat(raw)
    return Number.isNaN(parsed) ? DEFAULT_VOLUME : clamp01(parsed)
  } catch {
    return DEFAULT_VOLUME
  }
}

export type PlayerApi = PlayerState & {
  readonly tracks: readonly Track[]
  readonly currentTrack: Track | null
  readonly audioRef: RefObject<HTMLAudioElement | null>
  readonly togglePlay: () => void
  readonly next: () => void
  readonly prev: () => void
  readonly cycleRepeat: () => void
  readonly toggleShuffle: () => void
  readonly setScope: (scope: Scope) => void
  readonly setVolume: (value: number) => void
}

export const usePlayer = (): PlayerApi => {
  const [state, dispatch] = useReducer(playerReducer, undefined, () =>
    createInitialState(readStoredVolume()),
  )

  const stateRef = useRef(state)
  stateRef.current = state

  const engine = usePlayerEngine({
    // repeat-one loops natively via el.loop, so 'ended' only fires for off/all.
    onEnded: () => {
      dispatch({ type: 'ended' })
    },
    onError: (message) => {
      console.error(message)
    },
  })

  const byId = useMemo(() => new Map(TRACKS.map((track) => [track.id, track])), [])
  const currentTrack = state.currentId === null ? null : (byId.get(state.currentId) ?? null)

  useEffect(() => {
    if (currentTrack === null) {
      return
    }
    engine.load(resolveAudioUrl(currentTrack.file), stateRef.current.isPlaying)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on id+epoch only; epoch covers repeat-one replays, and engine/isPlaying are read via refs on purpose
  }, [state.currentId, state.epoch])

  useEffect(() => {
    if (state.isPlaying) {
      engine.play()
    } else {
      engine.pause()
    }
  }, [state.isPlaying, engine])

  useEffect(() => {
    engine.setVolume(state.volume)
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(state.volume))
    } catch {
      /* localStorage unavailable */
    }
  }, [state.volume, engine])

  useEffect(() => {
    engine.setLoop(state.repeat === 'one')
  }, [state.repeat, engine])

  const togglePlay = useCallback((): void => {
    dispatch({ type: 'togglePlay' })
  }, [])
  const next = useCallback((): void => {
    dispatch({ type: 'next' })
  }, [])
  const prev = useCallback((): void => {
    dispatch({ type: 'prev' })
  }, [])
  const cycleRepeat = useCallback((): void => {
    dispatch({ type: 'cycleRepeat' })
  }, [])
  const setVolume = useCallback((value: number): void => {
    dispatch({ type: 'setVolume', value })
  }, [])
  const toggleShuffle = useCallback((): void => {
    const { isShuffle, currentId, scope } = stateRef.current
    const nextIsShuffle = !isShuffle
    const ids = tracksInScope(scope)
    const order = nextIsShuffle ? shuffledOrder(ids, currentId) : ids
    dispatch({ type: 'setShuffle', isShuffle: nextIsShuffle, order })
  }, [])
  const setScope = useCallback((value: Scope): void => {
    if (value === stateRef.current.scope) {
      return
    }
    const { currentId, isShuffle } = stateRef.current
    const plan = planScopeChange(value, currentId, isShuffle)
    dispatch({
      type: 'setScope',
      value,
      order: plan.order,
      currentId: plan.currentId,
      shouldRestart: plan.shouldRestart,
    })
  }, [])

  return {
    ...state,
    tracks: TRACKS,
    currentTrack,
    audioRef: engine.audioRef,
    togglePlay,
    next,
    prev,
    cycleRepeat,
    toggleShuffle,
    setScope,
    setVolume,
  }
}
