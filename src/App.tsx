import { PlayerProvider, usePlayerContext } from '@/state/PlayerContext'

function NowPlaying(): React.JSX.Element {
  const { currentTrack, isPlaying, togglePlay, next, prev } = usePlayerContext()
  return (
    <section>
      <p>
        {currentTrack === null ? 'No track' : currentTrack.title} —{' '}
        {isPlaying ? 'playing' : 'paused'}
      </p>
      <button type="button" onClick={prev}>
        Prev
      </button>
      <button type="button" onClick={togglePlay}>
        Play/Pause
      </button>
      <button type="button" onClick={next}>
        Next
      </button>
    </section>
  )
}

export function App(): React.JSX.Element {
  return (
    <PlayerProvider>
      <main>
        <h1>Heroes of Might &amp; Magic II — Music Player</h1>
        <NowPlaying />
      </main>
    </PlayerProvider>
  )
}
