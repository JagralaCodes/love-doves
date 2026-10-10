import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { motion, useAnimate, useMotionValue, useTransform } from 'motion/react'
import type { PanInfo } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HeartSeal } from '../svg/HeartSeal'
import { sparkleBurstFrom } from '../../lib/sparkleBus'
import { jumpBy } from '../../lib/scroll'

type Props = {
  /** The letter — revealed once the envelope is opened. */
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
/** Envelope height as a share of its width. */
const ENV_RATIO = 0.7
/** How much of the pocket stays showing under the opened letter, px. */
const PEEK = 40
/** The sealed letter sits this far inside the envelope's edges, px. */
const TUCK = 12
/** Hearts that fall out as the letter rises. */
const SPRINKLE = 10
const SPRINKLE_TONES = ['var(--color-rose-pink)', 'var(--color-gold)', 'var(--color-blush-deep)', 'var(--color-gold-light)']

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * A sealed envelope, held shut by a heart sticker in its centre, with the
 * letter folded small inside it.
 *
 * The heart is a sticker, not a button: slide or flick it away and it
 * peels off, tilting with the drag and flying off along the swipe. A tap
 * only makes it wiggle. Keyboard users press Enter or Space.
 *
 * Then, in about 1.4 seconds:
 *   1. the flap swings up and back in 3D;
 *   2. the letter slides up out of the envelope — behind the pocket's
 *      front at first, so it really comes out of it — while a sprinkle of
 *      small hearts falls from the mouth;
 *   3. clear of the pocket, it grows to full width and settles, and the
 *      envelope drops a little and stays behind it, its bottom showing.
 *
 * The letter is far taller than the envelope, so the box has to grow when
 * it opens. That is one layout change, not an animation: the box takes
 * its final height and the page is jumped by the same amount in the same
 * frame, so the envelope the viewer is looking at does not move — the
 * room for the letter is made above it. Everything after is transform
 * and opacity. Under reduced motion the letter is simply shown open.
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
  const reduced = useReducedMotion()
  const [stage, setStage] = useState<Stage>(() => (reduced ? 'open' : 'sealed'))
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const stageRef = useRef<HTMLDivElement>(null)
  const envRef = useRef<HTMLDivElement>(null)
  const letterRef = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const onOpenedRef = useRef(onOpened)
  useEffect(() => {
    onOpenedRef.current = onOpened
  }, [onOpened])

  // The sticker's own position, so the peel can continue from wherever the
  // finger let go. It tilts as it is dragged, like a sticker lifting.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-160, 0, 160], [-28, 0, 28])

  // The letter's natural height and the envelope's, kept current.
  const [dims, setDims] = useState({ letter: 0, env: 0 })
  useLayoutEffect(() => {
    const letter = letterRef.current
    const box = stageRef.current
    if (!letter || !box) return
    const read = () => {
      const env = Math.round(box.clientWidth * ENV_RATIO)
      const h = letter.offsetHeight
      setDims((d) => (d.letter === h && d.env === env ? d : { letter: h, env }))
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(letter)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  const sealedScale = dims.letter ? Math.min(1, (dims.env - 2 * TUCK) / dims.letter) : 1

  // Rest states, written directly: while sealed the letter is folded small
  // inside the envelope; once open the box is the letter's height plus the
  // pocket's peek, and the envelope sits at its bottom. Nothing is written
  // mid-animation, so an in-flight transform is never overwritten.
  useLayoutEffect(() => {
    const box = stageRef.current
    const env = envRef.current
    const letter = letterRef.current
    if (!box || !env || !letter || !dims.letter) return
    if (stage === 'sealed') {
      box.style.height = ''
      // Written, not cleared: React set this same inline property, and
      // clearing it would leave the box with no height at all.
      box.style.aspectRatio = `1 / ${ENV_RATIO}`
      env.style.transform = ''
      letter.style.transform = `translateY(${TUCK}px) scale(${sealedScale})`
    } else if (stage === 'open') {
      const H = dims.letter + PEEK
      // The ratio must go with the height, or CSS derives the WIDTH from it.
      box.style.aspectRatio = 'auto'
      box.style.height = `${H}px`
      env.style.transform = `translateY(${H - dims.env}px)`
      letter.style.transform = ''
    }
  }, [stage, dims, sealedScale])

  useEffect(() => {
    if (reduced) onOpenedRef.current?.()
  }, [reduced])

  const open = useCallback(
    async (fling: { x: number; y: number }, viaKeyboard = false) => {
      if (busy.current) return
      busy.current = true
      setStage('opening')
      onOpenedRef.current?.()

      const root = scope.current
      const box = stageRef.current
      const env = envRef.current
      const letter = letterRef.current
      const seal = root.querySelector<HTMLElement>('[data-seal]')
      const flap = root.querySelector<HTMLElement>('[data-flap]')
      if (!box || !env || !letter || !seal || !flap) return
      sparkleBurstFrom(seal, { count: 30, tone: 'rose', power: 220 })

      // 1. The sticker comes away along the swipe and drifts off.
      const len = Math.hypot(fling.x, fling.y) || 1
      const ease = [0.25, 0.8, 0.4, 1] as const
      animate(x, x.get() + (fling.x / len) * 240, { duration: 0.5, ease })
      animate(y, y.get() + (fling.y / len) * 240 - 30, { duration: 0.5, ease })
      animate(seal, { opacity: 0, scale: 0.75 }, { duration: 0.45, ease: 'easeIn' })
      await sleep(220)

      // 2. The flap swings open; past the vertical it is behind the letter.
      animate(flap, { rotateX: -176 }, { duration: 0.5, ease: [0.4, 0, 0.2, 1] })
      sleep(250).then(() => {
        flap.style.zIndex = '1'
      })
      await sleep(260)

      // 3. Make room. One layout change and a matching scroll jump in the
      //    same frame: the envelope does not move on screen.
      const letterH = letter.offsetHeight
      const envH = Math.round(box.clientWidth * ENV_RATIO)
      const scale = Math.min(1, (envH - 2 * TUCK) / letterH)
      const H = letterH + PEEK
      const lift = H - envH - PEEK
      box.style.aspectRatio = 'auto'
      box.style.height = `${H}px`
      env.style.transform = `translateY(${lift}px)`
      letter.style.transform = `translateY(${lift + TUCK}px) scale(${scale})`
      jumpBy(lift)

      // 4. The letter slides up out of the pocket; hearts fall from the
      //    mouth; the envelope drops its forty pixels and stays.
      const rise = animate(
        letter,
        { y: [lift + TUCK, 0] },
        { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      )
      const sprinkle = root.querySelectorAll<HTMLElement>('[data-sprinkle]')
      sprinkle.forEach((h, i) => {
        const dx = ((i % 2 ? 1 : -1) * (18 + ((i * 37) % 60))) | 0
        animate(
          h,
          {
            x: [0, dx],
            y: [0, 70 + ((i * 53) % 70)],
            rotate: [0, (i % 2 ? -1 : 1) * (40 + ((i * 29) % 80))],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.7],
          },
          { duration: 0.9 + (i % 4) * 0.12, delay: 0.05 + i * 0.045, ease: 'easeOut' },
        )
      })
      animate(env, { y: [lift, lift + PEEK] }, { duration: 0.5, delay: 0.4, ease: 'easeInOut' })
      await sleep(380)
      // Clear of the pocket: in front from here, and up to full width.
      letter.style.zIndex = '10'
      await rise
      await animate(letter, { scale: [scale, 1] }, { duration: 0.45, ease: [0.22, 1, 0.36, 1] })

      setStage('open')
      // A keyboard user's focus was on the seal, which is now gone; hand it
      // to the first thing on the letter rather than dropping it on <body>.
      if (viaKeyboard) {
        requestAnimationFrame(() => letter.querySelector<HTMLElement>('a, button')?.focus())
      }
    },
    [animate, scope, x, y],
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
    if (busy.current) return
    animate('[data-seal-art]', { rotate: [0, -14, 11, -7, 4, 0] }, { duration: 0.55, ease: 'easeOut' })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open({ x: 0.4, y: -1 }, true)
    }
  }

  const sealed = stage === 'sealed'

  return (
    <div ref={scope} className={`relative mx-auto w-full max-w-[20rem] ${className}`}>
      {/* Envelope-shaped while sealed; the letter's height once open. */}
      <div
        ref={stageRef}
        className="relative"
        style={{ aspectRatio: `1 / ${ENV_RATIO}`, perspective: '1200px' }}
      >
        <div
          ref={envRef}
          data-env
          className="absolute inset-x-0 top-0"
          style={{ aspectRatio: `1 / ${ENV_RATIO}` }}
          aria-hidden="true"
        >
          {/* Back panel — the inside of the envelope. */}
          <div
            className="absolute inset-0 rounded-[0.9rem]"
            style={{
              background: 'linear-gradient(180deg, var(--color-rose-pink) 0%, var(--color-blush-deep) 100%)',
              boxShadow: '0 22px 48px -26px rgba(94,18,39,0.5), inset 0 0 0 1px rgba(212,175,55,0.35)',
            }}
          />

          {/* Flap. Pivots on its top edge, in its own perspective: the
              box's only reaches direct children. Reaches past the pocket's
              V so the two overlap and nothing of the letter shows. */}
          {!reduced && (
            <motion.div
              data-flap
              className="absolute inset-x-0 top-0"
              style={{
                height: '61%',
                zIndex: 4,
                transformOrigin: 'top center',
                transformPerspective: 1200,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background: 'linear-gradient(180deg, var(--color-blush-deep) 0%, var(--color-rose-pink) 100%)',
              }}
            />
          )}

          {/* Front pocket: two wings meeting in a V. The letter is behind it. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-b-[0.9rem]"
            style={{
              zIndex: 3,
              clipPath: 'polygon(0 0, 50% 60%, 100% 0, 100% 100%, 0 100%)',
              background: 'linear-gradient(180deg, var(--color-blush) 0%, var(--color-blush-deep) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
            }}
          />

          {/* The hearts that spill out. Start invisible at the mouth. */}
          {!reduced && (
            <div className="pointer-events-none absolute inset-x-0 top-[12%] flex justify-center" style={{ zIndex: 6 }}>
              {Array.from({ length: SPRINKLE }, (_, i) => (
                <svg
                  key={i}
                  data-sprinkle
                  viewBox="0 0 100 100"
                  className="absolute"
                  style={{
                    width: 9 + (i % 3) * 3,
                    left: `${44 + ((i * 17) % 14)}%`,
                    opacity: 0,
                    fill: SPRINKLE_TONES[i % SPRINKLE_TONES.length],
                  }}
                >
                  <path d="M50 88 C18 64, 6 44, 6 30 C6 15, 18 6, 30 6 C39 6, 46 11, 50 19 C54 11, 61 6, 70 6 C82 6, 94 15, 94 30 C94 44, 82 64, 50 88 Z" />
                </svg>
              ))}
            </div>
          )}
        </div>

        {/* The heart sticker, in the centre. Drag it off. */}
        {stage !== 'open' && !reduced && (
          <motion.button
            data-seal
            type="button"
            aria-label={openLabel}
            className="absolute left-1/2 z-[5] size-[4.5rem] -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{ top: `${(ENV_RATIO * 100) / 2}%`, x, y, rotate, touchAction: 'none' }}
            drag={sealed}
            dragMomentum={false}
            onDragEnd={onDragEnd}
            onTap={hint}
            onKeyDown={onKeyDown}
            whileDrag={{ scale: 1.12 }}
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

        {/* The letter. Absolute, so the box can be envelope-sized while it
            is folded away; scaled from its top edge so it rises as it grows. */}
        <motion.div
          ref={letterRef}
          data-card
          className="absolute inset-x-0 top-0"
          style={{ zIndex: stage === 'open' ? 10 : 2, transformOrigin: 'top center' }}
          inert={stage !== 'open'}
        >
          {children}
        </motion.div>
      </div>

      {/* Faded rather than removed once opened: removing it would pull the
          page below up by its height. */}
      {!reduced && (
        <motion.p
          className={`text-2xs mt-4 text-center tracking-[0.3em] text-wine-soft ${
            lang === 'ur' ? 'font-urdu' : 'uppercase'
          }`}
          lang={lang}
          dir={dir}
          initial={false}
          animate={{ opacity: sealed ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden={!sealed || undefined}
          style={sealed ? { animation: 'float-soft 2.8s ease-in-out infinite' } : undefined}
        >
          {prompt}
        </motion.p>
      )}
    </div>
  )
}
