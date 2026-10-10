/**
 * Line drawing with stroke-dasharray / stroke-dashoffset — what the GSAP
 * DrawSVG plugin does, in the two shapes this site needs. A few lines of
 * attribute writes are not worth a plugin in the bundle.
 */

/** Set up a path to be drawn, starting fully hidden. */
export function prepareDraw(path: SVGPathElement): number {
  const length = path.getTotalLength()
  path.style.strokeDasharray = `${length} ${length}`
  path.style.strokeDashoffset = `${length}`
  return length
}

/** Draw from the start to `progress` (0–1). */
export function drawTo(path: SVGPathElement, length: number, progress: number) {
  path.style.strokeDashoffset = `${length * (1 - Math.min(1, Math.max(0, progress)))}`
}

/** Draw outwards from the middle: at 1 the whole path is visible. */
export function drawFromCentre(path: SVGPathElement, length: number, progress: number) {
  const d = length * Math.min(1, Math.max(0, progress))
  path.style.strokeDasharray = `${d} ${length}`
  path.style.strokeDashoffset = `${-(length - d) / 2}`
}
