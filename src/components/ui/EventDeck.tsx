import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { sparkleBurst } from '../../lib/sparkleBus'
import { resolveThrow } from '../../lib/deckThrow'

type Props<T> = {
  items: readonly T[]
  /** Renders one card's contents. */
  children: (item: T, index: number) => ReactNode
  /** Announced when the top card changes, e.g. "Walima, card 2 of 2". */
  label: (item: T, index: number, total: number) => string
  /** Accessible names for the two arrow controls. */
  prevLabel: string
  nextLabel: string
  className?: string
  /** Fired the first time the viewer drags, to retire the swipe hint. */
  onFirstDrag?: () => void
}

/** Cards drawn behind the top one. More than two is never visible. */
const PEEK = 2

const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 } as const

/**
 * A deck of cards the viewer throws aside, one per event.
 *
 * Only the top card is draggable and only it carries content — the cards
 * behind are bare frames, so nothing is announced twice and the stack has
 * no hidden tab stops. Arrows and dots do the same job for anyone who is
 * not swiping, and the deck wraps, so it never dead-ends on the last card.
 *
 * Throwing left moves forward; throwing right brings the previous card
 * back in from the edge, which is the same gesture reversed rather than a
 * second, unrelated transition.
 */
export function EventDeck<T>({
  items,
  children,
  label,
  prevLabel,
  nextLabel,
  className = '',
  onFirstDrag,
}: Props<T>) {
  const total = items.length
  const [index, setIndex] = useState(0)
  const busyRef = useRef(false)
  const draggedRef = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  /** The card's own width, which the throw distance and threshold key off. */
  const cardWidth = useCallback(() => cardRef.current?.offsetWidth || 320, [])

  const x = useMotionValue(0)
  // The card tips as it is pulled, the way a held card would.
  const rotate = useTransform(x, [-260, 0, 260], reduced ? [0, 0, 0] : [-12, 0, 12])
  const opacity = useTransform(x, [-320, -140, 0, 140, 320], [0.15, 1, 1, 1, 0.15])
  // The card behind rises to meet the gap as the top one is pulled away.
  const peekScale = useTransform(x, [-240, 0, 240], [1, 0.945, 1])
  const peekLift = useTransform(x, [-240, 0, 240], [0, 14, 0])

  const flyDuration = reduced ? 0.18 : 0.4

  /** Throws the top card out to `dir`, then brings `target` in from the other side. */
  const go = useCallback(
    (target: number, dir: -1 | 1) => {
      if (busyRef.current || total < 2) return
      busyRef.current = true

      // Far enough to clear the column, which clips its own overflow.
      const width = cardWidth() * 1.4
      animate(x, dir * width, {
        duration: flyDuration,
        ease: [0.32, 0, 0.67, 0],
      }).then(() => {
        // Park the incoming card off the opposite edge before it is filled
        // with new content, so it is never seen in the wrong place.
        x.jump(-dir * width)
        setIndex(((target % total) + total) % total)
        animate(x, 0, reduced ? { duration: 0.2 } : SPRING).then(() => {
          busyRef.current = false
        })
      })
    },
    [cardWidth, flyDuration, reduced, total, x],
  )

  const next = useCallback(() => go(index + 1, -1), [go, index])
  const prev = useCallback(() => go(index - 1, 1), [go, index])

  const onDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const { thrown, forward } = resolveThrow(
        info.offset.x,
        info.velocity.x,
        cardWidth(),
      )

      if (!thrown || total < 2) {
        // Too short a pull: the card falls back into the stack.
        animate(x, 0, reduced ? { duration: 0.16 } : SPRING)
        return
      }

      // Sparkles come off the card itself, wherever it was let go.
      const r = cardRef.current?.getBoundingClientRect()
      if (r) {
        sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, {
          count: 14,
          tone: 'rose',
          power: 160,
        })
      }
      go(forward ? index + 1 : index - 1, forward ? -1 : 1)
    },
    [cardWidth, go, index, reduced, total, x],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (total < 2) return
      // Home/End jump the deck's ends; the arrows step and wrap.
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Home') go(0, 1)
      else if (e.key === 'End') go(total - 1, -1)
      else return
      // Only swallow the keys we actually handled, so Tab and the rest
      // still behave normally inside the card.
      e.preventDefault()
    },
    [go, next, prev, total],
  )

  const onDragStart = useCallback(() => {
    if (draggedRef.current) return
    draggedRef.current = true
    onFirstDrag?.()
  }, [onFirstDrag])

  // Only draw as many shells as there are other cards to suggest.
  const shells = Math.min(PEEK, Math.max(0, total - 1))

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative rounded-[1.35rem]"
        role="group"
        aria-roledescription="carousel"
        aria-label={label(items[index], index, total)}
        // Focusable so the deck answers the arrow keys directly, the way a
        // carousel is expected to. The arrows and dots below remain the
        // explicit controls; this is the shortcut, not the only route.
        tabIndex={total > 1 ? 0 : -1}
        onKeyDown={onKeyDown}
      >
        {/* Bare frames behind the top card: depth without duplicate content. */}
        {Array.from({ length: shells }, (_, i) => {
          const depth = shells - i
          return (
            <motion.div
              key={`shell-${depth}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[1.35rem] border border-gold/25 bg-blush-soft"
              style={{
                zIndex: i,
                // The nearest shell tracks the drag; the one behind is static.
                scale: depth === 1 ? peekScale : 0.9,
                y: depth === 1 ? peekLift : 26,
                boxShadow: '0 10px 26px -18px rgba(94,18,39,0.4)',
              }}
            />
          )
        })}

        <motion.div
          ref={cardRef}
          drag={total > 1 ? 'x' : false}
          // No constraints: the card tracks the finger one-to-one and the
          // release is resolved by hand, so a short pull springs back and a
          // long one keeps its momentum out of frame.
          dragElastic={1}
          dragMomentum={false}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          whileDrag={{ cursor: 'grabbing' }}
          className="relative z-10 rounded-[1.35rem]"
          // pan-y, not none: a vertical flick still scrolls the page, so the
          // deck never becomes a trap halfway down a long invitation.
          style={{ x, rotate, opacity, touchAction: 'pan-y' }}
        >
          {children(items[index], index)}
        </motion.div>
      </div>

      {/* Arrows and dots — the whole deck without a single swipe. */}
      {total > 1 && (
        <div className="mt-7 flex items-center justify-center gap-5">
          <DeckArrow direction="prev" label={prevLabel} onClick={prev} />

          <span className="flex items-center gap-2">
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (i !== index) go(i, i > index ? -1 : 1)
                }}
                aria-current={i === index}
                aria-label={label(item, i, total)}
                className="grid size-[var(--tap-min)] place-items-center"
              >
                <span
                  className="block size-1.5 rounded-full transition-all duration-500"
                  style={{
                    background: i === index ? 'var(--color-wine)' : 'transparent',
                    border: i === index ? 'none' : '1px solid rgba(155,44,74,0.35)',
                    transform: i === index ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              </button>
            ))}
          </span>

          <DeckArrow direction="next" label={nextLabel} onClick={next} />
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {label(items[index], index, total)}
      </span>
    </div>
  )
}

function DeckArrow({
  direction,
  label,
  onClick,
}: {
  direction: 'prev' | 'next'
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-[var(--tap-min)] place-items-center text-wine transition-opacity duration-300 hover:opacity-60"
    >
      <svg viewBox="0 0 16 16" className="w-3.5" aria-hidden="true">
        <path
          d={direction === 'prev' ? 'M10 2 L4 8 L10 14' : 'M6 2 L12 8 L6 14'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
