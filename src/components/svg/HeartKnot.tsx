import { useId } from 'react'

/** The proven heart silhouette, shared with the gate's wax seals. */
const HEART_PATH =
  'M50 90 C16 65, 4 45, 4 29 C4 13, 17 4, 30 4 C39 4, 46 9, 50 17 C54 9, 61 4, 70 4 C83 4, 96 13, 96 29 C96 45, 84 65, 50 90 Z'

type Props = {
  className?: string
  title?: string
}

/**
 * The motif joining the two families: one heart, with a gold cord that
 * comes down from the bride's card, parts to pass around the heart, and
 * carries on to the groom's.
 *
 * Replaces the heart-and-crescent pair that sat here before. Two symbols
 * competing in a 40px gap read as clutter rather than as a join, so this
 * commits to the heart and gives it room.
 *
 * The cord is split into four separately drawable pieces, and the two
 * halves of the loop sit on opposite sides of the heart in paint order —
 * right-hand side behind it, left-hand side in front — so the cord reads
 * as passing around the heart rather than lying flat on top of it.
 *
 * Geometry: the loop is an ellipse centred on the heart (rx 52, ry 58),
 * and the vertical cords meet it exactly at its top and bottom points
 * (70,72) and (70,188), so there is no join to see.
 */
export function HeartKnot({ className = '', title }: Props) {
  const uid = useId().replace(/:/g, '')
  const face = `knotFace-${uid}`
  const glow = `knotGlow-${uid}`

  return (
    <svg
      viewBox="0 0 140 260"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}

      <defs>
        <radialGradient id={face} cx="38%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#f9d9e1" />
          <stop offset="42%" stopColor="#f4b8c6" />
          <stop offset="78%" stopColor="#c9647f" />
          <stop offset="100%" stopColor="#9b2c4a" />
        </radialGradient>

        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4b8c6" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#f4b8c6" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#f4b8c6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* A soft bloom so the heart sits in light rather than on a flat page. */}
      <ellipse cx="70" cy="130" rx="66" ry="72" fill={`url(#${glow})`} />

      {/* Cord down from the bride's card. */}
      <path
        data-cord="in"
        d="M70 4 L70 72"
        fill="none"
        stroke="url(#goldFoil)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* The half of the loop that passes BEHIND the heart. */}
      <path
        data-cord="back"
        d="M70 72 A52 58 0 0 1 70 188"
        fill="none"
        stroke="url(#goldFoil)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Two nested groups on purpose. A CSS animation outranks an inline
          style, so the beat would stamp on whatever GSAP wrote and kill the
          entrance tween. The outer group is GSAP's to animate in; the inner
          one does nothing but beat. */}
      <g data-heart-enter>
        <g data-heart-beat>
          <g transform="translate(23.5 86.3) scale(0.93)">
            <path d={HEART_PATH} fill={`url(#${face})`} />
            {/* Gold rim, so the heart belongs to the same metal as the cord. */}
            <path
              d={HEART_PATH}
              fill="none"
              stroke="url(#goldFoil)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Gloss, placed on the upper-left lobe where the light falls. */}
            <ellipse
              cx="32"
              cy="25"
              rx="14"
              ry="9.5"
              fill="#ffffff"
              opacity="0.34"
              transform="rotate(-26 32 25)"
            />
          </g>
        </g>
      </g>

      {/* The half of the loop that passes IN FRONT of the heart. */}
      <path
        data-cord="front"
        d="M70 72 A52 58 0 0 0 70 188"
        fill="none"
        stroke="url(#goldFoil)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Cord on down to the groom's card. */}
      <path
        data-cord="out"
        d="M70 188 L70 256"
        fill="none"
        stroke="url(#goldFoil)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
