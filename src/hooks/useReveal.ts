import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motionPrefs'

export type RevealVariant =
  | 'fade-up'
  | 'mask-wipe'
  | 'scale-in'
  | 'slide-left'
  | 'slide-right'
  | 'stagger-up'
  | 'stagger-letters'

type RevealOptions = {
  variant?: RevealVariant
  /** Child selector for the stagger variants. */
  children?: string
  delay?: number
  stagger?: number
  start?: string
  /** Skip entirely — e.g. a section that animates itself. */
  disabled?: boolean
}

/**
 * Scroll reveal with a choice of entrances, so no two neighbouring
 * sections arrive the same way. Under reduced-motion every variant
 * collapses to a short opacity fade with no movement.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const {
    variant = 'fade-up',
    children,
    delay = 0,
    stagger = 0.08,
    start,
    disabled = false,
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    const reduced = prefersReducedMotion()
    const targets: Element[] | Element = children
      ? Array.from(el.querySelectorAll(children))
      : el

    if (Array.isArray(targets) && targets.length === 0) return

    const ctx = gsap.context(() => {
      const trigger = {
        trigger: el,
        start: start ?? 'top 82%',
        once: true,
      }

      if (reduced) {
        gsap.fromTo(
          targets,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: 'none', delay, scrollTrigger: trigger },
        )
        return
      }

      switch (variant) {
        case 'mask-wipe':
          gsap.fromTo(
            targets,
            { clipPath: 'inset(0 0 100% 0)', y: 24 },
            {
              clipPath: 'inset(0 0 0% 0)',
              y: 0,
              duration: 1.3,
              ease: 'expo.out',
              delay,
              scrollTrigger: trigger,
            },
          )
          break

        case 'scale-in':
          gsap.fromTo(
            targets,
            { autoAlpha: 0, scale: 0.9 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 1.1,
              ease: 'expo.out',
              delay,
              scrollTrigger: trigger,
            },
          )
          break

        case 'slide-left':
        case 'slide-right':
          gsap.fromTo(
            targets,
            { autoAlpha: 0, x: variant === 'slide-left' ? -56 : 56, y: 28 },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: 1.2,
              ease: 'power3.out',
              delay,
              scrollTrigger: trigger,
            },
          )
          break

        case 'stagger-up':
        case 'stagger-letters':
          gsap.fromTo(
            targets,
            { autoAlpha: 0, y: variant === 'stagger-letters' ? 18 : 30 },
            {
              autoAlpha: 1,
              y: 0,
              duration: variant === 'stagger-letters' ? 0.8 : 1,
              ease: 'power3.out',
              stagger,
              delay,
              scrollTrigger: trigger,
            },
          )
          break

        case 'fade-up':
        default:
          gsap.fromTo(
            targets,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              ease: 'power3.out',
              delay,
              scrollTrigger: trigger,
            },
          )
      }
    }, el)

    return () => ctx.revert()
  }, [variant, children, delay, stagger, start, disabled])

  return ref
}
