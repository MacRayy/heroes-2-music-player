# Music player

> The single-screen HOMM2 soundtrack player: album art, title, transport, and a theme toggle.

**Where** — the whole app (`src/App.tsx` → `src/components/PlayerPanel.tsx`); one screen, no routes.

**What users see** — a blurred HOMM2 world-map background with a centered ornate panel:
- Header: theme toggle (Good/Evil), the current category label, and a settings button.
- A category emblem as album art, the current track title + category.
- A seek bar with elapsed/total time.
- Transport row: shuffle · previous · play/pause · next · repeat (off/all/one).
- Settings dialog (gear): theme toggle + volume slider + about.

There is **no track list** — navigation is via the transport controls (removed intentionally;
selection UI could return in a later phase). Playback starts paused; first play needs a click
(autoplay-safe). Volume and theme persist across reloads.

**How it's wired** — `PlayerPanel` composes the sub-components; all read shared state from
`usePlayerContext` (`src/state/PlayerContext.tsx`) except `ProgressBar`, which owns the
high-frequency `currentTime` locally. Audio is driven by `usePlayerEngine`. See
[[architecture]] for the "play a track" walkthrough and [[2026-07-22-player-state]] /
[[2026-07-22-theming]] for the state and theming decisions.

**Specs** — reducer + shuffle logic: `src/test/usePlayer.test.ts`; manifest coverage:
`src/test/manifest.test.ts`. Real playback is verified with an ad-hoc Playwright driver (committed
E2E is deferred — see `backlog.md`).
