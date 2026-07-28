import { type ReactElement, useState } from 'react'

import { Dialog } from '@/ui/Dialog'

type Modal = 'info' | 'privacy' | null

const COPYRIGHT = [
  'This website is not an official product or service of Heroes of Might and Magic II, Might and Magic, or Ubisoft Entertainment. All rights reserved. Copying or republishing items from this site without the authors’ permission is prohibited.',
  'The music and sound effects are from the game Heroes of Might and Magic II, composed by Paul Anthony Romero, Rob King and Steve Baca.',
  'Ubisoft Entertainment, Might and Magic, Heroes of Might and Magic, Heroes and associated logos are trademarks of Ubisoft Entertainment. Graphics, audio and other materials from Heroes of Might and Magic II are the exclusive property of their respective rights holders and are used here solely for informational, non-commercial purposes within the scope of permitted use (fair use under 17 U.S.C. § 107 and applicable copyright law).',
  'The source code of this player is released under the MIT License.',
]

const PRIVACY = [
  'The author of this site does not collect any personal data about users.',
  'The hosting provider (Sevalla) may collect standard statistical data such as the number of page views and visitors’ IP addresses as part of normal server operation. This is independent of the author.',
  'The site uses meta tags for indexing by search engines and for link previews on social networks.',
]

export const Footer = (): ReactElement => {
  const [modal, setModal] = useState<Modal>(null)
  const isInfo = modal === 'info'
  const paragraphs = isInfo ? COPYRIGHT : PRIVACY

  return (
    <>
      <footer className="footer">
        <button
          type="button"
          className="footer__link"
          onClick={() => {
            setModal('info')
          }}
        >
          Copyrights &amp; licences
        </button>
        <button
          type="button"
          className="footer__link"
          onClick={() => {
            setModal('privacy')
          }}
        >
          Privacy policy
        </button>
      </footer>

      {modal === null ? null : (
        <Dialog
          title={isInfo ? 'Copyrights & licences' : 'Privacy policy'}
          titleId="footer-modal-title"
          onClose={() => {
            setModal(null)
          }}
        >
          <div className="dialog__scroll">
            {paragraphs.map((text) => (
              <p key={text.slice(0, 24)} className="dialog__about">
                {text}
              </p>
            ))}
          </div>
        </Dialog>
      )}
    </>
  )
}
