# Repeat-one silently fails on some browsers

> "Repeat one" didn't replay the track when it ended (reported on a non-Chrome browser).

**Symptom** — with repeat set to "one", a finished track did not restart; it either stopped or
advanced. User-reported on a non-Chrome browser; **not reproducible in headless Chromium** (repeat-one
worked there in both synthetic and real end-of-track tests).

**Root cause (partly hypothesis — unconfirmed).** Repeat-one was implemented in `usePlayer`'s
`onEnded` as `engine.seek(0)` + `engine.play()`. The leading theory is that this `play()` — fired
from an event handler, outside a user gesture — is autoplay-gated on Safari/Firefox, leaving the
element paused. **Caveat:** off/all auto-advance also does a non-gesture `play()` on the *same*
persistent element (`onEnded` → `advance` → reload effect → `engine.load(url, true)` → `play()`) and
was *not* reported broken, which argues against a blanket autoplay gate. So the precise trigger is
unconfirmed — it may instead be a `seek(0)`-on-an-ended-element + immediate-`play()` race specific to
that code path. Either way, the fragile pattern was the `play()`-on-`ended`.

**Fix** — drive repeat-one with the element's **native `loop`**: `engine.setLoop()` (`el.loop`)
toggled by an effect on `state.repeat === 'one'`. Native looping is gapless and makes **no `play()`
call at all** (the browser restarts the media itself), so it sidesteps both the autoplay-gate and the
seek/play-race theories. A looping element never emits `ended`, so `onEnded` now just dispatches
`ended` (off/all only). Files: `src/hooks/usePlayerEngine.ts`, `src/hooks/usePlayer.ts`.

**Lessons** — prefer native element behaviour (`loop`) over re-triggering playback from an event
handler. Chromium-only testing can't distinguish these paths (autoplay disabled, per-element unlock),
so the regression guard asserts the **mechanism** (`audio.loop === true` for repeat-one) rather than
just emergent playback — see `e2e/repeat.spec.ts` + the CI-safe `src/test/player-engine.test.ts`.
**Open:** confirm on a real Safari/Firefox; if the autoplay-gate theory holds, the off/all
auto-advance `play()` carries the same latent risk and should be revisited.

## References
Branch `fix/repeat-one`.
