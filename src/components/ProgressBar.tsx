import { type ReactElement, useEffect, useRef, useState } from 'react'

import { usePlayerContext } from '@/state/PlayerContext'

export const ProgressBar = (): ReactElement => {
  const { audioRef, currentId } = usePlayerContext()
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const isScrubbingRef = useRef(false)

  useEffect(() => {
    const el = audioRef.current
    if (el === null) {
      return
    }
    const onTime = (): void => {
      if (!isScrubbingRef.current) {
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
      <input
        className="range"
        type="range"
        min={0}
        max={duration > 0 ? duration : 0}
        step={1}
        value={current}
        aria-label="Seek"
        onPointerDown={() => {
          isScrubbingRef.current = true
        }}
        onPointerUp={() => {
          isScrubbingRef.current = false
        }}
        onChange={(e) => {
          seekTo(Number(e.target.value))
        }}
      />
    </div>
  )
}
