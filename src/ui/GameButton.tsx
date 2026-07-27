import type { PropsWithChildren, ReactElement, Ref } from 'react'

import './GameButton.css'

type ButtonSize = 'sm' | 'md'

type GameButtonProps = PropsWithChildren<{
  readonly label: string
  readonly onClick: () => void
  readonly size?: ButtonSize
  readonly isPressed?: boolean
  readonly className?: string
  readonly ref?: Ref<HTMLButtonElement>
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
  ref,
}: GameButtonProps): ReactElement => {
  const classes = ['game-button', SIZE_CLASS[size], className].filter((c) => c !== '').join(' ')
  return (
    <button
      ref={ref}
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
