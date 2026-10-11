/**
 * Line drawing with stroke-dasharray / stroke-dashoffset — what the GSAP
 * DrawSVG plugin does, in the two shapes this site needs. A few lines of
 * attribute writes are not worth a plugin in the bundle.
 *
 * One trap: with `vector-effect: non-scaling-stroke` the dash lengths are
 * in SCREEN pixels, while getTotalLength() is in the path's own units. On a
 * stretched arch that left the last lobe undrawn. So the length is scaled
 * to the screen for such paths, and at the end the dash is removed
 * outright — the finished line never depends on the arithmetic.
 */

/** The path's length in the units its dashes are measured in. */
function dashLength(path: SVGPathElement): number {
  const length = path.getTotalLength()
  if (getComputedStyle(path).vectorEffect !== 'non-scaling-stroke') return length
  try {
    const box = path.getBBox()
    const rect = path.getBoundingClientRect()
    if (box.width && box.height) return length * Math.max(rect.width / box.width, rect.height / box.height)
  } catch {
    /* detached or unmeasurable: fall through */
  }
  return length
}

/** Set up a path to be drawn, starting fully hidden. */
export function prepareDraw(path: SVGPathElement): number {
  const length = dashLength(path)
  path.style.strokeDasharray = `${length} ${length}`
  path.style.strokeDashoffset = `${length}`
  return length
}

function finish(path: SVGPathElement) {
  path.style.strokeDasharray = ''
  path.style.strokeDashoffset = ''
}

/** Draw from the start to `progress` (0–1). */
export function drawTo(path: SVGPathElement, length: number, progress: number) {
  const p = Math.min(1, Math.max(0, progress))
  if (p >= 1) return finish(path)
  path.style.strokeDasharray = `${length} ${length}`
  path.style.strokeDashoffset = `${length * (1 - p)}`
}

/** Draw outwards from the middle: at 1 the whole path is visible. */
export function drawFromCentre(path: SVGPathElement, length: number, progress: number) {
  const p = Math.min(1, Math.max(0, progress))
  if (p >= 1) return finish(path)
  const d = length * p
  path.style.strokeDasharray = `${d} ${length}`
  path.style.strokeDashoffset = `${-(length - d) / 2}`
}
