import { lazy, Suspense } from 'react'
import { useSmoothScroll } from '../hooks/useSmoothScroll'
import { useScrollLock } from '../hooks/useScrollLock'
import { useScrollRefresh } from '../hooks/useScrollRefresh'
import { useOffscreenSections } from '../hooks/useOffscreenSections'

import { SparkleLayer } from './ui/SparkleLayer'
import { ScrollThread } from './ui/ScrollThread'
import { Hero } from './sections/Hero'
import { QuranVerse } from './sections/QuranVerse'
import { Families } from './sections/Families'

// Save the Date onwards, as a third chunk — see BelowFold.
const BelowFold = lazy(() => import('./BelowFold'))

type Props = {
  /** The doors have begun to swing: the hero plays in. */
  opened: boolean
  /** The gate has gone: the page may scroll. */
  gateGone: boolean
}

/**
 * The page behind the gate — the hero, the verse, the families — and the
 * things that serve the whole page: smooth scrolling, the scroll lock, the
 * progress thread, the sparkle canvas.
 *
 * Its own chunk, requested the moment the gate has painted. The first
 * bundle is then React and the gate alone, so the doors are on screen and
 * tappable as early as the phone allows; GSAP, Lenis and three sections of
 * ornament arrive a moment later, behind the closed doors, where nobody is
 * waiting for them.
 */
export default function AboveFold({ opened, gateGone }: Props) {
  const lenisRef = useSmoothScroll()
  // Hold the viewer on the gate until it has gone.
  useScrollLock(!gateGone, lenisRef)
  // Re-measure scroll triggers when the page grows — including when the
  // lazy sections arrive.
  useScrollRefresh()
  // CSS animations pause in sections nobody can see, and in a hidden tab.
  useOffscreenSections()

  return (
    <>
      <SparkleLayer />
      <ScrollThread visible={opened} />

      <main>
        <Hero active={opened} />

        <QuranVerse />

        <Families />

        {/* Requested only once the doors begin to open: until then nothing
            below the hero can be seen, and the chunk's download and parse
            would only compete with the gate. The fallback holds a screen
            of space while it lands, so the page never ends abruptly. */}
        {opened && (
          <Suspense fallback={<section className="min-h-svh bg-pearl-white" aria-busy="true" />}>
            <BelowFold />
          </Suspense>
        )}
      </main>
    </>
  )
}
