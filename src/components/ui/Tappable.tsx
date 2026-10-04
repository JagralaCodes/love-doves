import { motion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Physical press feedback for controls: a spring squeeze on press and a
 * hair of lift on hover. One primitive, used everywhere, so every control
 * on the invitation answers a finger the same way.
 *
 * Springs rather than eases because a press can be interrupted — a thumb
 * that lands and lifts in 80ms should still see the control answer.
 */
const PRESS = { type: 'spring', stiffness: 520, damping: 30, mass: 0.6 } as const

type Gesture = {
  whileTap?: { scale: number }
  whileHover?: { y: number }
  transition?: typeof PRESS
}

function gestures(reduced: boolean, lift: boolean): Gesture {
  if (reduced) return {}
  return {
    whileTap: { scale: 0.95 },
    whileHover: lift ? { y: -1.5 } : undefined,
    transition: PRESS,
  }
}

type ButtonProps = Omit<ComponentProps<typeof motion.button>, 'children'> & {
  children: ReactNode
  /** Turn the hover lift off for controls that must stay put, like dots. */
  lift?: boolean
}

export function TapButton({ children, lift = true, ...rest }: ButtonProps) {
  const reduced = useReducedMotion()
  return (
    <motion.button type="button" {...gestures(reduced, lift)} {...rest}>
      {children}
    </motion.button>
  )
}

type LinkProps = Omit<ComponentProps<typeof motion.a>, 'children'> & {
  children: ReactNode
  lift?: boolean
}

export function TapLink({ children, lift = true, ...rest }: LinkProps) {
  const reduced = useReducedMotion()
  return (
    <motion.a {...gestures(reduced, lift)} {...rest}>
      {children}
    </motion.a>
  )
}
