import { type RefObject, useCallback, useEffect, useRef } from 'react'

export type PlayerEngineHandlers = {
  onEnded: () => void
  onError: (message: string) => void
}

export type PlayerEngine = {
  audioRef: RefObject<HTMLAudioElement | null>
  load: (url: string, shouldAutoplay: boolean) => void
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
  setLoop: (value: boolean) => void
}

const getAudio = (): HTMLAudioElement | null => (typeof Audio === 'undefined' ? null : new Audio())

export const usePlayerEngine = (handlers: PlayerEngineHandlers): PlayerEngine => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  audioRef.current ??= getAudio()

  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const el = audioRef.current
    if (el === null) {
      return
    }
    const handleEnded = (): void => {
      handlersRef.current.onEnded()
    }
    const handleError = (): void => {
      handlersRef.current.onError(`Audio failed to load: ${el.currentSrc}`)
    }
    el.addEventListener('ended', handleEnded)
    el.addEventListener('error', handleError)
    return () => {
      el.removeEventListener('ended', handleEnded)
      el.removeEventListener('error', handleError)
      el.pause()
    }
  }, [])

  const play = useCallback((): void => {
    const el = audioRef.current
    if (el === null) {
      return
    }
    void el.play().catch(() => {
      /* autoplay blocked before a user gesture — stays paused */
    })
  }, [])

  const pause = useCallback((): void => {
    audioRef.current?.pause()
  }, [])

  const load = useCallback(
    (url: string, shouldAutoplay: boolean): void => {
      const el = audioRef.current
      if (el === null) {
        return
      }
      el.src = url
      el.load()
      if (shouldAutoplay) {
        play()
      }
    },
    [play],
  )

  const seek = useCallback((seconds: number): void => {
    const el = audioRef.current
    if (el === null) {
      return
    }
    el.currentTime = seconds
  }, [])

  const setVolume = useCallback((value: number): void => {
    const el = audioRef.current
    if (el === null) {
      return
    }
    el.volume = Math.min(1, Math.max(0, value))
  }, [])

  // Native looping for repeat-one: gapless, and (unlike play()-on-ended) never autoplay-gated.
  const setLoop = useCallback((value: boolean): void => {
    const el = audioRef.current
    if (el === null) {
      return
    }
    el.loop = value
  }, [])

  return { audioRef, load, play, pause, seek, setVolume, setLoop }
}
