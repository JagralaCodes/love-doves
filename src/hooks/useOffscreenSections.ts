import { useEffect } from 'react'

/**
 * Pauses every CSS animation that nobody can see.
 *
 * One IntersectionObserver watches every `<section>` under `<main>` — the
 * ones present now and any a lazy chunk adds later — and marks the ones
 * more than ~200px outside the viewport with `is-offscreen`. A stylesheet
 * rule pauses all animations beneath that class. A hidden tab gets
 * `is-hidden` on `<html>` and the same treatment.
 *
 * Canvases pause themselves by the same test; this covers the CSS side,
 * which on this page is the larger half.
 */
export function useOffscreenSections() {
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle('is-offscreen', !e.isIntersecting)
      },
      { rootMargin: '200px 0px' },
    )
    const watch = () => main.querySelectorAll(':scope > section').forEach((s) => io.observe(s))
    watch()
    // Sections arriving later (the lazy below-the-fold chunk).
    const mo = new MutationObserver(watch)
    mo.observe(main, { childList: true })

    const root = document.documentElement
    const onVisibility = () => root.classList.toggle('is-hidden', document.visibilityState === 'hidden')
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      root.classList.remove('is-hidden')
    }
  }, [])
}
