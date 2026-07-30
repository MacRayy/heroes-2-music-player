import { TRACKS } from './tracks'

export const TRACK_PARAM = 'track'

// A shared track id from the URL query, or null if absent/unknown.
export const parseTrackParam = (search: string): string | null => {
  const id = new URLSearchParams(search).get(TRACK_PARAM)
  return id !== null && TRACKS.some((track) => track.id === id) ? id : null
}

export const trackShareUrl = (origin: string, trackId: string): string =>
  `${origin}/?${TRACK_PARAM}=${encodeURIComponent(trackId)}`
