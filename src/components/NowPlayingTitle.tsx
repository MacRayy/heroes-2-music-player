import { type ReactElement, useEffect, useRef, useState } from 'react'

type NowPlayingTitleProps = {
  readonly title: string
}

// Single-line title (keeps the player a fixed height). If it overflows, it marquees so the whole
// title becomes readable.
export const NowPlayingTitle = ({ title }: NowPlayingTitleProps): ReactElement => {
  const containerRef = useRef<HTMLHeadingElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (container === null || inner === null) {
      return
    }
    const measure = (): void => {
      const overflow = Math.max(0, inner.scrollWidth - container.clientWidth)
      inner.style.setProperty('--marquee', `${overflow}px`)
      setHasOverflow(overflow > 0)
    }
    measure()
    // Re-measure when the box resizes or the webfont swaps in (glyph widths change).
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(inner)
    return () => {
      observer.disconnect()
    }
  }, [title])

  return (
    <h2
      ref={containerRef}
      className={`now-playing__title${hasOverflow ? ' now-playing__title--scroll' : ''}`}
    >
      <span ref={innerRef} className="now-playing__title-inner">
        {title}
      </span>
    </h2>
  )
}
