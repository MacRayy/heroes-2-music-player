import { Background } from '@/components/Background'
import { PlayerPanel } from '@/components/PlayerPanel'
import { PlayerProvider } from '@/state/PlayerContext'

import './components/player.css'

export function App(): React.JSX.Element {
  return (
    <PlayerProvider>
      <Background />
      <div className="app">
        <PlayerPanel />
      </div>
    </PlayerProvider>
  )
}
