// Editorial source of truth for the in-scope soundtrack (19 full-length themes).
// `homm2_XX.ogg` = original HOMM2 CD track XX+1 (verified against fheroes2 mus.cpp + durations).
// The build pipeline (scripts/build-audio.ts) transcodes each `src` OGG to `file` (MP3) and
// emits audio-manifest.json; the app reads titles/categories/order from here.

export type TrackCategory = 'menu' | 'battle' | 'town' | 'terrain' | 'victory'

export interface Track {
  /** Stable app id / slug (also the MP3 basename minus extension). */
  readonly id: string
  /** Source OGG basename in the fheroes2 music dir (no extension). */
  readonly src: string
  /** Output MP3 filename served to the app. */
  readonly file: string
  readonly title: string
  readonly category: TrackCategory
}

export const CATEGORY_ORDER: readonly TrackCategory[] = [
  'menu',
  'battle',
  'town',
  'terrain',
  'victory',
]

export const CATEGORY_LABELS: Record<TrackCategory, string> = {
  menu: 'Main',
  battle: 'Battle',
  town: 'Towns',
  terrain: 'Terrain',
  victory: 'Victory',
}

export const TRACKS: readonly Track[] = [
  { id: 'menu-main', src: 'homm2_41', file: 'menu-main.mp3', title: 'Main Menu', category: 'menu' },

  { id: 'battle-1', src: 'homm2_01', file: 'battle-1.mp3', title: 'Battle 1', category: 'battle' },
  { id: 'battle-2', src: 'homm2_02', file: 'battle-2.mp3', title: 'Battle 2', category: 'battle' },
  { id: 'battle-3', src: 'homm2_03', file: 'battle-3.mp3', title: 'Battle 3', category: 'battle' },

  { id: 'town-knight', src: 'homm2_04', file: 'town-knight.mp3', title: 'Knight Castle', category: 'town' }, // prettier-ignore
  { id: 'town-barbarian', src: 'homm2_05', file: 'town-barbarian.mp3', title: 'Barbarian Castle', category: 'town' }, // prettier-ignore
  { id: 'town-sorceress', src: 'homm2_06', file: 'town-sorceress.mp3', title: 'Sorceress Castle', category: 'town' }, // prettier-ignore
  { id: 'town-warlock', src: 'homm2_07', file: 'town-warlock.mp3', title: 'Warlock Castle', category: 'town' }, // prettier-ignore
  { id: 'town-wizard', src: 'homm2_08', file: 'town-wizard.mp3', title: 'Wizard Castle', category: 'town' }, // prettier-ignore
  { id: 'town-necromancer', src: 'homm2_09', file: 'town-necromancer.mp3', title: 'Necromancer Castle', category: 'town' }, // prettier-ignore

  { id: 'terrain-lava', src: 'homm2_10', file: 'terrain-lava.mp3', title: 'Lava', category: 'terrain' }, // prettier-ignore
  { id: 'terrain-wasteland', src: 'homm2_11', file: 'terrain-wasteland.mp3', title: 'Wasteland', category: 'terrain' }, // prettier-ignore
  { id: 'terrain-desert', src: 'homm2_12', file: 'terrain-desert.mp3', title: 'Desert', category: 'terrain' }, // prettier-ignore
  { id: 'terrain-snow', src: 'homm2_13', file: 'terrain-snow.mp3', title: 'Snow', category: 'terrain' }, // prettier-ignore
  { id: 'terrain-swamp', src: 'homm2_14', file: 'terrain-swamp.mp3', title: 'Swamp', category: 'terrain' }, // prettier-ignore
  { id: 'terrain-ocean', src: 'homm2_15', file: 'terrain-ocean.mp3', title: 'Ocean', category: 'terrain' }, // prettier-ignore
  { id: 'terrain-dirt', src: 'homm2_16', file: 'terrain-dirt.mp3', title: 'Dirt', category: 'terrain' }, // prettier-ignore
  { id: 'terrain-grass', src: 'homm2_17', file: 'terrain-grass.mp3', title: 'Grass', category: 'terrain' }, // prettier-ignore

  { id: 'victory-scenario', src: 'homm2_42', file: 'victory-scenario.mp3', title: 'Scenario Victory', category: 'victory' }, // prettier-ignore
]
