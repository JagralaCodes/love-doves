/**
 * One hidden SVG holding every shared gradient and filter.
 *
 * SVG ids are document-global, so any inline SVG on the page can reference
 * these with `url(#goldFoil)` — the alternative is redefining the same
 * gradient inside a dozen separate SVGs. Mount this once, near the root.
 */
export function SvgDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        {/* Gold foil, raking across the shape. The dark stops carry most of
            the width — that is what makes it read as metal and not yellow. */}
        <linearGradient id="goldFoil" x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0%" stopColor="#8a6b23" />
          <stop offset="9%" stopColor="#a67c1f" />
          <stop offset="23%" stopColor="#c49b2e" />
          <stop offset="37%" stopColor="#d4af37" />
          <stop offset="47%" stopColor="#eed898" />
          <stop offset="51%" stopColor="#fff8e0" />
          <stop offset="55%" stopColor="#eed898" />
          <stop offset="66%" stopColor="#d4af37" />
          <stop offset="79%" stopColor="#b8912c" />
          <stop offset="91%" stopColor="#8a6b23" />
          <stop offset="100%" stopColor="#a67c1f" />
        </linearGradient>

        {/* Same foil running top-to-bottom, for uprights and jambs. */}
        <linearGradient id="goldFoilV" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#a67c1f" />
          <stop offset="18%" stopColor="#d4af37" />
          <stop offset="34%" stopColor="#f2e3b0" />
          <stop offset="50%" stopColor="#c49b2e" />
          <stop offset="68%" stopColor="#eed898" />
          <stop offset="86%" stopColor="#a67c1f" />
          <stop offset="100%" stopColor="#8a6b23" />
        </linearGradient>

        {/* Softer gold for large fills that must not shout. */}
        <linearGradient id="goldWash" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#f5e1a4" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#a67c1f" stopOpacity="0.28" />
        </linearGradient>

        <linearGradient id="roseFoil" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#9b2c4a" />
          <stop offset="30%" stopColor="#c56a85" />
          <stop offset="50%" stopColor="#f9d9e1" />
          <stop offset="70%" stopColor="#c56a85" />
          <stop offset="100%" stopColor="#9b2c4a" />
        </linearGradient>

        {/* Lantern glow and seal relief. */}
        <radialGradient id="goldGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#f5e1a4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="wineSeal" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#b8536d" />
          <stop offset="55%" stopColor="#9b2c4a" />
          <stop offset="100%" stopColor="#5e1227" />
        </radialGradient>

        {/* Blush card face — a barely-there warm tint, not a flat fill. */}
        <linearGradient id="blushFace" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#fdf1f4" />
          <stop offset="100%" stopColor="#fce4ea" />
        </linearGradient>
      </defs>
    </svg>
  )
}
