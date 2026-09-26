import { useId } from 'react'

type Props = {
  initials: string
  className?: string
}

/**
 * A wax seal bearing the couple's monogram, built so it can break.
 *
 * The disc is drawn twice and each copy is clipped to one side of a jagged
 * fracture line, so the two halves are independently transformable — the
 * gate timeline pulls them apart. A single path could not split.
 *
 * Data attributes mark the pieces for GSAP rather than exporting refs for
 * each one.
 */
export function WaxSeal({ initials, className = '' }: Props) {
  const uid = useId().replace(/:/g, '')
  const leftClip = `sealL-${uid}`
  const rightClip = `sealR-${uid}`

  // The fracture: an irregular line down the disc. Both halves share it, so
  // the broken edges interlock exactly.
  const crack = '48,0 54,18 44,32 56,48 46,62 55,78 47,92 52,100'

  const disc = (
    <>
      <circle cx="50" cy="50" r="42" fill="url(#wineSeal)" />
      {/* pressed rim: the ridge wax makes when a stamp lifts */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="#4a0e1f"
        strokeWidth="2"
        opacity="0.8"
      />
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="url(#goldFoil)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      {/* eight small notches around the rim */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return (
          <circle
            key={i}
            cx={50 + Math.cos(a) * 38.5}
            cy={50 + Math.sin(a) * 38.5}
            r="1.6"
            fill="url(#goldFoil)"
            opacity="0.85"
          />
        )
      })}
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fill="url(#goldFoil)"
        style={{ fontFamily: 'var(--font-script)', fontSize: 26 }}
      >
        {initials}
      </text>
    </>
  )

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`Wax seal with the monogram ${initials}`}
    >
      <title>{`Wax seal with the monogram ${initials}`}</title>
      <defs>
        <clipPath id={leftClip}>
          <polygon points={`0,0 ${crack} 0,100`} />
        </clipPath>
        <clipPath id={rightClip}>
          <polygon points={`100,0 ${crack} 100,100`} />
        </clipPath>
      </defs>

      <g data-seal-half="left" clipPath={`url(#${leftClip})`}>
        {disc}
      </g>
      <g data-seal-half="right" clipPath={`url(#${rightClip})`}>
        {disc}
      </g>

      {/* Hairline down the fracture, revealed as the seal gives way. */}
      <polyline
        data-seal-crack
        points={crack}
        fill="none"
        stroke="#3a0b18"
        strokeWidth="1.4"
        opacity="0"
      />
    </svg>
  )
}
