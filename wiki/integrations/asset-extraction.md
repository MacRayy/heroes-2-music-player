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
  `cursor` (the pointer, `ADVMCO.ICN` #0), and `arrow` (the up-arrow `RECRUIT.ICN` #0, rotated to
  point right — reused for prev/play/next transport glyphs). `trim` crops pixels off an edge before
  writing — used to drop `frame`'s baked shadow and to crop `page` (`ADVBORD`) down to its wood
  map-frame, dropping the right-side control panel (`trim.right: 160`, 640×480 → 480×480). `scale`
  nearest-neighbour upscales (cursor uses `scale: 2`). `rotate` (90/180/270° CW) reorients a sprite
  (arrow uses `rotate: 90`). `tint` recolours all opaque pixels to a flat RGB (the arrow is tinted
  dark brown `#552b0d` to match the transport glyphs). Transform order: trim → scale → rotate →
  tint. See [[2026-07-23-ui-art]].
- `--dump ICN…` mode dumps every sprite of an ICN for exploration.

**Guard** — `src/test/art-manifest.test.ts` asserts a `role×theme ↔ manifest` bijection. CI-safe
(committed manifest only; no AGG/PNGs needed), mirroring the audio manifest test.

**Gotchas**
- Copyrighted assets → gitignored; regenerate locally with `yarn extract:art`. Getting them into a
  production deploy is parked tech-debt (see [[audio-hosting]]).
- Index 0 is not special; transparency comes from the RLE skip/transform layer (transform 1 =
  transparent, 2–5 = shadow rendered as semi-transparent black).
