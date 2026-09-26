import type { ReactNode } from 'react'
import { archHeadPath, JAMB_INSET } from '../svg/MihrabArch'
import type { ArchVariant } from '../svg/MihrabArch'

type Props = {
  children: ReactNode
  variant?: ArchVariant
  className?: string
  /** Tint filling the arch head. */
  face?: string
  /** Ornament set into the niche, e.g. a star or crescent. */
  crest?: ReactNode
  /** Shrink the head so it crowns the content instead of towering over it. */
  headScale?: number
}

const STROKE = 'url(#goldFoil)'

/**
 * A mihrab arch that wraps content of any height.
 *
 * Built in two pieces: the curved head is an SVG at its true proportions
 * (so the lobes and the point never stretch), and the straight jambs below
 * are plain rules that grow with the content. One fixed-aspect path cannot
 * do both — it either letterboxes above tall text or squashes the curve.
 *
 * The jambs are inset by JAMB_INSET so they continue exactly where the
 * head's springline ends.
 */
export function ArchFrame({
  children,
  variant = 'ogee',
  className = '',
  face,
  crest,
  headScale = 1,
}: Props) {
  const inset = `${JAMB_INSET * 100}%`

  return (
    <div className={`relative ${className}`}>
      {/* head */}
      <div className="relative">
        <svg
          viewBox="0 0 200 150"
          className="block w-full"
          // Compress the whole head rather than cropping it: a slice would
          // cut the outer lobes off, whereas a wider-than-tall arch is a
          // real proportion and still meets the jambs at the springline.
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ aspectRatio: `200 / ${150 * headScale}` }}
        >
          {face && (
            <path d={`${archHeadPath(variant)} L186 150 L14 150 Z`} fill={face} />
          )}
          <path
            d={archHeadPath(variant)}
            fill="none"
            stroke={STROKE}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {crest && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[8%] flex justify-center">
            {crest}
          </div>
        )}
      </div>

      {/* body — the jambs continue the head's uprights */}
      <div className="relative" style={{ marginInline: inset, marginTop: -1 }}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-px"
          style={{ background: 'var(--foil-gold)', opacity: 0.85 }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-px"
          style={{ background: 'var(--foil-gold)', opacity: 0.85 }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'var(--foil-gold)', opacity: 0.85 }}
        />
        <div className="relative px-5 pt-3 pb-8">{children}</div>
      </div>
    </div>
  )
}
