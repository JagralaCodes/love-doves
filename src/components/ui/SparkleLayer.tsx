import { useEffect, useRef } from 'react'
import { mountCanvasScene, rand } from '../../lib/canvasScene'
import type { Scene } from '../../lib/canvasScene'
import { onSparkleBurst } from '../../lib/sparkleBus'
import type { BurstOptions } from '../../lib/sparkleBus'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { canRunPointerTrail, maxDpr, sparkleScale } from '../../lib/device'

type Shape = 'star' | 'dot' | 'heart'

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
  sprite: HTMLCanvasElement
}

const TONES = {
  white: ['255,255,255', '255,255,255', '253,241,244'],
  gold: ['245,225,164', '212,175,55', '255,250,234'],
  rose: ['244,184,198', '252,228,234', '255,255,255'],
  mixed: ['255,255,255', '245,225,164', '244,184,198'],
} as const

/** The trail is pink: small glittering hearts with sparkles between them. */
const TRAIL_TONE = ['244,184,198', '249,217,225', '227,164,180', '252,228,234']

/** Cap so a frantic pointer or stacked bursts cannot melt a phone. */
const MAX_PARTICLES = 320
/** Trail particles are emitted per this many px travelled, not per frame,
 *  so spacing stays even whether the pointer creeps or flies. */
const TRAIL_SPACING = 15
/** Sprites are drawn at this radius (CSS px) and scaled down from there. */
const SPRITE_R = 7

function heartPath(ctx: CanvasRenderingContext2D, s: number) {
  // Two lobes meeting at a point, sized about the particle's radius.
  ctx.beginPath()
  ctx.moveTo(0, s * 0.72)
  ctx.bezierCurveTo(-s * 1.25, -s * 0.2, -s * 0.55, -s * 1.05, 0, -s * 0.38)
  ctx.bezierCurveTo(s * 0.55, -s * 1.05, s * 1.25, -s * 0.2, 0, s * 0.72)
}

function starPath(ctx: CanvasRenderingContext2D, s: number) {
  // Four-point sparkle, drawn as a concave diamond.
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.quadraticCurveTo(s * 0.16, -s * 0.16, s, 0)
  ctx.quadraticCurveTo(s * 0.16, s * 0.16, 0, s)
  ctx.quadraticCurveTo(-s * 0.16, s * 0.16, -s, 0)
  ctx.quadraticCurveTo(-s * 0.16, -s * 0.16, 0, -s)
}

/**
 * One fixed, full-screen canvas serving every sparkle effect:
 *
 *  - a trail of small pink hearts following the mouse, fading fast
 *  - a puff of tiny hearts wherever a finger or mouse presses
 *  - bursts fired on reveals via the sparkle bus
 *
 * The tap puff is not a nicety. The trail is a mouse effect: on a
 * touchscreen `pointermove` fires only while a finger is already down and
 * moving, so on the phones this invitation is actually opened on, a tap
 * used to produce nothing at all.
 *
 * Every particle is a pre-rendered sprite — shape, colour and glow baked
 * once per combination — so a frame is one `drawImage` per particle with
 * no path building and no per-particle shadow. With nothing alive the
 * scene reports idle and the canvas is not touched at all; most of the
 * time that is exactly the state it is in.
 *
 * Mount once, near the root. Hidden from assistive tech, never
 * interactive, and skipped entirely under reduced motion.
 */
export function SparkleLayer() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced) return

    const scale = sparkleScale()
    const trailEnabled = canRunPointerTrail()
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr())

    // ── sprites, made on demand and kept ──────────────────────────────
    const sprites = new Map<string, HTMLCanvasElement>()
    const spriteFor = (shape: Shape, rgb: string) => {
      const key = `${shape}|${rgb}`
      let c = sprites.get(key)
      if (c) return c
      c = document.createElement('canvas')
      // Room for the glow around the shape.
      const pad = SPRITE_R * 2.4
      const size = Math.ceil(pad * 2 * dpr)
      c.width = c.height = size
      const g = c.getContext('2d')
      if (g) {
        g.setTransform(dpr, 0, 0, dpr, size / 2 / dpr, size / 2 / dpr)
        g.fillStyle = `rgb(${rgb})`
        g.shadowBlur = 8
        g.shadowColor = `rgba(${rgb},0.85)`
        if (shape === 'heart') heartPath(g, SPRITE_R)
        else if (shape === 'star') starPath(g, SPRITE_R)
        else {
          g.beginPath()
          g.arc(0, 0, SPRITE_R * 0.5, 0, Math.PI * 2)
        }
        g.fill()
      }
      sprites.set(key, c)
      return c
    }

    const particles: Particle[] = []
    let pointer: { x: number; y: number } | null = null
    let lastEmit: { x: number; y: number } | null = null
    /** The pointer has moved since the trail last caught up with it. */
    let pointerMoved = false

    // A fixed full-screen canvas is a full-screen compositor layer. It is
    // only on screen while something is alive; the rest of the time it is
    // hidden, which costs nothing.
    let shown = false
    const show = (on: boolean) => {
      if (on === shown) return
      shown = on
      canvas.style.visibility = on ? '' : 'hidden'
    }
    const add = (p: Particle) => {
      if (particles.length >= MAX_PARTICLES) particles.shift()
      particles.push(p)
      show(true)
    }

    const spawnTrail = (x: number, y: number) => {
      const roll = Math.random()
      // Mostly hearts, with sparkles and motes between them for glitter.
      const shape: Shape = roll < 0.55 ? 'heart' : roll < 0.8 ? 'star' : 'dot'
      add({
        x: x + rand(-3, 3),
        y: y + rand(-3, 3),
        vx: rand(-14, 14),
        vy: rand(-8, 20), // drifts down a touch, like settling dust
        life: 0,
        maxLife: rand(0.45, 0.85),
        size: shape === 'heart' ? rand(3.4, 7) : rand(1.4, 3.4),
        spin: rand(-0.4, 0.4),
        spinSpeed: rand(-2.2, 2.2),
        sprite: spriteFor(shape, TRAIL_TONE[Math.floor(Math.random() * TRAIL_TONE.length)]),
      })
    }

    const spawnBurst = (x: number, y: number, o: BurstOptions) => {
      const tone = TONES[o.tone ?? 'mixed']
      const power = o.power ?? 180
      const count = Math.round((o.count ?? 26) * scale)
      for (let i = 0; i < count; i++) {
        // Even angular spread with jitter, so it reads as a burst
        // rather than a random cloud.
        const a = (i / count) * Math.PI * 2 + rand(-0.25, 0.25)
        const speed = power * rand(0.35, 1)
        const shape: Shape =
          o.tone === 'rose'
            ? Math.random() < 0.6
              ? 'heart'
              : 'star'
            : Math.random() < 0.62
              ? 'star'
              : 'dot'
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
          sprite: spriteFor(shape, tone[Math.floor(Math.random() * tone.length)]),
        })
      }
    }

    /** A small puff of tiny hearts at the point touched. */
    const spawnTapHearts = (x: number, y: number) => {
      const count = Math.round(12 * scale)
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + rand(-0.3, 0.3)
        const speed = rand(26, 78)
        add({
          x: x + rand(-4, 4),
          y: y + rand(-4, 4),
          vx: Math.cos(a) * speed,
          // Biased upward, so they lift off the finger rather than pooling.
          vy: Math.sin(a) * speed - rand(18, 52),
          life: 0,
          maxLife: rand(0.5, 0.9),
          // Deliberately small: these sit under a fingertip, and anything
          // bigger reads as a splash rather than a glimmer.
          size: rand(2.6, 5),
          spin: rand(-0.5, 0.5),
          spinSpeed: rand(-3, 3),
          sprite: spriteFor(
            Math.random() < 0.78 ? 'heart' : 'star',
            TRAIL_TONE[Math.floor(Math.random() * TRAIL_TONE.length)],
          ),
        })
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      spawnTapHearts(e.clientX, e.clientY)
      // Seed the trail here as well, or the first stretch of a finger drag
      // is measured from wherever the pointer last was -- which on touch is
      // where the PREVIOUS touch ended, often right across the screen.
      pointer = { x: e.clientX, y: e.clientY }
      lastEmit = { x: e.clientX, y: e.clientY }
    }

    const onPointerMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY }
      pointerMoved = true
    }
    const onPointerLeave = () => {
      pointer = null
      lastEmit = null
      pointerMoved = false
    }

    // Taps glimmer on every device; only the trail needs headroom.
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerLeave, { passive: true })
    if (trailEnabled) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave, { passive: true })
      window.addEventListener('pointercancel', onPointerLeave, { passive: true })
    }

    const unsubscribe = onSparkleBurst((x, y, o) => spawnBurst(x, y, o))

    const createScene = (): Scene => ({
      resize() {
        /* full-viewport; nothing to recompute */
      },

      idle: () => {
        const idle = particles.length === 0 && !(trailEnabled && pointerMoved)
        if (idle) show(false)
        return idle
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
        pointerMoved = false

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
          const s = (p.size * (1 - k * 0.55)) / SPRITE_R / dpr
          const cos = Math.cos(p.spin) * s
          const sin = Math.sin(p.spin) * s
          const half = p.sprite.width / 2

          ctx.globalAlpha = Math.max(0, alpha)
          // The scene's transform is the DPR scale; compose the sprite's
          // rotation and size on top of it.
          ctx.setTransform(cos * dpr, sin * dpr, -sin * dpr, cos * dpr, p.x * dpr, p.y * dpr)
          ctx.drawImage(p.sprite, -half, -half)
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.globalAlpha = 1
      },
    })

    const teardown = mountCanvasScene(canvas, createScene, {
      pauseOffscreen: false, // it is fixed to the viewport, always on screen
    })

    return () => {
      teardown()
      unsubscribe()
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerLeave)
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
      style={{ visibility: 'hidden' }}
    />
  )
}
