/**
 * The small ornament set: crescent, corner flourishes, an arabesque vine,
 * a dome, and an 8-point star. All pure geometry and foliage — nothing
 * living, per the design rules.
 */

import { useId } from 'react'

type Base = { className?: string; stroke?: string; title?: string }

/* ─────────────────────────── Crescent + star ─────────────────────────── */

export function Crescent({
  className = '',
  fill = 'url(#goldFoil)',
  title,
}: Base & { fill?: string }) {
  const mid = `crescentCut-${useId().replace(/:/g, '')}`

  return (
    <svg
      viewBox="0 0 104 100"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}

      {/* Two true circles, the second masked out of the first.
          The previous shape subtracted a lens built from arcs of two
          DIFFERENT radii (35 then 46), so its inner edge was not a circle
          at all: the arc thinned unevenly and the lower horn collapsed.
          A mask of two real circles cannot drift like that, and the horns
          come out symmetrical by construction. */}
      <defs>
        <mask id={mid}>
          <circle cx="50" cy="50" r="44" fill="#fff" />
          <circle cx="64" cy="50" r="38" fill="#000" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="44" fill={fill} mask={`url(#${mid})`} />

      {/* Five-point star, nestled in the mouth between the horns.
          The horns meet the inner circle at x = 74.6, so a star centred at
          84 tucks inside the opening instead of floating off to one side. */}
      <path
        fill={fill}
        transform="translate(84 50)"
        d="M0 -15 L3.37 -4.64 L14.27 -4.64 L5.45 1.77 L8.82 12.14
           L0 5.73 L-8.82 12.14 L-5.45 1.77 L-14.27 -4.64 L-3.37 -4.64 Z"
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

export function DomeIcon({ className = '', stroke = 'url(#goldFoil)', title }: Base) {
  return (
    <svg
      viewBox="0 0 120 110"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
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

/* ───────────────────────── Chandelier / banquet ─────────────────────── */

/** A banquet hall's chandelier: a chain, two tiers of arms, candle flames. */
export function ChandelierIcon({ className = '', stroke = 'url(#goldFoil)', title }: Base) {
  return (
    <svg
      viewBox="0 0 120 110"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <g fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        {/* chain and stem */}
        <path d="M60 4 L60 12 M60 16 L60 24 M60 28 L60 42" />
        <circle cx="60" cy="14" r="2.2" />
        <circle cx="60" cy="26" r="2.2" />
        {/* upper tier */}
        <path d="M60 42 C44 42, 34 52, 30 66 M60 42 C76 42, 86 52, 90 66" />
        <path d="M60 42 C52 48, 50 56, 50 64 M60 42 C68 48, 70 56, 70 64" />
        {/* lower tier */}
        <path d="M60 48 C36 54, 20 66, 14 84 M60 48 C84 54, 100 66, 106 84" />
        {/* candle cups */}
        <path d="M26 66 L34 66 M46 64 L54 64 M66 64 L74 64 M86 66 L94 66 M10 84 L18 84 M102 84 L110 84" />
        {/* candles and flames */}
        <path d="M30 66 L30 58 M50 64 L50 56 M70 64 L70 56 M90 66 L90 58 M14 84 L14 76 M106 84 L106 76" strokeWidth="2" />
        <path
          d="M30 55 C28 52, 30 49, 30 48 C30 49, 32 52, 30 55 Z M50 53 C48 50, 50 47, 50 46 C50 47, 52 50, 50 53 Z M70 53 C68 50, 70 47, 70 46 C70 47, 72 50, 70 53 Z M90 55 C88 52, 90 49, 90 48 C90 49, 92 52, 90 55 Z M14 73 C12 70, 14 67, 14 66 C14 67, 16 70, 14 73 Z M106 73 C104 70, 106 67, 106 66 C106 67, 108 70, 106 73 Z"
          fill={stroke}
          stroke="none"
          opacity="0.9"
        />
        {/* bowl and drop */}
        <path d="M44 70 C48 84, 72 84, 76 70" />
        <path d="M60 84 L60 92" />
        <path d="M60 92 L56 98 L60 104 L64 98 Z" strokeWidth="2" />
      </g>
    </svg>
  )
}

/* ─────────────────────────── Doli / palanquin ───────────────────────── */

/** The bride's doli: a curved canopy, an arched window, carrying poles. */
export function DoliIcon({ className = '', stroke = 'url(#goldFoil)', title }: Base) {
  return (
    <svg
      viewBox="0 0 120 110"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <g fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        {/* finial and canopy */}
        <path d="M60 8 L60 18" />
        <circle cx="60" cy="6" r="2.4" fill={stroke} />
        <path d="M28 40 C32 26, 46 18, 60 18 C74 18, 88 26, 92 40 Z" />
        <path d="M24 40 L96 40" />
        {/* body */}
        <path d="M30 40 L30 78 L90 78 L90 40" />
        <path d="M30 78 L26 84 L94 84 L90 78" />
        {/* arched window with a drawn curtain */}
        <path d="M48 78 L48 58 C48 50, 72 50, 72 58 L72 78" />
        <path d="M60 52 C56 60, 56 70, 60 78" strokeWidth="1.6" />
        {/* carrying poles */}
        <path d="M4 70 L30 70 M90 70 L116 70" strokeWidth="2.8" />
        <path d="M4 70 L4 66 M116 70 L116 66" strokeWidth="2" />
        {/* tassels */}
        <path d="M36 84 L36 94 M44 84 L44 96 M76 84 L76 96 M84 84 L84 94" strokeWidth="1.6" />
        <circle cx="36" cy="96" r="1.6" fill={stroke} stroke="none" />
        <circle cx="44" cy="98" r="1.6" fill={stroke} stroke="none" />
        <circle cx="76" cy="98" r="1.6" fill={stroke} stroke="none" />
        <circle cx="84" cy="96" r="1.6" fill={stroke} stroke="none" />
      </g>
    </svg>
  )
}

/** The icon a config event names, so the letter and the schedule agree. */
export function EventIcon({ kind, className = '' }: { kind?: string; className?: string }) {
  if (kind === 'banquet') return <ChandelierIcon className={className} />
  if (kind === 'doli') return <DoliIcon className={className} />
  return <DomeIcon className={className} />
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
