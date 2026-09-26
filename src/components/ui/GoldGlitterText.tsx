import { useMemo } from 'react'
import type { ElementType, ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { particleScale } from '../../lib/device'

type Props = {
  children: ReactNode
  /** Rendered element — use a heading tag where it is a heading. */
  as?: ElementType
  className?: string
  /** How many twinkling specks sit on the letters. */
  specks?: number
  /** Turn the shine sweep off for small static labels. */
  shine?: boolean
  /**
   * Which background this sits on. 'dark' uses the brighter foil; on light
   * backgrounds the deep foil is what keeps thin strokes legible.
   */
  tone?: 'light' | 'dark' | 'rose'
  /**
   * Lay the text out as its own block. Default is inline-block so it can
   * sit inside a sentence; pass `block` for standalone headings and lines.
   */
  block?: boolean
  lang?: string
  dir?: 'rtl' | 'ltr'
}

type Speck = {
  left: string
  top: string
  size: number
  delay: string
  duration: string
}

/**
 * Gold-foil lettering: a gradient fill clipped to the glyphs, a slow shine
 * sweep across it, a soft gold halo behind, and tiny specks that twinkle
 * on top at random intervals.
 *
 * Used for the couple's names, Bismillah, the date reveal, section titles
 * and "Jazakallahu Khairan".
 */
export function GoldGlitterText({
  children,
  as: Tag = 'span',
  className = '',
  specks = 12,
  shine = true,
  tone = 'light',
  block = false,
  lang,
  dir,
}: Props) {
  const reduced = useReducedMotion()
  const scale = particleScale()
  const speckCount = reduced ? 0 : Math.round(specks * (scale || 0.4))

  // Positions are random per mount but stable across re-renders, so the
  // specks do not jump around while the text animates.
  const speckList = useMemo<Speck[]>(
    () =>
      Array.from({ length: speckCount }, () => ({
        left: `${Math.random() * 96 + 2}%`,
        top: `${Math.random() * 74 + 10}%`,
        size: Math.random() * 2.6 + 1.4,
        delay: `${Math.random() * 6}s`,
        duration: `${2.2 + Math.random() * 2.4}s`,
      })),
    [speckCount],
  )

  return (
    <Tag
      className={`relative isolate ${className}`}
      // Inline style, not a class: a display utility in `className` would
      // otherwise race the base one and the winner depends on Tailwind's
      // output order rather than the order written here.
      style={{ display: block ? 'block' : 'inline-block' }}
      lang={lang}
      dir={dir}
    >
      <span
        className={`${
          tone === 'dark'
            ? 'foil-text-bright'
            : tone === 'rose'
              ? 'rose-foil-text'
              : 'foil-text'
        } ${shine && !reduced ? 'foil-shimmer' : ''}`}
        // The gradient must paint over the glyphs, so the text itself
        // stays in normal flow and the specks layer on top of it.
      >
        {children}
      </span>

      {speckList.length > 0 && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
          {speckList.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-gold-light"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                boxShadow: '0 0 4px rgba(245,225,164,0.95), 0 0 9px rgba(212,175,55,0.65)',
                animation: `speck-twinkle ${s.duration} var(--ease-in-out-slow) ${s.delay} infinite`,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </span>
      )}
    </Tag>
  )
}
