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

const HEART_COUNT = 4

/**
 * The opening gate: carved doors closed over the invitation, held by a
 * stack of four wax hearts.
 *
 * Each tap releases the front heart, which falls away under gravity with a
 * little spin and a sideways kick. When the last one goes, the doors swing
 * open in 3D and light floods through.
 *
 * There is no separate button — the hearts are the control. They are real
 * <button>s, so the whole sequence works from the keyboard too.
 */
export function Gate({ onOpened }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  /** Refs, not state: taps can land faster than React re-renders. */
  const droppedRef = useRef(0)
  const openingRef = useRef(false)
  const [dropped, setDropped] = useState(0)

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

    tl.to(copyRef.current, { autoAlpha: 0, y: -12, duration: 0.4 })
      .to(leftRef.current, { rotateY: -102, duration: 1.5, ease: 'power3.inOut' }, 'swing')
      .to(rightRef.current, { rotateY: 102, duration: 1.5, ease: 'power3.inOut' }, 'swing')
      .fromTo(
        lightRef.current,
        { autoAlpha: 0, scaleX: 0.1 },
        { autoAlpha: 1, scaleX: 1, duration: 1.1, ease: 'power2.out' },
        'swing+=0.15',
      )
      .to(lightRef.current, { autoAlpha: 0, duration: 0.6 }, 'swing+=1.15')
      .to(root, { autoAlpha: 0, duration: 0.5 }, 'swing+=1.05')
  }, [reduced, onOpened])

  const dropHeart = useCallback(() => {
    const index = droppedRef.current
    if (index >= HEART_COUNT || openingRef.current) return
    droppedRef.current = index + 1
    setDropped(index + 1)

    const stack = stackRef.current
    const heart = stack?.querySelector<HTMLElement>(`[data-heart="${index}"]`)
    const last = index + 1 >= HEART_COUNT

    if (!heart || reduced) {
      if (heart) gsap.set(heart, { autoAlpha: 0 })
      if (last) openDoors()
      return
    }

    const rect = heart.getBoundingClientRect()
    sparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, {
      count: 18,
      tone: 'rose',
      power: 150,
    })

    // Alternate which way each heart tips, so the pile does not fall as one.
    const dir = index % 2 === 0 ? 1 : -1
    const fallDistance = window.innerHeight * 0.8

    const tl = gsap.timeline({
      onComplete: () => {
        if (last) openDoors()
      },
    })

    // A beat of release before gravity takes it...
    tl.to(heart, {
      scale: 1.07,
      yPercent: -12,
      rotate: dir * -5,
      duration: 0.16,
      ease: 'power2.out',
    })
      // ...then it drops, accelerating, tumbling and drifting aside.
      .to(heart, {
        y: fallDistance,
        x: dir * gsap.utils.random(26, 54),
        rotate: dir * gsap.utils.random(38, 70),
        scale: 0.86,
        duration: 0.95,
        ease: 'power2.in',
      })
      .to(heart, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, '-=0.35')

    // The heart now in front lifts as the weight comes off it.
    const next = stack?.querySelector<HTMLElement>(`[data-heart="${index + 1}"]`)
    if (next) {
      gsap.to(next, {
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        duration: 0.7,
        ease: 'expo.out',
        delay: 0.1,
      })
    }
  }, [reduced, openDoors])

  // Settle the stack in once the gate appears.
  useEffect(() => {
    const stack = stackRef.current
    if (!stack) return
    gsap.fromTo(
      stack,
      { autoAlpha: 0, scale: 0.86 },
      { autoAlpha: 1, scale: 1, duration: reduced ? 0.3 : 1, ease: 'expo.out', delay: 0.15 },
    )
  }, [reduced])

  const remaining = HEART_COUNT - dropped

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

      <div
        ref={lightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 45% 70% at 50% 45%, #fff8e0 0%, rgba(245,225,164,0.75) 28%, rgba(212,175,55,0.25) 55%, transparent 78%)',
          transformOrigin: '50% 50%',
        }}
      />

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

      {/* Hearts and invitation, sitting on the springline. */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center px-8"
        style={{ paddingTop: 'calc(75% - 3.5rem)' }}
      >
        <div ref={stackRef} className="relative size-28">
          {Array.from({ length: HEART_COUNT }, (_, i) => {
            // depth 0 is the front heart and the next one to be released.
            const depth = HEART_COUNT - 1 - i
            const isTop = depth === dropped
            return (
              <button
                key={depth}
                data-heart={depth}
                type="button"
                onClick={dropHeart}
                disabled={!isTop}
                aria-label={
                  isTop
                    ? `Release heart ${depth + 1} of ${HEART_COUNT} to open the invitation`
                    : undefined
                }
                aria-hidden={isTop ? undefined : true}
                tabIndex={isTop ? 0 : -1}
                className="absolute inset-0 origin-center transition-transform duration-300 disabled:cursor-default"
                style={{
                  // Each heart behind the front one sits back and a little lower.
                  transform: `translate(${depth * -5}px, ${depth * 7}px) scale(${1 - depth * 0.06})`,
                  zIndex: HEART_COUNT - depth,
                  pointerEvents: isTop ? 'auto' : 'none',
                  filter: `drop-shadow(0 ${6 + depth * 2}px ${10 + depth * 4}px rgba(0,0,0,0.42))`,
                }}
              >
                <HeartSeal
                  depth={depth - dropped}
                  // The monogram rides whichever heart is currently in
                  // front, so it never disappears with the first drop.
                  initials={isTop ? wedding.monogram : undefined}
                  className="size-full"
                />
              </button>
            )
          })}
        </div>

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

          {/* Hearts remaining, as dots rather than an instruction. */}
          <div className="flex items-center justify-center gap-2" aria-hidden="true">
            {Array.from({ length: HEART_COUNT }, (_, i) => (
              <span
                key={i}
                className="size-1.5 rounded-full transition-all duration-500"
                style={{
                  background: i < remaining ? 'var(--color-gold)' : 'transparent',
                  border: i < remaining ? 'none' : '1px solid rgba(212,175,55,0.35)',
                }}
              />
            ))}
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {remaining > 0
              ? `${remaining} of ${HEART_COUNT} hearts remaining`
              : 'Opening the invitation'}
          </p>
        </div>
      </div>
    </div>
  )
}
