# Custom game cursor reverts to the system arrow at the page edges

> The HOMM2 sword cursor showed the default OS arrow along the bottom/right viewport edges.

**Symptom** — everywhere in the app the custom HOMM2 pointer showed, except a band along the
**bottom and right** edges of the window, where it became the default browser arrow. Top and left
edges were fine.

**Root cause** — two independent issues, in order:

1. The `--cursor` token was applied on `body`, but the `[data-theme]` custom properties live on
   `html` (`document.documentElement`). At the extreme page-frame edges, hit-testing falls through
   the `pointer-events: none` `.page-frame` to the root element, whose `cursor` resolved `var(--cursor)`
   to its `auto` fallback. Fixed by setting `cursor` on `html` (`src/styles/globals.css`).

2. After that, the bottom/right asymmetry remained. That's **Chromium's anti-cursor-spoofing**
   behavior: a custom cursor larger than **32×32 CSS px** is silently replaced by the system arrow
   when its bitmap would overflow the viewport edge. The cursor was 30×**42** (`ADVMCO.ICN` #0 at
   ×2), and with the hotspot at the top-left sword tip `(2,2)` the image extends down-and-right —
   so it overflowed exactly at the **bottom and right** edges. `document.elementFromPoint` at those
   edges correctly returned `div.app` with the game-cursor URL, confirming the CSS was right and the
   fallback was happening below the DOM layer.

**Fix** — scale the cursor **×1.5 instead of ×2** → **23×32px**, under the 32px threshold
(`src/data/assets.ts` `cursor` role). Required rounding the output dimensions in `scaleSprite`
(`scripts/icn.ts`) so a fractional factor yields integer pixel sizes; integer factors are
unaffected. Regenerated via `yarn extract:art`; `art-manifest.json` cursor entries updated.

**Lessons** — keep CSS custom cursors ≤32×32 or they vanish near viewport edges in Chromium. Put
inherited-everywhere properties on `html`, not `body`, when the `pointer-events: none` frame can
expose the root element. Verify edge behavior with `document.elementFromPoint` + `getComputedStyle`
before assuming a CSS bug — the DOM here was correct; the fallback was a compositor rule.

## References
Branch `feat/authentic-ui-review`; relates to `[[decisions/2026-07-23-ui-art]]`.
