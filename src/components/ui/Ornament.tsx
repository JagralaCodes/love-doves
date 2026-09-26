type Props = {
  className?: string
  /** Width relative to its container. */
  width?: string
  tone?: 'gold' | 'rose'
}

/**
 * A small ornamental divider: two tapering rules meeting an 8-point star.
 * Pure geometry — no living beings — and inline SVG so it stays sharp and
 * can be animated later.
 */
export function Ornament({ className = '', width = '11rem', tone = 'gold' }: Props) {
  const id = tone === 'gold' ? 'ornGold' : 'ornRose'
  const stops =
    tone === 'gold'
      ? ['#a67c1f', '#d4af37', '#f5e1a4', '#d4af37', '#a67c1f']
      : ['#9b2c4a', '#c56a85', '#f9d9e1', '#c56a85', '#9b2c4a']

  return (
    <svg
      viewBox="0 0 240 24"
      className={className}
      style={{ width, height: 'auto' }}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          {stops.map((c, i) => (
            <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>

      <g stroke={`url(#${id})`} fill="none" strokeLinecap="round">
        {/* tapering rules */}
        <path d="M6 12 H88" strokeWidth="1" opacity="0.5" />
        <path d="M152 12 H234" strokeWidth="1" opacity="0.5" />
        {/* small terminal dots */}
        <circle cx="94" cy="12" r="1.8" fill={`url(#${id})`} stroke="none" />
        <circle cx="146" cy="12" r="1.8" fill={`url(#${id})`} stroke="none" />
      </g>

      {/* 8-point star */}
      <g fill={`url(#${id})`}>
        <path d="M120 1 L123.2 8.8 L131 12 L123.2 15.2 L120 23 L116.8 15.2 L109 12 L116.8 8.8 Z" />
        <path
          d="M120 4.5 L121.9 9.2 L126.6 11.1 L121.9 13 L120 17.7 L118.1 13 L113.4 11.1 L118.1 9.2 Z"
          opacity="0.55"
          transform="rotate(45 120 12)"
        />
      </g>
    </svg>
  )
}
