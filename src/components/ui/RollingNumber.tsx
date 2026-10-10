import { motion } from 'motion/react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

type Props = {
  /** Already-padded string, e.g. "07" or "128". */
  value: string
  className?: string
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const ROLL = { type: 'spring', stiffness: 170, damping: 24, mass: 0.9 } as const

/**
 * A number whose digits roll like a mechanical counter.
 *
 * Each column is a strip of 0–9 behind a one-character window, slid to the
 * current digit. A change becomes a roll rather than a swap, and only the
 * columns that changed move — the seconds tick, the days barely stir.
 * Springs, so a fast run of changes overlaps gracefully instead of queuing.
 */
export function RollingNumber({ value, className = '' }: Props) {
  const reduced = useReducedMotion()

  return (
    <span
      className={`nums-tabular inline-flex overflow-hidden leading-none ${className}`}
      // The window is exactly one line tall; the strip behind it is ten.
      style={{ height: '1em' }}
      aria-hidden="true"
    >
      {value.split('').map((ch, i) => {
        const d = DIGITS.indexOf(ch)
        if (d === -1) {
          return (
            <span key={i} className="inline-block">
              {ch}
            </span>
          )
        }
        return (
          <span key={i} className="relative inline-block" style={{ height: '1em' }}>
            {/* A spacer holds the column's width; the strip is positioned over it. */}
            <span className="invisible">0</span>
            <motion.span
              className="absolute top-0 left-0 flex flex-col"
              animate={{ y: `-${d * 10}%` }}
              transition={reduced ? { duration: 0 } : ROLL}
            >
              {DIGITS.map((n) => (
                <span key={n} style={{ height: '1em', lineHeight: 1 }}>
                  {n}
                </span>
              ))}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}
