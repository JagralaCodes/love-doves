import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from './useReducedMotion'
import { deviceTier } from '../lib/device'

type Options = {
  /** Pixels the layer travels over its section's pass. 0 turns it off. */
  travel: number
  /**
   * 'lag'  — background depth: the layer drifts down while the page
   *          scrolls up, so it reads as further away than the content.
   * 'lift' — hung objects (lanterns): they rise away as the section leaves.
   *          Lagging would pull a cord away from the edge it hangs from.
   */
  mode?: 'lag' | 'lift'
}

/**
 * Scroll-scrubbed depth for a decorative layer.
 *
 * Put the ref on a WRAPPER, never on an element that already runs a CSS
 * animation on `transform` (the pattern drift, the bokeh float, the lantern
 * sway): a running CSS animation outranks the inline transform GSAP writes,
 * and the parallax would silently do nothing.
 *
 * Transform only, scrubbed directly (Lenis already smooths the scroll), and
 * skipped entirely under reduced motion or on low-end devices.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>({
  travel,
  mode = 'lag',
}: Options) {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !travel || reduced || deviceTier() === 'low') return
    const section = el.closest('section') ?? el.parentElement
    // Marks the layer for the stylesheet: it gets will-change only while
    // its section is on screen (see index.css), since a scrubbed transform
    // on a big un-promoted layer repaints it on every scrolled frame.
    el.dataset.parallax = ''

    const tween =
      mode === 'lag'
        ? gsap.fromTo(
            el,
            { y: -travel },
            {
              y: travel,
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        : gsap.fromTo(
            el,
            { y: 0 },
            {
              y: -travel,
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
            },
          )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(el, { clearProps: 'transform' })
      delete el.dataset.parallax
    }
  }, [travel, mode, reduced])

  return ref
}
