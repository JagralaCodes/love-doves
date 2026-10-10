import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { sparkleBurst } from '../../lib/sparkleBus'

type Props = {
  /** The positioned box the canvas fills. Routes are drawn in its space. */
  boxRef: RefObject<HTMLElement | null>
  /** The upper card (the bride's) and the lower one (the groom's). */
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  /** The head of a stream has just slipped behind a card. */
  onArrive?: (card: 'from' | 'to') => void
}

/** Hearts in one stream, the gap between them along the route, in px. */
const LEN = 20
const SPACING = 24
/** Route px travelled per px scrolled. */
const SPEED = 2.2
/** Sideways slither, in px. */
const AMP = 10
/** A single frame never moves a stream further than this many px of scroll. */
const MAX_STEP = 40
/** After the scroll stops, the stream glides on and slows by this per frame. */
const GLIDE = 0.9
/** The route is sampled every STEP px, once per resize, not per frame. */
const STEP = 2

/** Head → tail: deep wine through rose to blush. Every sixth heart is gold. */
const RAMP = ['#6e1532', '#8a2142', '#a8304f', '#c2456b', '#d65f82', '#e57c98', '#ef9bb0', '#f5b6c5', '#f9cdd7', '#fbdde4']
const GOLD = '#d4af37'
const HEART = 'M0 3.6C-1.2 1.4-5.6.4-5.6-2.6-5.6-5.2-2.4-6.4 0-3.8 2.4-6.4 5.6-5.2 5.6-2.6 5.6.4 1.2 1.4 0 3.6Z'
/** Sprite px per heart unit, at 1x. */
const K = 7

type Rect = { l: number; r: number; t: number; b: number }
type Lut = { x: Float32Array; y: Float32Array; a: Float32Array; length: number }
type Stream = { lut: Lut | null; s: number; v: number; alpha: number; arrived: boolean }

/**
 * The two routes, shaped after the prototype and fitted to where the cards
 * really are. Each starts inside one card, leaves it from behind, swings
 * out past one side, crosses the gap and slips behind the other card from
 * the opposite side. Down runs bride → groom; up runs groom → bride.
 */
function routes(W: number, a: Rect, b: Rect) {
  const cw = a.r - a.l
  const left = a.l
  const right = W - a.r
  const g = b.t - a.b
  const ya = a.b - Math.min(58, (a.b - a.t) * 0.3)
  const hb = Math.min(150, (b.b - b.t) * 0.62)
  const yb = b.t + hb

  const down =
    `M${a.l + 0.183 * cw} ${ya} L${a.l + 5} ${ya} ` +
    `C${0.15 * left} ${ya + 2} ${0.3 * left} ${a.b + 0.333 * g} ${a.l + 0.25 * cw} ${a.b + 0.6 * g} ` +
    `C${a.l + 0.65 * cw} ${a.b + 0.867 * g} ${W - 0.3 * right} ${b.t - 0.083 * g} ${b.r + 0.6 * right} ${b.t + 0.533 * hb} ` +
    `C${b.r + 0.57 * right} ${b.t + 0.8 * hb} ${b.r + 0.477 * right} ${yb - 2} ${b.r - 5} ${yb} ` +
    `L${b.r - 0.177 * cw} ${yb}`

  const up =
    `M${b.l + 0.183 * cw} ${yb} L${b.l + 5} ${yb} ` +
    `C${0.3 * left} ${yb} ${0.385 * left} ${b.t + 0.083 * g} ${b.l + 0.183 * cw} ${a.b + 0.75 * g} ` +
    `C${b.l + 0.55 * cw} ${a.b + 0.375 * g} ${a.r + 0.69 * right} ${a.b + 0.5 * g} ${a.r + 0.6 * right} ${a.b - 20} ` +
    `C${a.r + 0.57 * right} ${ya + 13} ${a.r + 0.477 * right} ${ya} ${a.r - 5} ${ya} ` +
    `L${a.r - 0.177 * cw} ${ya}`

  return { down, up }
}

/** Points and headings along a path, every STEP px. */
function sample(path: SVGPathElement): Lut {
  const length = path.getTotalLength()
  const n = Math.ceil(length / STEP) + 1
  const x = new Float32Array(n)
  const y = new Float32Array(n)
  const a = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const p = path.getPointAtLength(Math.min(length, i * STEP))
    x[i] = p.x
    y[i] = p.y
  }
  for (let i = 0; i < n; i++) {
    const j = Math.min(n - 1, i + 1)
    const k = j === i ? i - 1 : i
    a[i] = Math.atan2(y[j] - y[k], x[j] - x[k])
  }
  return { x, y, a, length }
}

/** One glossy heart, pre-rendered so a frame is only drawImage calls. */
function sprite(color: string, dpr: number) {
  const k = K * dpr
  const size = Math.ceil(16 * k)
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g) return c
  g.translate(size / 2, size / 2)
  g.scale(k, k)
  // The prototype's radial gloss: a white highlight high on the left lobe.
  const grad = g.createRadialGradient(-1.68, -3.4, 0, -1.68, -3.4, 9.5)
  grad.addColorStop(0, 'rgba(255,255,255,0.75)')
  grad.addColorStop(0.35, color)
  grad.addColorStop(1, color)
  g.fillStyle = grad
  g.shadowColor = 'rgba(155,44,74,0.28)'
  g.shadowBlur = 1.4 * k
  g.shadowOffsetY = 0.6 * k
  g.fill(new Path2D(HEART))
  return c
}

/** Where a box sits inside an ancestor, ignoring transforms (entrances). */
function rectWithin(el: HTMLElement, box: HTMLElement): Rect {
  let l = 0
  let t = 0
  let n: HTMLElement | null = el
  while (n && n !== box) {
    l += n.offsetLeft
    t += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { l, t, r: l + el.offsetWidth, b: t + el.offsetHeight }
}

/**
 * A stream of hearts that slithers from one family's card to the other's,
 * fed by the scroll: down carries it bride → groom, up sends a second
 * stream back groom → bride along its own route.
 *
 * Drawn on a canvas behind the cards, so the hearts emerge from under one
 * and disappear under the other. Tracking, compared with the prototype:
 * it moves with the (Lenis-smoothed) scroll, but only while the crossing
 * between the cards is on screen, so the first stream leaves the bride's
 * card as the viewer arrives rather than somewhere off-screen; it glides
 * to a stop rather than freezing mid-slither; a jump is capped so a fast
 * fling never teleports it; layout is read only on resize; and nothing
 * runs while the section is off screen. Reduced motion gets a still trail.
 */
export function HeartSnake({ boxRef, fromRef, toRef, onArrive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const downRef = useRef<SVGPathElement>(null)
  const upRef = useRef<SVGPathElement>(null)
  const reduced = useReducedMotion()
  const arriveRef = useRef(onArrive)

  useEffect(() => {
    arriveRef.current = onArrive
  }, [onArrive])

  useEffect(() => {
    const box = boxRef.current
    const from = fromRef.current
    const to = toRef.current
    const canvas = canvasRef.current
    const downPath = downRef.current
    const upPath = upRef.current
    const ctx = canvas?.getContext('2d')
    if (!box || !from || !to || !canvas || !downPath || !upPath || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const sprites = [...RAMP, GOLD].map((c) => sprite(c, dpr))
    const half = sprites[0].width / 2

    const D: Stream = { lut: null, s: 0, v: 0, alpha: 0, arrived: false }
    const U: Stream = { lut: null, s: 0, v: 0, alpha: 0, arrived: false }

    const period = (st: Stream) => (st.lut ? st.lut.length + LEN * SPACING + 80 : 1)

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const st of [D, U]) {
        const lut = st.lut
        if (!lut || st.alpha <= 0.01) continue
        const L = lut.length
        const head = st.s % period(st)
        // Tail first, so the head is drawn on top of the body.
        for (let j = LEN - 1; j >= 0; j--) {
          const u = head - j * SPACING
          if (u < 0 || u > L) continue
          const i = Math.min(lut.x.length - 1, Math.round(u / STEP))
          const ang = lut.a[i]
          // Slither: a wave travelling along the body, damped at the ends.
          const edge = Math.min(1, u / 60, (L - u) / 60)
          const w = Math.sin(u * 0.045 - st.s * 0.02 + j * 0.15) * AMP * edge
          const x = lut.x[i] - Math.sin(ang) * w
          const y = lut.y[i] + Math.cos(ang) * w
          const t = j / (LEN - 1)
          // A heartbeat that ripples from the head down the body.
          const beat = 1 + 0.12 * Math.sin(st.s * 0.06 - j * 0.55)
          const size = (2.7 - 1.2 * t) * beat * (0.35 + 0.65 * edge)
          const tilt = ang * 0.2 + (w * 2.2 * Math.PI) / 180
          const sc = size / K
          const cos = Math.cos(tilt) * sc
          const sin = Math.sin(tilt) * sc
          ctx.globalAlpha = st.alpha * (1 - 0.35 * t)
          ctx.setTransform(cos, sin, -sin, cos, x * dpr, y * dpr)
          const gi = j % 6 === 3 ? RAMP.length : Math.round(t * (RAMP.length - 1))
          ctx.drawImage(sprites[gi], -half, -half)
        }
      }
    }

    /**
     * The stretch of scroll in which the crossing is on screen: from the
     * point the hearts leave the upper card entering at the bottom of the
     * viewport, to the point they enter the lower card leaving at the top.
     * Outside it the streams hold still, so no part of a journey is spent
     * where nobody can see it. Page coordinates, refreshed on resize and
     * whenever the section comes back into view.
     */
    const span = { start: 0, end: 0 }
    let crossTop = 0
    let crossBottom = 0
    const locate = () => {
      const top = box.getBoundingClientRect().top + window.scrollY
      const vh = window.innerHeight
      span.start = top + crossTop - vh * 0.92
      span.end = top + crossBottom - vh * 0.08
    }

    const measure = () => {
      const W = box.clientWidth
      const H = box.clientHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      const a = rectWithin(from, box)
      const b = rectWithin(to, box)
      crossTop = a.b - 60
      crossBottom = b.t + 150
      locate()
      const { down, up } = routes(W, a, b)
      downPath.setAttribute('d', down)
      upPath.setAttribute('d', up)
      D.lut = sample(downPath)
      U.lut = sample(upPath)
      if (reduced) {
        // A still trail, its body laid across the gap between the cards.
        D.s = D.lut.length * 0.66
        D.alpha = 0.9
      }
      draw()
    }

    // The head slipping behind a card: a little burst where it went in.
    const checkArrival = (st: Stream, card: 'from' | 'to') => {
      const lut = st.lut
      if (!lut) return
      const at = lut.length - 50
      const head = st.s % period(st)
      if (head < at) {
        st.arrived = false
        return
      }
      if (st.arrived || head > lut.length) return
      st.arrived = true
      const i = Math.round(at / STEP)
      const r = box.getBoundingClientRect()
      sparkleBurst(r.left + lut.x[i], r.top + lut.y[i], { count: 16, tone: 'rose', power: 120 })
      arriveRef.current?.(card)
    }

    let raf = 0
    let running = false
    let lastY = window.scrollY
    let prev = 0

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = prev ? Math.min(3, (now - prev) / 16.67) : 1
      prev = now
      const y = window.scrollY
      // Only the part of the move that falls inside the on-screen span.
      const lo = Math.max(span.start, Math.min(y, lastY))
      const hi = Math.min(span.end, Math.max(y, lastY))
      const inside = Math.max(0, hi - lo) * Math.sign(y - lastY)
      const dy = Math.max(-MAX_STEP, Math.min(MAX_STEP, inside))
      lastY = y

      let moved = false
      if (dy !== 0) {
        const [on, off] = dy > 0 ? [D, U] : [U, D]
        const drive = Math.abs(dy) * SPEED
        on.s += drive
        on.v = drive
        on.alpha = Math.min(1, on.alpha + drive * 0.02)
        off.v = 0
        off.alpha = Math.max(0, off.alpha - drive * 0.06)
        moved = true
      } else {
        for (const st of [D, U]) {
          if (st.v < 0.05) {
            st.v = 0
            continue
          }
          st.v *= GLIDE ** dt
          st.s += st.v * dt
          moved = true
        }
      }
      if (!moved) return
      checkArrival(D, 'to')
      checkArrival(U, 'from')
      draw()
    }

    const start = () => {
      if (running || reduced || document.hidden) return
      running = true
      // Anything above may have changed height since (fonts, images).
      locate()
      lastY = window.scrollY
      prev = 0
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    let visible = false
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
        else stop()
      },
      { rootMargin: '10% 0px' },
    )
    io.observe(box)

    let pending = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(measure)
    })
    ro.observe(box)
    ro.observe(from)
    ro.observe(to)

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (visible) start()
    }
    document.addEventListener('visibilitychange', onVisibility)
    // The viewport's height alone (a phone's address bar) moves the span.
    window.addEventListener('resize', locate)

    measure()

    return () => {
      stop()
      cancelAnimationFrame(pending)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', locate)
    }
  }, [boxRef, fromRef, toRef, reduced])

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]" />
      {/* The routes, never painted: only measured, once per resize. */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <path ref={downRef} fill="none" />
        <path ref={upRef} fill="none" />
      </svg>
    </>
  )
}
