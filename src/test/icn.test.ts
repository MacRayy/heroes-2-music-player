import { describe, expect, it } from 'vitest'

import {
  cropSprite,
  decodeIcn,
  keyLumaSprite,
  loadPalette,
  padToSquare,
  rotateSprite,
  scaleSprite,
  type Sprite,
  tintSprite,
} from '../../scripts/icn'

// A synthetic 1-sprite ICN: 3×2, header offsetData=13, data = colored/skip/end opcodes.
const buildIcn = (): Uint8Array => {
  const buf = new Uint8Array(26)
  buf[0] = 1 // sprite count (u16)
  buf[2] = 20 // totalSize (u32)
  buf[10] = 3 // width
  buf[12] = 2 // height
  buf[15] = 13 // offsetData (data begins right after the 13-byte header)
  buf.set([0x02, 1, 2, 0x00, 0x01, 3, 0x80], 19) // row0: 2 colored (idx1,2); row1: 1 colored (idx3)
  return buf
}

const palette = ((): Uint8Array => {
  const kb = new Uint8Array(768)
  kb[3] = 63 // index 1 → red
  kb[7] = 63 // index 2 → green
  kb[11] = 63 // index 3 → blue
  return loadPalette(kb)
})()

const pixel = (
  s: { width: number; rgba: Uint8Array },
  x: number,
  y: number,
): [number, number, number, number] => {
  const p = (y * s.width + x) * 4
  return [s.rgba[p] ?? 0, s.rgba[p + 1] ?? 0, s.rgba[p + 2] ?? 0, s.rgba[p + 3] ?? 0]
}

describe('loadPalette', () => {
  it('scales 6-bit VGA to 8-bit', () => {
    const pal = loadPalette(Uint8Array.from([63, 0, 32]))
    expect(pal[0]).toBe(255)
    expect(pal[1]).toBe(0)
    expect(pal[2]).toBe(130)
  })
})

describe('decodeIcn', () => {
  const sprite = decodeIcn(buildIcn(), palette)[0]

  it('decodes dimensions from the header', () => {
    expect(sprite?.width).toBe(3)
    expect(sprite?.height).toBe(2)
  })

  it('places colored pixels and leaves skipped pixels transparent', () => {
    expect(sprite).toBeDefined()
    if (sprite === undefined) {
      return
    }
    expect(pixel(sprite, 0, 0)).toEqual([255, 0, 0, 255]) // idx1 red
    expect(pixel(sprite, 1, 0)).toEqual([0, 255, 0, 255]) // idx2 green
    expect(pixel(sprite, 2, 0)[3]).toBe(0) // end-of-line → transparent
    expect(pixel(sprite, 0, 1)).toEqual([0, 0, 255, 255]) // idx3 blue
    expect(pixel(sprite, 2, 1)[3]).toBe(0) // untouched → transparent
  })
})

describe('scaleSprite', () => {
  it('nearest-neighbour upscales each pixel into a factor×factor block', () => {
    const src = {
      width: 2,
      height: 1,
      offsetX: 0,
      offsetY: 0,
      rgba: Uint8Array.from([255, 0, 0, 255, 0, 0, 255, 255]), // red, blue
    }
    const scaled = scaleSprite(src, 2)
    expect(scaled.width).toBe(4)
    expect(scaled.height).toBe(2)
    // left pixel replicated into the left 2×2 block, right into the right 2×2 block
    expect(pixel(scaled, 0, 0)).toEqual([255, 0, 0, 255])
    expect(pixel(scaled, 1, 1)).toEqual([255, 0, 0, 255])
    expect(pixel(scaled, 2, 0)).toEqual([0, 0, 255, 255])
    expect(pixel(scaled, 3, 1)).toEqual([0, 0, 255, 255])
  })
})

describe('rotateSprite', () => {
  const src = {
    width: 2,
    height: 1,
    offsetX: 0,
    offsetY: 0,
    rgba: Uint8Array.from([255, 0, 0, 255, 0, 0, 255, 255]), // red(left), blue(right)
  }

  it('rotates 90° clockwise (a horizontal pair becomes a vertical column)', () => {
    const rotated = rotateSprite(src, 90)
    expect([rotated.width, rotated.height]).toEqual([1, 2])
    expect(pixel(rotated, 0, 0)).toEqual([255, 0, 0, 255]) // left edge → top
    expect(pixel(rotated, 0, 1)).toEqual([0, 0, 255, 255]) // right edge → bottom
  })

  it('rotates 180° (the pair reverses in place)', () => {
    const rotated = rotateSprite(src, 180)
    expect([rotated.width, rotated.height]).toEqual([2, 1])
    expect(pixel(rotated, 0, 0)).toEqual([0, 0, 255, 255]) // right → left
    expect(pixel(rotated, 1, 0)).toEqual([255, 0, 0, 255])
  })

  it('rotates 270° clockwise (left edge → bottom)', () => {
    const rotated = rotateSprite(src, 270)
    expect([rotated.width, rotated.height]).toEqual([1, 2])
    expect(pixel(rotated, 0, 0)).toEqual([0, 0, 255, 255]) // right edge → top
    expect(pixel(rotated, 0, 1)).toEqual([255, 0, 0, 255]) // left edge → bottom
  })
})

describe('keyLumaSprite', () => {
  it('makes pixels at/above the luminance threshold transparent, keeps darker ones', () => {
    const src = {
      width: 2,
      height: 1,
      offsetX: 0,
      offsetY: 0,
      rgba: Uint8Array.from([48, 48, 48, 255, 208, 208, 208, 255]), // dark, light
    }
    const keyed = keyLumaSprite(src, 120)
    expect(pixel(keyed, 0, 0)[3]).toBe(255) // dark glyph kept
    expect(pixel(keyed, 1, 0)[3]).toBe(0) // light face keyed out
  })
})

describe('tintSprite', () => {
  it('recolours opaque pixels to a flat RGB and leaves transparent ones alone', () => {
    const src = {
      width: 2,
      height: 1,
      offsetX: 0,
      offsetY: 0,
      rgba: Uint8Array.from([255, 200, 0, 255, 0, 0, 0, 0]), // gold, transparent
    }
    const tinted = tintSprite(src, [0x55, 0x2b, 0x0d])
    expect(pixel(tinted, 0, 0)).toEqual([0x55, 0x2b, 0x0d, 255]) // recoloured, alpha kept
    expect(pixel(tinted, 1, 0)).toEqual([0, 0, 0, 0]) // transparent untouched
  })
})

describe('cropSprite', () => {
  it('trims from the given edges', () => {
    const sprite = decodeIcn(buildIcn(), palette)[0]
    expect(sprite).toBeDefined()
    if (sprite === undefined) {
      return
    }
    const cropped = cropSprite(sprite, { top: 0, right: 0, bottom: 0, left: 1 })
    expect(cropped.width).toBe(2)
    expect(cropped.height).toBe(2)
    expect(pixel(cropped, 0, 0)).toEqual([0, 255, 0, 255]) // old (1,0) green
  })
})

describe('padToSquare', () => {
  const makeSprite = (width: number, height: number): Sprite => {
    const rgba = new Uint8Array(width * height * 4)
    for (let i = 0; i < width * height; i += 1) {
      rgba[i * 4] = i + 1 // distinct non-zero red per pixel
      rgba[i * 4 + 3] = 255 // opaque
    }
    return { width, height, offsetX: 0, offsetY: 0, rgba }
  }

  it('pads a tall sprite into a square, centered horizontally, with transparent sides', () => {
    const out = padToSquare(makeSprite(1, 3))
    expect([out.width, out.height]).toEqual([3, 3])
    expect(pixel(out, 1, 0)).toEqual([1, 0, 0, 255])
    expect(pixel(out, 1, 2)).toEqual([3, 0, 0, 255])
    expect(pixel(out, 0, 0)).toEqual([0, 0, 0, 0])
    expect(pixel(out, 2, 2)).toEqual([0, 0, 0, 0])
  })

  it('pads a wide sprite into a square, centered vertically', () => {
    const out = padToSquare(makeSprite(3, 1))
    expect([out.width, out.height]).toEqual([3, 3])
    expect(pixel(out, 0, 1)).toEqual([1, 0, 0, 255])
    expect(pixel(out, 2, 1)).toEqual([3, 0, 0, 255])
    expect(pixel(out, 0, 0)).toEqual([0, 0, 0, 0])
  })

  it('leaves an already-square sprite unchanged in place', () => {
    const out = padToSquare(makeSprite(2, 2))
    expect([out.width, out.height]).toEqual([2, 2])
    expect(pixel(out, 0, 0)).toEqual([1, 0, 0, 255])
    expect(pixel(out, 1, 1)).toEqual([4, 0, 0, 255])
  })
})
