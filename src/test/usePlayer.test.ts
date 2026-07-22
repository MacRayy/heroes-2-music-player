import { describe, expect, it } from 'vitest'

import {
  createInitialState,
  planScopeChange,
  playerReducer,
  type PlayerState,
  type RepeatMode,
  shuffledOrder,
  tracksInScope,
} from '@/hooks/usePlayer'

const MUSIC = tracksInScope('all')
const STINGS = tracksInScope('sting')

function req(ids: readonly string[], index: number): string {
  const value = ids[index]
  if (value === undefined) {
    throw new Error(`no id at index ${index}`)
  }
  return value
}

const FIRST = req(MUSIC, 0)
const SECOND = req(MUSIC, 1)
const LAST = req(MUSIC, MUSIC.length - 1)

function stateAt(id: string, overrides: Partial<PlayerState> = {}): PlayerState {
  return { ...createInitialState(), currentId: id, ...overrides }
}

describe('tracksInScope', () => {
  it('all = music only (excludes stings), sting = stings only', () => {
    expect(MUSIC).toHaveLength(25)
    expect(STINGS).toHaveLength(20)
    expect(MUSIC.some((id) => STINGS.includes(id))).toBe(false)
  })

  it('category scopes return that category', () => {
    expect(tracksInScope('town')).toHaveLength(12) // 6 base + 6 SW
    expect(tracksInScope('battle')).toHaveLength(3)
    expect(tracksInScope('terrain')).toHaveLength(8)
  })
})

describe('playerReducer', () => {
  it('initial state is music-scoped and paused', () => {
    const s = createInitialState()
    expect(s.scope).toBe('all')
    expect(s.order).toEqual(MUSIC)
    expect(s.currentId).toBe(FIRST)
    expect(s.isPlaying).toBe(false)
  })

  it('togglePlay flips isPlaying but is a no-op with no track', () => {
    expect(
      playerReducer(stateAt(FIRST, { isPlaying: false }), { type: 'togglePlay' }).isPlaying,
    ).toBe(true)
    expect(
      playerReducer(stateAt(FIRST, { isPlaying: true }), { type: 'togglePlay' }).isPlaying,
    ).toBe(false)
    const noTrack = playerReducer(
      { ...createInitialState(), currentId: null },
      { type: 'togglePlay' },
    )
    expect(noTrack.isPlaying).toBe(false)
  })

  it('next advances to the following track', () => {
    expect(playerReducer(stateAt(FIRST, { isPlaying: true }), { type: 'next' }).currentId).toBe(
      SECOND,
    )
  })

  it('manual next always wraps end → start, regardless of repeat', () => {
    for (const repeat of ['off', 'all', 'one'] as const) {
      const after = playerReducer(stateAt(LAST, { isPlaying: true, repeat }), { type: 'next' })
      expect(after.currentId).toBe(FIRST)
      expect(after.isPlaying).toBe(true)
    }
  })

  it('manual prev always wraps start → end, regardless of repeat', () => {
    for (const repeat of ['off', 'all', 'one'] as const) {
      expect(playerReducer(stateAt(FIRST, { repeat }), { type: 'prev' }).currentId).toBe(LAST)
    }
  })

  it('auto-advance (ended) stops at end under repeat off but wraps under repeat all', () => {
    const stopped = playerReducer(stateAt(LAST, { isPlaying: true, repeat: 'off' }), {
      type: 'ended',
    })
    expect(stopped.currentId).toBe(LAST)
    expect(stopped.isPlaying).toBe(false)

    const wrapped = playerReducer(stateAt(LAST, { isPlaying: true, repeat: 'all' }), {
      type: 'ended',
    })
    expect(wrapped.currentId).toBe(FIRST)
    expect(wrapped.isPlaying).toBe(true)
  })

  it('ended advances to the next track mid-list', () => {
    expect(playerReducer(stateAt(FIRST, { isPlaying: true }), { type: 'ended' }).currentId).toBe(
      SECOND,
    )
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

  it('setScope applies order/currentId and bumps epoch only on restart', () => {
    const base = createInitialState()
    const restarted = playerReducer(base, {
      type: 'setScope',
      value: 'sting',
      order: STINGS,
      currentId: req(STINGS, 0),
      restart: true,
    })
    expect(restarted.scope).toBe('sting')
    expect(restarted.order).toEqual(STINGS)
    expect(restarted.epoch).toBe(base.epoch + 1)

    const kept = playerReducer(base, {
      type: 'setScope',
      value: 'all',
      order: MUSIC,
      currentId: base.currentId,
      restart: false,
    })
    expect(kept.epoch).toBe(base.epoch)
  })
})

describe('planScopeChange', () => {
  it('jumps to the first track when the current is out of the new scope (restart)', () => {
    const plan = planScopeChange('sting', FIRST, false)
    expect(plan.currentId).toBe(req(STINGS, 0))
    expect(plan.restart).toBe(true)
    expect(plan.order).toEqual(STINGS)
  })

  it('keeps the current track when it stays in scope (no restart)', () => {
    const townId = req(tracksInScope('town'), 0)
    const plan = planScopeChange('town', townId, false)
    expect(plan.currentId).toBe(townId)
    expect(plan.restart).toBe(false)
  })

  it('reshuffles within the new scope when shuffle is on, kept track first', () => {
    const plan = planScopeChange('all', FIRST, true)
    expect(plan.order[0]).toBe(FIRST)
    expect([...plan.order].sort()).toEqual([...MUSIC].sort())
  })
})

describe('shuffledOrder', () => {
  it('keeps the current track first and preserves the full set', () => {
    const order = shuffledOrder(MUSIC, FIRST)
    expect(order[0]).toBe(FIRST)
    expect([...order].sort()).toEqual([...MUSIC].sort())
  })

  it('handles a null current track', () => {
    expect([...shuffledOrder(MUSIC, null)].sort()).toEqual([...MUSIC].sort())
  })

  it('setShuffle swaps in the provided order', () => {
    const order = [SECOND, FIRST]
    const after = playerReducer(createInitialState(), { type: 'setShuffle', value: true, order })
    expect(after.shuffle).toBe(true)
    expect(after.order).toEqual(order)
  })
})
