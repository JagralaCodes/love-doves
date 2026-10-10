import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { sparkleBurst } from '../../lib/sparkleBus'
import { maxDpr } from '../../lib/device'

type Props = {
  /** The positioned box the canvas fills. Routes are drawn in its space. */
  boxRef: RefObject<HTMLElement | null>
  /** The upper card (the bride's) and the lower one (the groom's). */
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  /** The head of a stream has just slipped behind a card. */
  onArrive?: (card: 'from' | 'to') => void
}

/** Hearts in one stream, and the gap between them along the route, in px. */
const LEN = 20
const SPACING = 24
/** Route px travelled per px scrolled. Tune on a phone: 1.2–2.2. */
const SPEED = 1.6
/** Sideways slither, in px. */
const AMP = 9
/** A single frame never moves a stream further than this many px of scroll. */
const MAX_STEP = 40
/** The route is sampled every STEP px, once per resize, not per frame. */
const STEP = 2
/** Scroll px for the active stream to reach full opacity / the other to go. */
const FADE_IN = 10
const FADE_OUT = 20
/** Head and tail widths, in CSS px. */
const HEAD_W = 30
const TAIL_W = 14

/** Head → tail: deep wine through rose to blush. Every sixth heart is gold. */
const RAMP = ['#6e1532', '#8a2142', '#a8304f', '#c2456b', '#d65f82', '#e57c98', '#ef9bb0', '#f5b6c5', '#f9cdd7', '#fbdde4']
const GOLD = '#d4af37'
/** 11.2 units wide; the sprite is drawn at K px per unit. */
const HEART = 'M0 3.6C-1.2 1.4-5.6.4-5.6-2.6-5.6-5.2-2.4-6.4 0-3.8 2.4-6.4 5.6-5.2 5.6-2.6 5.6.4 1.2 1.4 0 3.6Z'
const HEART_W = 11.2
const K = 7

type Rect = { l: number; r: number; t: number; b: number }
type Lut = { x: Float32Array; y: Float32Array; a: Float32Array; length: number }
type Stream = {
  lut: Lut | null
  /** Distance the head has travelled along the route. */
  s: number
  alpha: number
  arrived: boolean
  /** Length of the straight run hidden inside the card at each end. */
  lead: number
}

/**
 * The two routes, fitted to where the cards really are. Each is ONE
 * sweeping S: a short straight run hidden inside the first card, out past
 * its left edge, one cubic across the gap, in through the right edge of
 * the other card and a short run hidden inside it.
 *
 *   down  bride (left side)  → groom (right side)
 *   up    groom (left side)  → bride (right side)
 */
function routes(W: number, a: Rect, b: Rect) {
  const cw = a.r - a.l
  const lead = 0.22 * cw
  const left = a.l
  const right = W - a.r
  // Leave low on the upper card, arrive high on the lower one (and the
  // other way back), so the sweep crosses the whole gap.
  const yaLow = a.b - 0.28 * (a.b - a.t)
  const ybHigh = b.t + 0.3 * (b.b - b.t)
  const ybLow = b.t + 0.42 * (b.b - b.t)
  const yaHigh = a.b - 0.42 * (a.b - a.t)

  const sweep = (x0: number, y0: number, x1: number, y1: number, outL: number, inR: number) => {
    const d = y1 - y0
    return (
      `C${x0 - 0.9 * outL} ${y0 + 0.42 * d} ` +
      `${x1 + 0.9 * inR} ${y1 - 0.42 * d} ` +
      `${x1} ${y1}`
    )
  }

  const down =
    `M${a.l + lead} ${yaLow} L${a.l} ${yaLow} ` +
    sweep(a.l, yaLow, b.r, ybHigh, left, right) +
    ` L${b.r - lead} ${ybHigh}`

  const up =
    `M${b.l + lead} ${ybLow} L${b.l} ${ybLow} ` +
    sweep(b.l, ybLow, a.r, yaHigh, left, right) +
    ` L${a.r - lead} ${yaHigh}`

  return { down, up, lead }
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

/** One glossy heart with its shadow, pre-rendered once. */
function sprite(color: string, dpr: number) {
  const k = K * dpr
  const size = Math.ceil(16 * k)
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  if (!g) return c
  g.translate(size / 2, size / 2)
  g.scale(k, k)
  // A white highlight high on the left lobe, so it reads as glass.
  const grad = g.createRadialGradient(-1.68, -3.4, 0, -1.68, -3.4, 9.5)
  grad.addColorStop(0, 'rgba(255,255,255,0.75)')
  grad.addColorStop(0.35, color)
  grad.addColorStop(1, color)
  g.fillStyle = grad
  g.shadowColor = 'rgba(94,18,39,0.3)'
  g.shadowBlur = 1.6 * k
  g.shadowOffsetY = 0.7 * k
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
 * A stream of hearts that slithers from one family's card to the other,
 * moved only by the scroll. Down carries it from the bride's card to the
 * groom's; up sends one back the other way. One stream is on screen at a
 * time: reversing fades the old one within about 20 px.
 *
 * Drawn on a canvas behind the cards, so the hearts slide out from under
 * one and in under the other. Everything is driven by distance scrolled —
 * position, slither and heartbeat alike — so when the page stops, the
 * hearts stop dead, and so does the work: a scroll event schedules one
 * frame, and with no scroll events there are no frames at all. Only the
 * stretch of scroll in which the crossing is on screen moves the stream,
 * so it leaves the bride's card as the viewer arrives. Layout is read on
 * resize only. Reduced motion gets a still, complete trail.
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

    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr())
    const sprites = [...RAMP, GOLD].map((c) => sprite(c, dpr))
    const half = sprites[0].width / 2

    const D: Stream = { lut: null, s: 0, alpha: 0, arrived: false, lead: 0 }
    const U: Stream = { lut: null, s: 0, alpha: 0, arrived: false, lead: 0 }
    const STREAMS = [D, U]

    const period = (st: Stream) => (st.lut ? st.lut.length + LEN * SPACING + 80 : 1)

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let si = 0; si < 2; si++) {
        const st = STREAMS[si]
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
          // Slither: a wave along the body, damped where it enters a card.
          const edge = Math.min(1, u / 60, (L - u) / 60)
          const w = Math.sin(u * 0.045 - st.s * 0.02 + j * 0.15) * AMP * edge
          const x = lut.x[i] - Math.sin(ang) * w
          const y = lut.y[i] + Math.cos(ang) * w
          const t = j / (LEN - 1)
          // A heartbeat rippling back from the head, paced by distance.
          const beat = 1 + 0.1 * Math.sin(st.s * 0.06 - j * 0.55)
          const width = (HEAD_W - (HEAD_W - TAIL_W) * t) * beat * (0.6 + 0.4 * edge)
          const sc = width / HEART_W / K
          const tilt = ang * 0.2 + (w * 2.2 * Math.PI) / 180
          const cos = Math.cos(tilt) * sc
          const sin = Math.sin(tilt) * sc
          ctx.globalAlpha = st.alpha * (1 - 0.3 * t)
          ctx.setTransform(cos, sin, -sin, cos, x * dpr, y * dpr)
          const gi = j % 6 === 3 ? RAMP.length : Math.round(t * (RAMP.length - 1))
          ctx.drawImage(sprites[gi], -half, -half)
        }
      }
    }

    /**
     * The stretch of scroll in which the crossing is on screen: from the
     * hearts leaving the upper card entering at the bottom of the viewport
     * to their entering the lower card leaving at the top. Outside it the
     * streams hold still, so no part of a journey is spent off screen.
     * Page coordinates; refreshed on resize and when the section returns.
     */
    const span = { start: 0, end: 0 }
    let boxTop = 0
    let boxLeft = 0
    let crossTop = 0
    let crossBottom = 0
    const locate = () => {
      const r = box.getBoundingClientRect()
      boxTop = r.top + window.scrollY
      boxLeft = r.left
      const vh = window.innerHeight
      span.start = boxTop + crossTop - vh * 0.92
      span.end = boxTop + crossBottom - vh * 0.08
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
      crossTop = a.b - 70
      crossBottom = b.t + 110
      locate()
      const { down, up, lead } = routes(W, a, b)
      downPath.setAttribute('d', down)
      upPath.setAttribute('d', up)
      D.lut = sample(downPath)
      U.lut = sample(upPath)
      D.lead = U.lead = lead
      if (reduced) {
        // Still and complete: the head just short of the groom's card, the
        // body laid back along the whole sweep.
        D.s = D.lut.length - lead - 6
        D.alpha = 1
      }
      draw()
    }

    // The head slipping behind a card: a little burst where it went in.
    const checkArrival = (st: Stream, card: 'from' | 'to') => {
      const lut = st.lut
      if (!lut) return
      const at = lut.length - st.lead
      const head = st.s % period(st)
      if (head < at) {
        st.arrived = false
        return
      }
      if (st.arrived || head > lut.length) return
      st.arrived = true
      const i = Math.round(at / STEP)
      sparkleBurst(boxLeft + lut.x[i], boxTop - window.scrollY + lut.y[i], {
        count: 16,
        tone: 'rose',
        power: 120,
      })
      arriveRef.current?.(card)
    }

    let raf = 0
    let visible = false
    let lastY = window.scrollY

    // One frame per scroll event, and none without one.
    const frame = () => {
      raf = 0
      const y = window.scrollY
      // Only the part of the move that falls inside the on-screen span.
      const lo = Math.max(span.start, Math.min(y, lastY))
      const hi = Math.min(span.end, Math.max(y, lastY))
      const inside = Math.max(0, hi - lo) * Math.sign(y - lastY)
      lastY = y
      const dy = Math.max(-MAX_STEP, Math.min(MAX_STEP, inside))
      if (dy === 0) return

      const on = dy > 0 ? D : U
      const off = dy > 0 ? U : D
      const step = Math.abs(dy)
      on.s += step * SPEED
      on.alpha = Math.min(1, on.alpha + step / FADE_IN)
      off.alpha = Math.max(0, off.alpha - step / FADE_OUT)
      checkArrival(D, 'to')
      checkArrival(U, 'from')
      draw()
    }
    const onScroll = () => {
      if (!visible || reduced || document.hidden || raf) return
      raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          // Anything above may have changed height since (fonts, images).
          locate()
          lastY = window.scrollY
        }
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

    window.addEventListener('scroll', onScroll, { passive: true })
    // The viewport's height alone (a phone's address bar) moves the span.
    window.addEventListener('resize', locate)

    measure()

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(pending)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
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
