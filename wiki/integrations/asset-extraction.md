# UI art extraction (HEROES2.AGG → PNG)

> Authentic HOMM2 UI sprites are decoded from the local game archive at build time; gitignored.

**What we use it for** — the frame and button sprites for the two themes (Good = base ICN, Evil =
`E`-suffixed). Small transparent PNGs served same-origin from `/art/ui/`.

**Pipeline** — `scripts/extract-art.ts` (run via `yarn extract:art`; `tsx`):
- Parses `HEROES2.AGG` (path via `HOMM2_DATA_DIR`, default the fheroes2 data dir): `uint16 count`,
  `count×12` FAT `{hash,offset,size}`, `count×15` name table at EOF.
- Reads `KB.PAL` (768-byte 6-bit palette, scaled ×255/63).
- Decodes ICN sprites (`uint16 count`, `uint32 size`, `count×13` `ICNHeader`, then RLE) — RLE +
  transform/shadow layer ported from fheroes2 `src/engine/image_tool.cpp::decodeICNSprite`
  (see header comment in the script for exact upstream files, for future diffing).
- Reads the role map `src/data/assets.ts` (`ASSETS: role → { good, evil } → {icn, index, slice?,
  trim?}`), writes `public/art/ui/<role>-<theme>.png` (gitignored) + committed
  `src/data/art-manifest.json` (`"<role>.<theme>" → {file, width, height, slice?}`).
- Roles: `frame`/`page` (border-image sheets, `slice` = 9-slice inset), `btn`/`btn-pressed`,
  `cursor` (`ADVMCO.ICN` #0), `arrow` (`RECRUIT.ICN` up-arrow, rotated → prev/play/next), `settings`
  (the System-Options computer `ADVBTNS.ICN` #14, keyed out of its button face + tinted), and
  `hero` (theme-toggle portraits — `PORT0054` Roland (Good) / `PORT0057` Archibald (Evil)). `trim`
  crops an edge before
  writing — used to drop `frame`'s baked shadow and to crop `page` (`ADVBORD`) down to its wood
  map-frame, dropping the right-side control panel (`trim.right: 160`, 640×480 → 480×480). `scale`
  nearest-neighbour upscales (cursor uses `scale: 2`). `rotate` (90/180/270° CW) reorients a sprite
  (arrow uses `rotate: 90`). `keyLuma` makes pixels at/above a luminance threshold transparent (to
  lift a dark glyph off a light button face — `settings` uses it). `tint` recolours all opaque pixels
  to a flat RGB (per-theme). Transform order: trim → scale → rotate → keyLuma → tint. See
  [[2026-07-23-ui-art]].
- `--dump ICN…` mode dumps every sprite of an ICN for exploration.

**Album covers** — a second map `COVERS` (`src/data/assets.ts`, un-themed) extracts a `MONS32`
creature per key via `applyTransforms` → `public/art/covers/<key>.png` (gitignored) + committed
`cover-manifest.json`. Town songs use the faction's **top-tier (upgraded) creature** (knight=Crusader,
barbarian=Cyclops, sorceress=Phoenix, warlock=Black Dragon, wizard=Titan, necromancer=Bone Dragon);
other categories: menu+victory=heraldic shield (`PRIMSKIL` #1), battle=Nomad, terrain=Rogue,
sting=Ghost. `AlbumArt` tries `/art/covers/<key>.png` most-specific-first — the track
id (minus `-sw`, e.g. `town-knight`) then the category — on 404 falling to the next, finally the SVG
emblem (so a hand-dropped `town-<faction>.png` still overrides).

**Favicon** — the same run writes two square favicons (gitignored, centered via `padToSquare`):
`favicon.png` = `town-warlock` Black Dragon (for light browser chrome) and `favicon-dark.png` =
`town-sorceress` Phoenix (bright — legible on dark chrome). `index.html` selects by
`prefers-color-scheme` via `media` on the `rel="icon"` links; `apple-touch-icon` uses the Phoenix.

**Guard** — `src/test/art-manifest.test.ts` asserts a `role×theme ↔ manifest` bijection, and
`src/test/cover-manifest.test.ts` a `COVERS ↔ cover-manifest` bijection. CI-safe (committed manifests
only; no AGG/PNGs needed), mirroring the audio manifest test.

**Gotchas**
- Copyrighted assets → gitignored; regenerate locally with `yarn extract:art`. Getting them into a
  production deploy is parked tech-debt (see [[audio-hosting]]).
- Index 0 is not special; transparency comes from the RLE skip/transform layer (transform 1 =
  transparent, 2–5 = shadow rendered as semi-transparent black).
