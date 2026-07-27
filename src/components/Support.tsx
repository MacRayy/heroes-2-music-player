import { type ReactElement, useState } from 'react'

import { Dialog } from '@/ui/Dialog'
import { GameButton } from '@/ui/GameButton'

const DONATE_URL = 'https://buymeacoffee.com/MacRay'

export const Support = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="support">
        <GameButton
          className="support__button"
          label="Server fundraising"
          onClick={() => {
            setIsOpen(true)
          }}
        >
          <span className="game-button__glyph game-button__glyph--chest" aria-hidden="true" />
        </GameButton>
        <p className="support__label">Server fundraising</p>
      </div>

      {isOpen ? (
        <Dialog
          title="Server fundraising"
          titleId="support-title"
          onClose={() => {
            setIsOpen(false)
          }}
        >
          <p className="dialog__about">
            This player streams the full Heroes II soundtrack from a server, so hosting and
            bandwidth cost real money. It&apos;s a free, non-commercial fan project — any tip goes
            straight to keeping the music online. Thank you!
          </p>
          <a
            className="game-button support__donate"
            href={DONATE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Buy me a brick (opens in a new tab)"
          >
            <span className="game-button__glyph game-button__glyph--chest" aria-hidden="true" />
          </a>
          <p className="support__donate-label">Buy me a brick</p>
        </Dialog>
      ) : null}
    </>
  )
}
