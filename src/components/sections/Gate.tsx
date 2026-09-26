import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { GateDoorLeaf, DoorDefs } from '../svg/GateDoors'
import { WaxSeal } from '../svg/WaxSeal'
import { EightStar } from '../svg/Ornaments'
import { sparkleBurst } from '../../lib/sparkleBus'
import { wedding } from '../../config/wedding.config'
import { useLang, langAttrs } from '../../hooks/useLang'

type Props = {
  onOpened: () => void
}

/**
 * The opening gate: two carved doors closed over the invitation, sealed
 * with the couple's monogram.
 *
 * Tapping cracks the seal, swings the doors open in 3D, floods the gap
 * with light, then hands scrolling back to the page. Under reduced motion
 * the sequence collapses to a fade — the gate still has to be dismissed
 * deliberately, since that is the interaction, but nothing swings.
 */
export function Gate({ onOpened }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLDivElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // A ref, not state: Enter on the focused button fires keydown *and* click
  // as two separate events, and a state flag would still read false in the
  // second one before React re-renders — running the timeline twice.
  const openedRef = useRef(false)
  const [opening, setOpening] = useState(false)

  const reduced = useReducedMotion()
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  const open = useCallback(() => {
    if (openedRef.current) return
    openedRef.current = true
    setOpening(true)

    const root = rootRef.current
    if (!root) return

    if (reduced) {
      gsap.to(root, { autoAlpha: 0, duration: 0.45, ease: 'none', onComplete: onOpened })
      return
    }

    const seal = sealRef.current
    const halves = seal?.querySelectorAll('[data-seal-half]')
    const crack = seal?.querySelector('[data-seal-crack]') ?? null

    const tl = gsap.timeline({ onComplete: onOpened })

    // 1. the seal gives: a flinch, the fracture shows, then it breaks
    tl.to(seal, { scale: 1.06, duration: 0.18, ease: 'power2.out' })
      .to(crack, { opacity: 1, duration: 0.12 }, '-=0.05')
      .to(seal, { scale: 1, duration: 0.12, ease: 'power2.in' })

    if (halves && halves.length === 2) {
      tl.to(
        halves[0],
        { xPercent: -16, yPercent: 10, rotation: -14, autoAlpha: 0, duration: 0.7, ease: 'power2.in' },
        'break',
      ).to(
        halves[1],
        { xPercent: 16, yPercent: 12, rotation: 16, autoAlpha: 0, duration: 0.7, ease: 'power2.in' },
        'break',
      )
    }

    tl.to(copyRef.current, { autoAlpha: 0, y: -10, duration: 0.4 }, 'break')

    // 2. the doors swing, hinged on their outer edges
    tl.to(leftRef.current, { rotateY: -102, duration: 1.5, ease: 'power3.inOut' }, 'swing')
      .to(rightRef.current, { rotateY: 102, duration: 1.5, ease: 'power3.inOut' }, 'swing')
      // 3. light pours through the widening gap
      .fromTo(
        lightRef.current,
        { autoAlpha: 0, scaleX: 0.1 },
        { autoAlpha: 1, scaleX: 1, duration: 1.1, ease: 'power2.out' },
        'swing+=0.15',
      )
      .to(lightRef.current, { autoAlpha: 0, duration: 0.6 }, 'swing+=1.1')
      .to(root, { autoAlpha: 0, duration: 0.5 }, 'swing+=1.0')

    // gold burst as the seal fractures
    gsap.delayedCall(0.3, () => {
      const r = seal?.getBoundingClientRect()
      if (r) {
        sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, {
          count: 34,
          tone: 'gold',
          power: 220,
        })
      }
    })
  }, [reduced, onOpened])

  // Focus the control so the gate is immediately operable by keyboard.
  useEffect(() => {
    buttonRef.current?.focus()
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] overflow-hidden bg-wine-deep"
      style={{
        perspective: '1400px',
        perspectiveOrigin: '50% 45%',
        // Fixed escapes the phone column, so re-centre it there by hand —
        // otherwise the doors span a whole desktop window.
        maxWidth: 'var(--app-max)',
        marginInline: 'auto',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={wedding.texts.inviteLine}
    >
      <DoorDefs />

      {/* Light behind the doors, revealed as they part. */}
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

      {/* Doors. No backface-visibility:hidden — the leaves pass 90 degrees,
          and hiding the reverse would pop them out of existence mid-swing. */}
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

      {/* Tap anywhere. A div, so it adds no second control for screen
          readers — the real button below is the accessible affordance. */}
      <div
        aria-hidden="true"
        onClick={open}
        className="absolute inset-0 cursor-pointer"
      />

      {/* Seal and invitation. The pad is a percentage, which resolves
          against WIDTH — the same basis as the arch head's height — so the
          seal lands on the springline at any screen size. */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center px-8"
        style={{ paddingTop: 'calc(75% - 3.25rem)' }}
      >
        <div ref={sealRef} className="w-28 drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
          <WaxSeal initials={wedding.monogram} />
        </div>

        <div ref={copyRef} className="mt-7 text-center">
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

          <button
            ref={buttonRef}
            type="button"
            onClick={open}
            disabled={opening}
            className="pointer-events-auto rounded-full border border-gold/50 px-7 text-2xs tracking-[0.3em] text-gold-light uppercase transition-transform duration-300 active:scale-[0.97] disabled:opacity-60"
          >
            {ur ? wedding.urdu.tapToOpen : wedding.texts.tapToOpen}
          </button>
        </div>
      </div>
    </div>
  )
}
