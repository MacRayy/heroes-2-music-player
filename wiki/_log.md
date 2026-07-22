# Wiki log

Chronological changelog of wiki updates. One line per page added or significantly changed, in
order of when the entry was written. Newest entries at the bottom.

Format: `- [<title>](<path>) — <category> — <one-sentence summary>`

- 2026-07-22 — Seed wiki bootstrap — meta — Wiki structure scaffolded from `wiki-seed.md`; awaiting first real entries.
- 2026-07-22 — Backlog — meta — Parked Phase 1 out-of-scope items (soundtrack coverage, authentic art, SFX, i18n, error recovery, hosting/deploy, E2E) in `backlog.md`.
- 2026-07-22 — Audio pipeline — decision — Editorial `tracks.ts` SOT + committed generated `audio-manifest.json`; MP3s gitignored; CI-safe coverage test — commit `✨ add track data + audio build pipeline`.
- 2026-07-22 — Audio hosting — integration — `VITE_AUDIO_BASE_URL` contract for serving MP3s (dev `/audio/`, prod CDN; CORS + range) — commit `✨ add track data + audio build pipeline`.
- 2026-07-22 — Audio engine — decision — Native `HTMLAudioElement` (not Howler); gesture-gated play, repeat-one handled imperatively — commit `✨ add player engine + state`.
- 2026-07-22 — Player state — decision — Zero-dep `useReducer` + Context; `currentTime` tick kept local to ProgressBar (overrides Zustand rec) — commit `✨ add player engine + state`.
- 2026-07-22 — Theming — decision — Two-tier CSS custom properties on `[data-theme]` (Good/Evil); pre-paint hydration; CSS-recreated GameButton/GameFrame — commit `💄 add theming + in-game UI primitives`.
