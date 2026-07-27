import type { ReactElement } from 'react'

import { useThemeContext } from '@/theme/ThemeProvider'
import { GameButton } from '@/ui/GameButton'

export const ThemeToggle = (): ReactElement => {
  const { theme, toggleTheme } = useThemeContext()
  const label = theme === 'good' ? 'Switch to Evil theme' : 'Switch to Good theme'
  return (
    <GameButton label={label} size="sm" onClick={toggleTheme}>
      {/* The current theme's game creature (Good = phoenix, Evil = black dragon). */}
      <span className="game-button__glyph game-button__glyph--creature" aria-hidden="true" />
    </GameButton>
  )
}
