import { describe, expect, it } from 'vitest'

import { COVERS } from '@/data/assets'
import coverManifestJson from '@/data/cover-manifest.json'

const coverManifest: Record<string, { width: number; height: number }> = coverManifestJson

describe('cover manifest coverage', () => {
  it('has exactly one entry per COVERS key (bijection)', () => {
    expect(Object.keys(coverManifest).sort()).toEqual(Object.keys(COVERS).sort())
  })

  it('every entry has positive dimensions', () => {
    for (const key of Object.keys(COVERS)) {
      const entry = coverManifest[key]
      expect(entry).toBeDefined()
      expect(entry?.width).toBeGreaterThan(0)
      expect(entry?.height).toBeGreaterThan(0)
    }
  })
})
