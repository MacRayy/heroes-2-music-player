# Backlog

> Deferred work parked out of scope during earlier phases — pick up when the foundation is stable.

Items are roughly ordered by likely value. Each has enough context to resume cold. When one is
picked up, move its detail into a `features/` / `decisions/` / `runbooks/` page as appropriate and
strike it here.

## Soundtrack coverage

- ~~Event stings (`homm2_18`–`homm2_40`)~~ — **DONE (Phase 2)**: added as the `sting` category,
  reachable via the Stings scope chip. See [[2026-07-22-soundtrack-scope]].
- ~~Succession Wars castle alternates (`music/sw/`)~~ — **DONE (Phase 2)**: 6 alternates in rotation.
- **Price of Loyalty variants (`music/pol/`)** — still deferred; `pol/` is byte-identical to the
  shipped base castle recordings, so it adds nothing until a genuinely different PoL source appears.
- **Alternate main menu** — not present in the fheroes2 source; would need external sourcing.

## Fidelity / art

- ~~Authentic UI art from `HEROES2.AGG`~~ — **DONE (Phase 3)**: extracted frame + button sprites
  per theme via `scripts/extract-art.ts`; see [[2026-07-23-ui-art]]. (Remaining fidelity nice-to-haves
  below.)
- **Game-inspired pixel-art transport icons** — the play/pause/next/shuffle glyphs are still simple
  vector shapes on the authentic button faces; could be redrawn pixel-art to match the game.
- **Per-track real album art** — Phase 1 uses per-category placeholder emblems. Real art = town
  paintings / terrain screenshots (extract from game or source). Data model already carries an
  optional `art` key per track.
- **Click / hover SFX** — the reference plays a click sound on buttons (game-authentic). Button
  sounds live in `HEROES2.AGG`. Low effort once we have an asset for it.

## Accessibility

- **Settings dialog focus management** — the dialog has `role="dialog"`/`aria-modal`/`aria-labelledby`
  and closes on Esc + Close button, but lacks a focus trap and focus-restore-on-close. Add both when
  hardening a11y.

## UX parity with the reference

- ~~**Intro / consent gate**~~ — **DONE**: a fog-of-war Start gate (welcome + horse Start button that
  reveals the map and begins playback). See [[start-gate]]. Language/privacy steps still optional.
- **Multi-language UI** — the reference supports ~10 languages. Only worth it with an audience.

## Robustness

- **Audio-element `error`-event recovery** — Phase 1's engine logs and no-throws on a
  missing/undecodable MP3 but does not auto-skip. Add auto-skip / user-surfaced error once we're
  off the controlled 19-file local manifest and onto remote hosting.

## Ops / delivery

- **Production audio hosting** — move the ~90 MB of MP3s to object storage / CDN (Cloudflare R2,
  Sevalla static, S3) and point `VITE_AUDIO_BASE_URL` at it. See [[audio-hosting]] for the contract.
- **Deploy pipeline** — Vercel or Sevalla static deploy of the Vite `dist/` (lean app bundle,
  audio served from the bucket above).
- **Committed E2E suite + CI** — promote the ad-hoc scratchpad Playwright playback check into a
  committed `@playwright/test` suite with browser setup in CI.
