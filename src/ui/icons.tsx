import type { PropsWithChildren, ReactElement } from 'react'

type IconProps = { readonly className?: string }

type SvgProps = PropsWithChildren<IconProps>

const Svg = ({ children, className }: SvgProps): ReactElement => (
  <svg
    className={className ?? 'game-button__icon'}
    viewBox="0 0 24 24"
    role="presentation"
    aria-hidden="true"
  >
    {children}
  </svg>
)

// --- Pixel-art icons (HOMM2 style: blocky, filled, stepped edges) -------------
// Each glyph is a 12x12 grid; `#` is ink (tinted via currentColor), anything else
// is transparent. Rows collapse to one <rect> per horizontal run.
const GRID = 12

type Rect = readonly [x: number, y: number, w: number]

const runsOf = (grid: readonly string[]): readonly Rect[] =>
  grid.flatMap((row, y) =>
    [...row.matchAll(/#+/gv)].map((match): Rect => [match.index, y, match[0].length]),
  )

const PixelIcon = ({
  grid,
  className,
}: {
  grid: readonly string[]
  className?: string
}): ReactElement => (
  <svg
    className={className ?? 'game-button__icon'}
    viewBox={`0 0 ${GRID} ${GRID}`}
    role="presentation"
    aria-hidden="true"
    shapeRendering="crispEdges"
  >
    {runsOf(grid).map(([x, y, w]) => (
      <rect key={`${x}-${y}-${w}`} x={x} y={y} width={w} height={1} />
    ))}
  </svg>
)

const PLAY_GRID = [
  '#...........',
  '##..........',
  '####........',
  '######......',
  '########....',
  '##########..',
  '##########..',
  '########....',
  '######......',
  '####........',
  '##..........',
  '#...........',
]

const PAUSE_GRID = [
  '............',
  '.###...###..',
  '.###...###..',
  '.###...###..',
  '.###...###..',
  '.###...###..',
  '.###...###..',
  '.###...###..',
  '.###...###..',
  '.###...###..',
  '.###...###..',
  '............',
]

const NEXT_GRID = [
  '#.........##',
  '##........##',
  '###.......##',
  '####......##',
  '######....##',
  '#######...##',
  '#######...##',
  '######....##',
  '####......##',
  '###.......##',
  '##........##',
  '#.........##',
]

const PREV_GRID = [
  '##.........#',
  '##........##',
  '##.......###',
  '##......####',
  '##....######',
  '##...#######',
  '##...#######',
  '##....######',
  '##......####',
  '##.......###',
  '##........##',
  '##.........#',
]

const SHUFFLE_GRID = [
  '............',
  '............',
  '.#....###...',
  '..#...###...',
  '...#..##....',
  '....##......',
  '....##......',
  '...#..##....',
  '..#...###...',
  '.#....###...',
  '............',
  '............',
]

const REPEAT_GRID = [
  '............',
  '............',
  '........#...',
  '##########..',
  '........#...',
  '............',
  '............',
  '...#........',
  '..##########',
  '...#........',
  '............',
  '............',
]

const REPEAT_ONE_GRID = [
  '............',
  '........#...',
  '##########..',
  '........#...',
  '.....##.....',
  '......#.....',
  '......#.....',
  '.....###....',
  '...#........',
  '..##########',
  '...#........',
  '............',
]

// Monitor + keyboard — the HOMM2 "System Options" glyph.
const SETTINGS_GRID = [
  '.########...',
  '.#......#...',
  '.#......#...',
  '.#......#...',
  '.########...',
  '....##......',
  '............',
  '############',
  '############',
  '############',
  '............',
  '............',
]

export const PlayIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={PLAY_GRID} {...props} />
)
export const PauseIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={PAUSE_GRID} {...props} />
)
export const PrevIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={PREV_GRID} {...props} />
)
export const NextIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={NEXT_GRID} {...props} />
)
export const ShuffleIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={SHUFFLE_GRID} {...props} />
)
export const RepeatIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={REPEAT_GRID} {...props} />
)
export const RepeatOneIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={REPEAT_ONE_GRID} {...props} />
)
export const SettingsIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={SETTINGS_GRID} {...props} />
)

export const VolumeIcon = (props: IconProps): ReactElement => (
  <Svg {...props}>
    <path d="M3 9v6h4l5 5V4L7 9H3zm11.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zM14 3.2v2.1a7 7 0 010 13.4v2.1a9 9 0 000-17.6z" />
  </Svg>
)

export const SunIcon = (props: IconProps): ReactElement => (
  <Svg {...props}>
    <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-6h0v3m0 16v3M4.2 4.2l2.1 2.1m11.4 11.4l2.1 2.1M1 12h3m16 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Svg>
)

export const FlameIcon = (props: IconProps): ReactElement => (
  <Svg {...props}>
    <path d="M13 2s3 4 3 8a4 4 0 01-8 0c0-1 .3-2 .8-2.8C7.5 8.7 6 10.8 6 14a6 6 0 0012 0c0-5-5-8-5-12z" />
  </Svg>
)
