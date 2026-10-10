import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
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

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_IN = 'cubic-bezier(0.55, 0, 1, 0.45)'
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)'

/** A finished `element.animate` keeps its last frame on the element. */
function run(el: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  if (!el) return Promise.resolve()
  const anim = el.animate(keyframes, { fill: 'forwards', ...options })
  return anim.finished.catch(() => {})
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

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
 *
 * Animated with the Web Animations API rather than GSAP, so the first
 * bundle — React and this gate — carries no animation library at all;
 * GSAP arrives with the page behind the doors.
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
      run(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'linear' }).then(onOpened)
      return
    }

    // The leaves cover the whole screen while shut, so the backdrop behind
    // them can go now: the hero shows through the widening gap as they
    // swing, instead of after the whole gate has faded.
    root.style.backgroundColor = 'transparent'

    run(copyRef.current, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-12px)' }], { duration: 300, easing: EASE_OUT })
    run(leftRef.current, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-104deg)' }], { duration: 1200, delay: 50, easing: EASE_IN_OUT })
    run(rightRef.current, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(104deg)' }], { duration: 1200, delay: 50, easing: EASE_IN_OUT })
    run(root, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 750, easing: EASE_IN_OUT }).then(onOpened)
  }, [reduced, onOpening, onOpened])

  const releaseHeart = useCallback(() => {
    if (releasedRef.current) return
    releasedRef.current = true
    setReleased(true)

    const heart = heartRef.current
    if (!heart || reduced) {
      if (heart) heart.style.visibility = 'hidden'
      openDoors()
      return
    }

    const rect = heart.getBoundingClientRect()
    sparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, {
      count: 24,
      tone: 'rose',
      power: 170,
    })

    // A beat of release before gravity takes it, then it drops,
    // accelerating, tumbling and drifting aside. The fall and the fade run
    // as one keyframe track so neither can fight the other.
    const fall = window.innerHeight * 0.8
    const dx = rnd(26, 54)
    const spin = rnd(38, 70)
    heart.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1, offset: 0 },
        { transform: 'translate(0, -12%) rotate(-5deg) scale(1.07)', opacity: 1, offset: 0.13, easing: EASE_IN },
        { transform: `translate(${dx * 0.6}px, ${fall * 0.62}px) rotate(${spin * 0.62}deg) scale(0.92)`, opacity: 1, offset: 0.72 },
        { transform: `translate(${dx}px, ${fall}px) rotate(${spin}deg) scale(0.86)`, opacity: 0, offset: 1 },
      ],
      { duration: 1100, fill: 'forwards' },
    )
    // The doors do not wait for it to land.
    window.setTimeout(openDoors, 400)
  }, [reduced, openDoors])

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    releaseHeart()
  }

  // Settle the heart in once the gate appears. Opacity only — never
  // `visibility: hidden`, which cannot be tapped, so a quick first tap
  // would have gone straight through to the door.
  useEffect(() => {
    const heart = heartRef.current
    if (!heart) return
    const anim = heart.animate(
      [{ opacity: 0, transform: 'scale(0.86)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: reduced ? 300 : 900, easing: EASE_OUT, fill: 'both' },
    )
    // Let go of the element once it has landed, so the release can take it.
    anim.finished.then(() => anim.commitStyles?.(), () => {}).finally(() => anim.cancel())
    return () => anim.cancel()
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
          className="pointer-events-auto relative size-28 origin-center disabled:cursor-default"
          // No double-tap-to-zoom delay on the one control that matters.
          style={{ touchAction: 'manipulation' }}
        >
          <HeartSeal initials={wedding.monogram} className="size-full" shadow />
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
