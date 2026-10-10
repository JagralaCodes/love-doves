import { gsap } from './gsap'

export type SceneCtx = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dt: number
  time: number
}

export type Scene = {
  /** Called on mount and whenever the canvas is resized. */
  resize: (width: number, height: number) => void
  /** Called once per frame while the canvas is on screen. */
  draw: (c: SceneCtx) => void
  /**
   * True when there is nothing moving. The canvas is cleared once and then
   * left alone — no clear, no draw — until this goes false again.
   */
  idle?: () => boolean
}

type Options = {
  /** Skip frames while the canvas is scrolled out of view. */
  pauseOffscreen?: boolean
  /** Cap the device pixel ratio — 2 is plenty, 3 wastes fill rate. */
  maxDpr?: number
}

/**
 * Mounts a 2D canvas scene onto an existing <canvas> element.
 *
 * Shares GSAP's single rAF with Lenis rather than starting another loop,
 * pauses when off screen or when the tab is hidden, and keeps the backing
 * store in sync with CSS size at a capped DPR.
 *
 * Returns a teardown function.
 */
export function mountCanvasScene(
  canvas: HTMLCanvasElement,
  createScene: () => Scene,
  options: Options = {},
): () => void {
  const { pauseOffscreen = true, maxDpr = 2 } = options
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return () => {}

  const scene = createScene()
  let width = 0
  let height = 0
  let visible = !pauseOffscreen
  let last = performance.now()
  let elapsed = 0
  let wasIdle = false

  const applySize = () => {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
    width = Math.max(1, Math.round(rect.width))
    height = Math.max(1, Math.round(rect.height))
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    scene.resize(width, height)
  }

  applySize()

  const tick = () => {
    const now = performance.now()
    // Clamp dt so a backgrounded tab does not teleport every particle.
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (!visible || document.hidden) return
    if (scene.idle?.()) {
      // A still scene costs nothing: wipe the last frame, then stop.
      if (!wasIdle) {
        ctx.clearRect(0, 0, width, height)
        wasIdle = true
      }
      return
    }
    wasIdle = false
    elapsed += dt
    ctx.clearRect(0, 0, width, height)
    scene.draw({ ctx, width, height, dt, time: elapsed })
  }

  gsap.ticker.add(tick)

  const ro = new ResizeObserver(applySize)
  ro.observe(canvas)

  let io: IntersectionObserver | undefined
  if (pauseOffscreen) {
    io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        // Reset the clock so nothing jumps when it comes back into view.
        last = performance.now()
      },
      { rootMargin: '120px' },
    )
    io.observe(canvas)
  }

  return () => {
    gsap.ticker.remove(tick)
    ro.disconnect()
    io?.disconnect()
  }
}

/** Uniform random in [min, max). */
export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
