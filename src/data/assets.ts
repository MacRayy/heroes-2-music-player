export type AssetRole = 'frame' | 'page' | 'btn' | 'btn-pressed' | 'cursor' | 'arrow'

export type Trim = {
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly left: number
}

export type AssetSource = {
  readonly icn: string
  readonly index: number
  readonly slice?: number
  readonly trim?: Trim
  readonly scale?: number
  readonly rotate?: 90 | 180 | 270
  readonly tint?: readonly [number, number, number]
}

const SHADOW_TRIM: Trim = { top: 0, right: 0, bottom: 16, left: 16 }

export const ASSETS: Record<AssetRole, { readonly good: AssetSource; readonly evil: AssetSource }> =
  {
    frame: {
      good: { icn: 'SURDRBKG.ICN', index: 0, slice: 22, trim: SHADOW_TRIM },
      evil: { icn: 'SURDRBKE.ICN', index: 0, slice: 22, trim: SHADOW_TRIM },
    },
    // Crop off the right-side control panel (map frame is x 0..~480) so the border is clean wood.
    page: {
      good: {
        icn: 'ADVBORD.ICN',
        index: 0,
        slice: 40,
        trim: { top: 0, right: 160, bottom: 0, left: 0 },
      },
      evil: {
        icn: 'ADVBORDE.ICN',
        index: 0,
        slice: 40,
        trim: { top: 0, right: 160, bottom: 0, left: 0 },
      },
    },
    btn: {
      good: { icn: 'SYSTEM.ICN', index: 11 },
      evil: { icn: 'SYSTEME.ICN', index: 11 },
    },
    'btn-pressed': {
      good: { icn: 'SYSTEM.ICN', index: 12 },
      evil: { icn: 'SYSTEME.ICN', index: 12 },
    },
    // The universal HOMM2 pointer (same sprite for both themes); upscaled for a visible CSS cursor.
    cursor: {
      good: { icn: 'ADVMCO.ICN', index: 0, scale: 2 },
      evil: { icn: 'ADVMCO.ICN', index: 0, scale: 2 },
    },
    // The game's up-arrow (RECRUIT quantity control), rotated to point right — CSS mirrors it for
    // left. Reused for prev/play/next. Tinted dark brown to match the transport glyphs.
    arrow: {
      good: { icn: 'RECRUIT.ICN', index: 0, scale: 2, rotate: 90, tint: [0x55, 0x2b, 0x0d] },
      evil: { icn: 'RECRUIT.ICN', index: 0, scale: 2, rotate: 90, tint: [0x55, 0x2b, 0x0d] },
    },
  }

export const ASSET_THEMES = ['good', 'evil'] as const
