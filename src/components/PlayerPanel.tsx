import { useState } from 'react'

import { CATEGORY_LABELS } from '@/data/tracks'
import { usePlayerContext } from '@/state/PlayerContext'
import { GameButton } from '@/ui/GameButton'
import { GameFrame } from '@/ui/GameFrame'
import { GearIcon } from '@/ui/icons'

import { AlbumArt } from './AlbumArt'
import { ProgressBar } from './ProgressBar'
import { ScopeChips } from './ScopeChips'
import { SettingsDialog } from './SettingsDialog'
import { ThemeToggle } from './ThemeToggle'
import { TransportControls } from './TransportControls'

export function PlayerPanel(): React.JSX.Element {
  const { currentTrack } = usePlayerContext()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const category = currentTrack?.category ?? null
  const categoryLabel = category === null ? 'Soundtrack' : CATEGORY_LABELS[category]

  return (
    <GameFrame className="player">
      <div className="player__header">
        <ThemeToggle />
        <h1 className="player__title">{categoryLabel}</h1>
        <GameButton
          label="Settings"
          size="sm"
          onClick={() => {
            setSettingsOpen(true)
          }}
        >
          <GearIcon />
        </GameButton>
      </div>

      <AlbumArt category={category} title={currentTrack?.title ?? 'No track'} />

      <div className="now-playing">
        <h2 className="now-playing__title">{currentTrack?.title ?? 'Select a track'}</h2>
        <p className="now-playing__category">{categoryLabel}</p>
      </div>

      <ScopeChips />
      <ProgressBar />
      <TransportControls />

      {settingsOpen ? (
        <SettingsDialog
          onClose={() => {
            setSettingsOpen(false)
          }}
        />
      ) : null}
    </GameFrame>
  )
}
