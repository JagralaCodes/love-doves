import type { ReactNode } from 'react'
import { archClosedPath } from '../svg/MihrabArch'
import type { ArchVariant } from '../svg/MihrabArch'
import { useId } from 'react'

type Props = {
  children: ReactNode
  variant?: ArchVariant
  className?: string
  /** Fill inside the arch. */
  face?: string
  tone?: 'light' | 'dark'
}

/**
 * A true mihrab arch used as a content panel.
 *
 * The arch is an SVG background at a fixed 200x260 ratio with
 * `preserveAspectRatio="none"` deliberately NOT set — instead the panel
 * keeps that aspect itself, so the curve never stretches into an egg. The
 * content sits in the lower two-thirds where the arch is full width.
 */
export function ArchPanel({
  children,
  variant = 'ogee',
  className = '',
  face = 'url(#blushFace)',
  tone = 'light',
}: Props) {
  const uid = useId().replace(/:/g, '')
  const d = archClosedPath(variant)
  const stroke = tone === 'dark' ? 'url(#goldFoil)' : 'url(#goldFoil)'

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: '200 / 260' }}>
      <svg
        viewBox="0 0 200 260"
        className="absolute inset-0 size-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Clip so the face never bleeds past the arch outline. */}
          <clipPath id={`archClip-${uid}`}>
            <path d={d} />
          </clipPath>
        </defs>
        <path d={d} fill={face} clipPath={`url(#archClip-${uid})`} />
        {/* vector-effect keeps the rule hairline-thin however the panel scales */}
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <g transform="translate(100 158) scale(0.88 0.9) translate(-100 -158)">
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            strokeLinejoin="round"
            opacity="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      {/* Content occupies the straight-sided lower portion. */}
      <div className="absolute inset-x-0 bottom-0 flex h-[62%] flex-col items-center justify-center px-7 text-center">
        {children}
      </div>
    </div>
  )
}
