import manifestJson from './audio-manifest.json'

export type AudioManifestEntry = {
  readonly file: string
  readonly src: string
  readonly durationSec: number
}

export const audioManifest: Readonly<Record<string, AudioManifestEntry>> = manifestJson

export const joinUrl = (base: string, file: string): string => {
  const trimmedBase = base.replace(/\/+$/v, '')
  const trimmedFile = file.replace(/^\/+/v, '')
  return `${trimmedBase}/${trimmedFile}`
}

export const resolveAudioUrl = (file: string): string => {
  const base = import.meta.env.VITE_AUDIO_BASE_URL ?? '/audio/'
  return joinUrl(base === '' ? '/audio/' : base, file)
}
