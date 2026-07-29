# Music player

> The single-screen HOMM2 soundtrack player: album art, title, transport, and a theme toggle.

**Where** — the whole app (`src/App.tsx` → `src/components/PlayerPanel.tsx`); one screen, no routes.

**What users see** — a blurred HOMM2 world-map background with a centered ornate panel:
- Header: theme toggle (Good/Evil), the current category label, and a settings button.
- A category emblem as album art, the current track title + category.
- A **scope chip row** (All · Battle · Towns · Terrain · Stings) that filters what the transport walks.
- A seek bar with elapsed/total time.
- Transport row: shuffle · previous · play/pause · next · repeat (off/all/one).
- Settings dialog (gear): theme toggle + volume slider + about.

There is **no track list** — navigation is via the transport controls + scope chips. The 45-track
catalog (25 music incl. Succession Wars castle alternates + 20 event stings) is navigated by
selecting a scope, then walking it with next/prev/shuffle. Stings are excluded from the default
`all` scope. **Manual next/prev wrap** the ends (circular); auto-advance stops at the end under
repeat-off. Playback starts paused; first play needs a click (autoplay-safe). Volume and theme
persist across reloads. See [[2026-07-22-soundtrack-scope]].

The chrome is **authentic HOMM2 art** extracted from the game (Good = wooden/stone, Evil = dark
metal): frame, buttons, and a viewport page-frame. Responsive/mobile-friendly. See [[2026-07-23-ui-art]].

**How it's wired** — `PlayerPanel` composes the sub-components; all read shared state from
`usePlayerContext` (`src/state/PlayerContext.tsx`) except `ProgressBar`, which owns the
high-frequency `currentTime` locally. Audio is driven by `usePlayerEngine`. `usePlayer` also wires
the **Media Session API** — OS / lock-screen transport controls + hardware media keys, and
now-playing metadata (title + album-cover artwork, resolved via `coverKeyForTrack` in
`src/data/covers.ts`). See [[architecture]] for the "play a track" walkthrough and
[[2026-07-22-player-state]] / [[2026-07-22-theming]] for the state and theming decisions.

**Specs** — pure logic in `src/test/` (reducer/shuffle, manifest + cover resolution, engine
`setLoop`); user flows in `e2e/` (`yarn e2e`: start gate, transport, repeat modes, media session,
modals). See [[testing]].
