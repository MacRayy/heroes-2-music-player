/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL where transcoded MP3 audio is served from. Unset in dev → `/audio/`. */
  readonly VITE_AUDIO_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
