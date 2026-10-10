import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

type Props = {
  className?: string
}

/**
 * A small gold chevron that bobs to say there is more below, and fades
 * out for good the first time the page moves. Opacity only, so it costs
 * nothing once it has gone.
 */
export function ScrollHint({ className = '' }: Props) {
  const reduced = useReducedMotion()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const hide = () => setGone(true)
    window.addEventListener('scroll', hide, { passive: true, once: true })
    return () => window.removeEventListener('scroll', hide)
  }, [])

  return (
    <span
      className={`block transition-opacity duration-500 ${gone ? 'opacity-0' : 'opacity-100'} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 14"
        className="mx-auto block w-5"
        style={reduced ? undefined : { animation: 'float-soft 2.2s ease-in-out infinite' }}
      >
        <path
          d="M4 3 L12 11 L20 3"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
