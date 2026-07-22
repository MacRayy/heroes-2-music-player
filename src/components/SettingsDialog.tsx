import { useEffect } from 'react'

import { GameFrame } from '@/ui/GameFrame'

import { ThemeToggle } from './ThemeToggle'
import { VolumeControl } from './VolumeControl'

interface SettingsDialogProps {
  readonly onClose: () => void
}

export function SettingsDialog({ onClose }: SettingsDialogProps): React.JSX.Element {
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="dialog-backdrop">
      <GameFrame className="dialog">
        <h2 className="dialog__title">Settings</h2>
        <div className="dialog__row">
          <span>Theme</span>
          <ThemeToggle />
        </div>
        <div className="dialog__row">
          <span>Volume</span>
          <VolumeControl />
        </div>
        <p className="dialog__about">
          Heroes of Might &amp; Magic II soundtrack player. Music from the game by New World
          Computing. A fan project.
        </p>
        <button type="button" className="dialog__close" onClick={onClose}>
          Close
        </button>
      </GameFrame>
    </div>
  )
}
