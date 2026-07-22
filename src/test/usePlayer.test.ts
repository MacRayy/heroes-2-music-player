import { describe, expect, it } from 'vitest'

import { TRACKS } from '@/data/tracks'
import {
  createInitialState,
  playerReducer,
  type PlayerState,
  type RepeatMode,
  shuffledOrder,
} from '@/hooks/usePlayer'

const IDS = TRACKS.map((track) => track.id)

function idAt(index: number): string {
  const value = IDS[index]
  if (value === undefined) {
    throw new Error(`no track id at index ${index}`)
  }
  return value
}

const FIRST = idAt(0)
const SECOND = idAt(1)
const LAST = idAt(IDS.length - 1)

function stateAt(id: string, overrides: Partial<PlayerState> = {}): PlayerState {
  return { ...createInitialState(), currentId: id, ...overrides }
}

describe('playerReducer', () => {
  it('togglePlay flips isPlaying but is a no-op with no track', () => {
    const paused = stateAt(FIRST, { isPlaying: false })
    expect(playerReducer(paused, { type: 'togglePlay' }).isPlaying).toBe(true)
    const playing = stateAt(FIRST, { isPlaying: true })
    expect(playerReducer(playing, { type: 'togglePlay' }).isPlaying).toBe(false)
    const noTrack = playerReducer(
      { ...createInitialState(), currentId: null },
      { type: 'togglePlay' },
    )
    expect(noTrack.isPlaying).toBe(false)
  })

  it('next advances to the following track', () => {
    const after = playerReducer(stateAt(FIRST, { isPlaying: true }), { type: 'next' })
    expect(after.currentId).toBe(SECOND)
    expect(after.isPlaying).toBe(true)
  })

  it('next at end of list stops when repeat is off', () => {
    const after = playerReducer(stateAt(LAST, { isPlaying: true, repeat: 'off' }), { type: 'next' })
    expect(after.currentId).toBe(LAST)
    expect(after.isPlaying).toBe(false)
  })

  it('next at end wraps to the first when repeat is all', () => {
    const after = playerReducer(stateAt(LAST, { isPlaying: true, repeat: 'all' }), { type: 'next' })
    expect(after.currentId).toBe(FIRST)
    expect(after.isPlaying).toBe(true)
  })

  it('prev at start clamps under repeat off and wraps under repeat all', () => {
    expect(playerReducer(stateAt(FIRST, { repeat: 'off' }), { type: 'prev' }).currentId).toBe(FIRST)
    expect(playerReducer(stateAt(FIRST, { repeat: 'all' }), { type: 'prev' }).currentId).toBe(LAST)
  })

  it('ended advances to the next track (repeat-one replay is handled by the engine)', () => {
    const advanced = playerReducer(stateAt(FIRST, { isPlaying: true }), { type: 'ended' })
    expect(advanced.currentId).toBe(SECOND)
    // Under repeat-one the engine replays imperatively and never dispatches 'ended',
    // so the reducer still just advances if it ever receives it.
    const underOne = playerReducer(stateAt(FIRST, { isPlaying: true, repeat: 'one' }), {
      type: 'ended',
    })
    expect(underOne.currentId).toBe(SECOND)
  })

  it('cycleRepeat goes off → all → one → off', () => {
    const modes: RepeatMode[] = []
    let s = createInitialState()
    for (let i = 0; i < 3; i += 1) {
      s = playerReducer(s, { type: 'cycleRepeat' })
      modes.push(s.repeat)
    }
    expect(modes).toEqual(['all', 'one', 'off'])
  })

  it('setVolume clamps to 0..1', () => {
    expect(playerReducer(createInitialState(), { type: 'setVolume', value: 2 }).volume).toBe(1)
    expect(playerReducer(createInitialState(), { type: 'setVolume', value: -1 }).volume).toBe(0)
  })

  it('setShuffle swaps in the provided order', () => {
    const order = [SECOND, FIRST]
    const after = playerReducer(createInitialState(), { type: 'setShuffle', value: true, order })
    expect(after.shuffle).toBe(true)
    expect(after.order).toEqual(order)
  })
})

describe('shuffledOrder', () => {
  it('keeps the current track first and preserves the full set', () => {
    const order = shuffledOrder(IDS, FIRST)
    expect(order[0]).toBe(FIRST)
    expect([...order].sort()).toEqual([...IDS].sort())
  })

  it('handles a null current track', () => {
    const order = shuffledOrder(IDS, null)
    expect([...order].sort()).toEqual([...IDS].sort())
  })
})
