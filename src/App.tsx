import type { ReactElement } from 'react'

import { Background } from '@/components/Background'
import { PlayerPanel } from '@/components/PlayerPanel'
import { PlayerProvider } from '@/state/PlayerContext'
import { ThemeProvider } from '@/theme/ThemeProvider'

import './components/player.css'

export const App = (): ReactElement => (
  <ThemeProvider>
    <PlayerProvider>
      <Background />
      <div className="app">
        <PlayerPanel />
      </div>
    </PlayerProvider>
  </ThemeProvider>
)
