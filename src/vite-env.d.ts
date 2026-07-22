/// <reference types="vite/client" />

// NOTE: `interface` (not `type`) is required here — these augment Vite's global `ImportMeta`
// via declaration merging, which only works with interfaces. This file is excluded from ESLint.

interface ImportMetaEnv {
  /** Base URL where transcoded MP3 audio is served from. Unset in dev → `/audio/`. */
  readonly VITE_AUDIO_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
