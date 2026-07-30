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

// Play / prev / next use the game's own arrow sprite (RECRUIT up-arrow, rotated to point right in
// the extractor); the `game-arrows--left` modifier mirrors it. Single = play, double = skip.
const ArrowGlyph = ({
  isLeft = false,
  isDouble = false,
}: {
  isLeft?: boolean
  isDouble?: boolean
}): ReactElement => (
  <span className={`game-arrows${isLeft ? ' game-arrows--left' : ''}`} aria-hidden="true">
    <span className="game-arrows__tri" />
    {isDouble ? <span className="game-arrows__tri" /> : null}
  </span>
)

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

const SHARE_GRID = [
  '............',
  '.....##.....',
  '....####....',
  '...######...',
  '.....##.....',
  '.....##.....',
  '.##########.',
  '.##......##.',
  '.##......##.',
  '.##......##.',
  '.##########.',
  '............',
]

const CHECK_GRID = [
  '............',
  '............',
  '..........#.',
  '.........##.',
  '........##..',
  '.#.....##...',
  '.##...##....',
  '..##.##.....',
  '...###......',
  '....#.......',
  '............',
  '............',
]

export const PlayIcon = (): ReactElement => <ArrowGlyph />
export const PauseIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={PAUSE_GRID} {...props} />
)
export const PrevIcon = (): ReactElement => <ArrowGlyph isLeft isDouble />
export const NextIcon = (): ReactElement => <ArrowGlyph isDouble />
export const ShuffleIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={SHUFFLE_GRID} {...props} />
)
export const RepeatIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={REPEAT_GRID} {...props} />
)
export const RepeatOneIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={REPEAT_ONE_GRID} {...props} />
)
export const SettingsIcon = (): ReactElement => (
  <span className="game-button__glyph game-button__glyph--settings" aria-hidden="true" />
)

export const VolumeIcon = (props: IconProps): ReactElement => (
  <Svg {...props}>
    <path d="M3 9v6h4l5 5V4L7 9H3zm11.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zM14 3.2v2.1a7 7 0 010 13.4v2.1a9 9 0 000-17.6z" />
  </Svg>
)
export const ShareIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={SHARE_GRID} {...props} />
)
export const CheckIcon = (props: IconProps): ReactElement => (
  <PixelIcon grid={CHECK_GRID} {...props} />
)
