/**
 * Deterministic pseudo-random numbers for decorative layouts.
 *
 * Particle positions used to come from Math.random() inside useMemo. That
 * is impure during render: React may re-run the memo (Strict Mode does it
 * on purpose), and the specks would jump. Seeding from the component's
 * useId keeps every instance different while making a given instance
 * produce the same layout on every render.
 */

/** FNV-1a: a stable 32-bit hash of a string, used as the seed. */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Mulberry32: tiny, fast, and plenty random for sparkle placement. */
export function seeded(seed: number | string): () => number {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
