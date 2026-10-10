import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Solid, not the foil gradient. The foil gradients are in objectBoundingBox
 * units, and a perfectly vertical line has a zero-width bounding box — the
 * gradient cannot map onto it and the stroke paints nothing at all. That is
 * why the lanterns used to float with no visible cord.
 */
const CORD_GOLD = '#c49b2e'

type Props = {
  /** Height in rem-ish CSS units; width follows the aspect. */
  width?: string
  /** Length of the cord above the lantern. */
  cord?: number
  /** Seconds per sway cycle — vary these so a row never swings in unison. */
  swayDuration?: number
  swayDelay?: number
  className?: string
  lit?: boolean
}

/**
 * A fanoos: hanging lantern in pierced gold with a warm core.
 *
 * The sway is applied to a wrapper with its transform-origin at the top of
 * the cord, so it pivots from the hook the way a hung object actually does,
 * rather than spinning about its own middle.
 */
export function Lantern({
  width = '3rem',
  cord = 40,
  swayDuration = 5.5,
  swayDelay = 0,
  className = '',
  lit = true,
}: Props) {
  const reduced = useReducedMotion()
  const H = 200 + cord

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        width,
        transformOrigin: 'top center',
        animation: reduced
          ? undefined
          : `lantern-sway ${swayDuration}s ease-in-out ${swayDelay}s infinite`,
      }}
    >
      <svg viewBox={`0 0 120 ${H}`} style={{ width: '100%', height: 'auto' }}>
        <g transform={`translate(0 ${cord})`}>
          {/* warm halo */}
          {lit && <ellipse cx="60" cy="105" rx="52" ry="62" fill="url(#goldGlow)" />}

          {/* finial and crown */}
          <path
            d="M60 2 L60 16 M52 22 L68 22"
            stroke="url(#goldFoilV)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M38 40 L60 18 L82 40 Z"
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* body: a tapering hexagonal cage */}
          <path
            d="M34 46 L86 46 L94 104 L78 156 L42 156 L26 104 Z"
            fill="url(#goldWash)"
            stroke="url(#goldFoil)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* pierced lattice — geometry only, no figures */}
          <g stroke="url(#goldFoil)" strokeWidth="1.6" fill="none" opacity="0.85">
            <path d="M40 60 L80 60 M36 82 L84 82 M33 104 L87 104 M38 128 L82 128" />
            <path d="M60 50 L60 152 M46 50 L40 152 M74 50 L80 152" />
            <polygon points="60,74 70,90 60,106 50,90" />
          </g>

          {/* base and drop */}
          <path
            d="M42 156 L78 156 L72 168 L48 168 Z"
            fill="url(#goldWash)"
            stroke="url(#goldFoil)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M60 168 L60 182" stroke={CORD_GOLD} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="188" r="6" fill="url(#goldFoil)" />
        </g>

        {/* cord */}
        <path
          d={`M60 0 L60 ${cord}`}
          stroke={CORD_GOLD}
          strokeWidth="1.6"
          opacity="0.75"
        />
      </svg>
    </div>
  )
}
