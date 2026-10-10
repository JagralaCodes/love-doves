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

/** Very low: it is an atmosphere behind the page, not a track. */
const VOLUME = 0.12

/**
 * Optional ambience behind a small glowing fanoos, top-right.
 *
 * - Off by default, every visit. Sound never starts without a tap.
 * - The audio file is not fetched until that tap: on mount only a HEAD
 *   request checks the file exists, so with nothing in public/audio the
 *   button does not exist, and dropping a file in makes it appear.
 * - Pauses while the tab is hidden; fades rather than cuts.
 * - The lit glow is a layer whose opacity changes — no shadow animation.
 */
export function AudioToggle({ src, label, visible }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [available, setAvailable] = useState(false)
  const [on, setOn] = useState(false)
  const reduced = useReducedMotion()

  // Is there a file at all? One cheap request, no media loaded.
  useEffect(() => {
    let alive = true
    fetch(src, { method: 'HEAD' })
      .then((r) => {
        if (alive && r.ok && (r.headers.get('content-type') ?? '').startsWith('audio')) setAvailable(true)
      })
      .catch(() => {})
    return () => {
      alive = false
      const audio = audioRef.current
      if (audio) {
        gsap.killTweensOf(audio)
        audio.pause()
        audio.removeAttribute('src')
        audio.load()
        audioRef.current = null
      }
    }
  }, [src])

  const fadeTo = useCallback((target: number, then?: () => void) => {
    const audio = audioRef.current
    if (!audio) return
    gsap.killTweensOf(audio)
    gsap.to(audio, { volume: target, duration: target ? 1.6 : 0.6, ease: 'sine.inOut', onComplete: then })
  }, [])

  const start = useCallback(() => {
    // Created on first use, inside the tap, so the file loads only now.
    let audio = audioRef.current
    if (!audio) {
      audio = new Audio(src)
      audio.loop = true
      audio.preload = 'auto'
      audio.volume = 0
      audioRef.current = audio
    }
    audio
      .play()
      .then(() => fadeTo(VOLUME))
      .catch(() => setOn(false))
    // Keep it under the page: the file is mastered quiet, and the fade
    // never takes it past VOLUME.
  }, [src, fadeTo])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    fadeTo(0, () => audio.pause())
  }, [fadeTo])

  // Quiet while the tab is in the background.
  useEffect(() => {
    if (!on) return
    const onVis = () => {
      const audio = audioRef.current
      if (!audio) return
      if (document.hidden) audio.pause()
      else start()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [on, start])

  const toggle = () => {
    const next = !on
    setOn(next)
    if (next) start()
    else stop()
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
            className="pointer-events-auto absolute top-[max(0.75rem,var(--safe-top))] right-3 grid size-[var(--tap-min)] place-items-center rounded-full border border-gold/35 bg-wine-deep/70 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: on ? 1 : 0.72, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={reduced ? undefined : { scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500"
              style={{
                boxShadow: '0 0 0 1px rgba(245,225,164,0.25), 0 0 22px 2px rgba(245,225,164,0.45)',
                opacity: on ? 1 : 0,
              }}
            />
            <Lantern width="0.95rem" cord={0} lit={on} swayDuration={on && !reduced ? 3.4 : 0} />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  )
}
