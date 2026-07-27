export type AssetRole =
  'frame' | 'page' | 'btn' | 'btn-pressed' | 'cursor' | 'arrow' | 'settings' | 'creature'

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
  readonly keyLuma?: number
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
      evil: { icn: 'RECRUIT.ICN', index: 0, scale: 2, rotate: 90, tint: [0x50, 0x50, 0x50] },
    },
    // The game's System-Options computer glyph (ADVBTNS #14), keyed out of its button face + tinted.
    settings: {
      good: {
        icn: 'ADVBTNS.ICN',
        index: 14,
        trim: { top: 6, right: 6, bottom: 6, left: 6 },
        scale: 2,
        keyLuma: 120,
        tint: [0x55, 0x2b, 0x0d],
      },
      evil: {
        icn: 'ADVBTNS.ICN',
        index: 14,
        trim: { top: 6, right: 6, bottom: 6, left: 6 },
        scale: 2,
        keyLuma: 120,
        tint: [0x50, 0x50, 0x50],
      },
    },
    // Theme-toggle creature icons (MONS32 army icons): Good = Black Dragon, Evil = Phoenix.
    creature: {
      good: { icn: 'MONS32.ICN', index: 37, scale: 2 },
      evil: { icn: 'MONS32.ICN', index: 28, scale: 2 },
    },
  }

export const ASSET_THEMES = ['good', 'evil'] as const

/*
 * Album-cover art per track, using real game elements (not themed). Keyed by a cover id that
 * AlbumArt derives from the track (town → per-faction castle building). Extracted to
 * `public/art/covers/<key>.png`; keys with no entry fall back to the SVG category emblem.
 */
export const COVERS: Record<string, AssetSource> = {
  // Town songs → the faction's castle as it appears on the adventure map (MINITOWN, 0..5 =
  // Knight/Barbarian/Sorceress/Warlock/Wizard/Necromancer).
  'town-knight': { icn: 'MINITOWN.ICN', index: 0, scale: 5 },
  'town-barbarian': { icn: 'MINITOWN.ICN', index: 1, scale: 5 },
  'town-sorceress': { icn: 'MINITOWN.ICN', index: 2, scale: 5 },
  'town-warlock': { icn: 'MINITOWN.ICN', index: 3, scale: 5 },
  'town-wizard': { icn: 'MINITOWN.ICN', index: 4, scale: 5 },
  'town-necromancer': { icn: 'MINITOWN.ICN', index: 5, scale: 5 },
  // Other categories → a representative game creature / element.
  menu: { icn: 'MONS32.ICN', index: 9, scale: 3 }, // Paladin
  battle: { icn: 'MONS32.ICN', index: 8, scale: 3 }, // Champion (mounted lancer)
  terrain: { icn: 'MONS32.ICN', index: 27, scale: 3 }, // Unicorn (roams the land)
  victory: { icn: 'MONS32.ICN', index: 46, scale: 3 }, // Titan
  sting: { icn: 'MONS32.ICN', index: 20, scale: 3 }, // Sprite
}
