import { type ReactElement, useState } from 'react'

import { Background } from '@/components/Background'
import { PlayerPanel } from '@/components/PlayerPanel'
import { StartGate } from '@/components/StartGate'
import { PlayerProvider, usePlayerContext } from '@/state/PlayerContext'
import { ThemeProvider } from '@/theme/ThemeProvider'

import './components/player.css'

const Shell = (): ReactElement => {
  const [hasStarted, setHasStarted] = useState(false)
  const { togglePlay } = usePlayerContext()

  const handleStart = (): void => {
    setHasStarted(true)
    togglePlay()
  }

  return (
    <>
      <Background isRevealed={hasStarted} />
      <div className="app">
        <PlayerPanel />
      </div>
      <div className="page-frame" aria-hidden="true" />
      <StartGate isOpen={!hasStarted} onStart={handleStart} />
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
