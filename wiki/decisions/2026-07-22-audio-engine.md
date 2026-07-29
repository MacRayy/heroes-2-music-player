# Audio engine: native `HTMLAudioElement`

> One long-lived `HTMLAudioElement`, not a library.

**Date:** 2026-07-22 **Status:** accepted

## Context

The player streams a single MP3 at a time with play/pause/seek/volume, auto-advance on end, and
must respect mobile autoplay policy (first play inside a user gesture).

## Options considered

- **A. Native `HTMLAudioElement`** — zero deps; hand-roll gesture-gated first play + one `ended`
  handler.
- **B. Howler.js** — +dep/bundle; its value (sprites, pooling, format-fallback chains) targets
  multi-source/game-SFX use, not one MP3 stream.
- **C. Web Audio API** — only justified for a visualizer/EQ/crossfade; more ceremony otherwise.

## Decision

**A.** `src/hooks/usePlayerEngine.ts` owns one element for the app's lifetime, registers
`ended`/`error` listeners once (cleaned up on unmount), and exposes imperative
`load/play/pause/seek/setVolume`. Playback fires as `void el.play().catch(...)` so blocked
autoplay never throws.

## Consequences

- Autoplay before a gesture is swallowed; UI reflects paused state. No auto-skip on `error` yet
  (logs only — deferred, see `backlog.md`).
- Repeat-one uses the element's native `loop` (`engine.setLoop`, driven by `repeat === 'one'`), so
  a looping track never emits `ended` and the reducer treats `ended` as a plain advance. (Originally
  `seek(0); play()` on `ended`; replaced — see [[bugs/2026-07-29-repeat-one]].) See
  [[2026-07-22-player-state]].

## References
- `src/hooks/usePlayerEngine.ts`
- commit `✨ add player engine + state`
