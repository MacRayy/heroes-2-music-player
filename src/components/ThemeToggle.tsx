import type { ReactElement } from 'react'

import { useThemeContext } from '@/theme/ThemeProvider'
import { GameButton } from '@/ui/GameButton'

export const ThemeToggle = (): ReactElement => {
  const { theme, toggleTheme } = useThemeContext()
  const label = theme === 'good' ? 'Switch to Evil theme' : 'Switch to Good theme'
  return (
    <GameButton label={label} size="sm" onClick={toggleTheme}>
      {/* The current theme's campaign hero (Good = Roland, Evil = Archibald). */}
      <span className="game-button__glyph game-button__glyph--hero" aria-hidden="true" />
    </GameButton>
  )
}
