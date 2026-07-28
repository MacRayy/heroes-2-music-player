import type { ReactElement } from 'react'

type BackgroundProps = {
  readonly isRevealed: boolean
}

export const Background = ({ isRevealed }: BackgroundProps): ReactElement => (
  <>
    <div className={`bg${isRevealed ? ' bg--revealed' : ''}`} aria-hidden="true" />
    <div className="bg__tint" aria-hidden="true" />
  </>
)
