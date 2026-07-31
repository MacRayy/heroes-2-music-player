# Glossary

> Domain terms specific to this project. See `architecture.md` for how they fit together.

## Good / Evil theme

The two interface skins mirroring HOMM2's interface styles: **Good** (blue/silver + gold) and
**Evil** (red/ember + dark iron). A single toggle swaps `data-theme` on `<html>`; all colors are
semantic CSS vars remapped per theme.
**Code:** `src/theme/themes.css`, `src/theme/useTheme.ts`. **Related:** [[2026-07-22-theming]].

## Category

The grouping of soundtrack tracks: `menu | battle | town | terrain | victory | sting`. Drives the
album-art emblem and the header label.
**Code:** `TrackCategory` in `src/data/tracks.ts`.

## Rotation scope

A filter (`all | battle | town | terrain | sting`) that determines which tracks the transport
(next/prev/shuffle) walks. `all` = all music, **excluding** stings; stings are only reachable via
the Stings scope. The `campaign` category (Roland/Archibald themes + AI Turn — full-length pieces,
not jingles) counts as music, so it plays in `all`. Set by the `ScopeChips` row.
**Code:** `Scope`/`tracksInScope`/`planScopeChange` in `src/hooks/usePlayer.ts`. **Related:** [[2026-07-22-soundtrack-scope]].

## Succession Wars variant

An alternate castle recording from the original HOMM2 (base game), distinct from the shipped Price
of Loyalty version — e.g. a 4:09 Sorceress vs 2:51. Sourced from `music/sw/`, `category: 'town'`,
title suffixed "(Succession Wars)".

## Sting

A short (~6 s) event jingle (Battle Won, New Week, Ultimate Artifact, …). `category: 'sting'`,
excluded from the default music rotation.

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

## AGG

The HOMM2 asset archive (`HEROES2.AGG`): `uint16` record count, `count×12` FAT `{hash,offset,size}`,
`count×15` name table at EOF. Contains ICN sprites, the `KB.PAL` palette, sounds, etc.
**Code:** `scripts/extract-art.ts`. **Related:** [[asset-extraction]].

## ICN

HOMM2 sprite format: `uint16 count`, `uint32 size`, `count×13` `ICNHeader`, then RLE bodies with a
transform layer (transparent / shadow / lighten). Good/Evil UI variants share a name with an `E`
suffix (e.g. `SYSTEM`/`SYSTEME`).
**Code:** `scripts/extract-art.ts` (`decodeIcn`).

## Asset manifest

Committed `src/data/art-manifest.json` (`"<role>.<theme>" → {file,width,height,slice?}`) generated
by the extractor; the gitignored PNGs live in `public/art/ui/`. Guarded by a bijection test.
**Related:** [[2026-07-23-ui-art]].

## Web app manifest

`public/manifest.webmanifest` — the PWA install descriptor (name, icons, `display: standalone`,
theme/background color). Distinct from the *asset manifest* and the audio manifest above; this one is
the browser-standard installability document. **Related:** [[pwa]].

## App shell

The static UI (HTML/CSS/JS + fonts/art) minus the audio — everything needed to render the player
before any track loads. The service worker caches the shell (never the audio) so it works offline
after a first visit. **Related:** [[pwa]].

## Service worker

`public/sw.js` — a client-side network proxy the browser runs off the main thread. Ours is
runtime-caching (network-first navigations, cache-first for immutable `/assets/*`, network-first with
cache-fallback for other same-origin assets, `/audio/*` bypassed) and makes the app installable +
offline-shell-capable. Can't be edge-purged, so it's served `no-cache`; recover
a broken one via the self-destruct SW in [[pwa-recovery]]. **Related:** [[2026-07-31-pwa]].

## Maskable icon

A PWA icon drawn full-bleed on an opaque background with its content inside a central "safe zone", so
platforms can mask it into a circle/squircle without clipping. Ours: `public/pwa-maskable-512.png`,
minted by `scripts/extract-art.ts::compositeOnOpaque`. **Related:** [[pwa]].
