import { type ReactElement, useEffect, useRef } from 'react'

import { GameButton } from '@/ui/GameButton'
import { GameFrame } from '@/ui/GameFrame'

type StartGateProps = {
  readonly isOpen: boolean
  readonly hasConfirmed: boolean
  readonly onConfirm: () => void
  readonly onStart: () => void
}

// Two-step HOMM3-style intro:
//  1. black screen + welcome modal → OKAY reveals (unblurs) the map;
//  2. a small modal with the horse button → starts playback (the click is the autoplay gesture).
export const StartGate = ({
  isOpen,
  hasConfirmed,
  onConfirm,
  onStart,
}: StartGateProps): ReactElement => {
  const okayRef = useRef<HTMLButtonElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const target = hasConfirmed ? startRef.current : okayRef.current
    target?.focus()
  }, [isOpen, hasConfirmed])

  return (
    <div
      className={`start-gate${isOpen ? '' : ' start-gate--closed'}${hasConfirmed ? ' start-gate--confirmed' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
      aria-hidden={!isOpen}
    >
      <div className="start-gate__fog" aria-hidden="true" />
      {hasConfirmed ? (
        <GameFrame className="start-gate__panel start-gate__panel--start">
          <GameButton
            ref={startRef}
            className="start-gate__button"
            label="Start playing"
            onClick={onStart}
          >
            <span className="game-button__glyph game-button__glyph--horse" aria-hidden="true" />
          </GameButton>
          <p className="start-gate__start-label">Start</p>
        </GameFrame>
      ) : (
        <GameFrame className="start-gate__panel">
          <h1 className="start-gate__title">Heroes of Might &amp; Magic II</h1>
          <p className="start-gate__subtitle">Music Player</p>
          <p className="start-gate__about">
            A fan project. Music from the game by New World Computing.
          </p>
          <button ref={okayRef} type="button" className="start-gate__okay" onClick={onConfirm}>
            Okay
          </button>
        </GameFrame>
      )}
    </div>
  )
}
