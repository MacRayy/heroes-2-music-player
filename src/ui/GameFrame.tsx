import type { PropsWithChildren, ReactElement } from 'react'

import './GameFrame.css'

type GameFrameProps = PropsWithChildren<{
  readonly className?: string
}>

export const GameFrame = ({ children, className = '' }: GameFrameProps): ReactElement => {
  const classes = ['game-frame', className].filter((c) => c !== '').join(' ')
  return (
    <div className={classes}>
      <div className="game-frame__inner">{children}</div>
    </div>
  )
}
