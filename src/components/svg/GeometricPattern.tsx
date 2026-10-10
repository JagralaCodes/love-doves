import { useId } from 'react'
import { useParallax } from '../../hooks/useParallax'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { lowPower } from '../../lib/device'

type Props = {
  /** Tile size in px. Smaller reads as texture, larger as ornament. */
  scale?: number
  opacity?: number
  color?: string
  /** Slow diagonal drift. Off under reduced motion regardless. */
  drift?: boolean
  /** Scroll-parallax travel in px (background depth). 0 turns it off. */
  parallax?: number
  className?: string
}

/**
 * Seamless girih lattice: an 8-point star at the tile centre, quarter stars
 * at each corner so the tile repeats without a visible seam, and a thin
 * diamond lattice linking them.
 *
 * Rendered once as an SVG <pattern> and tiled by the browser, so covering a
 * whole section costs one element rather than hundreds.
 */
export function GeometricPattern({
  scale = 96,
  opacity = 0.05,
  color = '#a67c1f',
  drift = true,
  parallax = 46,
  className = '',
}: Props) {
  const reduced = useReducedMotion()
  const layerRef = useParallax({ travel: parallax })
  const uid = useId().replace(/:/g, '')
  const patternId = `girih-${uid}`

  // An 8-point star: 16 vertices alternating between two radii. The inner
  // radius is cos(45)/cos(22.5) of the outer — the ratio that makes the
  // points meet at right angles, which is what gives girih its crispness.
  const star = (cx: number, cy: number, outer: number) => {
    const inner = outer * 0.7654
    const pts: string[] = []
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8 - Math.PI / 2
      const r = i % 2 === 0 ? outer : inner
      pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`)
    }
    return pts.join(' ')
  }

  const T = 100 // tile units
  const R = 21

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* The parallax wrapper. Kept separate from the svg because the svg's
          CSS drift animation would override any transform written here. */}
      <div ref={layerRef} className="absolute inset-0">
        <svg
          // Oversized and offset so neither the drift nor the parallax ever
          // exposes an edge: 15% for the drift, plus the parallax travel.
          className="absolute"
          style={{
            left: '-15%',
            top: `calc(-15% - ${parallax}px)`,
            width: '130%',
            height: `calc(130% + ${parallax * 2}px)`,
            opacity,
            // The drift is one big layer per section; a phone keeps the
            // lattice still and spends that on the content instead.
            animation:
              drift && !reduced && !lowPower()
                ? 'pattern-drift var(--dur-drift) linear infinite'
                : undefined,
          }}
        >
          <defs>
            <pattern
              id={patternId}
              width={scale}
              height={scale}
              patternUnits="userSpaceOnUse"
              viewBox={`0 0 ${T} ${T}`}
            >
              <g fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round">
                {/* centre star */}
                <polygon points={star(T / 2, T / 2, R)} />
                {/* corner stars — each contributes a quarter, so edges align */}
                <polygon points={star(0, 0, R)} />
                <polygon points={star(T, 0, R)} />
                <polygon points={star(0, T, R)} />
                <polygon points={star(T, T, R)} />
                {/* lattice connecting the star tips */}
                <path
                  d={`M${T / 2} ${T / 2 - R} L${T} ${0 + R} M${T / 2} ${T / 2 - R} L0 ${R}
                      M${T / 2} ${T / 2 + R} L${T} ${T - R} M${T / 2} ${T / 2 + R} L0 ${T - R}`}
                  strokeWidth="0.8"
                  opacity="0.7"
                />
                {/* small linking diamonds on the tile edges */}
                <polygon points={`${T / 2},4 ${T / 2 + 6},10 ${T / 2},16 ${T / 2 - 6},10`} strokeWidth="0.8" />
                <polygon points={`${T / 2},${T - 16} ${T / 2 + 6},${T - 10} ${T / 2},${T - 4} ${T / 2 - 6},${T - 10}`} strokeWidth="0.8" />
                <polygon points={`4,${T / 2} 10,${T / 2 - 6} 16,${T / 2} 10,${T / 2 + 6}`} strokeWidth="0.8" />
                <polygon points={`${T - 16},${T / 2} ${T - 10},${T / 2 - 6} ${T - 4},${T / 2} ${T - 10},${T / 2 + 6}`} strokeWidth="0.8" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>
    </div>
  )
}
