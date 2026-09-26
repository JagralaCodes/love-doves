/**
 * Tiny event bus so any component can fire a sparkle burst without
 * threading a context through the tree:
 *
 *   sparkleBurstFrom(cardEl)      // on reveal
 *   sparkleBurst(x, y, { count: 40 })
 *
 * <SparkleLayer /> subscribes and does the drawing.
 */

export type BurstOptions = {
  count?: number
  /** Initial speed spread, px/s. */
  power?: number
  tone?: 'white' | 'gold' | 'rose' | 'mixed'
}

type Listener = (x: number, y: number, options: BurstOptions) => void

const listeners = new Set<Listener>()

export function onSparkleBurst(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Burst at a point in viewport coordinates. */
export function sparkleBurst(x: number, y: number, options: BurstOptions = {}) {
  for (const fn of listeners) fn(x, y, options)
}

/** Burst from the centre of an element — the common case on a reveal. */
export function sparkleBurstFrom(
  el: Element | null | undefined,
  options: BurstOptions = {},
) {
  if (!el) return
  const r = el.getBoundingClientRect()
  sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, options)
}
