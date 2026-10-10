import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motionPrefs'

/**
 * Lenis smooth scrolling, driven by GSAP's ticker and kept in lockstep
 * with ScrollTrigger. Returns the instance so the gate can stop/start it.
 *
 * Under reduced-motion we never create Lenis at all — native scrolling
 * is what that setting is asking for.
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.1,
      // Gentle exponential glide, no overshoot.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch stays NATIVE. Smoothing a finger (syncTouch) re-implements
      // the phone's own scroll physics in JS and feels laggy on mid-range
      // Android; Lenis only smooths the wheel. Its touch listeners are
      // passive when it is not syncing.
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    })
    lenisRef.current = lenis

    // Lenis position changes must refresh ScrollTrigger's cache.
    lenis.on('scroll', ScrollTrigger.update)

    // One raf loop for both libraries (GSAP's ticker owns it).
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
