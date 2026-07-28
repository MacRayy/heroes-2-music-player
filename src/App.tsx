import { type ReactElement, useState } from 'react'

import { Background } from '@/components/Background'
import { Footer } from '@/components/Footer'
import { PlayerPanel } from '@/components/PlayerPanel'
import { StartGate } from '@/components/StartGate'
import { Support } from '@/components/Support'
import { PlayerProvider, usePlayerContext } from '@/state/PlayerContext'
import { ThemeProvider } from '@/theme/ThemeProvider'

import './components/player.css'

const Shell = (): ReactElement => {
  // Two-step intro: OKAY reveals the map, the horse button then starts playback.
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const { togglePlay } = usePlayerContext()

  const handleStart = (): void => {
    setHasStarted(true)
    togglePlay()
  }

  return (
    <>
      <Background isRevealed={hasConfirmed} />
      <div className={`app${hasStarted ? '' : ' app--hidden'}`}>
        <PlayerPanel />
      </div>
      <div className="page-frame" aria-hidden="true" />
      {hasStarted ? <Support /> : null}
      {hasStarted ? <Footer /> : null}
      <StartGate
        isOpen={!hasStarted}
        hasConfirmed={hasConfirmed}
        onConfirm={() => {
          setHasConfirmed(true)
        }}
        onStart={handleStart}
      />
    </>
  )
}

export const App = (): ReactElement => (
  <ThemeProvider>
    <PlayerProvider>
      <Shell />
    </PlayerProvider>
  </ThemeProvider>
)
