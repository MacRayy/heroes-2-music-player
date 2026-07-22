import './GameFrame.css'

interface GameFrameProps {
  readonly children: React.ReactNode
  readonly className?: string
}

/** Ornate gold-on-wood panel frame, themed via CSS custom properties. */
export function GameFrame({ children, className = '' }: GameFrameProps): React.JSX.Element {
  const classes = ['game-frame', className].filter((c) => c !== '').join(' ')
  return (
    <div className={classes}>
      <div className="game-frame__inner">{children}</div>
    </div>
  )
}
