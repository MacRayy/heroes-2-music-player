# Glossary

> Domain terms specific to this project. See `architecture.md` for how they fit together.

## Good / Evil theme

The two interface skins mirroring HOMM2's interface styles: **Good** (blue/silver + gold) and
**Evil** (red/ember + dark iron). A single toggle swaps `data-theme` on `<html>`; all colors are
semantic CSS vars remapped per theme.
**Code:** `src/theme/themes.css`, `src/theme/useTheme.ts`. **Related:** [[2026-07-22-theming]].

## Category

The grouping of soundtrack tracks: `menu | battle | town | terrain | victory`. Drives the album-art
emblem and the header label.
**Code:** `TrackCategory` in `src/data/tracks.ts`.

## Track id

A stable slug (e.g. `town-knight`) that is also the MP3 basename. Joins the editorial track record
to its generated manifest entry.
**Code:** `Track.id` in `src/data/tracks.ts`.

## Manifest

The committed `audio-manifest.json` — a build receipt mapping track id → `{ file, durationSec }`.
Metadata only; the MP3 binaries are gitignored.
**Code:** `src/data/audio-manifest.json`, `src/data/manifest.ts`. **Related:** [[2026-07-22-audio-pipeline]].

## epoch

A counter in player state bumped on every fresh (re)start of the current track — including
repeat-one replays — so the load effect re-fires even when `currentId` is unchanged.
**Code:** `PlayerState.epoch` in `src/hooks/usePlayer.ts`.

## Scrubbing

The state while the user drags the seek handle; incoming `timeupdate` events are ignored so they
don't fight the drag position.
**Code:** `scrubbingRef` in `src/components/ProgressBar.tsx`.

## VITE_AUDIO_BASE_URL

Build-time env var for where MP3s are served (unset → `/audio/` in dev; a CDN/bucket origin in
prod). **Code:** `resolveAudioUrl` in `src/data/manifest.ts`. **Related:** [[audio-hosting]].
