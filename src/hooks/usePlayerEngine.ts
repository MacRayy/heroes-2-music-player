import { useCallback, useEffect, useRef } from 'react'

export interface PlayerEngineHandlers {
  /** Fired when the current track finishes (does not fire for repeat-one replays). */
  onEnded: () => void
  /** Fired on a media error (missing/undecodable source). */
  onError: (message: string) => void
}

export interface PlayerEngine {
  /** The single long-lived audio element. Exposed so the ProgressBar can read time locally. */
  audioRef: React.RefObject<HTMLAudioElement | null>
  /** Point the element at a new URL; optionally start playing once it can. */
  load: (url: string, autoplay: boolean) => void
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
}

function getAudio(): HTMLAudioElement | null {
  return typeof Audio === 'undefined' ? null : new Audio()
}

/**
 * Owns one `HTMLAudioElement` for the app's lifetime and exposes imperative controls.
 * Event listeners are registered once and cleaned up on unmount. Playback is fired as
 * `void el.play().catch(...)` so a blocked-autoplay rejection never throws.
 */
export function usePlayerEngine(handlers: PlayerEngineHandlers): PlayerEngine {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  audioRef.current ??= getAudio()

  // Keep the latest handlers without re-binding listeners every render.
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
      // Autoplay blocked before a user gesture — state stays paused; ignore.
    })
  }, [])

  const pause = useCallback((): void => {
    audioRef.current?.pause()
  }, [])

  const load = useCallback(
    (url: string, autoplay: boolean): void => {
      const el = audioRef.current
      if (el === null) {
        return
      }
      el.src = url
      el.load()
      if (autoplay) {
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

  return { audioRef, load, play, pause, seek, setVolume }
}
