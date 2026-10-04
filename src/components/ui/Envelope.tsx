import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HeartSeal } from '../svg/HeartSeal'
import { sparkleBurstFrom } from '../../lib/sparkleBus'

type Props = {
  /** What is inside — revealed once the envelope is opened. */
  children: ReactNode
  /** The monogram pressed into the wax. */
  initials: string
  /** Hint under the envelope, e.g. "Tap or swipe up to open". */
  prompt: string
  /** Accessible name of the open control. */
  openLabel: string
  onOpened?: () => void
  className?: string
}

/** Pulling the card this far up (px) opens it; shorter pulls spring back. */
const PULL_TO_OPEN = -56

/**
 * A sealed envelope the viewer opens by tapping the wax heart or pulling
 * the card up out of it.
 *
 * Sequence on open: the seal breaks with a burst, the flap swings back in
 * 3D, the card rises out, then the envelope itself fades away and leaves
 * the card as the content. The whole thing is one direction — nothing ever
 * closes — so it needs no exit choreography beyond a fade.
 *
 * The card inside is the SAME element before and after: it is not swapped
 * for a "full" version. That keeps the rise continuous and avoids a layout
 * jump at the moment the envelope goes.
 */
export function Envelope({
  children,
  initials,
  prompt,
  openLabel,
  onOpened,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const [gone, setGone] = useState(false)
  const sealRef = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()

  const openIt = useCallback(() => {
    if (open) return
    setOpen(true)
    sparkleBurstFrom(sealRef.current, { count: 30, tone: 'rose', power: 220 })
    onOpened?.()
  }, [open, onOpened])

  const T = reduced ? { duration: 0.2 } : undefined

  return (
    <div className={`relative mx-auto w-full max-w-[20rem] ${className}`}>
      {/* Reserve the envelope's height so the page does not jump when it goes. */}
      <div className="relative" style={{ aspectRatio: '20 / 14', perspective: '1200px' }}>
        <AnimatePresence>
          {!gone && (
            <motion.div
              key="body"
              className="absolute inset-0"
              initial={false}
              animate={open ? { opacity: 0, scale: 0.96, y: 10 } : { opacity: 1, scale: 1, y: 0 }}
              transition={reduced ? { duration: 0.2 } : { delay: open ? 1.05 : 0, duration: 0.6, ease: 'easeInOut' }}
              onAnimationComplete={() => {
                if (open) setGone(true)
              }}
              aria-hidden={open || undefined}
            >
              {/* Back panel */}
              <div
                className="absolute inset-0 rounded-[0.9rem]"
                style={{
                  background: 'linear-gradient(180deg, #fdf1f4 0%, #fce4ea 100%)',
                  boxShadow: '0 22px 48px -26px rgba(94,18,39,0.5), inset 0 0 0 1px rgba(212,175,55,0.35)',
                }}
              />

              {/* Flap. Pivots from its top edge; z-order flips as it passes
                  vertical so it reads as going BEHIND the card. */}
              <motion.div
                className="absolute inset-x-0 top-0"
                style={{
                  height: '58%',
                  transformOrigin: 'top center',
                  transformStyle: 'preserve-3d',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: 'linear-gradient(180deg, #f8d2dc 0%, #f4b8c6 100%)',
                  zIndex: open ? 1 : 4,
                  boxShadow: 'inset 0 -1px 0 rgba(212,175,55,0.45)',
                }}
                initial={false}
                animate={{ rotateX: open ? -176 : 0 }}
                transition={T ?? { duration: 0.75, ease: [0.4, 0, 0.2, 1], delay: 0.12 }}
              />

              {/* Front pocket: left and right wings meeting at the bottom point. */}
              <div
                className="pointer-events-none absolute inset-0 rounded-b-[0.9rem]"
                style={{
                  zIndex: 3,
                  clipPath: 'polygon(0 0, 50% 60%, 100% 0, 100% 100%, 0 100%)',
                  background: 'linear-gradient(180deg, #fce4ea 0%, #f8d2dc 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                }}
              />

              {/* The wax seal. Tapping it opens the envelope. */}
              <motion.button
                ref={sealRef}
                type="button"
                onClick={openIt}
                aria-label={openLabel}
                className="absolute left-1/2 z-[5] size-16 -translate-x-1/2 cursor-pointer"
                style={{ top: '42%', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))' }}
                initial={false}
                animate={open ? { scale: 0, rotate: -20, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
                whileTap={reduced || open ? undefined : { scale: 0.92 }}
                transition={T ?? { duration: 0.32, ease: 'backIn' }}
              >
                <HeartSeal initials={initials} className="size-full" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The card. Draggable upward while sealed; rises out when opened;
            then settles as the content. */}
        <motion.div
          className="absolute inset-x-[7%] bottom-[8%]"
          style={{ zIndex: gone ? 10 : 2, touchAction: 'pan-y' }}
          drag={open || reduced ? false : 'y'}
          dragConstraints={{ top: -70, bottom: 0 }}
          dragElastic={0.18}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y < PULL_TO_OPEN) openIt()
          }}
          initial={false}
          animate={gone ? { y: 0, scale: 1 } : open ? { y: '-46%', scale: 1.02 } : { y: 0, scale: 1 }}
          transition={T ?? { type: 'spring', stiffness: 160, damping: 22, delay: open && !gone ? 0.5 : 0 }}
        >
          <div
            className="rounded-[0.8rem] bg-pearl-white"
            style={{ boxShadow: '0 14px 30px -20px rgba(94,18,39,0.45), inset 0 0 0 1px rgba(212,175,55,0.3)' }}
          >
            {children}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {!open && (
          <motion.p
            key="prompt"
            className="text-2xs mt-4 text-center tracking-[0.3em] text-wine-soft/80 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={reduced ? undefined : { animation: 'float-soft 2.8s ease-in-out infinite' }}
          >
            {prompt}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
