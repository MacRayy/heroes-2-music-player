import coverManifest from './cover-manifest.json'
import type { Track } from './tracks'

const covers: Record<string, { width: number; height: number }> = coverManifest

// Album-cover keys for a track, most-specific first: its id (minus the `-sw` variant suffix), then
// its category. Shared by AlbumArt (on-screen) and Media Session (OS widget) so the two can't drift.
export const coverCandidates = (track: Track): readonly string[] => [
  track.id.replace(/-sw$/v, ''),
  track.category,
]

// The first candidate present in cover-manifest.json, else null.
//
// NOTE: this is a *static manifest* lookup, unlike AlbumArt which probes each candidate via
// `<img onError>` and so also picks up hand-dropped `public/art/covers/*.png` not in the manifest.
// Media Session can't 404-probe, so a drop-in cover missing from the manifest won't appear in the
// OS media widget (it still shows on-screen). Add it to COVERS + re-extract to surface it there.
export const coverKeyForTrack = (track: Track): string | null =>
  coverCandidates(track).find((key) => key in covers) ?? null

export const coverSizes = (key: string): string => {
  const dims = covers[key]
  return dims === undefined ? '' : `${dims.width}x${dims.height}`
}

// Intrinsic pixel dimensions for a cover key (for <img width/height> to reserve layout space).
export const coverDims = (key: string): { width: number; height: number } | null =>
  covers[key] ?? null
