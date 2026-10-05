import type { CSSProperties } from 'react'

type Options = {
  /** How far the hand-off reaches into this section. */
  height?: string
  /**
   * Extra stops between `from` and transparent, for a longer transition
   * than a single fade — the dusk into the closing pages.
   */
  via?: string[]
}

/**
 * A soft hand-off from the section above, as a background layer.
 *
 * Every section paints its own flat ground, so neighbours of different
 * colours met in a hard horizontal line and the page read as a stack of
 * slabs. This carries the colour above down into the section and fades it
 * out, so the page flows from one ground to the next.
 *
 * It is a background-image on the section itself, not an overlay element.
 * An overlay is clipped by the section's overflow and anti-aliased
 * separately from the background beneath it, and at a fractional pixel
 * boundary the two soft edges compound: the wine underneath leaked through
 * as a hairline across the top of the dusk. Painted in the same pass as the
 * background colour, there is only one edge.
 *
 * Usage: `<section className="bg-wine-deep …" style={seam('var(--color-pearl-white)')}>`
 */
export function seam(from: string, { height = '5.5rem', via = [] }: Options = {}): CSSProperties {
  return {
    backgroundImage: `linear-gradient(180deg, ${[from, ...via, 'transparent'].join(', ')})`,
    backgroundSize: `100% ${height}`,
    backgroundRepeat: 'no-repeat',
  }
}
