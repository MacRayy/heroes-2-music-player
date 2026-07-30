import { type ReactElement, useEffect, useRef, useState } from 'react'

import { trackShareUrl } from '@/data/share'
import { usePlayerContext } from '@/state/PlayerContext'
import { GameButton } from '@/ui/GameButton'
import { CheckIcon, ShareIcon } from '@/ui/icons'

const COPIED_FEEDBACK_MS = 1600

export const ShareButton = (): ReactElement => {
  const { currentTrack } = usePlayerContext()
  const [isCopied, setIsCopied] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current)
      }
    },
    [],
  )

  const share = async (): Promise<void> => {
    if (currentTrack === null || typeof window === 'undefined') {
      return
    }
    const url = trackShareUrl(window.location.origin, currentTrack.id)
    // Native share sheet on mobile; clipboard fallback (with feedback) elsewhere.
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `${currentTrack.title} — Heroes of Might & Magic II`, url })
      } catch {
        /* user dismissed the share sheet */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        setIsCopied(false)
      }, COPIED_FEEDBACK_MS)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <GameButton
      label={isCopied ? 'Link copied' : 'Share this track'}
      size="sm"
      onClick={() => {
        void share()
      }}
    >
      {isCopied ? <CheckIcon /> : <ShareIcon />}
    </GameButton>
  )
}
