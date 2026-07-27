import { describe, expect, it } from 'vitest'

import artManifestJson from '@/data/art-manifest.json'
import { ASSET_THEMES, ASSETS } from '@/data/assets'

const artManifest: Record<string, { file: string; width: number; height: number; slice?: number }> =
  artManifestJson

describe('art manifest coverage', () => {
  const expectedKeys = Object.keys(ASSETS).flatMap((role) =>
    ASSET_THEMES.map((theme) => `${role}.${theme}`),
  )

  it('has exactly one entry per role×theme (bijection)', () => {
    expect(Object.keys(artManifest).sort()).toEqual([...expectedKeys].sort())
  })

  it('every entry has the expected file name and positive dimensions', () => {
    for (const key of expectedKeys) {
      const entry = artManifest[key]
      expect(entry).toBeDefined()
      expect(entry?.file).toBe(`${key.replace('.', '-')}.png`)
      expect(entry?.width).toBeGreaterThan(0)
      expect(entry?.height).toBeGreaterThan(0)
    }
  })
})
