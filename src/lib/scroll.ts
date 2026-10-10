import type Lenis from 'lenis'

let lenis: Lenis | null = null

/** The smooth-scroll instance, when there is one (none under reduced motion). */
export function registerLenis(instance: Lenis | null) {
  lenis = instance
}

/**
 * Jump the page by `delta` px with no smoothing.
 *
 * For holding something still on screen while the layout above it grows:
 * grow the box and jump by the same amount in the same frame, and the
 * element the viewer is looking at does not move. Goes through Lenis when
 * it is running, or it would animate back toward its own target.
 */
export function jumpBy(delta: number) {
  if (!delta) return
  const target = window.scrollY + delta
  if (lenis) lenis.scrollTo(target, { immediate: true, force: true, lock: false })
  else window.scrollTo(0, target)
}
