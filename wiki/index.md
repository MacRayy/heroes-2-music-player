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
- [`features/start-gate.md`](features/start-gate.md) — fog-of-war intro modal that reveals the map + starts playback.
- [`features/support-and-legal.md`](features/support-and-legal.md) — corner fundraising widget + footer Copyrights/Privacy modals.

## Decisions

- [`decisions/2026-07-22-audio-engine.md`](decisions/2026-07-22-audio-engine.md) — native `HTMLAudioElement` over a library.
- [`decisions/2026-07-22-player-state.md`](decisions/2026-07-22-player-state.md) — zero-dep reducer + Context (not Zustand).
- [`decisions/2026-07-22-theming.md`](decisions/2026-07-22-theming.md) — two-tier CSS custom properties on `[data-theme]`.
- [`decisions/2026-07-22-audio-pipeline.md`](decisions/2026-07-22-audio-pipeline.md) — editorial `tracks.ts` + committed generated manifest.
- [`decisions/2026-07-22-soundtrack-scope.md`](decisions/2026-07-22-soundtrack-scope.md) — extended soundtrack: SW alternates in rotation, stings behind a scope chip.
- [`decisions/2026-07-23-ui-art.md`](decisions/2026-07-23-ui-art.md) — authentic HOMM2 UI art extracted from HEROES2.AGG.
- [`decisions/2026-07-28-hosting-cloudflare-pages.md`](decisions/2026-07-28-hosting-cloudflare-pages.md) — deploy via Cloudflare Pages direct upload (not Sevalla).

## Bugs

- [`bugs/2026-07-22-castle-theme-mislabel.md`](bugs/2026-07-22-castle-theme-mislabel.md) — base castle themes mapped to the wrong source OGGs.
- [`bugs/2026-07-27-cursor-edges.md`](bugs/2026-07-27-cursor-edges.md) — game cursor reverted to the OS arrow on the bottom/right page edges.

## Runbooks

<!-- Recurring operational pain points with known recovery paths. -->

- [`runbooks/deploy-cloudflare.md`](runbooks/deploy-cloudflare.md) — build `dist/` locally + `wrangler pages deploy` to Cloudflare Pages.

## Tech debt

<!-- Accepted longer-lived debt with current-cost notes. -->

## Hacks

<!-- Workarounds with concrete "remove when" conditions. -->

## Integrations

- [`integrations/audio-hosting.md`](integrations/audio-hosting.md) — `VITE_AUDIO_BASE_URL` contract for serving MP3s.
- [`integrations/asset-extraction.md`](integrations/asset-extraction.md) — HEROES2.AGG → UI sprite PNGs (frame/page/buttons), decoded at build time.
- [`integrations/homm2-font.md`](integrations/homm2-font.md) — game bitmap fonts (`FONT.ICN`/`SMALFONT.ICN`) → TTF webfonts.

## Workflows

<!-- Repeatable team processes (release dance, PR flow, codegen loop, …). -->

- [`workflows/testing.md`](workflows/testing.md) — `yarn test` (unit, CI-safe) + `yarn e2e` (Playwright, local).
- [`workflows/renovate.md`](workflows/renovate.md) — automated dependency updates via the Renovate app.
