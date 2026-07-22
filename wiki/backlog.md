# Backlog

> Deferred work parked out of scope during earlier phases — pick up when the foundation is stable.

Items are roughly ordered by likely value. Each has enough context to resume cold. When one is
picked up, move its detail into a `features/` / `decisions/` / `runbooks/` page as appropriate and
strike it here.

## Soundtrack coverage

- **Event stings (`homm2_18`–`homm2_40`)** — the ~6 s jingles (battle won/lost, treasure, level-up,
  new week, AI turn…). Excluded from Phase 1 as they aren't listening music. Could surface as a
  separate "Stings" category or an SFX toggle. Source already on disk (see [[project setup]]).
- **Expansion variants (`music/sw/`, `music/pol/`)** — Succession Wars / Price of Loyalty alternate
  versions of 6 tracks. Add as per-track variant selection once the base player is solid.

## Fidelity / art

- **Authentic UI art from `HEROES2.AGG`** — replace the CSS-recreated buttons/frame with extracted
  ICN sprites for pixel-perfect Good/Evil skins. Needs an ICN/AGG extraction pipeline (custom
  parser or a community tool). Heavier: two full sprite sets + fixed-resolution assets.
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

- **Intro / consent gate** — the reference has language select → privacy accept → welcome dialog →
  Start. Optional; adds ceremony. Revisit if we localize or add a landing experience.
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
