import { type PropsWithChildren, type ReactElement, useEffect, useRef } from 'react'

import { GameFrame } from '@/ui/GameFrame'

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'

type DialogProps = PropsWithChildren<{
  readonly title: string
  readonly titleId: string
  readonly onClose: () => void
}>

export const Dialog = ({ title, titleId, onClose, children }: DialogProps): ReactElement => {
  const panelRef = useRef<HTMLDivElement>(null)

  // Empty deps (not [onClose]) so a parent re-render can't yank focus back mid-interaction.
  useEffect(() => {
    const previouslyFocused = document.activeElement
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || panelRef.current === null) {
        return
      }
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = items[0]
      const last = items[items.length - 1]
      if (first === undefined || last === undefined) {
        return
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="dialog-backdrop">
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <GameFrame className="dialog">
          <h2 id={titleId} className="dialog__title">
            {title}
          </h2>
          {children}
          <button type="button" className="dialog__close" onClick={onClose}>
            Close
          </button>
        </GameFrame>
      </div>
    </div>
  )
}
