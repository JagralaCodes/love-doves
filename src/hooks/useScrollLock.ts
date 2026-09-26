import { useEffect } from 'react'
import type { RefObject } from 'react'
import type Lenis from 'lenis'

/**
 * Freezes the page while `locked` is true — used to hold the viewer on
 * the opening gate. Locks Lenis when it exists, and the document either
 * way (so it also works under reduced-motion, where Lenis is skipped).
 */
export function useScrollLock(
  locked: boolean,
  lenisRef?: RefObject<Lenis | null>,
) {
  useEffect(() => {
    const root = document.documentElement
    const lenis = lenisRef?.current

    if (locked) {
      lenis?.stop()
      root.style.overflow = 'hidden'
      // Always re-open at the top, even on a refresh mid-page.
      window.scrollTo(0, 0)
    } else {
      root.style.overflow = ''
      lenis?.start()
    }

    return () => {
      root.style.overflow = ''
    }
  }, [locked, lenisRef])
}
