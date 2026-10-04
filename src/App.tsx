import { useState } from 'react'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useScrollLock } from './hooks/useScrollLock'

import { SvgDefs } from './components/svg/SvgDefs'

import { SparkleLayer } from './components/ui/SparkleLayer'
import { Gate } from './components/sections/Gate'
import { Hero } from './components/sections/Hero'
import { QuranVerse } from './components/sections/QuranVerse'
import { Families } from './components/sections/Families'
import { SaveTheDate } from './components/sections/SaveTheDate'
import { Events } from './components/sections/Events'
import { Venue } from './components/sections/Venue'
import { Rsvp } from './components/sections/Rsvp'
import { Closing } from './components/sections/Closing'
import { Countdown } from './components/sections/Countdown'

export default function App() {
  const lenisRef = useSmoothScroll()
  const [opened, setOpened] = useState(false)

  // Hold the viewer on the gate until they open it.
  useScrollLock(!opened, lenisRef)

  return (
    <>
      <SvgDefs />
      <SparkleLayer />

      {!opened && <Gate onOpened={() => setOpened(true)} />}

      <main>
        <Hero active={opened} />

        <QuranVerse />

        <Families />

        <SaveTheDate />

        <Events />

        <Venue />

        <Rsvp />

        <Closing />

        {/* Last on purpose: the invitation closes on "see you soon". */}
        <Countdown />
      </main>
    </>
  )
}
