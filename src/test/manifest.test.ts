import { describe, expect, it } from 'vitest'

import { audioManifest } from '@/data/manifest'
import { TRACKS } from '@/data/tracks'

// Authoritative fheroes2 castle mapping (mus.cpp, GOG/DOS scheme file = index − 1).
const CASTLE_BY_FILE: Record<string, string> = {
  homm2_04: 'Sorceress',
  homm2_05: 'Warlock',
  homm2_06: 'Necromancer',
  homm2_07: 'Knight',
  homm2_08: 'Barbarian',
  homm2_09: 'Wizard',
}

describe('audio manifest coverage', () => {
  const manifestIds = Object.keys(audioManifest)
  const trackIds = TRACKS.map((track) => track.id)

  it('has exactly one manifest entry per track (bijection)', () => {
    expect([...manifestIds].sort()).toEqual([...trackIds].sort())
  })

  it('has 45 tracks: 25 music + 20 stings', () => {
    expect(trackIds).toHaveLength(45)
    const stings = TRACKS.filter((track) => track.category === 'sting')
    expect(stings).toHaveLength(20)
    expect(TRACKS.length - stings.length).toBe(25)
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

describe('castle labeling guard (src → title)', () => {
  it('every castle track maps its source OGG to the correct castle name', () => {
    const towns = TRACKS.filter((track) => track.category === 'town')
    expect(towns).toHaveLength(12) // 6 base + 6 Succession Wars
    for (const track of towns) {
      const base = track.src.replace('sw/', '')
      const expected = CASTLE_BY_FILE[base]
      if (expected === undefined) {
        throw new Error(`castle track "${track.id}" has an unexpected src: ${track.src}`)
      }
      expect(track.title).toContain(expected)
    }
  })
})
