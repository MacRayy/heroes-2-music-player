import { usePlayerContext } from '@/state/PlayerContext'
import { VolumeIcon } from '@/ui/icons'

export function VolumeControl(): React.JSX.Element {
  const { volume, setVolume } = usePlayerContext()
  return (
    <div className="volume">
      <VolumeIcon className="volume__icon" />
      <input
        className="range"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        aria-label="Volume"
        onChange={(e) => {
          setVolume(Number(e.target.value))
        }}
      />
    </div>
  )
}
