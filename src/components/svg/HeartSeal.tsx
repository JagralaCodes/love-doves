import { useId } from 'react'

type Props = {
  /** Shown on the front-most heart only. */
  initials?: string
  className?: string
  /** 0 is the front heart; higher sits further back in the stack. */
  depth?: number
}

const HEART_PATH =
  'M50 90 C16 65, 4 45, 4 29 C4 13, 17 4, 30 4 C39 4, 46 9, 50 17 C54 9, 61 4, 70 4 C83 4, 96 13, 96 29 C96 45, 84 65, 50 90 Z'

/**
 * A heart in pressed wax, bearing the monogram.
 *
 * Four of these stack on the gate. The back ones are dimmer and cooler so
 * the pile reads as depth rather than as one flat shape; only the front
 * heart carries the initials.
 */
export function HeartSeal({ initials, className = '', depth = 0 }: Props) {
  // Depth can arrive negative once hearts ahead of this one have gone.
  const d = Math.max(0, depth)
  const front = d === 0
  // Unique per instance: two hearts can briefly share a depth while one is
  // falling away, and duplicate SVG ids would collide.
  const gid = `heartFace-${useId().replace(/:/g, '')}`

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gid} cx="36%" cy="28%" r="78%">
          <stop offset="0%" stopColor={front ? '#c9647f' : '#a84762'} />
          <stop offset="55%" stopColor={front ? '#9b2c4a' : '#7d2039'} />
          <stop offset="100%" stopColor={front ? '#5e1227' : '#470d1d'} />
        </radialGradient>
      </defs>

      <path d={HEART_PATH} fill={`url(#${gid})`} />
      {/* pressed rim */}
      <path
        d={HEART_PATH}
        fill="none"
        stroke="#3f0b1a"
        strokeWidth="2.5"
        opacity="0.75"
      />
      {/* inner gold line, inset like a stamp's relief */}
      <g transform="translate(50 47) scale(0.78) translate(-50 -47)">
        <path
          d={HEART_PATH}
          fill="none"
          stroke="url(#goldFoil)"
          strokeWidth="1.6"
          opacity={front ? 0.8 : 0.45}
        />
      </g>

      {front && initials && (
        <text
          x="50"
          y="46"
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#goldFoil)"
          style={{ fontFamily: 'var(--font-script)', fontSize: 24 }}
        >
          {initials}
        </text>
      )}

      {/* highlight, so the wax reads as glossy rather than matte */}
      <ellipse cx="33" cy="24" rx="13" ry="9" fill="#ffffff" opacity={front ? 0.16 : 0.08} transform="rotate(-24 33 24)" />
    </svg>
  )
}
