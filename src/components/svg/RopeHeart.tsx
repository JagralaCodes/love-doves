type Props = {
  className?: string
}

/**
 * The rope between the two families.
 *
 * It arrives from the heart above at the top-centre, drops into the cleft
 * of a large heart, traces the whole outline — left lobe, down to the tip,
 * up the right side, right lobe, back to the cleft — and then falls straight
 * through the middle to land on the groom's card below. Drawn on by scroll,
 * so the viewer watches a heart being tied as they go.
 *
 * One continuous path so DrawSVG can run it end to end; the faint dotted
 * twin underneath is the "road not yet travelled". The bead is moved along
 * the path by the section's ScrollTrigger to mark the drawing tip.
 *
 * In a 300 x 320 box: cleft (150,70), lobes out to x=40 and x=260, tip at
 * (150,250); the drop continues to (150,320), the card's edge.
 */
export const ROPE_PATH =
  'M150 0 L150 70 ' +
  'C110 20, 40 30, 40 105 C40 160, 110 200, 150 250 ' +
  'C190 200, 260 160, 260 105 C260 30, 190 20, 150 70 ' +
  'L150 320'

export function RopeHeart({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 300 320" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="ropeBead" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e0" />
          <stop offset="45%" stopColor="#f5e1a4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The road ahead, faint and dotted. */}
      <path
        d={ROPE_PATH}
        fill="none"
        stroke="url(#goldFoil)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="1 6"
        opacity="0.28"
      />

      {/* A soft glow under the rope so it reads as lit, not inked. */}
      <path
        data-rope-glow
        d={ROPE_PATH}
        fill="none"
        stroke="#f5e1a4"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.16"
        style={{ visibility: 'hidden' }}
      />

      {/* The rope itself. */}
      <path
        data-rope
        d={ROPE_PATH}
        fill="none"
        stroke="url(#goldFoil)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ visibility: 'hidden' }}
      />

      {/* The drawing tip. */}
      <circle data-rope-bead r="9" fill="url(#ropeBead)" style={{ visibility: 'hidden' }} />
      <circle data-rope-bead-core r="2.4" fill="#fff8e0" style={{ visibility: 'hidden' }} />
    </svg>
  )
}
