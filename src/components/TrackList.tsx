import { audioManifest } from '@/data/manifest'
import { CATEGORY_LABELS, CATEGORY_ORDER, type TrackCategory, TRACKS } from '@/data/tracks'
import { usePlayerContext } from '@/state/PlayerContext'

function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined) {
    return ''
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function TrackList(): React.JSX.Element {
  const { currentId, select } = usePlayerContext()

  return (
    <div className="tracklist">
      {CATEGORY_ORDER.map((category: TrackCategory) => {
        const tracks = TRACKS.filter((track) => track.category === category)
        if (tracks.length === 0) {
          return null
        }
        return (
          <div key={category}>
            <h3 className="tracklist__group-label">{CATEGORY_LABELS[category]}</h3>
            {tracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className="tracklist__item"
                aria-current={track.id === currentId}
                onClick={() => {
                  select(track.id)
                }}
              >
                <span>{track.title}</span>
                <span className="tracklist__dur">
                  {formatDuration(audioManifest[track.id]?.durationSec)}
                </span>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
