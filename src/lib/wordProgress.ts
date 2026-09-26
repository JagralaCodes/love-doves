/**
 * Where one word sits in its own reveal, 0–1, for a given overall scroll
 * progress through the passage.
 *
 * Kept in its own dependency-free module so the mapping can be tested
 * without a browser or a GSAP import.
 *
 * `overlap` lets neighbouring words be in flight at the same time, which
 * reads as a wave rather than a ticker.
 */
export function wordProgressAt(
  progress: number,
  index: number,
  count: number,
  overlap = 0.25,
): number {
  if (count <= 0) return 1
  // Cap at 1: with very few words the overlap would push the span past the
  // whole scroll range, and the word could never finish revealing.
  const span = Math.min(1, (1 / count) * (1 + overlap))
  const lastStart = Math.max(0.0001, 1 - span)
  const wordStart = count === 1 ? 0 : (index / (count - 1)) * lastStart
  const local = (progress - wordStart) / span
  // Snap the ends: the last word's arithmetic lands a float-epsilon short
  // of 1, and callers should be able to test for a clean finish.
  if (local <= 1e-9) return 0
  if (local >= 1 - 1e-9) return 1
  return local
}
