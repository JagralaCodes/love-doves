type Props = {
  /** e.g. "A & S" — comes from wedding.monogram, never hardcoded. */
  initials: string
  className?: string
  /** 'roundel' for a girih ring, 'cartouche' for a lobed medallion. */
  variant?: 'roundel' | 'cartouche'
  title?: string
}

/**
 * The couple's initials inside an ornamental medallion. Used on the wax
 * seal, the family cards and the OG image — never as a photo stand-in,
 * because there are no photos.
 */
export function Monogram({
  initials,
  className = '',
  variant = 'roundel',
  title,
}: Props) {
  const ringPoints: string[] = []
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2
    const r = i % 2 === 0 ? 46 : 46 * 0.7654
    ringPoints.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`)
  }

  // Eight lobes around the rim, for the cartouche variant.
  const lobes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    return { cx: 50 + Math.cos(a) * 40, cy: 50 + Math.sin(a) * 40 }
  })

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={title ?? `Monogram ${initials}`}
    >
      <title>{title ?? `Monogram ${initials}`}</title>

      {variant === 'roundel' ? (
        <>
          <polygon
            points={ringPoints.join(' ')}
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="50" r="36" fill="none" stroke="url(#goldFoil)" strokeWidth="1" opacity="0.6" />
        </>
      ) : (
        <>
          {lobes.map((l, i) => (
            <circle key={i} cx={l.cx} cy={l.cy} r="11" fill="none" stroke="url(#goldFoil)" strokeWidth="1.2" opacity="0.7" />
          ))}
          <circle cx="50" cy="50" r="34" fill="none" stroke="url(#goldFoil)" strokeWidth="1.8" />
        </>
      )}

      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="url(#goldFoil)"
        style={{ fontFamily: 'var(--font-script)', fontSize: 30 }}
      >
        {initials}
      </text>
    </svg>
  )
}
