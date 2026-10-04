import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Heart } from '../svg/Ornaments'

type Props = {
  /** Shown once the gate has opened; nothing to measure before that. */
  visible: boolean
}

/**
 * A thin gold thread down the left gutter that fills as the invitation is
 * read, with a small heart riding the end of it — the same "a line drawn
 * by scrolling" language as the rope and the route, applied to the page.
 *
 * Fixed inside a box the width of the invitation column, so on desktop it
 * hugs the column rather than the edge of a wide window. Transform only:
 * the fill is a scaleY, the heart a translateY.
 */
export function ScrollThread({ visible }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const beadRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!visible || !root || !track) return

    const ctx = gsap.context(() => {
      gsap.to(root, { autoAlpha: 1, duration: reduced ? 0.2 : 1.2, delay: reduced ? 0 : 1.4 })

      gsap
        .timeline({
          // Whole document: from the very top to the very bottom.
          scrollTrigger: { start: 0, end: 'max', scrub: reduced ? true : 0.35 },
          defaults: { ease: 'none' },
        })
        .fromTo(fillRef.current, { scaleY: 0 }, { scaleY: 1 }, 0)
        .fromTo(
          beadRef.current,
          { y: 0 },
          // Re-measured on refresh, so a resize keeps the heart on the tip.
          { y: () => track.clientHeight },
          0,
        )
    }, root)

    return () => ctx.revert()
  }, [visible, reduced])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-1/2 z-[60] w-full max-w-[var(--app-max)] -translate-x-1/2"
    >
      <div ref={rootRef} className="invisible absolute top-[16svh] bottom-[16svh] left-[9px] w-px opacity-0">
        <div ref={trackRef} className="absolute inset-0 bg-gold/15" />
        <div
          ref={fillRef}
          className="absolute inset-0 origin-top"
          style={{
            background: 'linear-gradient(180deg, rgba(212,175,55,0.15), #d4af37 70%, #f5e1a4)',
            transform: 'scaleY(0)',
          }}
        />
        <div ref={beadRef} className="absolute top-0 left-1/2">
          <span
            className="block -translate-x-1/2 -translate-y-1/2"
            style={{ filter: 'drop-shadow(0 0 4px rgba(245,225,164,0.9))' }}
          >
            <Heart className="w-2" />
          </span>
        </div>
      </div>
    </div>
  )
}
