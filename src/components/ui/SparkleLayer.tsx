import { useEffect, useRef } from 'react'
import { mountCanvasScene, rand } from '../../lib/canvasScene'
import type { Scene } from '../../lib/canvasScene'
import { onSparkleBurst } from '../../lib/sparkleBus'
import type { BurstOptions } from '../../lib/sparkleBus'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { canRunPointerTrail, particleScale } from '../../lib/device'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  spin: number
  spinSpeed: number
  rgb: string
  star: boolean
}

const TONES = {
  white: ['255,255,255', '255,255,255', '253,241,244'],
  gold: ['245,225,164', '212,175,55', '255,250,234'],
  rose: ['244,184,198', '252,228,234', '255,255,255'],
  mixed: ['255,255,255', '245,225,164', '244,184,198'],
} as const

/** Cap so a frantic pointer or stacked bursts cannot melt a phone. */
const MAX_PARTICLES = 320
/** Trail particles are emitted per this many px travelled, not per frame,
 *  so spacing stays even whether the pointer creeps or flies. */
const TRAIL_SPACING = 18

/**
 * One fixed, full-screen canvas serving both sparkle effects:
 *
 *  - a light white trail following the finger or mouse, fading fast
 *  - white/gold bursts fired on reveals via the sparkle bus
 *
 * Mount once, near the root. Hidden from assistive tech, never
 * interactive, and skipped entirely under reduced motion. The trail
 * alone is dropped on low-end devices; bursts still run there.
 */
export function SparkleLayer() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced) return

    const scale = particleScale()
    if (scale === 0) return
    const trailEnabled = canRunPointerTrail()

    const particles: Particle[] = []
    let pointer: { x: number; y: number } | null = null
    let lastEmit: { x: number; y: number } | null = null

    const add = (p: Particle) => {
      if (particles.length >= MAX_PARTICLES) particles.shift()
      particles.push(p)
    }

    const spawnTrail = (x: number, y: number) => {
      const rgb = TONES.white[Math.floor(Math.random() * TONES.white.length)]
      add({
        x: x + rand(-3, 3),
        y: y + rand(-3, 3),
        vx: rand(-14, 14),
        vy: rand(-6, 22), // drifts down a touch, like settling dust
        life: 0,
        maxLife: rand(0.35, 0.7),
        size: rand(1.4, 3.6),
        spin: rand(0, Math.PI),
        spinSpeed: rand(-3, 3),
        rgb,
        star: Math.random() < 0.3,
      })
    }

    const spawnBurst = (x: number, y: number, o: BurstOptions) => {
      const tone = TONES[o.tone ?? 'mixed']
      const power = o.power ?? 180
      const count = Math.round((o.count ?? 26) * Math.max(0.5, scale))
      for (let i = 0; i < count; i++) {
        // Even angular spread with jitter, so it reads as a burst
        // rather than a random cloud.
        const a = (i / count) * Math.PI * 2 + rand(-0.25, 0.25)
        const speed = power * rand(0.35, 1)
        add({
          x,
          y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - rand(10, 50),
          life: 0,
          maxLife: rand(0.6, 1.2),
          size: rand(2.2, 5.4),
          spin: rand(0, Math.PI),
          spinSpeed: rand(-5, 5),
          rgb: tone[Math.floor(Math.random() * tone.length)],
          star: Math.random() < 0.62,
        })
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY }
    }
    const onPointerLeave = () => {
      pointer = null
      lastEmit = null
    }

    if (trailEnabled) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave, { passive: true })
      window.addEventListener('pointercancel', onPointerLeave, { passive: true })
    }

    const unsubscribe = onSparkleBurst((x, y, o) => spawnBurst(x, y, o))

    const drawStar = (
      ctx: CanvasRenderingContext2D,
      s: number,
    ) => {
      // Four-point sparkle, drawn as a concave diamond.
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.quadraticCurveTo(s * 0.16, -s * 0.16, s, 0)
      ctx.quadraticCurveTo(s * 0.16, s * 0.16, 0, s)
      ctx.quadraticCurveTo(-s * 0.16, s * 0.16, -s, 0)
      ctx.quadraticCurveTo(-s * 0.16, -s * 0.16, 0, -s)
      ctx.fill()
    }

    const createScene = (): Scene => ({
      resize() {
        /* full-viewport; nothing to recompute */
      },

      draw({ ctx, dt }) {
        // --- emit trail by distance travelled, not per frame ---
        if (trailEnabled && pointer) {
          if (!lastEmit) lastEmit = { ...pointer }
          let dx = pointer.x - lastEmit.x
          let dy = pointer.y - lastEmit.y
          let dist = Math.hypot(dx, dy)
          // Walk the segment, dropping a sparkle every TRAIL_SPACING px.
          let guard = 0
          while (dist >= TRAIL_SPACING && guard++ < 12) {
            const t = TRAIL_SPACING / dist
            lastEmit.x += dx * t
            lastEmit.y += dy * t
            spawnTrail(lastEmit.x, lastEmit.y)
            dx = pointer.x - lastEmit.x
            dy = pointer.y - lastEmit.y
            dist = Math.hypot(dx, dy)
          }
        }

        // --- integrate and draw ---
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.life += dt
          if (p.life >= p.maxLife) {
            particles.splice(i, 1)
            continue
          }

          const k = p.life / p.maxLife
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.vy += 150 * dt // gentle gravity so bursts settle
          p.vx *= 1 - 1.6 * dt // air drag
          p.vy *= 1 - 0.8 * dt
          p.spin += p.spinSpeed * dt

          // Fade in fast, out slow.
          const alpha = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85
          const size = p.size * (1 - k * 0.55)

          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.spin)
          ctx.globalAlpha = Math.max(0, alpha)
          ctx.fillStyle = `rgb(${p.rgb})`
          ctx.shadowBlur = 8
          ctx.shadowColor = `rgba(${p.rgb},0.85)`
          if (p.star) {
            drawStar(ctx, size)
          } else {
            ctx.beginPath()
            ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
        }
        ctx.globalAlpha = 1
      },
    })

    const teardown = mountCanvasScene(canvas, createScene, {
      pauseOffscreen: false, // it is fixed to the viewport, always on screen
    })

    return () => {
      teardown()
      unsubscribe()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointercancel', onPointerLeave)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] size-full"
    />
  )
}
