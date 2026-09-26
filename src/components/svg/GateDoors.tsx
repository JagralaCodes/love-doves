import { archHeadPath } from './MihrabArch'

type LeafProps = {
  side: 'left' | 'right'
  className?: string
}

/**
 * One leaf of the entrance doors: a carved panel in deep wine with gold
 * girih inlay, a ring pull on the inner edge, and the half of an ogee arch
 * crowning it.
 *
 * Drawn per leaf rather than as one door so each can be hinged and swung
 * independently in 3D. The arch head keeps its own aspect at the top while
 * the panel body below stretches to whatever height the screen is — the
 * same split ArchFrame uses, for the same reason.
 */
function Leaf({ side, className = '' }: LeafProps) {
  const isLeft = side === 'left'
  // Crop the shared arch head to this side: same geometry, half the viewBox.
  const headViewBox = isLeft ? '0 0 100 150' : '100 0 100 150'

  return (
    <div className={`relative flex h-full flex-col overflow-hidden ${className}`}>
      {/* arch head */}
      <svg
        viewBox={headViewBox}
        preserveAspectRatio="none"
        className="block w-full shrink-0"
        style={{ aspectRatio: '100 / 150' }}
        aria-hidden="true"
      >
        <path
          d={`${archHeadPath('ogee')} L186 150 L14 150 Z`}
          fill="url(#doorFace)"
        />
        <path
          d={archHeadPath('ogee')}
          fill="none"
          stroke="url(#goldFoil)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* inset echo of the arch, like a carved reveal */}
        <g transform="translate(100 150) scale(0.82 0.78) translate(-100 -150)">
          <path
            d={archHeadPath('ogee')}
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="1"
            opacity="0.6"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      {/* panel body */}
      <div className="relative min-h-0 flex-1">
        <svg
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <rect x="0" y="0" width="100" height="200" fill="url(#doorFace)" />

          {/* outer stile */}
          <rect
            x={isLeft ? 5 : 1}
            y="0"
            width="94"
            height="196"
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />

          {/* One carved panel low on each leaf, leaving the upper half
              clear for the seal and the invitation copy. */}
          <g>
            <rect
              x={isLeft ? 16 : 12}
              y="104"
              width="72"
              height="80"
              fill="none"
              stroke="url(#goldFoil)"
              strokeWidth="1"
              opacity="0.75"
              vectorEffect="non-scaling-stroke"
            />
            <g transform={`translate(${isLeft ? 52 : 48} 144) scale(0.3)`} opacity="0.8">
              <polygon
                points="0,-100 19,-46 73,-73 46,-19 100,0 46,19 73,73 19,46 0,100 -19,46 -73,73 -46,19 -100,0 -46,-19 -73,-73 -19,-46"
                fill="none"
                stroke="url(#goldFoil)"
                strokeWidth="7"
              />
            </g>
          </g>
        </svg>

        {/* ring pull, on the meeting edge */}
        <svg
          viewBox="0 0 40 60"
          className="absolute top-[62%] w-[12%]"
          style={isLeft ? { right: '4%' } : { left: '4%' }}
          aria-hidden="true"
        >
          <circle cx="20" cy="14" r="5" fill="url(#goldFoil)" />
          <circle
            cx="20"
            cy="34"
            r="13"
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="4"
          />
        </svg>
      </div>
    </div>
  )
}

export function GateDoorLeaf(props: LeafProps) {
  return <Leaf {...props} />
}

/** The gradient the door faces are painted with. */
export function DoorDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="doorFace" x1="0" y1="0" x2="1" y2="0.8">
          <stop offset="0%" stopColor="#6d1a2f" />
          <stop offset="38%" stopColor="#8a2741" />
          <stop offset="72%" stopColor="#6b1930" />
          <stop offset="100%" stopColor="#4a0e1f" />
        </linearGradient>
      </defs>
    </svg>
  )
}
