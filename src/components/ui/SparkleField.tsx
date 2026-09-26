import { useMemo } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { particleScale } from '../../lib/device'

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
  white: { fill: '#ffffff', glow: 'rgba(255,255,255,0.9)' },
  gold: { fill: '#f5e1a4', glow: 'rgba(212,175,55,0.9)' },
  rose: { fill: '#f9d9e1', glow: 'rgba(244,184,198,0.9)' },
} as const

/**
 * Four-point star sparkles that pop in, twinkle and fade at random spots
 * across a section. Pure CSS animation on transform/opacity, so it costs
 * nothing per frame on the main thread.
 *
 * Decorative only — hidden from assistive tech.
 */
export function SparkleField({
  count = 14,
  tone = 'white',
  maxSize = 18,
  className = '',
}: Props) {
  const reduced = useReducedMotion()
  const scale = particleScale()
  const total = reduced ? 0 : Math.round(count * scale)
  const { fill, glow } = TONES[tone]

  const stars = useMemo(
    () =>
      Array.from({ length: total }, () => ({
        left: `${Math.random() * 94 + 3}%`,
        top: `${Math.random() * 90 + 5}%`,
        size: Math.random() * (maxSize - 6) + 6,
        delay: `${Math.random() * 9}s`,
        duration: `${3 + Math.random() * 3.5}s`,
      })),
    [total, maxSize],
  )

  if (total === 0) return null

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {stars.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            marginLeft: -s.size / 2,
            marginTop: -s.size / 2,
            opacity: 0,
            filter: `drop-shadow(0 0 3px ${glow})`,
            animation: `sparkle-pop ${s.duration} var(--ease-in-out-slow) ${s.delay} infinite`,
            willChange: 'transform, opacity',
          }}
        >
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
