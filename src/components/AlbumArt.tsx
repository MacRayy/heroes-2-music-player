import type { TrackCategory } from '@/data/tracks'

// Heraldic placeholder emblems per category (authentic per-track art is deferred; see backlog).
const EMBLEMS: Record<TrackCategory, React.ReactNode> = {
  menu: <path d="M4 8l4 4 4-7 4 7 4-4-1.5 10H5.5L4 8z" />,
  battle: (
    <path d="M12 2l8 3v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V5l8-3zm-3.2 5.1L7.4 8.5l6 6 1.4-1.4-6-6z" />
  ),
  town: <path d="M4 20V9l2-2V4h3v2h6V4h3v3l2 2v11h-5v-5h-6v5H4zm6-9h4V9h-4v2z" />,
  terrain: <path d="M2 20l6-11 4 6 3-5 7 10H2zm4-9a2 2 0 100-4 2 2 0 000 4z" />,
  victory: <path d="M12 2l2.5 5.5L20 8l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5L12 2z" />,
}

interface AlbumArtProps {
  readonly category: TrackCategory | null
  readonly title: string
}

export function AlbumArt({ category, title }: AlbumArtProps): React.JSX.Element {
  return (
    <div className="album-art" role="img" aria-label={`${title} artwork`}>
      <svg className="album-art__emblem" viewBox="0 0 24 24" aria-hidden="true">
        {category === null ? EMBLEMS.menu : EMBLEMS[category]}
      </svg>
    </div>
  )
}
