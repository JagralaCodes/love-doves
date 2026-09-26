import type { ReactNode } from 'react'
import { CornerFlourish, EightStar } from '../svg/Ornaments'

type Props = {
  children: ReactNode
  className?: string
  tone?: 'blush' | 'plain' | 'wine'
  /** A small star set into the top edge, like a keystone. */
  crown?: boolean
  /** Arabesque brackets in all four corners. */
  corners?: boolean
}

const FILLS = {
  blush: 'bg-blush-soft',
  plain: 'bg-pearl-white',
  wine: 'bg-wine-deep',
} as const

/**
 * A rectangular panel with a doubled gold rule, arabesque corner brackets
 * and an optional star keystone.
 *
 * This replaces the earlier half-dome card. A semicircular top read as a
 * headstone; the ornament here does the decorative work instead, and the
 * real arch geometry lives in ArchPanel where it can keep its proportions.
 */
export function OrnateFrame({
  children,
  className = '',
  tone = 'plain',
  crown = true,
  corners = true,
}: Props) {
  const line = tone === 'wine' ? 'rgba(212,175,55,0.5)' : 'rgba(166,124,31,0.38)'

  return (
    <div className={`relative ${FILLS[tone]} ${className}`} style={{ boxShadow: 'var(--shadow-petal)' }}>
      {/* outer rule */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ border: `1px solid ${line}` }}
      />
      {/* inner rule — the doubled line that makes it read as engraved */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[6px]"
        style={{ border: `1px solid ${line}`, opacity: 0.55 }}
      />

      {corners && (
        <>
          <CornerFlourish className="pointer-events-none absolute top-0 left-0 w-9" />
          <CornerFlourish className="pointer-events-none absolute top-0 right-0 w-9 -scale-x-100" />
          <CornerFlourish className="pointer-events-none absolute bottom-0 left-0 w-9 -scale-y-100" />
          <CornerFlourish className="pointer-events-none absolute right-0 bottom-0 w-9 -scale-100" />
        </>
      )}

      {crown && (
        <span
          aria-hidden="true"
          className={`absolute -top-[11px] left-1/2 w-[22px] -translate-x-1/2 ${FILLS[tone]} px-1`}
        >
          <EightStar className="w-full" />
        </span>
      )}

      <div className="relative px-6 py-9">{children}</div>
    </div>
  )
}
