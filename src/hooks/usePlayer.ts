import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { resolveAudioUrl } from '@/data/manifest'
import { type Track, TRACKS } from '@/data/tracks'

import { usePlayerEngine } from './usePlayerEngine'

export type RepeatMode = 'off' | 'all' | 'one'

const VOLUME_STORAGE_KEY = 'h2mp-volume'
const DEFAULT_VOLUME = 0.7
const DEFAULT_ORDER: readonly string[] = TRACKS.map((track) => track.id)

export interface PlayerState {
  /** Playback order of track ids (a shuffled permutation when `shuffle` is on). */
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

/** Move `delta` steps through `order`, honoring repeat mode. Stops (pauses) past the end. */
function advance(state: PlayerState, delta: number): PlayerState {
  const { order, currentId, repeat } = state
  if (order.length === 0) {
    return state
  }
  const idx = currentId === null ? -1 : order.indexOf(currentId)
  let nextIdx = idx + delta
  if (nextIdx >= order.length) {
    if (repeat !== 'all') {
      return { ...state, isPlaying: false }
    }
    nextIdx = 0
  } else if (nextIdx < 0) {
    nextIdx = repeat === 'all' ? order.length - 1 : 0
  }
  const nextId = order[nextIdx] ?? currentId
  return { ...state, currentId: nextId, isPlaying: true, epoch: state.epoch + 1 }
}

export function createInitialState(volume: number = DEFAULT_VOLUME): PlayerState {
  return {
    order: DEFAULT_ORDER,
    currentId: DEFAULT_ORDER[0] ?? null,
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
      return advance(state, 1)
    case 'prev':
      return advance(state, -1)
    case 'ended':
      // Repeat-one is handled imperatively in the engine (seek 0 + play) and never dispatches
      // 'ended', so here 'ended' is always a plain advance.
      return advance(state, 1)
    case 'setShuffle':
      return { ...state, shuffle: action.value, order: action.order }
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
    const { shuffle, currentId } = stateRef.current
    const value = !shuffle
    const order = value ? shuffledOrder(DEFAULT_ORDER, currentId) : DEFAULT_ORDER
    dispatch({ type: 'setShuffle', value, order })
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
    setVolume,
  }
}
