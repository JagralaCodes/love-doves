import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Heart } from '../svg/Ornaments'

type Props = {
  /** Shown once the gate has opened; nothing to measure before that. */
  visible: boolean
}

type Mark = { label: string; at: number }

/**
 * A scroll-progress thread down the left gutter: a 2px gold line that
 * fills as the invitation is read, a small dot for each section, and a
 * heart riding the end of the fill.
 *
 * The dots are placed from the sections themselves — anything carrying
 * `data-thread="Name"` — measured on every ScrollTrigger refresh, so they
 * follow the page as it grows (the envelope opening, the lazy chunk
 * landing). The fill is a scaleY and the heart a translateY; each dot
 * lights up by opacity when the thread reaches it. Fixed inside a box the
 * width of the invitation column, so on desktop it hugs the column.
 */
export function ScrollThread({ visible }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const beadRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [marks, setMarks] = useState<Mark[]>([])

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!visible || !root || !track) return

    // Where each marked section sits in the scroll range, 0–1: the point
    // at which its top crosses the middle of the screen.
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const mid = window.innerHeight * 0.5
      const next = Array.from(document.querySelectorAll<HTMLElement>('[data-thread]')).map((el) => ({
        label: el.dataset.thread ?? '',
        at: Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY - mid) / max)),
      }))
      setMarks((prev) =>
        prev.length === next.length && prev.every((m, i) => m.label === next[i].label && Math.abs(m.at - next[i].at) < 0.002)
          ? prev
          : next,
      )
    }

    // Each dot lights when the thread reaches it — an opacity flip, and
    // only when a dot's state actually changes.
    const light = (progress: number) => {
      root.querySelectorAll<HTMLElement>('[data-dot]').forEach((dot) => {
        const lit = progress >= Number(dot.dataset.at) - 0.004
        if ((dot.dataset.lit === '1') !== lit) {
          dot.dataset.lit = lit ? '1' : '0'
          dot.style.opacity = lit ? '1' : '0'
        }
      })
    }

    const ctx = gsap.context(() => {
      gsap.to(root, { autoAlpha: 1, duration: reduced ? 0.2 : 1.2, delay: reduced ? 0 : 1.4 })

      gsap
        .timeline({
          // Whole document: from the very top to the very bottom.
          scrollTrigger: {
            start: 0,
            end: 'max',
            scrub: reduced ? true : 0.35,
            onRefresh: (self) => {
              measure()
              // The dots were just re-placed; light the ones already passed.
              requestAnimationFrame(() => light(self.progress))
            },
            onUpdate: (self) => light(self.progress),
          },
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

    measure()
    // Fonts and lazy sections change the page's height after mount.
    const onRefresh = () => measure()
    ScrollTrigger.addEventListener('refresh', onRefresh)

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      ctx.revert()
    }
  }, [visible, reduced])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-1/2 z-[60] w-full max-w-[var(--app-max)] -translate-x-1/2"
    >
      <div ref={rootRef} className="invisible absolute top-[16svh] bottom-[16svh] left-[10px] w-0.5 opacity-0">
        <div ref={trackRef} className="absolute inset-0 rounded-full bg-gold/15" />
        <div
          ref={fillRef}
          className="absolute inset-0 origin-top rounded-full"
          style={{
            background: 'linear-gradient(180deg, rgba(212,175,55,0.2), var(--color-gold) 70%, var(--color-gold-light))',
            transform: 'scaleY(0)',
          }}
        />

        {/* One dot per section, on the track. */}
        {marks.map((m) => (
          <span
            key={m.label}
            className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/60 bg-pearl-white"
            style={{ top: `${m.at * 100}%` }}
          >
            <span
              data-dot
              data-at={m.at}
              className="absolute inset-0 rounded-full bg-gold"
              style={{ opacity: 0, transition: 'opacity 0.4s ease' }}
            />
          </span>
        ))}

        <div ref={beadRef} className="absolute top-0 left-1/2">
          <span
            className="block -translate-x-1/2 -translate-y-1/2"
            style={{ filter: 'drop-shadow(0 0 4px rgba(245,225,164,0.9))' }}
          >
            <Heart className="w-2.5" />
          </span>
        </div>
      </div>
    </div>
  )
}
