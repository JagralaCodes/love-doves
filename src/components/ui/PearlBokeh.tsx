import { useId, useMemo } from 'react'
import { useParallax } from '../../hooks/useParallax'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { decorScale, lowPower } from '../../lib/device'
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
  /** Scroll-parallax travel in px. Orbs are the furthest layer, so most. */
  parallax?: number
}

const TINTS = {
  light: ['244,184,198', '252,228,234', '248,210,220', '253,241,244', '244,184,198'],
  dark: ['255,255,255', '252,228,234', '244,184,198', '255,255,255', '248,210,220'],
} as const
const ALPHA = { light: 0.3, dark: 0.15 } as const

/**
 * Soft white and pink circles drifting slowly behind the hero and closing
 * sections. Big, few, and soft — depth without noise.
 *
 * The softness is in the gradient itself (a long falloff to transparent),
 * not a blur filter: a blurred element that also moves has to be
 * re-blurred every frame, and these are the largest things on the page.
 * Transform only once painted. Still under reduced motion; 40% as many on
 * a phone.
 */
export function PearlBokeh({ count = 7, className = '', tone = 'light', parallax = 80 }: Props) {
  const tints = TINTS[tone]
  const reduced = useReducedMotion()
  const total = Math.min(lowPower() ? 3 : count, Math.round(count * decorScale()))

  const seed = useId()
  const layerRef = useParallax({ travel: parallax })

  const orbs = useMemo(() => {
    const rnd = seeded(seed)
    return Array.from({ length: total }, (_, i) => ({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: rnd() * 190 + 90,
      tint: tints[i % tints.length],
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
      <div ref={layerRef} className="absolute inset-0">
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
              background: `radial-gradient(circle at 40% 38%, rgba(${o.tint},${ALPHA[tone]}) 0%, rgba(${o.tint},${ALPHA[tone] * 0.55}) 28%, rgba(${o.tint},${ALPHA[tone] * 0.18}) 52%, rgba(${o.tint},0) 70%)`,
              animation: reduced ? undefined : `bokeh-drift ${o.duration} ease-in-out ${o.delay} infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
