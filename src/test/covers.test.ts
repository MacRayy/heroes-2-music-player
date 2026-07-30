import { describe, expect, it } from 'vitest'

import { coverCandidates, coverDims, coverKeyForTrack, coverSizes } from '@/data/covers'
import { TRACKS } from '@/data/tracks'

describe('coverKeyForTrack', () => {
  it('strips the -sw variant suffix to the base faction cover', () => {
    const sw = TRACKS.find((track) => track.id.endsWith('-sw'))
    expect(sw).toBeDefined()
    if (sw !== undefined) {
      expect(coverKeyForTrack(sw)).toBe(sw.id.replace(/-sw$/v, ''))
    }
  })

  it('falls back to the category cover when there is no per-track cover', () => {
    const menu = TRACKS.find((track) => track.id === 'menu-main')
    expect(menu === undefined ? null : coverKeyForTrack(menu)).toBe('menu')
  })

  it('resolves every track to an existing cover key', () => {
    for (const track of TRACKS) {
      expect(coverKeyForTrack(track)).not.toBeNull()
    }
  })

  it('candidates are id-minus-sw then category', () => {
    const sw = TRACKS.find((track) => track.id.endsWith('-sw'))
    expect(sw).toBeDefined()
    if (sw !== undefined) {
      expect(coverCandidates(sw)).toEqual([sw.id.replace(/-sw$/v, ''), sw.category])
    }
  })
})

describe('coverSizes', () => {
  it('returns WxH from the manifest', () => {
    expect(coverSizes('menu')).toMatch(/^\d+x\d+$/v)
  })

  it('returns empty string for an unknown key', () => {
    expect(coverSizes('not-a-real-cover')).toBe('')
  })
})

describe('coverDims', () => {
  it('returns positive width/height for a known key', () => {
    const dims = coverDims('menu')
    expect(dims).not.toBeNull()
    expect((dims?.width ?? 0) > 0 && (dims?.height ?? 0) > 0).toBe(true)
  })

  it('returns null for an unknown key', () => {
    expect(coverDims('not-a-real-cover')).toBeNull()
  })
})
