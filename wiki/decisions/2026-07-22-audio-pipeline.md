# Audio pipeline: editorial `tracks.ts` + committed generated manifest

> Track metadata is hand-authored; media facts are generated and committed; MP3 binaries are not.

**Date:** 2026-07-22 **Status:** accepted

## Context

The player needs a single source of truth for the 19 in-scope tracks (titles, categories, order)
that is decoupled from where the ~52 MB of audio is hosted. Audio is transcoded from a local
fheroes2 game install (OGG) and must not be committed to git. Tests need to verify coverage
without ffmpeg or the game files (CI has neither).

## Options considered

- **A. Generated manifest is SOT, `tracks.ts` derives from it** — titles/categories/order are
  editorial, not derivable from filenames; codegen would fight hand-edits.
- **B. `tracks.ts` is SOT, no manifest** — simple, but loses build-time proof every declared
  track was actually transcoded, and durations are unknown until runtime.
- **C. Editorial `tracks.ts` SOT + generated, committed `audio-manifest.json` joined by `id`** —
  one source per concern; the manifest is a build *receipt*.

## Decision

**C.** `src/data/tracks.ts` (`TrackId`/`Track`, ordered) owns id/src/file/title/category.
`scripts/build-audio.ts` (run via `tsx`) reads it, transcodes each `src` OGG → `file` MP3 into
`public/audio/` (gitignored), probes durations with `ffprobe`, and writes
`src/data/audio-manifest.json` (metadata only, ~1 KB, **committed**, prettier-conformant).
`src/data/manifest.ts` types the JSON and exposes `resolveAudioUrl(file)`.

## Consequences

- `src/test/manifest.test.ts` asserts a `tracks.ts ↔ manifest` id bijection — runs in CI with no
  ffmpeg/OGGs/MP3s (touches only committed metadata). A missing transcode fails tests, not prod.
- Regenerating audio requires `ffmpeg` (`brew install ffmpeg`) and the fheroes2 music dir
  (override with `HOMM2_MUSIC_DIR`). The script guards both and exits with a clear message.
- Runtime hosting is swappable via `VITE_AUDIO_BASE_URL` — see [[audio-hosting]].
- `scripts/**` is excluded from ESLint (build tooling) but still typechecked via `tsconfig.node.json`.

## References
- `src/data/tracks.ts`, `scripts/build-audio.ts`, `src/data/manifest.ts`, `src/test/manifest.test.ts`
- commit `✨ add track data + audio build pipeline`
