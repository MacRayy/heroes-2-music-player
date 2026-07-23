# HOMM2 bitmap → TTF font pipeline

> Build-time conversion of the game's own bitmap fonts into TTF webfonts, so titles and labels
> render in the authentic HOMM2 typeface.

**What we use it for** — the display font (`--font-display`, "HOMM2 Big") on panel titles and the
now-playing title, and the body/label font (`--font-body`, "HOMM2 Small") on scope chips and small
labels. Both are the real in-game glyphs, not a lookalike serif.

**Contract** — reads two ICN sprite sheets from `HEROES2.AGG`:
- `FONT.ICN` → `public/fonts/homm2-big.ttf` (family `HOMM2 Big`)
- `SMALFONT.ICN` → `public/fonts/homm2-small.ttf` (family `HOMM2 Small`)

Each ICN is a sequence of glyph sprites for **ASCII 32–127** (index `i` → codepoint `32 + i`). The
extractor reuses the shared decode in `scripts/icn.ts` (see [[asset-extraction]]).

**How it works** (`scripts/extract-font.ts`, run via `yarn extract:font`):
- Each row's **opaque** pixels (alpha > 128) are merged into one filled rectangle per horizontal run
  (not one square per pixel) — this removes internal seams that otherwise make the rasterised glyph
  look muddy/blurry at UI sizes. The font is monochrome, so CSS `color` tints it.
- Coordinate mapping: `EM_PX = 16`, `ASCENT_PX = 12`, `SCALE = 1000/16` (unitsPerEm 1000). A pixel at
  `(x, y)` maps to em-x `(offsetX + x)·SCALE`, em-y `(ASCENT_PX − (offsetY + y) − 1)·SCALE`
  (y flips: bitmap top-down → font baseline-up). The sprite's `offsetX/offsetY` position the glyph.
- Advance width: space (code 32) = 4px; others = `offsetX + width + 1`px (min 2), ×SCALE.
- Built with **opentype.js** (`opentype.Font` → `toArrayBuffer` → `.ttf`). A `.notdef` glyph is added.
- Wired via `src/theme/fonts.css` (`@font-face`, `font-display: swap`), imported in `src/main.tsx`;
  `tokens.css` sets `--font-display`/`--font-body` to these families with a serif fallback stack.

**Auth & config** — no auth. Needs a local game install; `HOMM2_DATA_DIR` overrides the default
fheroes2 data path (`~/Library/Application Support/fheroes2/data`).

**Gotchas**
- TTFs are **gitignored** (`public/fonts/`) — copyrighted game assets, same stance as the UI art.
  A CI build can't produce them; production font delivery is parked tech-debt with the art/audio
  (see [[audio-hosting]]).
- Only ASCII 32–127 exist in the sheets — no accented glyphs. Track titles are ASCII, so fine.
- `font-display: swap` means the serif fallback flashes before the TTF loads on a cold cache.

## References
- `scripts/extract-font.ts`, `scripts/icn.ts`, `src/theme/fonts.css`, `src/theme/tokens.css`,
  `src/main.tsx`
- Related: [[asset-extraction]], [[2026-07-23-ui-art]]
