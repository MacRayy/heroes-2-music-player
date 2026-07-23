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
- 2026-07-22 — Architecture — reference — Filled the module map, layered model, and "play a track" worked example — commit `📝 populate wiki architecture + glossary`.
- 2026-07-22 — Glossary — reference — Defined domain terms: Good/Evil theme, category, track id, manifest, epoch, scrubbing, VITE_AUDIO_BASE_URL — commit `📝 populate wiki architecture + glossary`.
- 2026-07-22 — Music player — feature — Documented the single-screen player; noted the track list was removed (navigation via transport) — commit `♻️ address solution-critic findings`.
- 2026-07-22 — Castle labeling fix — bug — Repointed base castle `src` to authoritative fheroes2 mapping (homm2_04=Sorceress…09=Wizard); added `src→title` guard test — commit `🐛 fix mislabeled castle themes`.
- 2026-07-22 — Extended soundtrack — decision/feature — Added 6 Succession Wars castle alternates + 20 event stings (45 tracks); stings behind a scope-chip filter; manual next/prev now wrap — commit `✨ add … + category scope`.
- 2026-07-22 — Glossary/architecture/backlog — reference — Added sting/scope/SW-variant terms, `scope` in the reducer model, struck completed backlog items — same commits.
- 2026-07-22 — Castle theme mislabel — bug — Postmortem: base castles mapped to wrong OGGs since Phase 1 (bad WebFetch summary + false "verified" comment); fixed + guard test — commit `📝 add castle-mislabel postmortem`.

- 2026-07-23 — UI art extraction — integration — AGG/ICN→PNG extractor (ported fheroes2 decode), role map + committed art-manifest + bijection test — commit `✨ add AGG/ICN art extraction pipeline`.
- 2026-07-23 — Authentic UI reskin — feature — Frame (SURDRBKG/E border-image, good=round/evil=stretch, baked shadow cropped) + game button faces via asset tokens; viewport page-frame; neutral album inset; de-reddened evil bg — commit `💄 reskin frame + buttons with extracted art`.
- 2026-07-23 — UI art decision — decision — Extract HOMM2 sprites (border-image frame, per-theme repeat, cropped shadow, button faces); responsive; font deferred — commit `📝 wiki: authentic UI art`.
- 2026-07-23 — Glossary — reference — Added AGG, ICN, Asset manifest terms — commit `📝 wiki: authentic UI art`.
- 2026-07-23 — Address solution-critic — refactor — Pure decode split to scripts/icn.ts + unit tests; pruned dead tokens; hex→--inset token; frame fallback bg; coarse-pointer 44px targets — commit `♻️ address solution-critic findings`.
- 2026-07-23 — Authentic HOMM2 fonts — integration — Build TTF webfonts from the game's own bitmap `FONT.ICN`/`SMALFONT.ICN` via opentype.js (`yarn extract:font`); titles + chips now render the real typeface — commit `💄 polish authentic UI: fonts, page frame, cursor, pixel icons`.
- 2026-07-23 — Ornate page frame — decision — Added `page` asset role (`ADVBORD`/`ADVBORDE`) for the viewport border; cropped off the right control panel (`trim.right: 160`) so the wood-and-gem border tiles cleanly with `round` — same commit.
- 2026-07-23 — Transport icons — feature — Made all transport buttons uniform size with smaller (44%) glyphs per feedback — same commit.
- 2026-07-23 — Cursor + pixel-art icons — feature/decision — Added `cursor` asset role (ADVMCO#0, ×2 upscale via new `scale`) wired to a per-theme `--cursor`; redrew transport/settings icons as 12×12 pixel-art SVGs (filled triangles, crossing-arrow shuffle, monitor+keyboard settings); increased panel spacing and made the now-playing category gold/legible — commit `💄 polish authentic UI: fonts, page frame, cursor, pixel icons`.
- 2026-07-23 — Shared AGG reader — refactor — Hoisted duplicated `openAgg` into `scripts/agg.ts`, reused by both extractors; removed dead `lg` GameButton size variant (solution-critic findings) — same commit.
