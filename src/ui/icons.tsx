// Minimal inline SVG icons. All inherit `currentColor` and share the transport icon class.

type IconProps = { readonly className?: string }

function Svg({
  children,
  className,
}: { children: React.ReactNode } & IconProps): React.JSX.Element {
  return (
    <svg
      className={className ?? 'game-button__icon'}
      viewBox="0 0 24 24"
      role="presentation"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function PlayIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M7 5v14l12-7z" />
    </Svg>
  )
}

export function PauseIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </Svg>
  )
}

export function PrevIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M6 5h2.4v14H6zM20 5v14L9 12z" />
    </Svg>
  )
}

export function NextIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M15.6 5H18v14h-2.4zM4 5l11 7-11 7z" />
    </Svg>
  )
}

export function ShuffleIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M16 4.5l5.5 4.5-5.5 4.5V10.5h-2.1l-2.4 2.9-1.7-2 2.6-3.1H16V4.5zM3 8h3.6l2.3 2.7-1.7 2L5.4 10H3V8zm13 6.6V11l5.5 4.5L16 20v-3.4h-2.4l-3-3.5 1.7-2 2.4 2.9H16z" />
    </Svg>
  )
}

export function RepeatIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M7 7h9v2.5l4-3.5-4-3.5V5H5v6h2V7zm10 10H8v-2.5l-4 3.5 4 3.5V19h11v-6h-2v4z" />
    </Svg>
  )
}

export function RepeatOneIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M7 7h9v2.5l4-3.5-4-3.5V5H5v6h2V7zm10 10H8v-2.5l-4 3.5 4 3.5V19h11v-6h-2v4z" />
      <text x="12" y="14" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor">
        1
      </text>
    </Svg>
  )
}

export function GearIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M19.4 13a7.8 7.8 0 000-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-1.7-1L14.9 3H9.1l-.4 2.6a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7.8 7.8 0 000 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.7 1.7 1l.4 2.6h5.8l.4-2.6c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" />
    </Svg>
  )
}

export function VolumeIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm11.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zM14 3.2v2.1a7 7 0 010 13.4v2.1a9 9 0 000-17.6z" />
    </Svg>
  )
}

export function SunIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-6h0v3m0 16v3M4.2 4.2l2.1 2.1m11.4 11.4l2.1 2.1M1 12h3m16 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </Svg>
  )
}

export function FlameIcon(props: IconProps): React.JSX.Element {
  return (
    <Svg {...props}>
      <path d="M13 2s3 4 3 8a4 4 0 01-8 0c0-1 .3-2 .8-2.8C7.5 8.7 6 10.8 6 14a6 6 0 0012 0c0-5-5-8-5-12z" />
    </Svg>
  )
}
