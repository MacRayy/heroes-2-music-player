import { type ReactElement, type ReactNode, useState } from 'react'

import { coverCandidates, coverDims } from '@/data/covers'
import type { Track, TrackCategory } from '@/data/tracks'

const EMBLEMS: Record<TrackCategory, ReactNode> = {
  menu: <path d="M4 8l4 4 4-7 4 7 4-4-1.5 10H5.5L4 8z" />,
  battle: (
    <path d="M12 2l8 3v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V5l8-3zm-3.2 5.1L7.4 8.5l6 6 1.4-1.4-6-6z" />
  ),
  town: <path d="M4 20V9l2-2V4h3v2h6V4h3v3l2 2v11h-5v-5h-6v5H4zm6-9h4V9h-4v2z" />,
  terrain: <path d="M2 20l6-11 4 6 3-5 7 10H2zm4-9a2 2 0 100-4 2 2 0 000 4z" />,
  victory: <path d="M12 2l2.5 5.5L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 2z" />,
  sting: (
    <path d="M12 2a2 2 0 012 2v.6a6 6 0 014 5.6v3.8l2 2V19H4v-3.4l2-2v-3.8a6 6 0 014-5.6V4a2 2 0 012-2zM9 20h6a3 3 0 01-6 0z" />
  ),
}

type AlbumArtProps = {
  readonly track: Track | null
}

// Cover candidates, most-specific first: the track (e.g. town-knight) then the category (e.g.
// battle). Each is tried as /art/covers/<key>.png; on 404 we fall to the next, finally the SVG.
export const AlbumArt = ({ track }: AlbumArtProps): ReactElement => {
  const category = track?.category ?? null
  const candidates = track === null ? [] : coverCandidates(track)
  const [step, setStep] = useState(0)
  const coverKey = candidates[step]
  const dims = coverKey === undefined ? null : coverDims(coverKey)

  return (
    <div className="album-art" role="img" aria-label={`${track?.title ?? 'No track'} artwork`}>
      {coverKey === undefined ? (
        <svg className="album-art__emblem" viewBox="0 0 24 24" aria-hidden="true">
          {category === null ? EMBLEMS.menu : EMBLEMS[category]}
        </svg>
      ) : (
        <img
          className="album-art__cover"
          src={`/art/covers/${coverKey}.png`}
          alt=""
          width={dims?.width}
          height={dims?.height}
          onError={() => {
            setStep((s) => s + 1)
          }}
        />
      )}
    </div>
  )
}
