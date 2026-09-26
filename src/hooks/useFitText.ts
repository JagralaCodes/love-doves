import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Scales an element down so it fits its container's width.
 *
 * Needed for the Bismillah ligature (U+FDFD): it is a single glyph roughly
 * four times as wide as it is tall, so any font size large enough to read
 * comfortably overflows a phone. Guessing a size per breakpoint is fragile
 * — different fonts give the glyph different advance widths — so measure
 * the rendered text and scale to fit.
 *
 * Re-measures on resize and once webfonts land.
 */
export function useFitText<T extends HTMLElement = HTMLDivElement>(
  /** Never scale up past this, so short text does not balloon. */
  maxScale = 1,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<T | null>(null)
  const [scale, setScale] = useState(1)

  const measure = useCallback(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const available = container.clientWidth
    // Measure the untransformed width, or each pass would compound.
    const natural = content.scrollWidth
    if (!available || !natural) return

    const next = Math.min(maxScale, available / natural)
    // Ignore sub-pixel noise so we do not thrash on every resize frame.
    setScale((prev) => (Math.abs(prev - next) > 0.005 ? next : prev))
  }, [maxScale])

  useEffect(() => {
    measure()

    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(measure)
    ro.observe(container)

    // The glyph's width is not known until its font is actually in place.
    document.fonts?.ready.then(measure).catch(() => {})

    return () => ro.disconnect()
  }, [measure])

  return { containerRef, contentRef, scale }
}
