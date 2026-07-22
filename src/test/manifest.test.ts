import { describe, expect, it } from 'vitest'

import { audioManifest } from '@/data/manifest'
import { TRACKS } from '@/data/tracks'

describe('audio manifest coverage', () => {
  const manifestIds = Object.keys(audioManifest)
  const trackIds = TRACKS.map((track) => track.id)

  it('has exactly one manifest entry per track (bijection)', () => {
    expect([...manifestIds].sort()).toEqual([...trackIds].sort())
  })

  it('has 19 in-scope tracks', () => {
    expect(trackIds).toHaveLength(19)
  })

  it('manifest file matches the track file and duration is positive', () => {
    for (const track of TRACKS) {
      const entry = audioManifest[track.id]
      expect(entry).toBeDefined()
      expect(entry?.file).toBe(track.file)
      expect(entry?.durationSec).toBeGreaterThan(0)
    }
  })

  it('track ids and files are unique', () => {
    expect(new Set(trackIds).size).toBe(trackIds.length)
    const files = TRACKS.map((track) => track.file)
    expect(new Set(files).size).toBe(files.length)
  })
})
