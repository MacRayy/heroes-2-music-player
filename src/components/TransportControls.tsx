import { usePlayerContext } from '@/state/PlayerContext'
import { GameButton } from '@/ui/GameButton'
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
} from '@/ui/icons'

export function TransportControls(): React.JSX.Element {
  const { isPlaying, shuffle, repeat, togglePlay, next, prev, toggleShuffle, cycleRepeat } =
    usePlayerContext()

  const repeatLabel =
    repeat === 'off' ? 'Repeat: off' : repeat === 'all' ? 'Repeat: all' : 'Repeat: one'

  return (
    <div className="transport">
      <GameButton label="Shuffle" size="sm" isPressed={shuffle} onClick={toggleShuffle}>
        <ShuffleIcon />
      </GameButton>
      <GameButton label="Previous track" onClick={prev}>
        <PrevIcon />
      </GameButton>
      <GameButton label={isPlaying ? 'Pause' : 'Play'} size="lg" onClick={togglePlay}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </GameButton>
      <GameButton label="Next track" onClick={next}>
        <NextIcon />
      </GameButton>
      <GameButton label={repeatLabel} size="sm" isPressed={repeat !== 'off'} onClick={cycleRepeat}>
        {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
      </GameButton>
    </div>
  )
}
