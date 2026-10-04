/**
 * The rule deciding what a released swipe does to the event deck.
 *
 * Kept out of the component so it can be tested directly, and because it
 * is the part that was wrong once already: the threshold used to be a
 * fraction of the VIEWPORT width. The invitation is a fixed ~480px column
 * at every screen size, so on a desktop window that demanded a 478px drag
 * — further than the card is wide — and the deck could not be swiped at
 * all. It is a fraction of the CARD's width instead.
 */

/** Fraction of the card's width a drag must cross to count as a throw. */
export const THROW_RATIO = 0.28
/** Floor, so a narrow card still needs a real pull rather than a twitch. */
export const THROW_MIN = 72
/** A fast flick counts even when the card barely moved, in px/s. */
export const FLICK_VELOCITY = 460

export type ThrowResult = {
  thrown: boolean
  /** True when the deck should advance; dragging left moves forward. */
  forward: boolean
}

export function resolveThrow(
  offsetX: number,
  velocityX: number,
  cardWidth: number,
): ThrowResult {
  const threshold = Math.max(THROW_MIN, cardWidth * THROW_RATIO)
  const thrown =
    Math.abs(offsetX) > threshold || Math.abs(velocityX) > FLICK_VELOCITY
  // A flick that barely moved still has a direction: prefer the offset's
  // sign, and fall back to the velocity's when the card has not shifted.
  const forward = offsetX !== 0 ? offsetX < 0 : velocityX < 0
  return { thrown, forward }
}
