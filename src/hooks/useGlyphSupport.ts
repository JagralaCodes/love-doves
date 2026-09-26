import { useEffect, useState } from 'react'

/**
 * Whether the given font can actually draw a character.
 *
 * The Bismillah ligature (U+FDFD) is a single glyph in Amiri, but if the
 * font fails to load the browser silently substitutes a fallback — which
 * renders it as tofu or as nothing at all. Measuring is the only reliable
 * way to tell: an unsupported codepoint falls back to the same .notdef
 * width as a guaranteed-absent character.
 *
 * Returns `null` until measured, so callers can avoid a flash of the
 * wrong variant.
 */
export function useGlyphSupport(char: string, fontFamily: string): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    const measure = () => {
      if (cancelled) return
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setSupported(false)
          return
        }
        const font = `64px ${fontFamily}`
        ctx.font = font
        // U+FFFF is permanently unassigned, so it always renders .notdef.
        const missing = ctx.measureText('￿').width
        const target = ctx.measureText(char).width
        setSupported(target > 0 && Math.abs(target - missing) > 0.5)
      } catch {
        setSupported(false)
      }
    }

    // Measure only once the webfont is actually in place.
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(measure)
    } else {
      measure()
    }

    return () => {
      cancelled = true
    }
  }, [char, fontFamily])

  return supported
}
