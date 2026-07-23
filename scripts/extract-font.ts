// Build web fonts (.ttf) from HOMM2's bitmap FONT.ICN / SMALFONT.ICN (ASCII 32-127).
// Each opaque glyph pixel becomes a filled square in the outline (monochrome; CSS colors it).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import opentype from 'opentype.js'

import { type Agg, openAgg } from './agg'
import { decodeIcn, loadPalette, type Sprite } from './icn'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir =
  process.env.HOMM2_DATA_DIR ??
  join(homedir(), 'Library', 'Application Support', 'fheroes2', 'data')

const EM_PX = 16
const ASCENT_PX = 12
const SCALE = 1000 / EM_PX

const isOpaque = (sprite: Sprite, x: number, y: number): boolean =>
  (sprite.rgba[(y * sprite.width + x) * 4 + 3] ?? 0) > 128

// One rectangle per horizontal run of opaque pixels (not per pixel) — no internal
// seams, so the rasteriser renders clean glyph edges instead of a muddy pixel grid.
const glyphPath = (sprite: Sprite): opentype.Path => {
  const path = new opentype.Path()
  for (let y = 0; y < sprite.height; y += 1) {
    let x = 0
    while (x < sprite.width) {
      if (!isOpaque(sprite, x, y)) {
        x += 1
        continue
      }
      let run = 1
      while (x + run < sprite.width && isOpaque(sprite, x + run, y)) {
        run += 1
      }
      const fx = (sprite.offsetX + x) * SCALE
      const fy = (ASCENT_PX - (sprite.offsetY + y) - 1) * SCALE
      const w = run * SCALE
      path.moveTo(fx, fy)
      path.lineTo(fx + w, fy)
      path.lineTo(fx + w, fy + SCALE)
      path.lineTo(fx, fy + SCALE)
      path.close()
      x += run
    }
  }
  return path
}

const buildFont = (
  agg: Agg,
  palette: Uint8Array,
  icnName: string,
  familyName: string,
  outPath: string,
): void => {
  const rec = agg.records.get(icnName)
  if (rec === undefined) {
    console.error(`${icnName} not in AGG`)
    process.exit(1)
  }
  const sprites = decodeIcn(agg.data.subarray(rec.offset, rec.offset + rec.size), palette)
  const notdef = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: Math.round(6 * SCALE),
    path: new opentype.Path(),
  })
  const glyphs = [notdef]
  sprites.forEach((sprite, i) => {
    const code = 32 + i
    const advancePx = code === 32 ? 4 : sprite.offsetX + sprite.width + 1
    glyphs.push(
      new opentype.Glyph({
        name: `uni${code.toString(16).padStart(4, '0')}`,
        unicode: code,
        advanceWidth: Math.round(Math.max(advancePx, 2) * SCALE),
        path: code === 32 ? new opentype.Path() : glyphPath(sprite),
      }),
    )
  })
  const font = new opentype.Font({
    familyName,
    styleName: 'Regular',
    unitsPerEm: 1000,
    ascender: Math.round(ASCENT_PX * SCALE),
    descender: -Math.round((EM_PX - ASCENT_PX) * SCALE),
    glyphs,
  })
  writeFileSync(outPath, Buffer.from(font.toArrayBuffer()))
  console.log(`✔ ${familyName} → ${outPath} (${sprites.length} glyphs)`)
}

const main = (): void => {
  const aggPath = join(dataDir, 'HEROES2.AGG')
  if (!existsSync(aggPath)) {
    console.error(`HEROES2.AGG not found at ${aggPath}. Set HOMM2_DATA_DIR.`)
    process.exit(1)
  }
  const agg = openAgg(aggPath)
  const kb = agg.records.get('KB.PAL')
  if (kb === undefined) {
    console.error('KB.PAL not found')
    process.exit(1)
  }
  const palette = loadPalette(agg.data.subarray(kb.offset, kb.offset + kb.size))
  const outDir = join(repoRoot, 'public', 'fonts')
  mkdirSync(outDir, { recursive: true })
  buildFont(agg, palette, 'FONT.ICN', 'HOMM2 Big', join(outDir, 'homm2-big.ttf'))
  buildFont(agg, palette, 'SMALFONT.ICN', 'HOMM2 Small', join(outDir, 'homm2-small.ttf'))
}

main()
