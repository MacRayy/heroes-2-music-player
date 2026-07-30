import { type ReactElement, useState } from 'react'

import { CATEGORY_LABELS } from '@/data/tracks'
import { usePlayerContext } from '@/state/PlayerContext'
import { GameButton } from '@/ui/GameButton'
import { GameFrame } from '@/ui/GameFrame'
import { SettingsIcon } from '@/ui/icons'

import { AlbumArt } from './AlbumArt'
import { NowPlayingTitle } from './NowPlayingTitle'
import { ProgressBar } from './ProgressBar'
import { ScopeChips } from './ScopeChips'
import { SettingsDialog } from './SettingsDialog'
import { ShareButton } from './ShareButton'
import { ThemeToggle } from './ThemeToggle'
import { TransportControls } from './TransportControls'

export const PlayerPanel = (): ReactElement => {
  const { currentTrack } = usePlayerContext()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const category = currentTrack?.category ?? null
  const categoryLabel = category === null ? 'Soundtrack' : CATEGORY_LABELS[category]

  return (
    <GameFrame className="player">
      <div className="player__header">
        <ThemeToggle />
        <h1 className="player__title">{categoryLabel}</h1>
        <div className="player__actions">
          <ShareButton />
          <GameButton
            label="Settings"
            size="sm"
            onClick={() => {
              setIsSettingsOpen(true)
            }}
          >
            <SettingsIcon />
          </GameButton>
        </div>
      </div>

      <AlbumArt key={currentTrack?.id ?? 'none'} track={currentTrack ?? null} />

      <div className="now-playing">
        <NowPlayingTitle title={currentTrack?.title ?? 'Select a track'} />
        <p className="now-playing__category">{categoryLabel}</p>
      </div>

      <ScopeChips />
      <ProgressBar />
      <TransportControls />

      {isSettingsOpen ? (
        <SettingsDialog
          onClose={() => {
            setIsSettingsOpen(false)
          }}
        />
      ) : null}
    </GameFrame>
  )
}
