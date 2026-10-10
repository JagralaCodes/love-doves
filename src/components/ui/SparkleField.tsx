import { useId, useMemo } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { decorScale, lowPower } from '../../lib/device'
import { seeded } from '../../lib/seeded'

type Props = {
  /** How many stars are alive across the section. */
  count?: number
  /** Star colour — white by default, gold for warmer sections. */
  tone?: 'white' | 'gold' | 'rose'
  /** Largest star, in px. */
  maxSize?: number
  className?: string
}

const TONES = {
  white: { fill: '#ffffff', glow: '255,255,255' },
  gold: { fill: '#f5e1a4', glow: '212,175,55' },
  rose: { fill: '#f9d9e1', glow: '244,184,198' },
} as const

/**
 * Four-point star sparkles that pop in, twinkle and fade at random spots
 * across a section. Pure CSS animation on transform/opacity.
 *
 * The glow is baked in — a soft radial gradient behind each star inside
 * its own SVG — rather than a drop-shadow filter, which would have to be
 * re-rasterised on every frame of the animation. On a phone the field is
 * 40% as dense. Decorative only; none under reduced motion, where a star
 * frozen at its first keyframe is invisible anyway.
 */
export function SparkleField({
  count = 14,
  tone = 'white',
  maxSize = 18,
  className = '',
}: Props) {
  const reduced = useReducedMotion()
  const total = reduced ? 0 : Math.min(lowPower() ? 5 : count, Math.round(count * decorScale()))
  const { fill, glow } = TONES[tone]

  const seed = useId()
  const gid = `glow-${seed.replace(/:/g, '')}`

  const stars = useMemo(() => {
    const rnd = seeded(seed)
    return Array.from({ length: total }, () => ({
      left: `${rnd() * 94 + 3}%`,
      top: `${rnd() * 90 + 5}%`,
      size: rnd() * (maxSize - 6) + 6,
      delay: `${rnd() * 9}s`,
      duration: `${3 + rnd() * 3.5}s`,
    }))
  }, [seed, total, maxSize])

  if (total === 0) return null

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* One gradient, shared by every star in this field. */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <radialGradient id={gid}>
            <stop offset="0" stopColor={`rgba(${glow},0.55)`} />
            <stop offset="0.5" stopColor={`rgba(${glow},0.18)`} />
            <stop offset="1" stopColor={`rgba(${glow},0)`} />
          </radialGradient>
        </defs>
      </svg>
      {stars.map((s, i) => (
        <svg
          key={i}
          viewBox="-8 -8 40 40"
          className="absolute"
          style={{
            left: s.left,
            top: s.top,
            width: s.size * 1.6,
            height: s.size * 1.6,
            marginLeft: -s.size * 0.8,
            marginTop: -s.size * 0.8,
            opacity: 0,
            animation: `sparkle-pop ${s.duration} var(--ease-in-out-slow) ${s.delay} infinite`,
          }}
        >
          <circle cx="12" cy="12" r="19" fill={`url(#${gid})`} />
          {/* Classic 4-point sparkle: concave diamond. */}
          <path
            d="M12 0 C12.9 7.2 16.8 11.1 24 12 C16.8 12.9 12.9 16.8 12 24 C11.1 16.8 7.2 12.9 0 12 C7.2 11.1 11.1 7.2 12 0 Z"
            fill={fill}
          />
        </svg>
      ))}
    </div>
  )
}
