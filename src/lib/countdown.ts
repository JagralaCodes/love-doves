/**
 * Pure countdown arithmetic, kept dependency-free so it can be tested in
 * Node and so the hook that drives it stays trivial.
 */

export type Remaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** True once the target has passed. */
  done: boolean
  /** Whole milliseconds left, floored at zero. */
  ms: number
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Time left until `target`, split into display units.
 *
 * Always computed from absolute timestamps rather than by decrementing a
 * stored counter: a decrementing counter drifts, and worse, it stops when
 * the tab is backgrounded and resumes wrong. Re-deriving from `now` on
 * every tick is self-correcting by construction.
 */
export function remaining(target: Date | number | string, now: number = Date.now()): Remaining {
  const end = typeof target === 'number' ? target : new Date(target).getTime()
  const ms = Math.max(0, end - now)
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / MINUTE),
    seconds: Math.floor((ms % MINUTE) / SECOND),
    done: ms === 0,
    ms,
  }
}

/** Two-digit cell for the rollers. Days can legitimately exceed 99. */
export function cell(n: number, min = 2): string {
  return String(Math.max(0, Math.floor(n))).padStart(min, '0')
}
