import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { sparkleBurst } from '../../lib/sparkleBus'

type Props = {
  /** What sits under the foil. */
  children: ReactNode
  /** Fraction of the foil that must be cleared before it falls away. */
  threshold?: number
  /** Radius of the scratch brush, in CSS px. */
  brush?: number
  onRevealed?: () => void
  className?: string
  /** Label for the accessible fallback control. */
  revealLabel: string
  /**
   * Silhouette the foil is cut to. Without it the foil is the full
   * rectangle; with it, the sheet takes the shape instead — so the gold
   * IS the arch rather than a panel sitting inside one.
   */
  shape?: { d: string; width: number; height: number }
}

const MAX_DPR = 2
/** How many pixels to step when sampling coverage — full reads are wasteful. */
const SAMPLE_STEP = 8

/**
 * A gold-foil panel the viewer scratches away.
 *
 * The foil is drawn procedurally — gradient, grain, and a faint girih
 * lattice — so there is no image to ship. Scratching punches holes with
 * `destination-out`; once enough is cleared the whole sheet fades and the
 * date underneath is revealed.
 *
 * `touch-action: none` on the canvas stops a scratch from also scrolling
 * the page, which otherwise makes the card nearly unusable on a phone.
 *
 * Always pairs with a plain button, so the reveal never depends on being
 * able to drag: keyboard users, assistive tech and anyone with reduced
 * motion get there in one press.
 */
export function ScratchCard({
  children,
  threshold = 0.55,
  brush = 26,
  onRevealed,
  className = '',
  revealLabel,
  shape,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const revealedRef = useRef(false)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  /** How many samples the untouched sheet covers. Set on every repaint. */
  const baselineRef = useRef(0)

  const [revealed, setRevealed] = useState(false)
  const [progress, setProgress] = useState(0)
  const reduced = useReducedMotion()

  /**
   * Paints the foil. Also used to restore it after a resize.
   *
   * Spun gold rather than a flat sheet: a conic gradient gives the sectors
   * that radiate from the centre the way turned metal catches light, and
   * fine concentric arcs give it the lathe grain. The girih lattice is
   * pressed in underneath, and the whole thing is cut to `shape` so the
   * sheet reads as a solid gold arch, not a square panel inside one.
   */
  const paintFoil = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)
      ctx.save()

      // Cut everything that follows to the silhouette.
      if (shape) {
        const p = new Path2D()
        const m = new DOMMatrix()
          .scaleSelf(w / shape.width, h / shape.height)
        p.addPath(new Path2D(shape.d), m)
        ctx.clip(p)
      }

      const cx = w * 0.5
      const cy = h * 0.52
      const reach = Math.hypot(w, h)

      // Base: alternating light and shadow sectors around the centre.
      if (typeof ctx.createConicGradient === 'function') {
        const spun = ctx.createConicGradient(-Math.PI / 2, cx, cy)
        const stops: [number, string][] = [
          [0, '#f3e3ab'], [0.06, '#c9a33a'], [0.13, '#9c7622'],
          [0.2, '#e0c56e'], [0.27, '#f7eec9'], [0.34, '#c49b2e'],
          [0.42, '#8a6b23'], [0.5, '#dcbd5c'], [0.58, '#f7eec9'],
          [0.66, '#c49b2e'], [0.74, '#8f6d20'], [0.82, '#e3ca7b'],
          [0.9, '#c9a33a'], [0.96, '#9c7622'], [1, '#f3e3ab'],
        ]
        for (const [at, colour] of stops) spun.addColorStop(at, colour)
        ctx.fillStyle = spun
      } else {
        // Safari used to lack conic gradients; a raking linear still reads
        // as metal, just without the turned centre.
        const flat = ctx.createLinearGradient(0, 0, w, h * 0.6)
        flat.addColorStop(0, '#8a6b23')
        flat.addColorStop(0.3, '#c49b2e')
        flat.addColorStop(0.5, '#f7eec9')
        flat.addColorStop(0.72, '#c49b2e')
        flat.addColorStop(1, '#7d5f1c')
        ctx.fillStyle = flat
      }
      ctx.fillRect(0, 0, w, h)

      // A bloom at the turning centre, where the light pools.
      const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach * 0.42)
      bloom.addColorStop(0, 'rgba(255,250,228,0.72)')
      bloom.addColorStop(0.45, 'rgba(247,238,201,0.22)')
      bloom.addColorStop(1, 'rgba(247,238,201,0)')
      ctx.fillStyle = bloom
      ctx.fillRect(0, 0, w, h)

      // Lathe grain: concentric arcs, alternating highlight and shadow.
      ctx.globalAlpha = 0.09
      ctx.lineWidth = 1
      for (let i = 0; i < 150; i++) {
        const r = Math.random() * reach * 0.6
        const a0 = Math.random() * Math.PI * 2
        ctx.strokeStyle = Math.random() > 0.5 ? '#fff6dc' : '#6b5016'
        ctx.beginPath()
        ctx.arc(cx, cy, r, a0, a0 + 0.25 + Math.random() * 1.1)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // The girih lattice, pressed into the sheet.
      ctx.globalAlpha = 0.1
      ctx.strokeStyle = '#6b5016'
      ctx.lineWidth = 1
      const tile = 46
      for (let gx = tile / 2; gx < w + tile; gx += tile) {
        for (let gy = tile / 2; gy < h + tile; gy += tile) {
          ctx.beginPath()
          for (let k = 0; k < 16; k++) {
            const a = (k * Math.PI) / 8 - Math.PI / 2
            const r = k % 2 === 0 ? tile * 0.34 : tile * 0.34 * 0.7654
            const px = gx + Math.cos(a) * r
            const py = gy + Math.sin(a) * r
            if (k === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1

      // An inner rule following the silhouette, so the sheet reads as a
      // struck panel with a border rather than a flat fill.
      if (shape) {
        const inset = new Path2D()
        const k = 0.955
        const m = new DOMMatrix()
          .translateSelf((w * (1 - k)) / 2, (h * (1 - k)) / 2)
          .scaleSelf((w / shape.width) * k, (h / shape.height) * k)
        inset.addPath(new Path2D(shape.d), m)
        ctx.globalAlpha = 0.45
        ctx.strokeStyle = '#6b5016'
        ctx.lineWidth = 1.5
        ctx.stroke(inset)
        ctx.globalAlpha = 1
      } else {
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = '#6b5016'
        ctx.lineWidth = 1.5
        ctx.strokeRect(7, 7, w - 14, h - 14)
        ctx.globalAlpha = 1
      }

      ctx.restore()
    },
    [shape],
  )

  /** Opaque samples on a grid. The unit the progress fraction is built from. */
  const sampleOpaque = useCallback((ctx: CanvasRenderingContext2D) => {
    const { w, h, dpr } = sizeRef.current
    if (!w || !h) return 0
    const data = ctx.getImageData(0, 0, Math.round(w * dpr), Math.round(h * dpr)).data
    let opaque = 0
    // Sample on a grid rather than every pixel — precision here is wasted.
    const stride = 4 * SAMPLE_STEP
    for (let i = 3; i < data.length; i += stride) {
      if (data[i] >= 24) opaque++
    }
    return opaque
  }, [])

  /**
   * Portion of the foil that has been cleared, 0–1.
   *
   * Measured against what was actually PAINTED, not against the canvas
   * rectangle. Once the sheet is cut to an arch, most of the corners were
   * never foil to begin with — counting them as cleared would have the
   * card reveal itself the moment it was touched.
   */
  const measureCleared = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const baseline = baselineRef.current
      if (!baseline) return 0
      const left = sampleOpaque(ctx)
      return Math.min(1, Math.max(0, (baseline - left) / baseline))
    },
    [sampleOpaque],
  )

  const reveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    setRevealed(true)
    setProgress(1)

    const el = wrapRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, {
        count: 46,
        tone: 'mixed',
        power: 260,
      })
    }
    onRevealed?.()
  }, [onRevealed])

  // ── set up the canvas ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      sizeRef.current = { w: rect.width, h: rect.height, dpr }
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Resizing wipes the backing store, so the foil is repainted whole.
      // Scratches are lost — but only on an orientation change, and the
      // alternative is a stretched, blurry snapshot of the old surface.
      if (!revealedRef.current) {
        paintFoil(ctx, rect.width, rect.height)
        baselineRef.current = sampleOpaque(ctx)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [paintFoil, sampleOpaque, reduced])

  // ── scratching ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const pointAt = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    const scratchTo = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = brush * 2

      const last = lastPointRef.current
      if (last) {
        // Draw along the segment, or a fast drag leaves gaps between dots.
        ctx.beginPath()
        ctx.moveTo(last.x, last.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(x, y, brush, 0, Math.PI * 2)
      ctx.fill()
      lastPointRef.current = { x, y }
    }

    const onDown = (e: PointerEvent) => {
      if (revealedRef.current) return
      drawingRef.current = true
      lastPointRef.current = null
      // Capture keeps the drag alive if the finger leaves the card. It
      // throws for a pointer id the element never received, so it must not
      // be allowed to abort the scratch.
      try {
        canvas.setPointerCapture?.(e.pointerId)
      } catch {
        /* capture is an optimisation, not a requirement */
      }
      const p = pointAt(e)
      scratchTo(p.x, p.y)
    }

    const onMove = (e: PointerEvent) => {
      if (!drawingRef.current || revealedRef.current) return
      const p = pointAt(e)
      scratchTo(p.x, p.y)
    }

    const onUp = () => {
      if (!drawingRef.current) return
      drawingRef.current = false
      lastPointRef.current = null
      if (revealedRef.current) return
      // Measure on release rather than per frame: getImageData is a
      // readback and stalls the GPU pipeline if called while drawing.
      const cleared = measureCleared(ctx)
      setProgress(cleared)
      if (cleared >= threshold) reveal()
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    canvas.addEventListener('pointerleave', onUp)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('pointerleave', onUp)
    }
  }, [brush, threshold, measureCleared, reveal, reduced])

  // Reduced motion gets the content outright — no scratching required.
  useEffect(() => {
    if (reduced && !revealedRef.current) {
      revealedRef.current = true
      setRevealed(true)
    }
  }, [reduced])

  return (
    <div
      ref={wrapRef}
      className={`relative ${shape ? "" : "overflow-hidden rounded-[1.1rem]"} ${className}`}
    >
      {children}

      {!reduced && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 size-full cursor-grab transition-opacity duration-700 active:cursor-grabbing"
          style={{
            // Without this the browser claims the gesture and scrolls the
            // page instead of letting the card receive the drag.
            touchAction: 'none',
            opacity: revealed ? 0 : 1,
            pointerEvents: revealed ? 'none' : 'auto',
          }}
        />
      )}

      {!revealed && !reduced && (
        <button
          type="button"
          onClick={reveal}
          className="text-2xs absolute -bottom-11 left-1/2 -translate-x-1/2 tracking-[0.25em] whitespace-nowrap text-wine-soft uppercase transition-opacity duration-300 hover:opacity-70"
        >
          <span className="border-b border-gold/40 pb-1">{revealLabel}</span>
        </button>
      )}

      {/* Progress for assistive tech, which cannot see the foil thinning. */}
      <span className="sr-only" role="status" aria-live="polite">
        {revealed
          ? 'Revealed'
          : progress > 0
            ? `${Math.round(progress * 100)} percent scratched away`
            : ''}
      </span>
    </div>
  )
}
