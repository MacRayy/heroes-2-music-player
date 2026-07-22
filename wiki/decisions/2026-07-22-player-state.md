# Player state: zero-dep reducer + Context (not Zustand)

> `useReducer` + Context; the high-frequency `currentTime` tick is kept out of global state.

**Date:** 2026-07-22 **Status:** accepted (overrides an architect recommendation of Zustand)

## Context

Transport and settings all read/mutate one now-playing state (the app also had a track list at the
time this was decided; it was later removed). The architect recommended Zustand, mainly so selector
subscriptions could isolate the ~4 Hz `currentTime` tick from context fan-out, plus `persist` for
theme/volume.

## Options considered

- **A. `useReducer` + Context (zero dep).** Global state is low-frequency only; the tick lives
  locally in the ProgressBar.
- **B. Zustand.** Selector-scoped re-renders + `persist`; +1 dep.
- **C. Prop-drilling.** Rejected — siblings all mutate shared state.

## Decision

**A (override).** The only argument for Zustand was the tick fan-out — and that is neutralized by
keeping `currentTime`/seek **local to `ProgressBar`** (its own `useState` fed by the audio
element's `timeupdate`). It never enters Context, so play/pause/track-change are the only
(infrequent) global updates. Persistence is a few lines of `localStorage` (volume here, theme in
`useTheme`). Not worth a dependency for a 19-track app.

## Consequences

- `src/hooks/usePlayer.ts` holds the pure `playerReducer` (exported, unit-tested) + the hook that
  wires it to `usePlayerEngine` via effects keyed on `currentId`/`epoch`.
- `epoch` is bumped for every fresh (re)start including repeat-one replays, so the load effect
  re-fires even when `currentId` is unchanged.
- `ProgressBar` MUST own its own time state; putting `currentTime` in Context would reintroduce the
  fan-out this decision avoids.
- If future features add more high-frequency shared state, revisit Zustand.

## References
- `src/hooks/usePlayer.ts`, `src/state/PlayerContext.tsx`, `src/test/usePlayer.test.ts`
- commit `✨ add player engine + state`
