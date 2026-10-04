import { useEffect, useState } from 'react'
import { remaining } from '../lib/countdown'
import type { Remaining } from '../lib/countdown'

/**
 * Live time-left until `target`, ticking once a second.
 *
 * One interval for the whole site — this is the ONLY countdown, by design.
 * Every tick re-derives from Date.now() rather than decrementing, so a
 * backgrounded tab (where browsers throttle timers to once a minute or
 * worse) snaps back to the right value the instant it is foregrounded,
 * instead of resuming from wherever it stalled. A visibilitychange
 * listener forces that correction immediately rather than on the next tick.
 */
export function useCountdown(target: string | number | Date): Remaining {
  const [state, setState] = useState<Remaining>(() => remaining(target))

  useEffect(() => {
    const tick = () => setState(remaining(target))
    tick()
    const id = window.setInterval(tick, 1000)
    const onVisible = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [target])

  return state
}
