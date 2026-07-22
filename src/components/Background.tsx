import type { ReactElement } from 'react'

export const Background = (): ReactElement => (
  <>
    <div className="bg" aria-hidden="true" />
    <div className="bg__tint" aria-hidden="true" />
  </>
)
