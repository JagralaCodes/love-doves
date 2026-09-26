import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/motionPrefs'

/**
 * Live `prefers-reduced-motion` value. Components branch on this to
 * swap rich choreography for a plain fade — and to skip particles,
 * parallax and anything else that moves on its own.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
