/**
 * The small ornament set: crescent, corner flourishes, an arabesque vine,
 * a dome, and an 8-point star. All pure geometry and foliage — nothing
 * living, per the design rules.
 */

type Base = { className?: string; stroke?: string; title?: string }

/* ─────────────────────────── Crescent + star ─────────────────────────── */

export function Crescent({
  className = '',
  fill = 'url(#goldFoil)',
  title,
}: Base & { fill?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {/* Crescent as one circle minus an offset circle, via even-odd fill. */}
      <path
        fillRule="evenodd"
        fill={fill}
        d="M50 6 A44 44 0 1 0 50 94 A44 44 0 1 1 50 6 Z
           M56 14 A36 36 0 1 0 56 86 A44 44 0 0 1 56 14 Z"
      />
      <path
        d="M78 22 L81.5 30.5 L90 34 L81.5 37.5 L78 46 L74.5 37.5 L66 34 L74.5 30.5 Z"
        fill={fill}
      />
    </svg>
  )
}

/* ──────────────────────────── 8-point star ───────────────────────────── */

export function EightStar({
  className = '',
  fill = 'url(#goldFoil)',
  title,
}: Base & { fill?: string }) {
  const pts: string[] = []
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2
    const r = i % 2 === 0 ? 48 : 48 * 0.7654
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`)
  }
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <polygon points={pts.join(' ')} fill={fill} />
    </svg>
  )
}

/* ───────────────────────── Corner flourish ───────────────────────────── */

/**
 * An arabesque corner, drawn for the top-left and mirrored by the caller
 * with a scale transform — one path, four corners.
 */
export function CornerFlourish({
  className = '',
  stroke = 'url(#goldFoil)',
}: Base) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
        {/* the bracket itself */}
        <path d="M4 34 L4 10 Q4 4 10 4 L34 4" strokeWidth="2" />
        {/* inner echo */}
        <path d="M11 32 L11 15 Q11 11 15 11 L32 11" opacity="0.55" />
        {/* scrolling vine off the elbow */}
        <path d="M11 44 C11 58, 20 64, 33 62 C25 70, 12 68, 8 58" />
        <path d="M44 11 C58 11, 64 20, 62 33 C70 25, 68 12, 58 8" />
        {/* leaf buds — foliage is permitted */}
        <path d="M33 62 C36 57, 42 56, 46 58 C42 63, 36 65, 33 62 Z" fill={stroke} stroke="none" opacity="0.75" />
        <path d="M62 33 C57 36, 56 42, 58 46 C63 42, 65 36, 62 33 Z" fill={stroke} stroke="none" opacity="0.75" />
      </g>
      <circle cx="7" cy="7" r="2.4" fill={stroke} />
    </svg>
  )
}

/* ───────────────────────── Arabesque vine ───────────────────────────── */

export function FloralVine({ className = '', stroke = 'url(#goldFoil)' }: Base) {
  return (
    <svg viewBox="0 0 320 44" className={className} aria-hidden="true">
      <g fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
        {/* twin stems mirrored about the centre */}
        <path d="M160 22 C132 22, 124 8, 102 8 C84 8, 78 20, 62 20 C48 20, 42 12, 28 14" />
        <path d="M160 22 C132 22, 124 36, 102 36 C84 36, 78 24, 62 24 C48 24, 42 32, 28 30" />
        <path d="M160 22 C188 22, 196 8, 218 8 C236 8, 242 20, 258 20 C272 20, 278 12, 292 14" />
        <path d="M160 22 C188 22, 196 36, 218 36 C236 36, 242 24, 258 24 C272 24, 278 32, 292 30" />
        {/* leaves */}
        <g fill={stroke} stroke="none" opacity="0.8">
          <path d="M102 8 C97 3, 89 3, 85 7 C90 12, 98 12, 102 8 Z" />
          <path d="M102 36 C97 41, 89 41, 85 37 C90 32, 98 32, 102 36 Z" />
          <path d="M218 8 C223 3, 231 3, 235 7 C230 12, 222 12, 218 8 Z" />
          <path d="M218 36 C223 41, 231 41, 235 37 C230 32, 222 32, 218 36 Z" />
        </g>
      </g>
      {/* centre medallion */}
      <g transform="translate(150 12) scale(0.2)">
        <polygon
          points="50,2 57.6,27.4 83,20 70.4,43.2 95,50 70.4,56.8 83,80 57.6,72.6 50,98 42.4,72.6 17,80 29.6,56.8 5,50 29.6,43.2 17,20 42.4,27.4"
          fill={stroke}
        />
      </g>
    </svg>
  )
}

/* ──────────────────────────── Dome / masjid ──────────────────────────── */

export function DomeIcon({
  className = '',
  stroke = 'url(#goldFoil)',
  title = 'Venue',
}: Base) {
  return (
    <svg viewBox="0 0 120 110" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <g fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        {/* central onion dome */}
        <path d="M60 10 L60 20" />
        <circle cx="60" cy="7" r="3" fill={stroke} />
        <path d="M38 62 C38 44, 48 38, 54 28 C57 23, 59 18, 60 20 C61 18, 63 23, 66 28 C72 38, 82 44, 82 62 Z" />
        {/* drum and base */}
        <path d="M36 62 L84 62 L84 72 L36 72 Z" />
        <path d="M30 100 L90 100 L90 72 L30 72 Z" />
        {/* flanking minarets */}
        <path d="M16 100 L16 52 C16 46, 24 46, 24 52 L24 100" />
        <path d="M96 100 L96 52 C96 46, 104 46, 104 52 L104 100" />
        <path d="M14 62 L26 62 M94 62 L106 62" strokeWidth="1.6" />
        {/* arched doorway */}
        <path d="M52 100 L52 86 A8 8 0 0 1 68 86 L68 100" strokeWidth="1.8" />
        <path d="M8 100 L112 100" strokeWidth="2.6" />
      </g>
    </svg>
  )
}

/* ────────────────────────── Hearts ──────────────────────────────────── */

/**
 * A heart, drawn from two bezier lobes meeting at a point. Not a living
 * being — a symbol — so it sits comfortably inside the design rules.
 */
export function Heart({
  className = '',
  fill = 'url(#roseFoil)',
  stroke,
  title,
}: Base & { fill?: string }) {
  const d =
    'M50 88 C18 64, 6 44, 6 30 C6 15, 18 6, 30 6 C39 6, 46 11, 50 19 C54 11, 61 6, 70 6 C82 6, 94 15, 94 30 C94 44, 82 64, 50 88 Z'
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path d={d} fill={stroke ? 'none' : fill} stroke={stroke} strokeWidth={stroke ? 3 : 0} />
    </svg>
  )
}

/**
 * The heart-and-crescent motif: a crescent cradling a small heart, used to
 * join the couple's names.
 */
export function HeartCrescent({ className = '', title }: Base) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {/* crescent, opening to the right */}
      <path
        fillRule="evenodd"
        fill="url(#goldFoil)"
        d="M46 6 A44 44 0 1 0 46 94 A44 44 0 1 1 46 6 Z
           M52 15 A35 35 0 1 0 52 85 A44 44 0 0 1 52 15 Z"
      />
      {/* heart nested in the opening */}
      <g transform="translate(58 26) scale(0.44)">
        <path
          d="M50 88 C18 64, 6 44, 6 30 C6 15, 18 6, 30 6 C39 6, 46 11, 50 19 C54 11, 61 6, 70 6 C82 6, 94 15, 94 30 C94 44, 82 64, 50 88 Z"
          fill="url(#roseFoil)"
        />
      </g>
      {/* small star above */}
      <path
        d="M96 14 L99 21 L106 24 L99 27 L96 34 L93 27 L86 24 L93 21 Z"
        fill="url(#goldFoil)"
      />
    </svg>
  )
}
