import { AnimatePresence, motion } from 'motion/react'
import { useLang } from '../../hooks/useLang'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { wedding } from '../../config/wedding.config'
import { formatDotDate } from '../../lib/date'

type Props = {
  /** Shown once the gate has opened. */
  visible: boolean
}

/** The invitation, as one WhatsApp message with the page's own link. */
function shareUrl(ur: boolean) {
  const names = `${wedding.bride.shortName} & ${wedding.groom.shortName}`
  const date = formatDotDate(wedding.events[0].date)
  const t = ur ? wedding.urdu : wedding.texts
  const text = `${t.shareBefore} ${names} — ${date}. ${t.shareAfter} ${window.location.href}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/**
 * A small floating WhatsApp button, bottom-right, inside the safe area.
 * Opens a prefilled message with a short invite line and this page's URL.
 */
export function ShareButton({ visible }: Props) {
  const ur = useLang() === 'ur'
  const reduced = useReducedMotion()
  const label = ur ? wedding.urdu.share : wedding.texts.share

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-none fixed inset-y-0 left-1/2 z-[60] w-full max-w-[var(--app-max)] -translate-x-1/2">
          <motion.a
            href={shareUrl(ur)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="pointer-events-auto absolute right-3 bottom-[max(0.75rem,var(--safe-bottom))] grid size-[var(--tap-min)] place-items-center rounded-full border border-gold/35 bg-wine-deep/80 text-gold-light shadow-[0_6px_16px_-8px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={reduced ? undefined : { scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 1.6 }}
          >
            {/* A speech bubble with a handset: the WhatsApp mark, in gold. */}
            <svg viewBox="0 0 24 24" className="w-5" aria-hidden="true">
              <path
                d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.6 21.4l4.7-1.2A9.5 9.5 0 1 0 12 2.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9.1 7.6c-.3-.6-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.8 5 2.9 1.1 3.5.9 4.1.8.6-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.7-.4l-2.3-1.1c-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1 1.3-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2.1-.4 0-.6l-1-2.5Z"
                fill="currentColor"
              />
            </svg>
          </motion.a>
        </div>
      )}
    </AnimatePresence>
  )
}
