import { createContext, type PropsWithChildren, type ReactElement, useContext } from 'react'

import { type PlayerApi, usePlayer } from '@/hooks/usePlayer'

const PlayerContext = createContext<PlayerApi | null>(null)

export const PlayerProvider = ({ children }: PropsWithChildren): ReactElement => {
  const player = usePlayer()
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
}

export const usePlayerContext = (): PlayerApi => {
  const ctx = useContext(PlayerContext)
  if (ctx === null) {
    throw new Error('usePlayerContext must be used within a PlayerProvider')
  }
  return ctx
}
