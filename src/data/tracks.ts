// Editorial source of truth for the soundtrack (45 tracks: 25 music + 20 event stings).
// `homm2_XX.ogg` = original HOMM2 CD track XX+1 (GOG/DOS scheme, file = musmap index − 1),
// verified against fheroes2 src/fheroes2/agg/mus.cpp. Succession Wars alternate castle
// recordings live in the `sw/` subfolder. The build pipeline (scripts/build-audio.ts)
// transcodes each `src` OGG to `file` (MP3) and emits audio-manifest.json.

export type TrackCategory = 'menu' | 'battle' | 'town' | 'terrain' | 'victory' | 'sting'

export interface Track {
  /** Stable app id / slug (also the MP3 basename minus extension). */
  readonly id: string
  /** Source OGG path relative to the music dir, no extension (may include a subfolder, e.g. `sw/homm2_04`). */
  readonly src: string
  /** Output MP3 filename served to the app. */
  readonly file: string
  readonly title: string
  readonly category: TrackCategory
}

export const CATEGORY_LABELS: Record<TrackCategory, string> = {
  menu: 'Main',
  battle: 'Battle',
  town: 'Towns',
  terrain: 'Terrain',
  victory: 'Victory',
  sting: 'Stings',
}

/** A playback "scope" filter: `all` = all music (excludes stings); otherwise a single category. */
export type Scope = 'all' | TrackCategory

/** Scope chips shown in the UI, in order. Single-track menu/victory are reachable via `all`. */
export const SCOPE_ORDER: readonly Scope[] = ['all', 'battle', 'town', 'terrain', 'sting']

export const SCOPE_LABELS: Record<Scope, string> = {
  all: 'All',
  menu: 'Main',
  battle: 'Battle',
  town: 'Towns',
  terrain: 'Terrain',
  victory: 'Victory',
  sting: 'Stings',
}

// prettier-ignore
export const TRACKS: readonly Track[] = [
  { id: 'menu-main', src: 'homm2_41', file: 'menu-main.mp3', title: 'Main Menu', category: 'menu' },

  { id: 'battle-1', src: 'homm2_01', file: 'battle-1.mp3', title: 'Battle 1', category: 'battle' },
  { id: 'battle-2', src: 'homm2_02', file: 'battle-2.mp3', title: 'Battle 2', category: 'battle' },
  { id: 'battle-3', src: 'homm2_03', file: 'battle-3.mp3', title: 'Battle 3', category: 'battle' },

  // Base castle themes (Price of Loyalty recordings). Each is followed by its Succession Wars variant.
  { id: 'town-knight', src: 'homm2_07', file: 'town-knight.mp3', title: 'Knight Castle', category: 'town' },
  { id: 'town-knight-sw', src: 'sw/homm2_07', file: 'town-knight-sw.mp3', title: 'Knight Castle (Succession Wars)', category: 'town' },
  { id: 'town-barbarian', src: 'homm2_08', file: 'town-barbarian.mp3', title: 'Barbarian Castle', category: 'town' },
  { id: 'town-barbarian-sw', src: 'sw/homm2_08', file: 'town-barbarian-sw.mp3', title: 'Barbarian Castle (Succession Wars)', category: 'town' },
  { id: 'town-sorceress', src: 'homm2_04', file: 'town-sorceress.mp3', title: 'Sorceress Castle', category: 'town' },
  { id: 'town-sorceress-sw', src: 'sw/homm2_04', file: 'town-sorceress-sw.mp3', title: 'Sorceress Castle (Succession Wars)', category: 'town' },
  { id: 'town-warlock', src: 'homm2_05', file: 'town-warlock.mp3', title: 'Warlock Castle', category: 'town' },
  { id: 'town-warlock-sw', src: 'sw/homm2_05', file: 'town-warlock-sw.mp3', title: 'Warlock Castle (Succession Wars)', category: 'town' },
  { id: 'town-wizard', src: 'homm2_09', file: 'town-wizard.mp3', title: 'Wizard Castle', category: 'town' },
  { id: 'town-wizard-sw', src: 'sw/homm2_09', file: 'town-wizard-sw.mp3', title: 'Wizard Castle (Succession Wars)', category: 'town' },
  { id: 'town-necromancer', src: 'homm2_06', file: 'town-necromancer.mp3', title: 'Necromancer Castle', category: 'town' },
  { id: 'town-necromancer-sw', src: 'sw/homm2_06', file: 'town-necromancer-sw.mp3', title: 'Necromancer Castle (Succession Wars)', category: 'town' },

  { id: 'terrain-lava', src: 'homm2_10', file: 'terrain-lava.mp3', title: 'Lava', category: 'terrain' },
  { id: 'terrain-wasteland', src: 'homm2_11', file: 'terrain-wasteland.mp3', title: 'Wasteland', category: 'terrain' },
  { id: 'terrain-desert', src: 'homm2_12', file: 'terrain-desert.mp3', title: 'Desert', category: 'terrain' },
  { id: 'terrain-snow', src: 'homm2_13', file: 'terrain-snow.mp3', title: 'Snow', category: 'terrain' },
  { id: 'terrain-swamp', src: 'homm2_14', file: 'terrain-swamp.mp3', title: 'Swamp', category: 'terrain' },
  { id: 'terrain-ocean', src: 'homm2_15', file: 'terrain-ocean.mp3', title: 'Ocean', category: 'terrain' },
  { id: 'terrain-dirt', src: 'homm2_16', file: 'terrain-dirt.mp3', title: 'Dirt', category: 'terrain' },
  { id: 'terrain-grass', src: 'homm2_17', file: 'terrain-grass.mp3', title: 'Grass', category: 'terrain' },

  { id: 'victory-scenario', src: 'homm2_42', file: 'victory-scenario.mp3', title: 'Scenario Victory', category: 'victory' },

  // Event stings (short jingles). Excludes the 3 "not in use" Caravans clips (homm2_24/25/26).
  { id: 'sting-lost-game', src: 'homm2_18', file: 'sting-lost-game.mp3', title: 'Lost Game', category: 'sting' },
  { id: 'sting-new-week', src: 'homm2_19', file: 'sting-new-week.mp3', title: 'New Week', category: 'sting' },
  { id: 'sting-new-month', src: 'homm2_20', file: 'sting-new-month.mp3', title: 'New Month', category: 'sting' },
  { id: 'sting-archibald', src: 'homm2_21', file: 'sting-archibald.mp3', title: 'Archibald Campaign', category: 'sting' },
  { id: 'sting-puzzle', src: 'homm2_22', file: 'sting-puzzle.mp3', title: 'Map Puzzle', category: 'sting' },
  { id: 'sting-roland', src: 'homm2_23', file: 'sting-roland.mp3', title: 'Roland Campaign', category: 'sting' },
  { id: 'sting-ai-turn', src: 'homm2_27', file: 'sting-ai-turn.mp3', title: 'AI Turn', category: 'sting' },
  { id: 'sting-battle-won', src: 'homm2_28', file: 'sting-battle-won.mp3', title: 'Battle Won', category: 'sting' },
  { id: 'sting-battle-lost', src: 'homm2_29', file: 'sting-battle-lost.mp3', title: 'Battle Lost', category: 'sting' },
  { id: 'sting-dungeon', src: 'homm2_30', file: 'sting-dungeon.mp3', title: 'Dungeon', category: 'sting' },
  { id: 'sting-waterspring', src: 'homm2_31', file: 'sting-waterspring.mp3', title: 'Waterspring', category: 'sting' },
  { id: 'sting-arabian', src: 'homm2_32', file: 'sting-arabian.mp3', title: 'Arabian', category: 'sting' },
  { id: 'sting-hillfort', src: 'homm2_33', file: 'sting-hillfort.mp3', title: 'Hillfort', category: 'sting' },
  { id: 'sting-treehouse', src: 'homm2_34', file: 'sting-treehouse.mp3', title: 'Treehouse', category: 'sting' },
  { id: 'sting-demoncave', src: 'homm2_35', file: 'sting-demoncave.mp3', title: 'Demoncave', category: 'sting' },
  { id: 'sting-experience', src: 'homm2_36', file: 'sting-experience.mp3', title: 'Experience', category: 'sting' },
  { id: 'sting-skill', src: 'homm2_37', file: 'sting-skill.mp3', title: 'Skill', category: 'sting' },
  { id: 'sting-watchtower', src: 'homm2_38', file: 'sting-watchtower.mp3', title: 'Watchtower', category: 'sting' },
  { id: 'sting-xanadu', src: 'homm2_39', file: 'sting-xanadu.mp3', title: 'Xanadu', category: 'sting' },
  { id: 'sting-ultimate-artifact', src: 'homm2_40', file: 'sting-ultimate-artifact.mp3', title: 'Ultimate Artifact', category: 'sting' },
]
