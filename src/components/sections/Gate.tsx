import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { GateDoorLeaf, DoorDefs } from '../svg/GateDoors'
import { HeartSeal } from '../svg/HeartSeal'
import { EightStar } from '../svg/Ornaments'
import { sparkleBurst } from '../../lib/sparkleBus'
import { wedding } from '../../config/wedding.config'
import { useLang, langAttrs } from '../../hooks/useLang'

type Props = {
  /** The doors have begun to swing: start the page behind them. */
  onOpening: () => void
  /** The gate has faded out completely and can be unmounted. */
  onOpened: () => void
}

/**
 * The opening gate: carved doors closed over the invitation, held shut by
 * a single wax heart.
 *
 * One tap releases it. It lifts for a beat, then falls away under gravity
 * with a little spin and a sideways kick — and while it is still falling
 * the doors start to swing, the hero begins to play in behind them, and
 * the gate fades off. Tap to names on screen is about 2.4 seconds.
 *
 * The release fires on `pointerdown`, not `click`: a click needs the
 * finger to lift without moving and can be eaten by a 300 ms double-tap
 * delay or a stray drag, and a first tap that does nothing is the worst
 * thing this screen can do. Keyboard users still get a click (Enter /
 * Space), guarded so the two can never both fire.
 */
export function Gate({ onOpening, onOpened }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  /** A ref, not state: a second tap can land before React re-renders. */
  const releasedRef = useRef(false)
  const [released, setReleased] = useState(false)

  const reduced = useReducedMotion()
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  const openDoors = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    onOpening()

    if (reduced) {
      gsap.to(root, { autoAlpha: 0, duration: 0.45, ease: 'none', onComplete: onOpened })
      return
    }

    // The leaves cover the whole screen while shut, so the backdrop behind
    // them can go now: the hero shows through the widening gap as they
    // swing, instead of after the whole gate has faded.
    root.style.backgroundColor = 'transparent'

    gsap
      .timeline({ onComplete: onOpened })
      .to(copyRef.current, { autoAlpha: 0, y: -12, duration: 0.3 }, 0)
      .to(leftRef.current, { rotateY: -104, duration: 1.2, ease: 'power3.inOut' }, 0.05)
      .to(rightRef.current, { rotateY: 104, duration: 1.2, ease: 'power3.inOut' }, 0.05)
      .to(root, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, 0.75)
  }, [reduced, onOpening, onOpened])

  const releaseHeart = useCallback(() => {
    if (releasedRef.current) return
    releasedRef.current = true
    setReleased(true)

    const heart = heartRef.current
    if (!heart || reduced) {
      if (heart) gsap.set(heart, { autoAlpha: 0 })
      openDoors()
      return
    }

    const rect = heart.getBoundingClientRect()
    sparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, {
      count: 24,
      tone: 'rose',
      power: 170,
    })

    gsap
      .timeline()
      // A beat of release before gravity takes it...
      .to(heart, { scale: 1.07, yPercent: -12, rotate: -5, duration: 0.14, ease: 'power2.out' })
      // ...then it drops, accelerating, tumbling and drifting aside.
      .to(heart, {
        y: window.innerHeight * 0.8,
        x: gsap.utils.random(26, 54),
        rotate: gsap.utils.random(38, 70),
        scale: 0.86,
        duration: 0.8,
        ease: 'power2.in',
      })
      .to(heart, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, '-=0.3')
      // The doors do not wait for it to land.
      .add(openDoors, 0.4)
  }, [reduced, openDoors])

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    releaseHeart()
  }

  // Settle the heart in once the gate appears. Opacity only — `autoAlpha`
  // would set `visibility: hidden`, and a hidden element cannot be tapped,
  // so a quick first tap would have gone straight through to the door.
  useEffect(() => {
    const heart = heartRef.current
    if (!heart) return
    gsap.fromTo(
      heart,
      { opacity: 0, scale: 0.86 },
      { opacity: 1, scale: 1, duration: reduced ? 0.3 : 0.9, ease: 'expo.out' },
    )
  }, [reduced])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] overflow-hidden bg-wine-deep"
      style={{
        perspective: '1400px',
        perspectiveOrigin: '50% 45%',
        maxWidth: 'var(--app-max)',
        marginInline: 'auto',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={wedding.texts.inviteLine}
    >
      <DoorDefs />

      <div className="absolute inset-0 flex" style={{ transformStyle: 'preserve-3d' }}>
        <div
          ref={leftRef}
          className="h-full w-1/2"
          style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
        >
          <GateDoorLeaf side="left" />
        </div>
        <div
          ref={rightRef}
          className="h-full w-1/2"
          style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d' }}
        >
          <GateDoorLeaf side="right" />
        </div>
      </div>

      {/* Heart and invitation, sitting on the springline. */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center px-8"
        style={{ paddingTop: 'calc(75% - 3.5rem)' }}
      >
        <button
          ref={heartRef}
          type="button"
          onPointerDown={onPointerDown}
          onClick={releaseHeart}
          disabled={released}
          aria-label="Release the heart to open the invitation"
          // No CSS transition on transform: GSAP drives the lift and the
          // fall, and a transition would smear every frame of it.
          className="pointer-events-auto relative size-28 origin-center disabled:cursor-default"
          style={{
            filter: 'drop-shadow(0 6px 13px rgba(0,0,0,0.45))',
            // No double-tap-to-zoom delay on the one control that matters.
            touchAction: 'manipulation',
          }}
        >
          <HeartSeal initials={wedding.monogram} className="size-full" />
        </button>

        <div ref={copyRef} className="mt-9 text-center">
          <p
            className={`text-2xs tracking-[0.45em] text-gold-light/90 ${ur ? 'font-urdu' : 'uppercase'}`}
            lang={t.lang}
            dir={t.dir}
          >
            {ur ? wedding.urdu.inviteLine : wedding.texts.inviteLine}
          </p>

          <span className="my-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/50" />
            <EightStar className="w-2.5" />
            <span className="h-px w-8 bg-gold/50" />
          </span>

          <p className="sr-only" role="status" aria-live="polite">
            {released ? 'Opening the invitation' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
