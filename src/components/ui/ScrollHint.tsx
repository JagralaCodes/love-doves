import { useReducedMotion } from '../../hooks/useReducedMotion'

type Props = {
  label?: string
  className?: string
}

/** A quiet cue that there is more below. Decorative, but labelled. */
export function ScrollHint({ label = 'Scroll', className = '' }: Props) {
  const reduced = useReducedMotion()

  return (
    <div
      className={`flex flex-col items-center gap-2 ${className}`}
      style={
        reduced ? undefined : { animation: 'float-soft 2.8s ease-in-out infinite' }
      }
    >
      <span className="text-2xs tracking-[0.4em] text-wine-soft/70 uppercase">
        {label}
      </span>
      <svg
        viewBox="0 0 24 34"
        className="w-3.5"
        role="presentation"
        aria-hidden="true"
      >
        <path
          d="M12 2 V26"
          stroke="var(--color-gold)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M5 20 L12 27.5 L19 20"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
