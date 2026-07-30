export type AssetRole =
  | 'frame'
  | 'page'
  | 'btn'
  | 'btn-pressed'
  | 'cursor'
  | 'arrow'
  | 'settings'
  | 'share'
  | 'hero'
  | 'horse'
  | 'chest'

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
    // ×1.5 keeps it ≤32px; larger custom cursors are dropped near viewport edges by Chromium.
    cursor: {
      good: { icn: 'ADVMCO.ICN', index: 0, scale: 1.5 },
      evil: { icn: 'ADVMCO.ICN', index: 0, scale: 1.5 },
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
    // The game's pointing "move" hand (ADVBTNS), keyed off its stone button face — the Share button.
    share: {
      good: {
        icn: 'ADVBTNS.ICN',
        index: 6,
        trim: { top: 5, right: 5, bottom: 5, left: 5 },
        scale: 2,
        keyLuma: 120,
        tint: [0x55, 0x2b, 0x0d],
      },
      evil: {
        icn: 'ADVBTNS.ICN',
        index: 6,
        trim: { top: 5, right: 5, bottom: 5, left: 5 },
        scale: 2,
        keyLuma: 120,
        tint: [0x50, 0x50, 0x50],
      },
    },
    // Theme-toggle hero portraits: the button shows the hero you'll switch TO — Good shows
    // Archibald (→ Evil), Evil shows Roland (→ Good).
    hero: {
      good: { icn: 'PORT0057.ICN', index: 0 },
      evil: { icn: 'PORT0054.ICN', index: 0 },
    },
    // The game's horse glyph (ADVBTNS "next hero"), keyed off its button face — the Start button.
    horse: {
      good: {
        icn: 'ADVBTNS.ICN',
        index: 2,
        trim: { top: 5, right: 5, bottom: 5, left: 5 },
        scale: 2,
        keyLuma: 120,
        tint: [0x55, 0x2b, 0x0d],
      },
      evil: {
        icn: 'ADVBTNS.ICN',
        index: 2,
        trim: { top: 5, right: 5, bottom: 5, left: 5 },
        scale: 2,
        keyLuma: 120,
        tint: [0x50, 0x50, 0x50],
      },
    },
    // Treasure chest (adventure-map object) — kept in full colour for the support button.
    chest: {
      good: { icn: 'OBJNRSRC.ICN', index: 19, scale: 2 },
      evil: { icn: 'OBJNRSRC.ICN', index: 19, scale: 2 },
    },
  }

export const ASSET_THEMES = ['good', 'evil'] as const

/*
 * Album-cover art per track, using real game elements (not themed). Keyed by a cover id that
 * AlbumArt derives from the track (town → per-faction castle building). Extracted to
 * `public/art/covers/<key>.png`; keys with no entry fall back to the SVG category emblem.
 */
export const COVERS: Record<string, AssetSource> = {
  // Town songs → the faction's top-tier (upgraded) creature (MONS32 army icon).
  'town-knight': { icn: 'MONS32.ICN', index: 10, scale: 4 }, // Crusader
  'town-barbarian': { icn: 'MONS32.ICN', index: 19, scale: 4 }, // Cyclops
  'town-sorceress': { icn: 'MONS32.ICN', index: 28, scale: 4 }, // Phoenix
  'town-warlock': { icn: 'MONS32.ICN', index: 37, scale: 4 }, // Black Dragon
  'town-wizard': { icn: 'MONS32.ICN', index: 46, scale: 4 }, // Titan
  'town-necromancer': { icn: 'MONS32.ICN', index: 56, scale: 4 }, // Bone Dragon
  // Other categories → a representative game creature / element.
  menu: { icn: 'PRIMSKIL.ICN', index: 1, scale: 2 }, // heraldic shield (defense skill icon)
  battle: { icn: 'MONS32.ICN', index: 58, scale: 4 }, // Nomad
  terrain: { icn: 'MONS32.ICN', index: 57, scale: 4 }, // Rogue
  victory: { icn: 'PRIMSKIL.ICN', index: 1, scale: 2 }, // heraldic shield
  sting: { icn: 'MONS32.ICN', index: 59, scale: 4 }, // Ghost
  // Campaign tracks → their own per-id cover (the 'campaign' category has no default here).
  'sting-roland': { icn: 'PORT0054.ICN', index: 0, scale: 2 }, // Roland
  'sting-archibald': { icn: 'PORT0057.ICN', index: 0, scale: 2 }, // Archibald
  'sting-ai-turn': { icn: 'MONS32.ICN', index: 60, scale: 4 }, // Genie
}
