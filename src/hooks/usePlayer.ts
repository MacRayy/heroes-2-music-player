import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { resolveAudioUrl } from '@/data/manifest'
import { type Scope, type Track, TRACKS } from '@/data/tracks'

import { usePlayerEngine } from './usePlayerEngine'

export type RepeatMode = 'off' | 'all' | 'one'

const VOLUME_STORAGE_KEY = 'h2mp-volume'
const DEFAULT_VOLUME = 0.7

/** Track ids within a scope. `all` = all music (excludes stings); otherwise a single category. */
export function tracksInScope(scope: Scope): readonly string[] {
  return TRACKS.filter((track) =>
    scope === 'all' ? track.category !== 'sting' : track.category === scope,
  ).map((track) => track.id)
}

export interface PlayerState {
  /** Active scope filter. */
  readonly scope: Scope
  /** Playback order of track ids within the scope (shuffled when `shuffle` is on). */
  readonly order: readonly string[]
  readonly currentId: string | null
  readonly isPlaying: boolean
  readonly shuffle: boolean
  readonly repeat: RepeatMode
  readonly volume: number
  /** Bumped whenever a fresh (re)start of `currentId` should occur — drives the load effect. */
  readonly epoch: number
}

export type PlayerAction =
  | { readonly type: 'togglePlay' }
  | { readonly type: 'next' }
  | { readonly type: 'prev' }
  | { readonly type: 'ended' }
  | { readonly type: 'setShuffle'; readonly value: boolean; readonly order: readonly string[] }
  | {
      readonly type: 'setScope'
      readonly value: Scope
      readonly order: readonly string[]
      readonly currentId: string | null
      readonly restart: boolean
    }
  | { readonly type: 'cycleRepeat' }
  | { readonly type: 'setVolume'; readonly value: number }

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function nextRepeat(mode: RepeatMode): RepeatMode {
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

/**
 * Move `delta` steps through `order`. When `circular` (manual next/prev), it always wraps around
 * the ends. Otherwise (auto-advance on `ended`) it honors repeat: wrap only under repeat 'all',
 * else stop (pause) past the end.
 */
function advance(state: PlayerState, delta: number, circular: boolean): PlayerState {
  const { order, currentId, repeat } = state
  if (order.length === 0) {
    return state
  }
  const wrap = circular || repeat === 'all'
  const idx = currentId === null ? -1 : order.indexOf(currentId)
  let nextIdx = idx + delta
  if (nextIdx >= order.length) {
    if (!wrap) {
      return { ...state, isPlaying: false }
    }
    nextIdx = 0
  } else if (nextIdx < 0) {
    nextIdx = wrap ? order.length - 1 : 0
  }
  const nextId = order[nextIdx] ?? currentId
  return { ...state, currentId: nextId, isPlaying: true, epoch: state.epoch + 1 }
}

export function createInitialState(volume: number = DEFAULT_VOLUME): PlayerState {
  const order = tracksInScope('all')
  return {
    scope: 'all',
    order,
    currentId: order[0] ?? null,
    isPlaying: false,
    shuffle: false,
    repeat: 'off',
    volume: clamp01(volume),
    epoch: 0,
  }
}

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'togglePlay':
      return state.currentId === null ? state : { ...state, isPlaying: !state.isPlaying }
    case 'next':
      // Manual next always wraps around the end.
      return advance(state, 1, true)
    case 'prev':
      // Manual prev always wraps around the start.
      return advance(state, -1, true)
    case 'ended':
      // Auto-advance honors repeat (stop at end when 'off'). Repeat-one is handled imperatively
      // in the engine (seek 0 + play) and never dispatches 'ended'.
      return advance(state, 1, false)
    case 'setShuffle':
      return { ...state, shuffle: action.value, order: action.order }
    case 'setScope':
      return {
        ...state,
        scope: action.value,
        order: action.order,
        currentId: action.currentId,
        epoch: action.restart ? state.epoch + 1 : state.epoch,
      }
    case 'cycleRepeat':
      return { ...state, repeat: nextRepeat(state.repeat) }
    case 'setVolume':
      return { ...state, volume: clamp01(action.value) }
    default:
      return state
  }
}

/** Fisher–Yates shuffle that keeps `first` at the front (so toggling shuffle keeps playing). */
export function shuffledOrder(ids: readonly string[], first: string | null): string[] {
  const rest = ids.filter((id) => id !== first)
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = rest[i]
    const b = rest[j]
    if (a !== undefined && b !== undefined) {
      rest[i] = b
      rest[j] = a
    }
  }
  return first === null ? rest : [first, ...rest]
}

/** Pure plan for a scope switch: keep the current track if still in scope, else jump to the first. */
export function planScopeChange(
  nextScope: Scope,
  currentId: string | null,
  shuffle: boolean,
): { order: readonly string[]; currentId: string | null; restart: boolean } {
  const ids = tracksInScope(nextScope)
  const keep = currentId !== null && ids.includes(currentId)
  const nextId = keep ? currentId : (ids[0] ?? null)
  const order = shuffle ? shuffledOrder(ids, nextId) : ids
  return { order, currentId: nextId, restart: !keep }
}

function readStoredVolume(): number {
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

export interface PlayerApi extends PlayerState {
  readonly tracks: readonly Track[]
  readonly currentTrack: Track | null
  readonly audioRef: React.RefObject<HTMLAudioElement | null>
  readonly togglePlay: () => void
  readonly next: () => void
  readonly prev: () => void
  readonly cycleRepeat: () => void
  readonly toggleShuffle: () => void
  readonly setScope: (scope: Scope) => void
  readonly setVolume: (value: number) => void
}

export function usePlayer(): PlayerApi {
  const [state, dispatch] = useReducer(playerReducer, undefined, () =>
    createInitialState(readStoredVolume()),
  )

  const stateRef = useRef(state)
  stateRef.current = state

  const engine = usePlayerEngine({
    onEnded: () => {
      if (stateRef.current.repeat === 'one') {
        engine.seek(0)
        engine.play()
        return
      }
      dispatch({ type: 'ended' })
    },
    onError: (message) => {
      // No-throw; auto-skip on error is deferred (see wiki/backlog.md).
      console.error(message)
    },
  })

  const byId = useMemo(() => new Map(TRACKS.map((track) => [track.id, track])), [])
  const currentTrack = state.currentId === null ? null : (byId.get(state.currentId) ?? null)

  // Load (and optionally play) whenever the selected track or its epoch changes.
  useEffect(() => {
    if (currentTrack === null) {
      return
    }
    engine.load(resolveAudioUrl(currentTrack.file), stateRef.current.isPlaying)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on id+epoch only; epoch covers repeat-one replays, and engine/isPlaying are read via refs on purpose
  }, [state.currentId, state.epoch])

  // Reflect play/pause toggles that don't change the track.
  useEffect(() => {
    if (state.isPlaying) {
      engine.play()
    } else {
      engine.pause()
    }
  }, [state.isPlaying, engine])

  // Apply + persist volume.
  useEffect(() => {
    engine.setVolume(state.volume)
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(state.volume))
    } catch {
      // localStorage unavailable — non-fatal.
    }
  }, [state.volume, engine])

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
    const { shuffle, currentId, scope } = stateRef.current
    const value = !shuffle
    const ids = tracksInScope(scope)
    const order = value ? shuffledOrder(ids, currentId) : ids
    dispatch({ type: 'setShuffle', value, order })
  }, [])
  const setScope = useCallback((value: Scope): void => {
    if (value === stateRef.current.scope) {
      return
    }
    const { currentId, shuffle } = stateRef.current
    const plan = planScopeChange(value, currentId, shuffle)
    dispatch({
      type: 'setScope',
      value,
      order: plan.order,
      currentId: plan.currentId,
      restart: plan.restart,
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
