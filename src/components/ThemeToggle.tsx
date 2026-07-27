import type { ReactElement } from 'react'

import { useThemeContext } from '@/theme/ThemeProvider'
import { GameButton } from '@/ui/GameButton'
import { FlameIcon, SunIcon } from '@/ui/icons'

export const ThemeToggle = (): ReactElement => {
  const { theme, toggleTheme } = useThemeContext()
  const label = theme === 'good' ? 'Switch to Evil theme' : 'Switch to Good theme'
  return (
    <GameButton label={label} size="sm" onClick={toggleTheme}>
      {theme === 'good' ? <SunIcon /> : <FlameIcon />}
    </GameButton>
  )
}
