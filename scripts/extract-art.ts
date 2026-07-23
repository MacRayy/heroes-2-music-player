// HOMM2 UI art extractor: AGG record table + ICN sprite RLE + KB.PAL palette → transparent PNGs.
// Decode ported from fheroes2 (GPL, build-time only): src/engine/agg_file.cpp (AGG table),
// src/engine/image_tool.cpp `decodeICNSprite` (ICN RLE + transform layer), src/tools/icn2img.cpp
// (ICN file layout: u16 count, u32 totalSize, count×13-byte ICNHeader, then sprite data).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PNG } from 'pngjs'

import { ASSET_THEMES, type AssetRole, ASSETS } from '../src/data/assets'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..')
const DEFAULT_DATA_DIR = join(homedir(), 'Library', 'Application Support', 'fheroes2', 'data')
const dataDir = process.env.HOMM2_DATA_DIR ?? DEFAULT_DATA_DIR

type AggRecord = { offset: number; size: number }
type Sprite = { width: number; height: number; offsetX: number; offsetY: number; rgba: Buffer }

const openAgg = (path: string): { data: Buffer; records: Map<string, AggRecord> } => {
  const data = readFileSync(path)
  const count = data.readUInt16LE(0)
  const nameStart = data.length - 15 * count
  const records = new Map<string, AggRecord>()
  for (let i = 0; i < count; i += 1) {
    const rawName = data.subarray(nameStart + i * 15, nameStart + i * 15 + 15)
    const end = rawName.indexOf(0)
    const name = rawName.toString('latin1', 0, end === -1 ? 15 : end)
    const fat = 2 + i * 12
    const offset = data.readUInt32LE(fat + 4)
    const size = data.readUInt32LE(fat + 8)
    records.set(name, { offset, size })
  }
  return { data, records }
}

const loadPalette = (kbpal: Buffer): Uint8Array => {
  const pal = new Uint8Array(256 * 3)
  for (let i = 0; i < 256 * 3; i += 1) {
    pal[i] = Math.min(255, Math.round((kbpal[i] ?? 0) * (255 / 63)))
  }
  return pal
}

const SHADOW_ALPHA: Record<number, number> = { 2: 178, 3: 140, 4: 102, 5: 64 }

const decodeIcn = (buf: Buffer, palette: Uint8Array): Sprite[] => {
  const spritesCount = buf.readUInt16LE(0)
  const totalSize = buf.readUInt32LE(2)
  const beginPos = 6
  const headers = Array.from({ length: spritesCount }, (_unused, i) => {
    const h = beginPos + i * 13
    return {
      offsetX: buf.readInt16LE(h),
      offsetY: buf.readInt16LE(h + 2),
      width: buf.readUInt16LE(h + 4),
      height: buf.readUInt16LE(h + 6),
      animationFrames: buf.readUInt8(h + 8),
      offsetData: buf.readUInt32LE(h + 9),
    }
  })

  return headers.map((header, idx) => {
    const { width, height } = header
    const rgba = Buffer.alloc(width * height * 4) // all transparent
    const start = beginPos + header.offsetData
    const nextOffset = idx + 1 < spritesCount ? headers[idx + 1]!.offsetData : totalSize
    const end = beginPos + nextOffset

    const put = (x: number, y: number, r: number, g: number, b: number, a: number): void => {
      if (x < 0 || x >= width || y < 0 || y >= height) {
        return
      }
      const p = (y * width + x) * 4
      rgba[p] = r
      rgba[p + 1] = g
      rgba[p + 2] = b
      rgba[p + 3] = a
    }

    let data = start
    let posX = 0
    let posY = 0
    while (data < end && data < buf.length) {
      const cmd = buf[data]!
      if (cmd === 0x00) {
        posY += 1
        posX = 0
        data += 1
      } else if (cmd < 0x80) {
        for (let k = 0; k < cmd; k += 1) {
          const idxColor = buf[data + 1 + k]! * 3
          put(posX, posY, palette[idxColor]!, palette[idxColor + 1]!, palette[idxColor + 2]!, 255)
          posX += 1
        }
        data += 1 + cmd
      } else if (cmd === 0x80) {
        break
      } else if (cmd < 0xc0) {
        posX += cmd - 0x80
        data += 1
      } else if (cmd === 0xc0) {
        const transformValue = buf[data + 1]!
        const low = transformValue & 0x03
        const pixelCount = low !== 0 ? low : buf[data + 2]!
        data += low !== 0 ? 2 : 3
        if ((transformValue & 0x40) !== 0) {
          const transformType = ((transformValue & 0x3c) >> 2) + 2
          const alpha = SHADOW_ALPHA[transformType]
          if (alpha !== undefined) {
            for (let k = 0; k < pixelCount; k += 1) {
              put(posX + k, posY, 0, 0, 0, alpha)
            }
          }
        }
        posX += pixelCount
      } else {
        const pixelCount = cmd === 0xc1 ? buf[data + 1]! : cmd - 0xc0
        const colorPos = cmd === 0xc1 ? data + 2 : data + 1
        const idxColor = buf[colorPos]! * 3
        for (let k = 0; k < pixelCount; k += 1) {
          put(
            posX + k,
            posY,
            palette[idxColor]!,
            palette[idxColor + 1]!,
            palette[idxColor + 2]!,
            255,
          )
        }
        posX += pixelCount
        data = colorPos + 1
      }
    }
    return { width, height, offsetX: header.offsetX, offsetY: header.offsetY, rgba }
  })
}

const cropSprite = (
  sprite: Sprite,
  trim: { top: number; right: number; bottom: number; left: number },
): Sprite => {
  const width = sprite.width - trim.left - trim.right
  const height = sprite.height - trim.top - trim.bottom
  const rgba = Buffer.alloc(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    const srcStart = ((y + trim.top) * sprite.width + trim.left) * 4
    sprite.rgba.copy(rgba, y * width * 4, srcStart, srcStart + width * 4)
  }
  return { width, height, offsetX: sprite.offsetX, offsetY: sprite.offsetY, rgba }
}

const writeSpritePng = (sprite: Sprite, outPath: string): void => {
  const png = new PNG({ width: sprite.width, height: sprite.height })
  sprite.rgba.copy(png.data)
  writeFileSync(outPath, PNG.sync.write(png))
}

// --- CLI: `--dump ICN...` writes every sprite of each ICN to <out>/<icn>/<idx>.png ---
const args = process.argv.slice(2)
const outFlag = args.indexOf('--out')
const outDir = outFlag !== -1 ? args[outFlag + 1]! : join(repoRoot, 'public', 'art', 'ui')
const dumpFlag = args.indexOf('--dump')

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

const spriteFromRole = (icn: string, index: number): Sprite => {
  const rec = agg.records.get(icn)
  if (rec === undefined) {
    console.error(`ICN not found in AGG: ${icn}`)
    process.exit(1)
  }
  const sprites = decodeIcn(agg.data.subarray(rec.offset, rec.offset + rec.size), palette)
  const sprite = sprites[index]
  if (sprite === undefined) {
    console.error(`sprite ${index} missing in ${icn}`)
    process.exit(1)
  }
  return sprite
}

if (dumpFlag !== -1) {
  const icnNames = args.slice(dumpFlag + 1).filter((a) => a.toUpperCase().endsWith('.ICN'))
  for (const icnName of icnNames) {
    const rec = agg.records.get(icnName)
    if (rec === undefined) {
      console.warn(`skip: ${icnName} not in AGG`)
      continue
    }
    const sprites = decodeIcn(agg.data.subarray(rec.offset, rec.offset + rec.size), palette)
    const dir = join(outDir, icnName.replace('.ICN', ''))
    mkdirSync(dir, { recursive: true })
    sprites.forEach((s, i) => {
      writeSpritePng(s, join(dir, `${String(i).padStart(3, '0')}.png`))
    })
    console.log(
      `${icnName}: ${sprites.length} sprites (first ${sprites[0]?.width}x${sprites[0]?.height})`,
    )
  }
} else {
  // Production: extract every role×theme in assets.ts → public/art/ui + committed manifest.
  mkdirSync(outDir, { recursive: true })
  const manifest: Record<string, { file: string; width: number; height: number; slice?: number }> =
    {}
  const roles = Object.keys(ASSETS) as AssetRole[]
  for (const role of roles) {
    for (const theme of ASSET_THEMES) {
      const source = ASSETS[role][theme]
      const decoded = spriteFromRole(source.icn, source.index)
      const sprite = source.trim === undefined ? decoded : cropSprite(decoded, source.trim)
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
  const manifestPath = join(repoRoot, 'src', 'data', 'art-manifest.json')
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  console.log(`✔ extracted ${Object.keys(manifest).length} role×theme assets → ${outDir}`)
}
