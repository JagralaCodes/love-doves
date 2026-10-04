import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Lantern } from '../svg/Lantern'

type Props = {
  src: string
  label: string
  /** Shown once the gate has opened. */
  visible: boolean
}

const STORE_KEY = 'love-doves:audio'
const VOLUME = 0.35

function readChoice(): boolean {
  try {
    return localStorage.getItem(STORE_KEY) === 'on'
  } catch {
    return false
  }
}

function saveChoice(on: boolean) {
  try {
    localStorage.setItem(STORE_KEY, on ? 'on' : 'off')
  } catch {
    // Private mode or blocked storage: the toggle still works this visit.
  }
}

/**
 * Opt-in ambience behind a small glowing fanoos.
 *
 * - Off by default. Sound never starts without the viewer asking for it.
 * - Renders NOTHING until the audio file has actually loaded its metadata,
 *   so with no file in public/audio the button simply does not exist —
 *   and the moment a file is dropped in, it appears.
 * - Remembers the choice. Browsers forbid starting sound without a gesture,
 *   so a remembered "on" waits for the first tap anywhere (opening the gate
 *   counts) and fades in from there.
 * - Pauses while the tab is hidden; fades rather than cuts.
 */
export function AudioToggle({ src, label, visible }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [available, setAvailable] = useState(false)
  const [on, setOn] = useState(readChoice)
  const reduced = useReducedMotion()

  // Probe the file once.
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.loop = true
    audio.volume = 0
    const ok = () => setAvailable(true)
    audio.addEventListener('loadedmetadata', ok, { once: true })
    audio.src = src
    audioRef.current = audio
    return () => {
      audio.removeEventListener('loadedmetadata', ok)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [src])

  const fadeTo = useCallback((target: number, then?: () => void) => {
    const audio = audioRef.current
    if (!audio) return
    gsap.killTweensOf(audio)
    gsap.to(audio, { volume: target, duration: target ? 1.6 : 0.6, ease: 'sine.inOut', onComplete: then })
  }, [])

  const start = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio
      .play()
      .then(() => fadeTo(VOLUME))
      .catch(() => {
        // Blocked (no gesture yet). The first-gesture listener retries.
      })
  }, [fadeTo])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    fadeTo(0, () => audio.pause())
  }, [fadeTo])

  // Follow the switch.
  useEffect(() => {
    if (!available) return
    if (!on) {
      stop()
      return
    }
    start()
    // A remembered "on" cannot autoplay; begin on the first gesture.
    const onGesture = () => {
      if (audioRef.current?.paused) start()
    }
    window.addEventListener('pointerdown', onGesture, { once: true })
    window.addEventListener('keydown', onGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [on, available, start, stop])

  // Quiet while the tab is in the background.
  useEffect(() => {
    if (!available) return
    const onVis = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) audio.pause()
      else if (on) start()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [on, available, start])

  const toggle = () => {
    const next = !on
    saveChoice(next)
    setOn(next)
  }

  return (
    <AnimatePresence>
      {available && visible && (
        <div className="pointer-events-none fixed inset-y-0 left-1/2 z-[60] w-full max-w-[var(--app-max)] -translate-x-1/2">
          <motion.button
            type="button"
            onClick={toggle}
            aria-pressed={on}
            aria-label={label}
            title={label}
            className="pointer-events-auto absolute right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] grid size-[var(--tap-min)] place-items-center rounded-full border border-gold/35 bg-wine-deep/70 backdrop-blur-sm"
            style={{
              boxShadow: on
                ? '0 0 0 1px rgba(245,225,164,0.25), 0 0 22px 2px rgba(245,225,164,0.45)'
                : '0 6px 16px -8px rgba(0,0,0,0.5)',
              transition: 'box-shadow 0.6s ease',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: on ? 1 : 0.72, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={reduced ? undefined : { scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <Lantern width="0.95rem" cord={0} lit={on} swayDuration={on && !reduced ? 3.4 : 0} />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  )
}
