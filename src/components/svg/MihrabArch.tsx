export type ArchVariant = 'ogee' | 'pointed' | 'multifoil'

/**
 * Arch geometry. The curved head is drawn in a 200 x 150 viewBox; the full
 * arch adds straight jambs down to y = 260.
 *
 *  - ogee      Mughal onion arch: an S-curve rising to a point. The form
 *              you see across Deccan and North Indian masjids.
 *  - pointed   Two-centred arch — two circular arcs struck from centres on
 *              the springline. Radius > half-span is what makes it point
 *              rather than dome.
 *  - multifoil Scalloped head, broken into cusped lobes.
 */

const LEFT = 14
const RIGHT = 186
const SPRING = 150
const FOOT = 260

/** Jamb position as a fraction of width — lets CSS borders line up with the head. */
export const JAMB_INSET = LEFT / 200
/** Head height as a fraction of width, for reserving space. */
export const HEAD_RATIO = SPRING / 200

/* ── heads: start at (LEFT, SPRING), end at (RIGHT, SPRING) ───────────── */

function ogeeHead(): string {
  return [
    `M${LEFT} ${SPRING}`,
    `C${LEFT} 104, 46 86, 72 60`,
    `C86 46, 95 28, 100 5`,
    `C105 28, 114 46, 128 60`,
    `C154 86, ${RIGHT} 104, ${RIGHT} ${SPRING}`,
  ].join(' ')
}

function pointedHead(): string {
  const half = (RIGHT - LEFT) / 2
  const r = 140
  const apexY = SPRING - Math.sqrt(r * r - half * half)
  const midX = (LEFT + RIGHT) / 2
  return [
    `M${LEFT} ${SPRING}`,
    `A${r} ${r} 0 0 1 ${midX} ${apexY.toFixed(2)}`,
    `A${r} ${r} 0 0 1 ${RIGHT} ${SPRING}`,
  ].join(' ')
}

function multifoilHead(lobes = 5): string {
  const cx = (LEFT + RIGHT) / 2
  const R = (RIGHT - LEFT) / 2
  const lobeR = (Math.PI * R) / (lobes * 2)
  const parts = [`M${LEFT} ${SPRING}`]
  for (let i = 1; i <= lobes; i++) {
    const a = Math.PI - (i / lobes) * Math.PI
    const x = cx + Math.cos(a) * R
    const y = SPRING - Math.sin(a) * R
    parts.push(`A${lobeR.toFixed(2)} ${lobeR.toFixed(2)} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return parts.join(' ')
}

export function archHeadPath(variant: ArchVariant): string {
  if (variant === 'pointed') return pointedHead()
  if (variant === 'multifoil') return multifoilHead()
  return ogeeHead()
}

/** Full arch: jambs plus head, in a 200 x 260 viewBox. */
export function archPath(variant: ArchVariant): string {
  return `M${LEFT} ${FOOT} L${LEFT} ${SPRING} ${archHeadPath(variant).replace(`M${LEFT} ${SPRING} `, '')} L${RIGHT} ${FOOT}`
}

export function archClosedPath(variant: ArchVariant): string {
  return `${archPath(variant)} Z`
}

/* ── standalone arch outline ──────────────────────────────────────────── */

type Props = {
  variant?: ArchVariant
  className?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  inner?: boolean
  title?: string
}

export function MihrabArch({
  variant = 'ogee',
  className = '',
  fill = 'none',
  stroke = 'url(#goldFoil)',
  strokeWidth = 2,
  inner = true,
  title,
}: Props) {
  const d = archClosedPath(variant)

  return (
    <svg
      viewBox={`0 0 200 ${FOOT}`}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {inner && (
        <g transform="translate(100 155) scale(0.9 0.92) translate(-100 -155)">
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth * 0.5}
            strokeLinejoin="round"
            opacity="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      )}
    </svg>
  )
}
