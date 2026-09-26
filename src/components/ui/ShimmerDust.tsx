import { useEffect, useRef } from 'react'
import { mountCanvasScene, rand } from '../../lib/canvasScene'
import type { Scene } from '../../lib/canvasScene'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { particleScale } from '../../lib/device'

type Props = {
  /** Base particle count at full device tier, scaled by area. */
  density?: number
  tone?: 'white' | 'gold'
  className?: string
}

type Mote = {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  phase: number
  speed: number
  alpha: number
}

/**
 * A soft shimmer dust layer that drifts slowly across the hero and
 * countdown. Each mote rises gently, sways, and breathes in opacity.
 *
 * Canvas rather than DOM because these are many and small; it shares
 * GSAP's ticker and pauses when scrolled out of view.
 */
export function ShimmerDust({
  density = 70,
  tone = 'white',
  className = '',
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced) return

    const scale = particleScale()
    if (scale === 0) return

    const rgb = tone === 'gold' ? '245,225,164' : '255,255,255'

    const createScene = (): Scene => {
      let motes: Mote[] = []
      let w = 0
      let h = 0

      const spawn = (initial: boolean): Mote => ({
        x: rand(0, w),
        y: initial ? rand(0, h) : h + rand(4, 40),
        r: rand(0.7, 2.3),
        vx: rand(-5, 5),
        vy: rand(-16, -5),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.5, 1.5),
        alpha: rand(0.25, 0.8),
      })

      return {
        resize(width, height) {
          w = width
          h = height
          // Scale with area so a tall desktop hero is not sparse.
          const target = Math.round(
            density * scale * Math.min(1.6, (w * h) / (390 * 720)),
          )
          motes = Array.from({ length: target }, () => spawn(true))
        },

        draw({ ctx, dt, time }) {
          for (const m of motes) {
            m.y += m.vy * dt
            m.x += (m.vx + Math.sin(time * m.speed + m.phase) * 7) * dt

            if (m.y < -10) Object.assign(m, spawn(false))
            if (m.x < -10) m.x = w + 10
            else if (m.x > w + 10) m.x = -10

            // Slow breathing twinkle, offset per mote.
            const twinkle = 0.55 + 0.45 * Math.sin(time * 1.6 * m.speed + m.phase)
            ctx.globalAlpha = m.alpha * twinkle
            ctx.fillStyle = `rgb(${rgb})`
            ctx.beginPath()
            ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
        },
      }
    }

    return mountCanvasScene(canvas, createScene)
  }, [reduced, density, tone])

  if (reduced) return null

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  )
}
