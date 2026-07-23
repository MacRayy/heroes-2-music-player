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
- Reads the role map `src/data/assets.ts` (`ASSETS: role → { good, evil } → {icn, index, slice?}`),
  writes `public/art/ui/<role>-<theme>.png` (gitignored) + committed `src/data/art-manifest.json`
  (`"<role>.<theme>" → {file, width, height, slice?}`).
- `--dump ICN…` mode dumps every sprite of an ICN for exploration.

**Guard** — `src/test/art-manifest.test.ts` asserts a `role×theme ↔ manifest` bijection. CI-safe
(committed manifest only; no AGG/PNGs needed), mirroring the audio manifest test.

**Gotchas**
- Copyrighted assets → gitignored; regenerate locally with `yarn extract:art`. Getting them into a
  production deploy is parked tech-debt (see [[audio-hosting]]).
- Index 0 is not special; transparency comes from the RLE skip/transform layer (transform 1 =
  transparent, 2–5 = shadow rendered as semi-transparent black).
