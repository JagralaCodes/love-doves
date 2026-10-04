import { useId, useMemo } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { deviceTier } from '../../lib/device'
import { seeded } from '../../lib/seeded'

type Props = {
  count?: number
  className?: string
  /**
   * 'light' for the white page — only the pink orbs register there, so they
   * stay very faint to avoid smudging the gold lettering above them.
   * 'dark' for wine sections, where pearl white is what actually shows.
   */
  tone?: 'light' | 'dark'
}

const TINTS = {
  light: [
    'rgba(244,184,198,0.26)',
    'rgba(252,228,234,0.40)',
    'rgba(248,210,220,0.30)',
    'rgba(253,241,244,0.50)',
    'rgba(244,184,198,0.20)',
  ],
  dark: [
    'rgba(255,255,255,0.16)',
    'rgba(252,228,234,0.14)',
    'rgba(244,184,198,0.18)',
    'rgba(255,255,255,0.10)',
    'rgba(248,210,220,0.15)',
  ],
} as const

/**
 * Soft blurred white and pink circles drifting slowly behind the hero and
 * closing sections. Big, few, and heavily blurred — depth without noise.
 *
 * Blur is expensive to animate, so each orb is blurred once and then only
 * its transform changes, which stays on the compositor.
 */
export function PearlBokeh({ count = 7, className = '', tone = 'light' }: Props) {
  const tints = TINTS[tone]
  const reduced = useReducedMotion()
  const tier = deviceTier()
  // Blur has a real fill-rate cost; keep it modest on weaker phones.
  const total = reduced ? 0 : tier === 'low' ? 0 : tier === 'mid' ? Math.min(4, count) : count

  const seed = useId()

  const orbs = useMemo(() => {
    const rnd = seeded(seed)
    return Array.from({ length: total }, (_, i) => ({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: rnd() * 190 + 90,
      tint: tints[i % tints.length],
      blur: rnd() * 22 + 26,
      duration: `${26 + rnd() * 26}s`,
      delay: `${-rnd() * 30}s`,
    }))
  }, [seed, total, tints])

  if (total === 0) return null

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {orbs.map((o, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: o.left,
            top: o.top,
            width: o.size,
            height: o.size,
            marginLeft: -o.size / 2,
            marginTop: -o.size / 2,
            background: `radial-gradient(circle at 34% 32%, ${o.tint}, transparent 68%)`,
            filter: `blur(${o.blur}px)`,
            animation: `bokeh-drift ${o.duration} ease-in-out ${o.delay} infinite`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
