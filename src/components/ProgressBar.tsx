import { useEffect, useRef, useState } from 'react'

import { usePlayerContext } from '@/state/PlayerContext'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }
  const total = Math.floor(seconds)
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Owns the high-frequency `currentTime` locally (fed by the audio element's `timeupdate`) so the
 * ~4 Hz tick never enters global state. While scrubbing, incoming ticks are ignored.
 */
export function ProgressBar(): React.JSX.Element {
  const { audioRef, currentId } = usePlayerContext()
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const scrubbingRef = useRef(false)

  useEffect(() => {
    const el = audioRef.current
    if (el === null) {
      return
    }
    const onTime = (): void => {
      if (!scrubbingRef.current) {
        setCurrent(el.currentTime)
      }
    }
    const onMeta = (): void => {
      setDuration(Number.isFinite(el.duration) ? el.duration : 0)
    }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('durationchange', onMeta)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('durationchange', onMeta)
    }
  }, [audioRef])

  // Reset the displayed position when the track changes.
  useEffect(() => {
    setCurrent(0)
  }, [currentId])

  const seekTo = (value: number): void => {
    setCurrent(value)
    const el = audioRef.current
    if (el !== null) {
      el.currentTime = value
    }
  }

  return (
    <div className="progress">
      <span>{formatTime(current)}</span>
      <input
        className="range"
        type="range"
        min={0}
        max={duration > 0 ? duration : 0}
        step={1}
        value={current}
        aria-label="Seek"
        onPointerDown={() => {
          scrubbingRef.current = true
        }}
        onPointerUp={() => {
          scrubbingRef.current = false
        }}
        onChange={(e) => {
          seekTo(Number(e.target.value))
        }}
      />
      <span>{formatTime(duration)}</span>
    </div>
  )
}
