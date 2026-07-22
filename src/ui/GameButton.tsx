import './GameButton.css'

type ButtonSize = 'sm' | 'md' | 'lg'

interface GameButtonProps {
  readonly label: string
  readonly onClick: () => void
  readonly children: React.ReactNode
  readonly size?: ButtonSize
  /** Toggle state for shuffle/repeat-style controls; renders the "lit" look + aria-pressed. */
  readonly isPressed?: boolean
  readonly className?: string
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'game-button--sm',
  md: '',
  lg: 'game-button--lg',
}

export function GameButton({
  label,
  onClick,
  children,
  size = 'md',
  isPressed,
  className = '',
}: GameButtonProps): React.JSX.Element {
  const classes = ['game-button', SIZE_CLASS[size], className].filter((c) => c !== '').join(' ')
  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={label}
      title={label}
      {...(isPressed === undefined ? {} : { 'aria-pressed': isPressed })}
    >
      {children}
    </button>
  )
}
