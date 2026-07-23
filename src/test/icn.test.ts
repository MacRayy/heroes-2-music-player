import { describe, expect, it } from 'vitest'

import { cropSprite, decodeIcn, loadPalette, scaleSprite } from '../../scripts/icn'

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
