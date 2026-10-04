import { useEffect, useRef } from 'react'
import { mountCanvasScene } from '../../lib/canvasScene'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { particleScale } from '../../lib/device'

type Props = {
  /** Hearts at full strength; scaled down on weaker devices. */
  count?: number
  className?: string
}

type Piece = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  /** Radians. Confetti spins as it falls. */
  spin: number
  spinRate: number
  /** Drives the flutter, so pieces do not fall as one sheet. */
  phase: number
  flutter: number
  colour: string
  life: number
  maxLife: number
}

const GRAVITY = 760
const DRAG = 0.86
const COLOURS = ['#f4b8c6', '#9b2c4a', '#c9647f', '#d4af37', '#f5e1a4', '#fce4ea']

/** One heart, drawn centred on the origin. */
function heartPath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath()
  ctx.moveTo(0, s * 0.62)
  ctx.bezierCurveTo(-s * 1.1, -s * 0.15, -s * 0.5, -s * 0.95, 0, -s * 0.36)
  ctx.bezierCurveTo(s * 0.5, -s * 0.95, s * 1.1, -s * 0.15, 0, s * 0.62)
  ctx.closePath()
}

/**
 * A one-shot burst of heart confetti.
 *
 * Fires the moment it mounts, so it is rendered conditionally — mount it
 * when the card is revealed and it plays once. Pieces are launched upward
 * and outward from the lower middle, tumble, and fall out of frame; once
 * they are all gone the canvas stops drawing rather than idling.
 *
 * Each piece's width is scaled by the cosine of its own spin, so it turns
 * edge-on and back instead of sliding about as a flat shape — that is what
 * makes paper confetti read as paper.
 */
export function HeartConfetti({ count = 54, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    const total = Math.max(10, Math.round(count * (particleScale() || 0.5)))
    let pieces: Piece[] = []
    let settled = false

    const spawn = (w: number, h: number) => {
      pieces = Array.from({ length: total }, () => {
        // Launched from the lower middle in a fan, the way a popper throws.
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5
        const speed = 300 + Math.random() * 460
        const maxLife = 2.4 + Math.random() * 1.8
        return {
          x: w * (0.5 + (Math.random() - 0.5) * 0.42),
          y: h * (0.62 + Math.random() * 0.1),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 5 + Math.random() * 8,
          spin: Math.random() * Math.PI * 2,
          spinRate: (Math.random() - 0.5) * 7,
          phase: Math.random() * Math.PI * 2,
          flutter: 14 + Math.random() * 26,
          colour: COLOURS[(Math.random() * COLOURS.length) | 0],
          life: 0,
          maxLife,
        }
      })
      settled = false
    }

    return mountCanvasScene(
      canvas,
      () => ({
        resize: (w, h) => spawn(w, h),
        draw: ({ ctx, width, height, dt, time }) => {
          ctx.clearRect(0, 0, width, height)
          if (settled) return

          let alive = 0
          for (const p of pieces) {
            p.life += dt
            if (p.life > p.maxLife || p.y > height + 40) continue
            alive++

            // Air resistance on the horizontal only, so they keep falling.
            p.vx *= Math.pow(DRAG, dt)
            p.vy += GRAVITY * dt
            p.x += (p.vx + Math.sin(time * 2.2 + p.phase) * p.flutter) * dt
            p.y += p.vy * dt
            p.spin += p.spinRate * dt

            // Fade out over the last third rather than vanishing.
            const t = p.life / p.maxLife
            ctx.globalAlpha = t > 0.66 ? Math.max(0, 1 - (t - 0.66) / 0.34) : 1

            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(Math.sin(p.spin * 0.5) * 0.6)
            // Turning edge-on: the piece narrows, it does not just rotate.
            ctx.scale(Math.cos(p.spin), 1)
            ctx.fillStyle = p.colour
            heartPath(ctx, p.size)
            ctx.fill()
            ctx.restore()
          }
          ctx.globalAlpha = 1
          // Nothing left to draw — stop clearing and redrawing an empty canvas.
          if (alive === 0) settled = true
        },
      }),
      { pauseOffscreen: true, maxDpr: 2 },
    )
  }, [count, reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
    />
  )
}
