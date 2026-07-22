# Wiki index

Map of content. Pages carry their own one-line summary at the top; this index quotes it.

## Start here

- [`architecture.md`](architecture.md) — layered model + worked end-to-end example.
- [`glossary.md`](glossary.md) — domain vocabulary with code references.
- [`CLAUDE.md`](CLAUDE.md) — schema: when to update, how to write pages.
- [`_log.md`](_log.md) — chronological changelog of wiki updates.
- [`backlog.md`](backlog.md) — deferred / out-of-scope work parked for later phases.

<!-- As you add pages, group them under the headers below. Each entry should be:
     - [`path/to/page.md`](path/to/page.md) — **<title>** — <one-line summary copied from the page>
     Delete a section header if it's empty. Add new headers as new categories emerge. -->

## Apps

<!-- One page per runtime surface (web app, API service, CLI, mobile, etc.). -->

## Features

- [`features/player.md`](features/player.md) — the single-screen music player (transport, themes, settings).

## Decisions

- [`decisions/2026-07-22-audio-engine.md`](decisions/2026-07-22-audio-engine.md) — native `HTMLAudioElement` over a library.
- [`decisions/2026-07-22-player-state.md`](decisions/2026-07-22-player-state.md) — zero-dep reducer + Context (not Zustand).
- [`decisions/2026-07-22-theming.md`](decisions/2026-07-22-theming.md) — two-tier CSS custom properties on `[data-theme]`.
- [`decisions/2026-07-22-audio-pipeline.md`](decisions/2026-07-22-audio-pipeline.md) — editorial `tracks.ts` + committed generated manifest.

## Bugs

<!-- Postmortems for non-obvious bugs. Date-prefixed: YYYY-MM-DD-slug.md. -->

## Runbooks

<!-- Recurring operational pain points with known recovery paths. -->

## Tech debt

<!-- Accepted longer-lived debt with current-cost notes. -->

## Hacks

<!-- Workarounds with concrete "remove when" conditions. -->

## Integrations

- [`integrations/audio-hosting.md`](integrations/audio-hosting.md) — `VITE_AUDIO_BASE_URL` contract for serving MP3s.

## Workflows

<!-- Repeatable team processes (release dance, PR flow, codegen loop, …). -->
