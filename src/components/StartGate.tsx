import { type ReactElement, useEffect, useRef } from 'react'

import { GameButton } from '@/ui/GameButton'
import { GameFrame } from '@/ui/GameFrame'

type StartGateProps = {
  readonly isOpen: boolean
  readonly onStart: () => void
}

// HOMM3-style intro: a fog-of-war modal that reveals (unblurs) the map and starts playback on
// the Start (horse) button — which also serves as the autoplay gesture.
export const StartGate = ({ isOpen, onStart }: StartGateProps): ReactElement => {
  const startRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      startRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div
      className={`start-gate${isOpen ? '' : ' start-gate--closed'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      aria-hidden={!isOpen}
    >
      <div className="start-gate__fog" aria-hidden="true" />
      <GameFrame className="start-gate__panel">
        <h1 className="start-gate__title">Heroes of Might &amp; Magic II</h1>
        <p className="start-gate__subtitle">Music Player</p>
        <p className="start-gate__about">
          A fan project. Music from the game by New World Computing. Press the horse to begin.
        </p>
        <GameButton
          ref={startRef}
          className="start-gate__button"
          label="Start playing"
          onClick={onStart}
        >
          <span className="game-button__glyph game-button__glyph--horse" aria-hidden="true" />
        </GameButton>
      </GameFrame>
    </div>
  )
}
