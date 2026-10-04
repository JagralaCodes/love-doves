import { useEffect } from 'react'
import { ScrollTrigger } from '../lib/gsap'

/**
 * Re-measures every ScrollTrigger when the page's height changes.
 *
 * ScrollTrigger recalculates on window resize, but not when content above
 * a trigger grows or shrinks: the envelope opening, the RSVP turning into
 * its thank-you, a lazily loaded section arriving, a font swapping in.
 * Each of those leaves every trigger further down firing at the wrong
 * scroll position. One observer on the body, debounced, and only when the
 * height really changed — there are no pinned sections, so a refresh
 * cannot itself change the height and loop.
 */
export function useScrollRefresh() {
  useEffect(() => {
    let last = document.body.scrollHeight
    let timer = 0
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight
      if (Math.abs(h - last) < 2) return
      last = h
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    })
    ro.observe(document.body)
    return () => {
      ro.disconnect()
      window.clearTimeout(timer)
    }
  }, [])
}
