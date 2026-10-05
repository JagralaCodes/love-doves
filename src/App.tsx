import { lazy, Suspense, useState } from 'react'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useScrollLock } from './hooks/useScrollLock'
import { useScrollRefresh } from './hooks/useScrollRefresh'

import { SvgDefs } from './components/svg/SvgDefs'

import { SparkleLayer } from './components/ui/SparkleLayer'
import { ScrollThread } from './components/ui/ScrollThread'
import { Gate } from './components/sections/Gate'
import { Hero } from './components/sections/Hero'
import { QuranVerse } from './components/sections/QuranVerse'
import { Families } from './components/sections/Families'

// Save the Date onwards, in its own chunk — see BelowFold.
const BelowFold = lazy(() => import('./components/BelowFold'))

export default function App() {
  const lenisRef = useSmoothScroll()
  const [opened, setOpened] = useState(false)

  // Hold the viewer on the gate until they open it.
  useScrollLock(!opened, lenisRef)
  // Re-measure scroll triggers when the page grows — including when the
  // lazy sections arrive.
  useScrollRefresh()

  return (
    <>
      <SvgDefs />
      <SparkleLayer />
      <ScrollThread visible={opened} />

      {!opened && <Gate onOpened={() => setOpened(true)} />}

      <main>
        <Hero active={opened} />

        <QuranVerse />

        <Families />

        {/* Holds a screen of space while the chunk lands, so the page never
            ends abruptly under a fast scroller. */}
        <Suspense fallback={<section className="min-h-svh bg-pearl-white" aria-busy="true" />}>
          <BelowFold opened={opened} />
        </Suspense>
      </main>
    </>
  )
}
