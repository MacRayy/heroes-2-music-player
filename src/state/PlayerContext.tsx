import { createContext, useContext } from 'react'

import { type PlayerApi, usePlayer } from '@/hooks/usePlayer'

const PlayerContext = createContext<PlayerApi | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const player = usePlayer()
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
}

export function usePlayerContext(): PlayerApi {
  const ctx = useContext(PlayerContext)
  if (ctx === null) {
    throw new Error('usePlayerContext must be used within a PlayerProvider')
  }
  return ctx
}
