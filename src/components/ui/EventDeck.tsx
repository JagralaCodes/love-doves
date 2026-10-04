import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { animate, motion, motionValue } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { sparkleBurst } from '../../lib/sparkleBus'
import { resolveThrow } from '../../lib/deckThrow'
import { TapButton } from './Tappable'

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

/** How many cards behind the top one are drawn. Deeper ones are hidden. */
const PEEK = 2
/**
 * How far back each card sits: a step smaller and a step lower.
 *
 * The drop has to beat the shrink or there is no visible pile. Scaling
 * about the centre already lifts the bottom edge by half the height lost
 * (~12px on a 420px card), so STEP_Y has to clear that first.
 */
const STEP_SCALE = 0.055
const STEP_Y = 26

const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 } as const

/**
 * A stack of cards that cycles: throw the top one off and it travels round
 * and settles at the back of the pile, so the deck never runs out.
 *
 * Each card is its own element with its own position, kept for the life of
 * the deck — they are never re-used to show a different event. That is
 * what lets a card be followed all the way round: it slides off, its place
 * in the pile becomes the back, and it slides home underneath the others.
 * Swapping content between two elements, as this did before, can only ever
 * make a card vanish and a different one appear.
 *
 * The cards are stacked in a single grid cell rather than absolutely
 * positioned, so the deck is always exactly as tall as its tallest card
 * and nothing shifts when the order changes.
 *
 * The top card slides straight along the swipe and does not tilt — a card
 * thrown off a pile travels the way it was pushed, and rotating it is what
 * made this read as a carousel.
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

  // One lasting x per card, so a card keeps its own position all the way
  // round the pile. The count comes from the data, so these cannot be a
  // list of useMotionValue calls — React's hook order has to be fixed.
  // Keyed on the count: the event list comes from config and does not
  // change at runtime, so in practice these are created once.
  const xs = useMemo<MotionValue<number>[]>(
    () => Array.from({ length: total }, () => motionValue(0)),
    [total],
  )

  /** The card's own width, which the throw distance and threshold key off. */
  const cardWidth = useCallback(() => cardRef.current?.offsetWidth || 320, [])

  /** Where a card sits in the pile: 0 is the top, 1 is behind it, and so on. */
  const rankOf = useCallback(
    (i: number) => (i - index + total) % total,
    [index, total],
  )

  /**
   * Throws the card on top off to `dir`, moves the deck on, then walks it
   * back in to the rear of the pile.
   */
  const throwTop = useCallback(
    (dir: -1 | 1) => {
      if (busyRef.current || total < 2) return
      busyRef.current = true

      const from = index
      const x = xs[from]
      const travel = cardWidth() * 1.45

      animate(x, dir * travel, {
        duration: reduced ? 0.16 : 0.38,
        ease: [0.32, 0, 0.67, 0],
      }).then(() => {
        // The deck moves on. This card is now the LAST in the pile, so its
        // rank-driven scale and offset are already heading for the back.
        setIndex((i) => (i + 1) % total)
        // It comes home from the edge it left by, underneath everything —
        // its z-index went to the bottom the moment the deck moved on.
        animate(x, 0, reduced ? { duration: 0.2 } : { duration: 0.55, ease: 'easeOut' }).then(
          () => {
            busyRef.current = false
          },
        )
      })
    },
    [cardWidth, index, reduced, total, xs],
  )

  /** Steps the deck back, drawing the card underneath out to the front. */
  const stepBack = useCallback(() => {
    if (busyRef.current || total < 2) return
    busyRef.current = true
    const target = (index - 1 + total) % total
    const x = xs[target]
    // It is at the back; bring it round the outside rather than letting it
    // grow through the pile.
    x.jump(-cardWidth() * 1.45)
    setIndex(target)
    animate(x, 0, reduced ? { duration: 0.2 } : SPRING).then(() => {
      busyRef.current = false
    })
  }, [cardWidth, index, reduced, total, xs])

  const next = useCallback(() => throwTop(-1), [throwTop])
  const prev = useCallback(() => stepBack(), [stepBack])

  const onDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const { thrown, forward } = resolveThrow(
        info.offset.x,
        info.velocity.x,
        cardWidth(),
      )

      if (!thrown || total < 2) {
        // Too short a pull: the card falls back onto the pile.
        animate(xs[index], 0, reduced ? { duration: 0.16 } : SPRING)
        return
      }

      const r = cardRef.current?.getBoundingClientRect()
      if (r) {
        sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, {
          count: 14,
          tone: 'rose',
          power: 160,
        })
      }
      // Off the way it was pushed, either way — then round to the back.
      throwTop(forward ? -1 : 1)
    },
    [cardWidth, index, reduced, throwTop, total, xs],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (total < 2) return
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else return
      // Only swallow the keys we actually handled, so Tab and the rest
      // still behave normally inside the card.
      e.preventDefault()
    },
    [next, prev, total],
  )

  const onDragStart = useCallback(() => {
    if (draggedRef.current) return
    draggedRef.current = true
    onFirstDrag?.()
  }, [onFirstDrag])

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative grid"
        role="group"
        aria-roledescription="carousel"
        aria-label={label(items[index], index, total)}
        tabIndex={total > 1 ? 0 : -1}
        onKeyDown={onKeyDown}
      >
        {items.map((item, i) => {
          const rank = rankOf(i)
          const isTop = rank === 0
          // Deeper than the pile shows: parked, invisible, out of the way.
          const buried = rank > PEEK
          return (
            <motion.div
              key={i}
              // Every card in the same grid cell: the deck is as tall as its
              // tallest card, and no card has to change positioning when the
              // order changes.
              className="col-start-1 row-start-1 rounded-[1.35rem]"
              ref={isTop ? cardRef : undefined}
              drag={isTop && total > 1 ? 'x' : false}
              // No constraints: the card tracks the finger one-to-one and the
              // release is resolved by hand, so a short pull springs back and
              // a long one keeps its momentum out of frame.
              dragElastic={1}
              dragMomentum={false}
              onDragStart={isTop ? onDragStart : undefined}
              onDragEnd={isTop ? onDragEnd : undefined}
              whileDrag={{ cursor: 'grabbing' }}
              // Only the card on top is reachable. The rest are real cards,
              // really filled in — a blank card behind the front one reads
              // as a bug — but `inert` keeps their text out of the reading
              // order and their buttons out of the tab order.
              inert={!isTop}
              aria-hidden={!isTop || undefined}
              animate={{
                scale: 1 - STEP_SCALE * Math.min(rank, PEEK),
                y: STEP_Y * Math.min(rank, PEEK),
                opacity: buried ? 0 : 1,
              }}
              transition={reduced ? { duration: 0.2 } : SPRING}
              style={{
                // No `rotate`: a card thrown off a pile travels the way it
                // was pushed.
                x: xs[i],
                zIndex: total - rank,
                pointerEvents: isTop ? 'auto' : 'none',
                transformOrigin: 'center',
                // pan-y, not none: a vertical flick still scrolls the page,
                // so the deck never becomes a trap mid-invitation.
                touchAction: 'pan-y',
              }}
            >
              {children(item, i)}
            </motion.div>
          )
        })}
      </div>

      {/* Arrows and dots — the whole deck without a single swipe. */}
      {total > 1 && (
        <div className="mt-5 flex items-center justify-center gap-5">
          <DeckArrow direction="prev" label={prevLabel} onClick={prev} />

          <span className="flex items-center gap-2">
            {items.map((item, i) => (
              <TapButton
                key={i}
                lift={false}
                onClick={() => {
                  // The pile moves one card at a time, so a dot steps the
                  // deck the short way round rather than teleporting.
                  const r = rankOf(i)
                  if (r === 0) return
                  if (r <= total / 2) throwTop(-1)
                  else stepBack()
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
              </TapButton>
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
    <TapButton
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
    </TapButton>
  )
}
