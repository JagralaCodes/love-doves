import type { CSSProperties } from 'react'

type Options = {
  /** How far the hand-off reaches into this section. */
  height?: string
  /**
   * Extra stops between `from` and the section's own colour, as
   * [colour, fraction of `height`] — for a longer transition than a single
   * fade, like the dusk into the closing pages.
   */
  via?: [string, number][]
}

/**
 * A soft hand-off from the section above: the ENTIRE background of the
 * section, as one gradient from the colour above into the section's own.
 *
 * Every section paints its own flat ground, so neighbours of different
 * colours met in a hard horizontal line and the page read as a stack of
 * slabs. This carries the colour above down into the section and fades it
 * out, so the page flows from one ground to the next.
 *
 * Why one gradient and not "background colour + a gradient on top": the
 * browser paints a background colour and a background image as two
 * separate fills, and each is anti-aliased on its own at a fractional
 * pixel edge. The colour underneath then leaks through the image's soft
 * edge — wine showing as a grey hairline across the top of the white dusk.
 * An overlay element had the same problem. A single fill has one edge.
 *
 * The `background` shorthand also resets background-colour to transparent,
 * overriding the section's bg-* class, so nothing is painted beneath.
 *
 * Usage: `<section className="bg-wine-deep …" style={seam(PEARL, WINE)}>`
 * — keep the bg-* class as documentation and as the no-inline-style
 * fallback; the inline style wins.
 */
export function seam(from: string, to: string, { height = '5.5rem', via = [] }: Options = {}): CSSProperties {
  const stops = [
    `${from} 0`,
    ...via.map(([color, f]) => `${color} calc(${height} * ${f})`),
    `${to} ${height}`,
    `${to} 100%`,
  ]
  return { background: `linear-gradient(180deg, ${stops.join(', ')})` }
}
