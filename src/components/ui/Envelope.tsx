import { useCallback, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { motion, useAnimate, useMotionValue, useTransform } from 'motion/react'
import type { PanInfo } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HeartSeal } from '../svg/HeartSeal'
import { sparkleBurstFrom } from '../../lib/sparkleBus'

type Props = {
  /** What is inside — revealed once the envelope is opened. */
  children: ReactNode
  /** The monogram pressed into the heart seal. */
  initials: string
  /** Hint under the envelope, e.g. "Slide the heart away to open". */
  prompt: string
  /** Accessible name of the seal. */
  openLabel: string
  onOpened?: () => void
  /** Language of the prompt, so Urdu gets its own face and direction. */
  lang?: string
  dir?: 'rtl' | 'ltr'
  className?: string
}

type Stage = 'sealed' | 'opening' | 'open'

/** Drag the sticker this far (px), or flick it this fast (px/s), to peel it. */
const PEEL_DISTANCE = 64
const PEEL_VELOCITY = 600
/** How far the card climbs out of the pocket, as a share of its height. */
const RISE = '-72%'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * A sealed envelope, held shut by a heart sticker in its centre.
 *
 * The heart is a sticker, not a button: slide or flick it away and it
 * peels off, tilting with the drag and flying off along the swipe. A tap
 * only makes it wiggle, as a hint. Keyboard users press Enter or Space.
 *
 * Then, in order:
 *   1. the flap swings up and back, passing behind the card halfway over;
 *   2. the card climbs out of the envelope — BEHIND the front pocket, so
 *      its lower half stays hidden inside, the way a letter really comes
 *      out of an envelope;
 *   3. once it is clear, the card comes to the front and settles into
 *      place while the envelope falls away.
 *
 * Paint order inside the box (one stacking context, set by `perspective`):
 *   back panel (auto) < flap when open (1) < card (2) < pocket (3)
 *   < flap when closed (4) < seal (5); the card jumps to 10 for step 3.
 *
 * The card is the only in-flow child: an aspect-ratio box grows to fit
 * in-flow content, so the envelope always encloses the card whatever its
 * length, and opening moves things with transforms only — the page below
 * never shifts. While sealed the card is fully covered (the flap and the
 * pocket overlap), and `inert`, so keyboard focus cannot land on links
 * nobody can see.
 */
export function Envelope({
  children,
  initials,
  prompt,
  openLabel,
  onOpened,
  lang,
  dir,
  className = '',
}: Props) {
  const [stage, setStage] = useState<Stage>('sealed')
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const reduced = useReducedMotion()
  const busy = useRef(false)

  // The sticker's own position, so the peel can continue from wherever the
  // finger let go. It tilts as it is dragged, like a sticker lifting.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-160, 0, 160], [-28, 0, 28])

  const open = useCallback(
    async (fling: { x: number; y: number }, viaKeyboard = false) => {
      if (busy.current) return
      busy.current = true
      setStage('opening')
      onOpened?.()

      const root = scope.current
      const seal = root.querySelector<HTMLElement>('[data-seal]')
      const flap = root.querySelector<HTMLElement>('[data-flap]')
      const card = root.querySelector<HTMLElement>('[data-card]')
      if (!seal || !flap || !card) return
      sparkleBurstFrom(seal, { count: 30, tone: 'rose', power: 220 })

      if (reduced) {
        await animate(seal, { opacity: 0 }, { duration: 0.2 })
        await animate('[data-env]', { opacity: 0 }, { duration: 0.3 })
      } else {
        // 1. The sticker comes away along the swipe and drifts off.
        const len = Math.hypot(fling.x, fling.y) || 1
        const dx = (fling.x / len) * 240
        const dy = (fling.y / len) * 240 - 30
        const ease = [0.25, 0.8, 0.4, 1] as const
        animate(x, x.get() + dx, { duration: 0.55, ease })
        animate(y, y.get() + dy, { duration: 0.55, ease })
        await animate(seal, { opacity: 0, scale: 0.75 }, { duration: 0.5, ease: 'easeIn' })

        // 2. The flap swings open. Halfway over it passes the vertical and
        //    from then on it is behind the card, not over it.
        const swing = animate(flap, { rotateX: -176 }, { duration: 0.75, ease: [0.4, 0, 0.2, 1] })
        await sleep(380)
        flap.style.zIndex = '1'
        await swing

        // 3. The card climbs out, still behind the pocket's front.
        await animate(card, { y: RISE }, { type: 'spring', stiffness: 110, damping: 19, mass: 1 })
        await sleep(120)

        // 4. Clear of the envelope: it comes forward and settles, and the
        //    envelope falls away beneath it.
        card.style.zIndex = '10'
        animate('[data-env]', { opacity: 0, y: 26 }, { duration: 0.6, ease: 'easeIn' })
        await animate(card, { y: 0 }, { type: 'spring', stiffness: 150, damping: 21 })
      }

      setStage('open')
      // A keyboard user's focus was on the seal, which is now gone; hand it
      // to the first thing on the card rather than dropping it on <body>.
      if (viaKeyboard) {
        requestAnimationFrame(() => card.querySelector<HTMLElement>('a, button')?.focus())
      }
    },
    [animate, onOpened, reduced, scope, x, y],
  )

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const far = Math.hypot(info.offset.x, info.offset.y) > PEEL_DISTANCE
    const fast = Math.hypot(info.velocity.x, info.velocity.y) > PEEL_VELOCITY
    if (far || fast) {
      open(far ? info.offset : info.velocity)
      return
    }
    // Not far enough: it presses back down.
    animate(x, 0, { type: 'spring', stiffness: 520, damping: 26 })
    animate(y, 0, { type: 'spring', stiffness: 520, damping: 26 })
  }

  // A tap is not a peel. It wiggles, to say "slide me".
  const hint = () => {
    if (busy.current || reduced) return
    animate('[data-seal-art]', { rotate: [0, -14, 11, -7, 4, 0] }, { duration: 0.55, ease: 'easeOut' })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open({ x: 0.4, y: -1 }, true)
    }
  }

  const sealed = stage !== 'open'

  return (
    <div ref={scope} className={`relative mx-auto w-full max-w-[20rem] ${className}`}>
      {/* At least envelope-shaped, and taller if the card needs it. */}
      <div
        className="relative flex flex-col px-[7%] py-[8%]"
        style={{ aspectRatio: '20 / 14', perspective: '1200px' }}
      >
        {sealed && (
          <div data-env className="absolute inset-0" aria-hidden="true">
            {/* Back panel — the inside of the envelope. */}
            <div
              className="absolute inset-0 rounded-[0.9rem]"
              style={{
                background: 'linear-gradient(180deg, #f6c9d4 0%, #f2bccb 100%)',
                boxShadow: '0 22px 48px -26px rgba(94,18,39,0.5), inset 0 0 0 1px rgba(212,175,55,0.35)',
              }}
            />

            {/* Flap. Pivots on its top edge. Reaches past the pocket's V
                (60%) so the two overlap and no sliver of card shows. */}
            {/* Carries its own perspective: the box's `perspective` only
                reaches direct children, and preserve-3d on the wrapper would
                make a stacking context and break the card/pocket layering. */}
            <motion.div
              data-flap
              className="absolute inset-x-0 top-0"
              style={{
                height: '61%',
                zIndex: 4,
                transformOrigin: 'top center',
                transformPerspective: 1200,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background: 'linear-gradient(180deg, #f8d2dc 0%, #f4b8c6 100%)',
              }}
            />

            {/* Front pocket: two wings meeting in a V. The card is behind it. */}
            <div
              className="pointer-events-none absolute inset-0 rounded-b-[0.9rem]"
              style={{
                zIndex: 3,
                clipPath: 'polygon(0 0, 50% 60%, 100% 0, 100% 100%, 0 100%)',
                background: 'linear-gradient(180deg, #fce4ea 0%, #f8d2dc 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
            />
          </div>
        )}

        {/* The heart sticker, in the centre. Drag it off. */}
        {sealed && (
          <motion.button
            data-seal
            type="button"
            aria-label={openLabel}
            className="absolute top-1/2 left-1/2 z-[5] size-[4.5rem] -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{ x, y, rotate, touchAction: 'none' }}
            drag={stage === 'sealed'}
            dragMomentum={false}
            onDragEnd={onDragEnd}
            onTap={hint}
            onKeyDown={onKeyDown}
            whileDrag={reduced ? undefined : { scale: 1.12 }}
          >
            <span
              data-seal-art
              className="block size-full"
              style={{ filter: 'drop-shadow(0 6px 10px rgba(94,18,39,0.35))' }}
            >
              <HeartSeal initials={initials} className="size-full" />
            </span>
          </motion.button>
        )}

        {/* The card. In flow — it decides the envelope's height. */}
        <motion.div
          data-card
          className="relative"
          style={{ zIndex: sealed ? 2 : 10 }}
          inert={sealed}
        >
          <div
            className="rounded-[0.8rem] bg-pearl-white"
            style={{ boxShadow: '0 14px 30px -20px rgba(94,18,39,0.45), inset 0 0 0 1px rgba(212,175,55,0.3)' }}
          >
            {children}
          </div>
        </motion.div>
      </div>

      {/* Faded rather than removed once opened: removing it would pull the
          page below up by its height. */}
      <motion.p
        className={`text-2xs mt-4 text-center tracking-[0.3em] text-wine-soft ${
          lang === 'ur' ? 'font-urdu' : 'uppercase'
        }`}
        lang={lang}
        dir={dir}
        initial={false}
        animate={{ opacity: stage === 'sealed' ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        aria-hidden={stage !== 'sealed' || undefined}
        style={reduced || stage !== 'sealed' ? undefined : { animation: 'float-soft 2.8s ease-in-out infinite' }}
      >
        {prompt}
      </motion.p>
    </div>
  )
}
