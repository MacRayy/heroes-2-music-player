import { useTheme } from '@/theme/useTheme'
import { GameButton } from '@/ui/GameButton'
import { FlameIcon, SunIcon } from '@/ui/icons'

export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'good' ? 'Switch to Evil theme' : 'Switch to Good theme'
  return (
    <GameButton label={label} size="sm" onClick={toggleTheme}>
      {theme === 'good' ? <SunIcon /> : <FlameIcon />}
    </GameButton>
  )
}
