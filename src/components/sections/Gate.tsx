import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { GateDoorLeaf, DoorDefs } from '../svg/GateDoors'
import { HeartSeal } from '../svg/HeartSeal'
import { EightStar } from '../svg/Ornaments'
import { sparkleBurst } from '../../lib/sparkleBus'
import { wedding } from '../../config/wedding.config'
import { useLang, langAttrs } from '../../hooks/useLang'

type Props = {
  onOpened: () => void
}

/**
 * The opening gate: carved doors closed over the invitation, held shut by
 * a single wax heart.
 *
 * Tapping the heart releases it: it lifts for a beat, then falls away
 * under gravity with a little spin and a sideways kick, carrying its
 * stamped monogram with it. Then the doors swing open and the gate fades
 * off the invitation.
 *
 * There is no separate button — the heart is the control. It is a real
 * <button>, so the whole sequence works from the keyboard too.
 */
export function Gate({ onOpened }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const heartRef = useRef<HTMLButtonElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  /** A ref, not state: a second tap can land before React re-renders. */
  const releasedRef = useRef(false)
  const openingRef = useRef(false)
  const [released, setReleased] = useState(false)

  const reduced = useReducedMotion()
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  const openDoors = useCallback(() => {
    if (openingRef.current) return
    openingRef.current = true

    const root = rootRef.current
    if (!root) return

    if (reduced) {
      gsap.to(root, { autoAlpha: 0, duration: 0.45, ease: 'none', onComplete: onOpened })
      return
    }

    const tl = gsap.timeline({ onComplete: onOpened })

    // The doors swing, then the whole gate fades off the invitation.
    // There is deliberately no light burst behind them: a full-bleed
    // radial flash washed the page out to a flat oval and showed the hero
    // through it mid-fade, which read as a glitch rather than an opening.
    tl.to(copyRef.current, { autoAlpha: 0, y: -12, duration: 0.4 })
      .to(leftRef.current, { rotateY: -102, duration: 1.5, ease: 'power3.inOut' }, 'swing')
      .to(rightRef.current, { rotateY: 102, duration: 1.5, ease: 'power3.inOut' }, 'swing')
      .to(root, { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' }, 'swing+=0.95')
  }, [reduced, onOpened])

  const releaseHeart = useCallback(() => {
    if (releasedRef.current || openingRef.current) return
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

    const tl = gsap.timeline({ onComplete: openDoors })

    // A beat of release before gravity takes it...
    tl.to(heart, {
      scale: 1.07,
      yPercent: -12,
      rotate: -5,
      duration: 0.16,
      ease: 'power2.out',
    })
      // ...then it drops, accelerating, tumbling and drifting aside.
      .to(heart, {
        y: window.innerHeight * 0.8,
        x: gsap.utils.random(26, 54),
        rotate: gsap.utils.random(38, 70),
        scale: 0.86,
        duration: 0.95,
        ease: 'power2.in',
      })
      .to(heart, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, '-=0.35')
  }, [reduced, openDoors])

  // Settle the heart in once the gate appears.
  useEffect(() => {
    const heart = heartRef.current
    if (!heart) return
    gsap.fromTo(
      heart,
      { autoAlpha: 0, scale: 0.86 },
      { autoAlpha: 1, scale: 1, duration: reduced ? 0.3 : 1, ease: 'expo.out', delay: 0.15 },
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
          onClick={releaseHeart}
          disabled={released}
          aria-label="Release the heart to open the invitation"
          // No CSS transition on transform: GSAP drives the lift and the
          // fall, and a transition would smear every frame of it.
          className="pointer-events-auto relative size-28 origin-center disabled:cursor-default"
          style={{ filter: 'drop-shadow(0 6px 13px rgba(0,0,0,0.45))' }}
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
