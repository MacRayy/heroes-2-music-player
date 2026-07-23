// HOMM2 UI art extractor: reads HEROES2.AGG, decodes chosen ICN sprites → transparent PNGs.
// Pure decode lives in ./icn.ts (unit-tested). AGG record table ported from fheroes2
// src/engine/agg_file.cpp; ICN/palette from ./icn.ts.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { PNG } from 'pngjs'

import { ASSET_THEMES, type AssetRole, ASSETS } from '../src/data/assets'
import { openAgg } from './agg'
import { cropSprite, decodeIcn, loadPalette, scaleSprite, type Sprite } from './icn'

const writeSpritePng = (sprite: Sprite, outPath: string): void => {
  const png = new PNG({ width: sprite.width, height: sprite.height })
  png.data.set(sprite.rgba)
  writeFileSync(outPath, PNG.sync.write(png))
}

const main = (): void => {
  const args = process.argv.slice(2)
  const outFlag = args.indexOf('--out')
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const outDir = outFlag !== -1 ? (args[outFlag + 1] ?? '') : join(repoRoot, 'public', 'art', 'ui')
  const dumpFlag = args.indexOf('--dump')
  const dataDir =
    process.env.HOMM2_DATA_DIR ??
    join(homedir(), 'Library', 'Application Support', 'fheroes2', 'data')

  const aggPath = join(dataDir, 'HEROES2.AGG')
  if (!existsSync(aggPath)) {
    console.error(`HEROES2.AGG not found at ${aggPath}. Set HOMM2_DATA_DIR.`)
    process.exit(1)
  }
  const agg = openAgg(aggPath)
  const kbpal = agg.records.get('KB.PAL')
  if (kbpal === undefined) {
    console.error('KB.PAL not found in AGG')
    process.exit(1)
  }
  const palette = loadPalette(agg.data.subarray(kbpal.offset, kbpal.offset + kbpal.size))

  const spritesOf = (icn: string): Sprite[] => {
    const rec = agg.records.get(icn)
    if (rec === undefined) {
      console.error(`ICN not found in AGG: ${icn}`)
      process.exit(1)
    }
    return decodeIcn(agg.data.subarray(rec.offset, rec.offset + rec.size), palette)
  }

  if (dumpFlag !== -1) {
    const icnNames = args.slice(dumpFlag + 1).filter((a) => a.toUpperCase().endsWith('.ICN'))
    for (const icnName of icnNames) {
      const sprites = spritesOf(icnName)
      const dir = join(outDir, icnName.replace('.ICN', ''))
      mkdirSync(dir, { recursive: true })
      sprites.forEach((s, i) => {
        writeSpritePng(s, join(dir, `${String(i).padStart(3, '0')}.png`))
      })
      console.log(
        `${icnName}: ${sprites.length} sprites (first ${sprites[0]?.width}x${sprites[0]?.height})`,
      )
    }
    return
  }

  mkdirSync(outDir, { recursive: true })
  const manifest: Record<string, { file: string; width: number; height: number; slice?: number }> =
    {}
  for (const role of Object.keys(ASSETS) as AssetRole[]) {
    for (const theme of ASSET_THEMES) {
      const source = ASSETS[role][theme]
      const decoded = spritesOf(source.icn)[source.index]
      if (decoded === undefined) {
        console.error(`sprite ${source.index} missing in ${source.icn}`)
        process.exit(1)
      }
      const cropped = source.trim === undefined ? decoded : cropSprite(decoded, source.trim)
      const sprite = source.scale === undefined ? cropped : scaleSprite(cropped, source.scale)
      const file = `${role}-${theme}.png`
      writeSpritePng(sprite, join(outDir, file))
      manifest[`${role}.${theme}`] = {
        file,
        width: sprite.width,
        height: sprite.height,
        ...(source.slice === undefined ? {} : { slice: source.slice }),
      }
    }
  }
  writeFileSync(
    join(repoRoot, 'src', 'data', 'art-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )
  console.log(`✔ extracted ${Object.keys(manifest).length} role×theme assets → ${outDir}`)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
