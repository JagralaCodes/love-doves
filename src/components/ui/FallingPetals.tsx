import { useEffect, useRef } from 'react'
import { mountCanvasScene, rand } from '../../lib/canvasScene'
import type { Scene } from '../../lib/canvasScene'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { particleScale } from '../../lib/device'

export type BlossomShape = 'petal' | 'heart' | 'mixed'

type Props = {
  /** Particles on screen at full tier. Keep it sparse — this is a whisper. */
  count?: number
  shape?: BlossomShape
  /** Push particles gently aside near the pointer or finger. */
  pointerPush?: boolean
  className?: string
}

type Petal = {
  x: number
  y: number
  size: number
  vy: number
  /** Velocity added by the pointer, decays back to zero. */
  px: number
  py: number
  drift: number
  phase: number
  swing: number
  spin: number
  spinSpeed: number
  /** Independent flutter that turns the shape edge-on and back. */
  flutter: number
  flutterSpeed: number
  tint: string
  alpha: number
  heart: boolean
}

const TINTS = ['#f4b8c6', '#fce4ea', '#f9d9e1', '#f8d2dc', '#ffffff']
const HEART_TINTS = ['#f4b8c6', '#e3a4b4', '#c98b8b', '#f9d9e1', '#c56a85']

const POINTER_RADIUS = 96

/**
 * Soft petals and hearts drifting down across a section.
 *
 * Each one falls on its own axis: it spins, and a separate flutter value
 * squashes its width so it turns edge-on and opens out again. That flutter
 * also drives the sideways slip, which is what stops a field of them
 * reading as falling confetti.
 *
 * With `pointerPush`, a finger or cursor nudges nearby particles aside and
 * they drift back — one distance check per particle per frame, no listener
 * per particle.
 */
export function FallingPetals({
  count = 16,
  shape = 'mixed',
  pointerPush = true,
  className = '',
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced) return

    const scale = particleScale()
    if (scale === 0) return

    // Pointer is tracked in canvas-local coordinates.
    const pointer = { x: -9999, y: -9999, active: false }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
      pointer.active = true
    }
    const onLeave = () => {
      pointer.active = false
      pointer.x = -9999
      pointer.y = -9999
    }

    if (pointerPush) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave, { passive: true })
      window.addEventListener('pointercancel', onLeave, { passive: true })
    }

    const createScene = (): Scene => {
      let petals: Petal[] = []
      let w = 0
      let h = 0

      const isHeart = () =>
        shape === 'heart' ? true : shape === 'petal' ? false : Math.random() < 0.38

      const spawn = (initial: boolean): Petal => {
        const heart = isHeart()
        return {
          x: rand(-20, w + 20),
          y: initial ? rand(-40, h) : rand(-70, -20),
          size: heart ? rand(6, 12) : rand(7, 15),
          vy: rand(18, 42),
          px: 0,
          py: 0,
          drift: rand(-9, 9),
          phase: rand(0, Math.PI * 2),
          swing: rand(10, 26),
          spin: rand(0, Math.PI * 2),
          spinSpeed: rand(-0.7, 0.7),
          flutter: rand(0, Math.PI * 2),
          flutterSpeed: rand(1.1, 2.4),
          tint: heart
            ? HEART_TINTS[Math.floor(Math.random() * HEART_TINTS.length)]
            : TINTS[Math.floor(Math.random() * TINTS.length)],
          alpha: rand(0.45, 0.9),
          heart,
        }
      }

      return {
        resize(width, height) {
          w = width
          h = height
          const target = Math.round(count * scale * Math.min(1.5, w / 390))
          petals = Array.from({ length: target }, () => spawn(true))
        },

        draw({ ctx, dt, time }) {
          for (const p of petals) {
            p.y += p.vy * dt
            p.flutter += p.flutterSpeed * dt
            p.spin += p.spinSpeed * dt

            // The same flutter that turns the shape also pushes it sideways,
            // so the slip and the visible face stay in agreement.
            const face = Math.cos(p.flutter)
            p.x += (p.drift + face * p.swing) * dt

            // Pointer disturbance: a soft radial shove that decays away.
            if (pointer.active) {
              const dx = p.x - pointer.x
              const dy = p.y - pointer.y
              const dist = Math.hypot(dx, dy)
              if (dist < POINTER_RADIUS && dist > 0.01) {
                const force = (1 - dist / POINTER_RADIUS) ** 2 * 260
                p.px += (dx / dist) * force * dt
                p.py += (dy / dist) * force * dt
              }
            }
            p.x += p.px * dt
            p.y += p.py * dt
            // Settle back to the natural fall.
            p.px *= 1 - Math.min(1, 2.4 * dt)
            p.py *= 1 - Math.min(1, 2.4 * dt)

            if (p.y > h + 30) Object.assign(p, spawn(false))
            if (p.x < -40) p.x = w + 30
            else if (p.x > w + 40) p.x = -30

            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.spin + Math.sin(time * 0.4 + p.phase) * 0.25)
            ctx.scale(Math.max(0.12, Math.abs(face)), 1)
            ctx.globalAlpha = p.alpha * (0.55 + 0.45 * Math.abs(face))
            ctx.fillStyle = p.tint

            const s = p.size
            ctx.beginPath()
            if (p.heart) {
              // Two lobes meeting at a point.
              ctx.moveTo(0, s * 0.62)
              ctx.bezierCurveTo(-s * 1.1, -s * 0.15, -s * 0.5, -s * 0.95, 0, -s * 0.36)
              ctx.bezierCurveTo(s * 0.5, -s * 0.95, s * 1.1, -s * 0.15, 0, s * 0.62)
            } else {
              ctx.moveTo(0, -s * 0.5)
              ctx.bezierCurveTo(s * 0.62, -s * 0.3, s * 0.5, s * 0.45, 0, s * 0.5)
              ctx.bezierCurveTo(-s * 0.5, s * 0.45, -s * 0.62, -s * 0.3, 0, -s * 0.5)
            }
            ctx.fill()
            ctx.restore()
          }
          ctx.globalAlpha = 1
        },
      }
    }

    const teardown = mountCanvasScene(canvas, createScene)

    return () => {
      teardown()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointercancel', onLeave)
    }
  }, [reduced, count, shape, pointerPush])

  if (reduced) return null

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  )
}
