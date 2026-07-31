// Pure HOMM2 ICN/palette decode (no I/O) so it can be unit-tested.
// Ported from fheroes2 (GPL): src/engine/image_tool.cpp `decodeICNSprite` (RLE + transform layer),
// src/tools/icn2img.cpp (ICN layout), src/engine/image_palette.cpp (palette scaling).

export type Sprite = {
  width: number
  height: number
  offsetX: number
  offsetY: number
  rgba: Uint8Array
}

export type Trim = { top: number; right: number; bottom: number; left: number }

const u16 = (d: Uint8Array, o: number): number => (d[o] ?? 0) | ((d[o + 1] ?? 0) << 8)
const u32 = (d: Uint8Array, o: number): number =>
  ((d[o] ?? 0) | ((d[o + 1] ?? 0) << 8) | ((d[o + 2] ?? 0) << 16) | ((d[o + 3] ?? 0) << 24)) >>> 0
const i16 = (d: Uint8Array, o: number): number => (u16(d, o) << 16) >> 16

/** KB.PAL is 768 bytes of 6-bit VGA values; scale to 8-bit. */
export const loadPalette = (kbpal: Uint8Array): Uint8Array => {
  const pal = new Uint8Array(256 * 3)
  for (let i = 0; i < 256 * 3; i += 1) {
    pal[i] = Math.min(255, Math.round((kbpal[i] ?? 0) * (255 / 63)))
  }
  return pal
}

const SHADOW_ALPHA: Record<number, number> = { 2: 178, 3: 140, 4: 102, 5: 64 }

export const decodeIcn = (buf: Uint8Array, palette: Uint8Array): Sprite[] => {
  const spritesCount = u16(buf, 0)
  const totalSize = u32(buf, 2)
  const beginPos = 6
  const headers = Array.from({ length: spritesCount }, (_unused, i) => {
    const h = beginPos + i * 13
    return {
      offsetX: i16(buf, h),
      offsetY: i16(buf, h + 2),
      width: u16(buf, h + 4),
      height: u16(buf, h + 6),
      offsetData: u32(buf, h + 9),
    }
  })

  return headers.map((header, idx) => {
    const { width, height } = header
    const rgba = new Uint8Array(width * height * 4)
    const start = beginPos + header.offsetData
    const nextOffset =
      idx + 1 < spritesCount ? (headers[idx + 1]?.offsetData ?? totalSize) : totalSize
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
    const putColor = (x: number, y: number, index: number, alpha: number): void => {
      const c = index * 3
      put(x, y, palette[c] ?? 0, palette[c + 1] ?? 0, palette[c + 2] ?? 0, alpha)
    }

    let data = start
    let posX = 0
    let posY = 0
    while (data < end && data < buf.length) {
      const cmd = buf[data] ?? 0x80
      if (cmd === 0x00) {
        posY += 1
        posX = 0
        data += 1
      } else if (cmd < 0x80) {
        for (let k = 0; k < cmd; k += 1) {
          putColor(posX, posY, buf[data + 1 + k] ?? 0, 255)
          posX += 1
        }
        data += 1 + cmd
      } else if (cmd === 0x80) {
        break
      } else if (cmd < 0xc0) {
        posX += cmd - 0x80
        data += 1
      } else if (cmd === 0xc0) {
        const transformValue = buf[data + 1] ?? 0
        const low = transformValue & 0x03
        const pixelCount = low !== 0 ? low : (buf[data + 2] ?? 0)
        data += low !== 0 ? 2 : 3
        if ((transformValue & 0x40) !== 0) {
          const alpha = SHADOW_ALPHA[((transformValue & 0x3c) >> 2) + 2]
          if (alpha !== undefined) {
            for (let k = 0; k < pixelCount; k += 1) {
              put(posX + k, posY, 0, 0, 0, alpha)
            }
          }
        }
        posX += pixelCount
      } else {
        const pixelCount = cmd === 0xc1 ? (buf[data + 1] ?? 0) : cmd - 0xc0
        const colorPos = cmd === 0xc1 ? data + 2 : data + 1
        const index = buf[colorPos] ?? 0
        for (let k = 0; k < pixelCount; k += 1) {
          putColor(posX + k, posY, index, 255)
        }
        posX += pixelCount
        data = colorPos + 1
      }
    }
    return { width, height, offsetX: header.offsetX, offsetY: header.offsetY, rgba }
  })
}

/** Rotate a sprite by a multiple of 90° clockwise (used to turn game up-arrows sideways). */
export const rotateSprite = (sprite: Sprite, degrees: 90 | 180 | 270): Sprite => {
  const quarter = ((degrees / 90) % 4) as 0 | 1 | 2 | 3
  const swaps = quarter === 1 || quarter === 3
  const width = swaps ? sprite.height : sprite.width
  const height = swaps ? sprite.width : sprite.height
  const rgba = new Uint8Array(width * height * 4)
  for (let dy = 0; dy < height; dy += 1) {
    for (let dx = 0; dx < width; dx += 1) {
      const [sx, sy] =
        quarter === 1
          ? [dy, sprite.height - 1 - dx]
          : quarter === 2
            ? [sprite.width - 1 - dx, sprite.height - 1 - dy]
            : [sprite.width - 1 - dy, dx]
      rgba.set(
        sprite.rgba.subarray((sy * sprite.width + sx) * 4, (sy * sprite.width + sx) * 4 + 4),
        (dy * width + dx) * 4,
      )
    }
  }
  return { width, height, offsetX: 0, offsetY: 0, rgba }
}

/** Make pixels at/above a luminance threshold transparent — isolates a dark glyph from a light
 * button face (e.g. the System-Options computer from its beige button). */
export const keyLumaSprite = (sprite: Sprite, maxLuma: number): Sprite => {
  const rgba = new Uint8Array(sprite.rgba)
  for (let i = 0; i < rgba.length; i += 4) {
    const luma = 0.3 * (rgba[i] ?? 0) + 0.59 * (rgba[i + 1] ?? 0) + 0.11 * (rgba[i + 2] ?? 0)
    if (luma >= maxLuma) {
      rgba[i + 3] = 0
    }
  }
  return {
    width: sprite.width,
    height: sprite.height,
    offsetX: sprite.offsetX,
    offsetY: sprite.offsetY,
    rgba,
  }
}

/** Recolour every non-transparent pixel to a flat RGB (keeps alpha) — e.g. tint the gold arrow. */
export const tintSprite = (sprite: Sprite, rgb: readonly [number, number, number]): Sprite => {
  const rgba = new Uint8Array(sprite.rgba)
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] !== 0) {
      rgba[i] = rgb[0]
      rgba[i + 1] = rgb[1]
      rgba[i + 2] = rgb[2]
    }
  }
  return {
    width: sprite.width,
    height: sprite.height,
    offsetX: sprite.offsetX,
    offsetY: sprite.offsetY,
    rgba,
  }
}

/** Nearest-neighbour integer upscale (keeps pixel art crisp; used for cursors). */
export const scaleSprite = (sprite: Sprite, factor: number): Sprite => {
  // Round to keep integer dimensions for fractional factors.
  const width = Math.round(sprite.width * factor)
  const height = Math.round(sprite.height * factor)
  const rgba = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = (Math.floor(y / factor) * sprite.width + Math.floor(x / factor)) * 4
      rgba.set(sprite.rgba.subarray(src, src + 4), (y * width + x) * 4)
    }
  }
  return { width, height, offsetX: sprite.offsetX, offsetY: sprite.offsetY, rgba }
}

export const cropSprite = (sprite: Sprite, trim: Trim): Sprite => {
  const width = sprite.width - trim.left - trim.right
  const height = sprite.height - trim.top - trim.bottom
  const rgba = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    const srcStart = ((y + trim.top) * sprite.width + trim.left) * 4
    rgba.set(sprite.rgba.subarray(srcStart, srcStart + width * 4), y * width * 4)
  }
  return { width, height, offsetX: sprite.offsetX, offsetY: sprite.offsetY, rgba }
}

// Crop away fully-transparent margins so the visible content (not the sprite's baked-in padding)
// is what gets centered downstream.
export const trimTransparent = (sprite: Sprite): Sprite => {
  let top = sprite.height
  let bottom = -1
  let left = sprite.width
  let right = -1
  for (let y = 0; y < sprite.height; y += 1) {
    for (let x = 0; x < sprite.width; x += 1) {
      if ((sprite.rgba[(y * sprite.width + x) * 4 + 3] ?? 0) !== 0) {
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
        left = Math.min(left, x)
        right = Math.max(right, x)
      }
    }
  }
  if (right < left || bottom < top) {
    return sprite
  }
  return cropSprite(sprite, {
    top,
    left,
    right: sprite.width - 1 - right,
    bottom: sprite.height - 1 - bottom,
  })
}

// Scale a sprite to fit a `safeZone` fraction of a `size`×`size` opaque square (filled `bg`) and
// alpha-composite it centered. Opaque + full-bleed is what a PWA maskable icon needs — a transparent
// one gets masked wrong. `safeZone` ~0.9 for `any`, smaller for maskable's central-circle safe area.
export const compositeOnOpaque = (
  sprite: Sprite,
  bg: readonly [number, number, number],
  size: number,
  safeZone: number,
): Sprite => {
  const rgba = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i += 1) {
    rgba[i * 4] = bg[0]
    rgba[i * 4 + 1] = bg[1]
    rgba[i * 4 + 2] = bg[2]
    rgba[i * 4 + 3] = 255
  }
  const box = size * safeZone
  const scale = Math.min(box / sprite.width, box / sprite.height)
  const dw = Math.round(sprite.width * scale)
  const dh = Math.round(sprite.height * scale)
  const ox = Math.floor((size - dw) / 2)
  const oy = Math.floor((size - dh) / 2)
  for (let y = 0; y < dh; y += 1) {
    for (let x = 0; x < dw; x += 1) {
      const sx = Math.min(sprite.width - 1, Math.floor(x / scale))
      const sy = Math.min(sprite.height - 1, Math.floor(y / scale))
      const s = (sy * sprite.width + sx) * 4
      const a = sprite.rgba[s + 3] ?? 0
      if (a !== 0) {
        const d = ((oy + y) * size + (ox + x)) * 4
        const alpha = a / 255
        rgba[d] = Math.round((sprite.rgba[s] ?? 0) * alpha + (rgba[d] ?? 0) * (1 - alpha))
        rgba[d + 1] = Math.round(
          (sprite.rgba[s + 1] ?? 0) * alpha + (rgba[d + 1] ?? 0) * (1 - alpha),
        )
        rgba[d + 2] = Math.round(
          (sprite.rgba[s + 2] ?? 0) * alpha + (rgba[d + 2] ?? 0) * (1 - alpha),
        )
        rgba[d + 3] = 255
      }
    }
  }
  return { width: size, height: size, offsetX: 0, offsetY: 0, rgba }
}

// Center a sprite on a transparent square canvas (side = the larger dimension).
export const padToSquare = (sprite: Sprite): Sprite => {
  const side = Math.max(sprite.width, sprite.height)
  const rgba = new Uint8Array(side * side * 4)
  const dx = Math.floor((side - sprite.width) / 2)
  const dy = Math.floor((side - sprite.height) / 2)
  for (let y = 0; y < sprite.height; y += 1) {
    const src = y * sprite.width * 4
    rgba.set(sprite.rgba.subarray(src, src + sprite.width * 4), ((y + dy) * side + dx) * 4)
  }
  return { width: side, height: side, offsetX: 0, offsetY: 0, rgba }
}
