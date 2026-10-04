type Props = {
  /** The colour of the section above, carried down over the boundary. */
  from: string
  /** How far the hand-off reaches into this section. */
  height?: string
  /**
   * Extra stops between `from` and transparent, for a longer transition
   * than a single fade — the dusk into the closing pages.
   */
  via?: string[]
}

/**
 * A soft hand-off from the section above.
 *
 * Every section paints its own flat background, so neighbours of different
 * colours met in a hard horizontal line — the page read as a stack of
 * slabs. A seam carries the colour above down into this section and fades
 * it out, so the page flows from one ground to the next.
 *
 * Place it AFTER the section's pattern layer (so it softens the pattern's
 * edge too) and before the content, which sits at z-10 above it.
 */
export function Seam({ from, height = '5.5rem', via = [] }: Props) {
  const stops = [from, ...via, 'transparent'].join(', ')
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0"
      style={{ height, background: `linear-gradient(180deg, ${stops})` }}
    />
  )
}
