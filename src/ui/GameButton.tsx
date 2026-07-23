import type { PropsWithChildren, ReactElement } from 'react'

import './GameButton.css'

type ButtonSize = 'sm' | 'md'

type GameButtonProps = PropsWithChildren<{
  readonly label: string
  readonly onClick: () => void
  readonly size?: ButtonSize
  readonly isPressed?: boolean
  readonly className?: string
}>

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'game-button--sm',
  md: '',
}

export const GameButton = ({
  label,
  onClick,
  children,
  size = 'md',
  isPressed,
  className = '',
}: GameButtonProps): ReactElement => {
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
