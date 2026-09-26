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
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const revealedRef = useRef(false)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })

  const [revealed, setRevealed] = useState(false)
  const [progress, setProgress] = useState(0)
  const reduced = useReducedMotion()

  /** Paints the foil. Also used to restore it after a resize. */
  const paintFoil = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, w, h)

    // Base sheet: a raking gold gradient.
    const grad = ctx.createLinearGradient(0, 0, w, h * 0.6)
    grad.addColorStop(0, '#8a6b23')
    grad.addColorStop(0.18, '#c49b2e')
    grad.addColorStop(0.34, '#e6cf7e')
    grad.addColorStop(0.46, '#f7ecc4')
    grad.addColorStop(0.58, '#d9b544')
    grad.addColorStop(0.76, '#a67c1f')
    grad.addColorStop(1, '#7d5f1c')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Brushed grain: short strokes along the gradient's axis.
    ctx.globalAlpha = 0.12
    for (let i = 0; i < w * 0.9; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const len = 6 + Math.random() * 22
      ctx.strokeStyle = Math.random() > 0.5 ? '#fff6dc' : '#6b5016'
      ctx.lineWidth = Math.random() * 1.4
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + len, y + len * 0.35)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // A faint girih lattice pressed into the foil.
    ctx.globalAlpha = 0.14
    ctx.strokeStyle = '#6b5016'
    ctx.lineWidth = 1
    const tile = 46
    for (let cx = tile / 2; cx < w + tile; cx += tile) {
      for (let cy = tile / 2; cy < h + tile; cy += tile) {
        ctx.beginPath()
        for (let k = 0; k < 16; k++) {
          const a = (k * Math.PI) / 8 - Math.PI / 2
          const r = k % 2 === 0 ? tile * 0.34 : tile * 0.34 * 0.7654
          const px = cx + Math.cos(a) * r
          const py = cy + Math.sin(a) * r
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1

    // Inner border, so the sheet reads as a pressed panel.
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = '#6b5016'
    ctx.lineWidth = 1.5
    ctx.strokeRect(7, 7, w - 14, h - 14)
    ctx.globalAlpha = 1
  }, [])

  /** Portion of the foil that has been cleared, 0–1. */
  const measureCleared = useCallback((ctx: CanvasRenderingContext2D) => {
    const { w, h, dpr } = sizeRef.current
    if (!w || !h) return 0
    const data = ctx.getImageData(0, 0, Math.round(w * dpr), Math.round(h * dpr)).data
    let clear = 0
    let total = 0
    // Sample on a grid rather than every pixel — precision here is wasted.
    const stride = 4 * SAMPLE_STEP
    for (let i = 3; i < data.length; i += stride) {
      total++
      if (data[i] < 24) clear++
    }
    return total ? clear / total : 0
  }, [])

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
      if (!revealedRef.current) paintFoil(ctx, rect.width, rect.height)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [paintFoil, reduced])

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
    <div ref={wrapRef} className={`relative overflow-hidden rounded-[1.1rem] ${className}`}>
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
