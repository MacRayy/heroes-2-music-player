import type { ReactElement } from 'react'

import { Dialog } from '@/ui/Dialog'

import { ThemeToggle } from './ThemeToggle'
import { VolumeControl } from './VolumeControl'

type SettingsDialogProps = {
  readonly onClose: () => void
}

export const SettingsDialog = ({ onClose }: SettingsDialogProps): ReactElement => (
  <Dialog title="Settings" titleId="settings-title" onClose={onClose}>
    <div className="dialog__row">
      <span>Theme</span>
      <ThemeToggle />
    </div>
    <div className="dialog__row">
      <span>Volume</span>
      <VolumeControl />
    </div>
    <p className="dialog__about">
      Heroes of Might &amp; Magic II soundtrack player. Music from the game by New World Computing.
      A fan project.
    </p>
  </Dialog>
)
