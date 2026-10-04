import { useState } from 'react'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useScrollLock } from './hooks/useScrollLock'
import { useScrollRefresh } from './hooks/useScrollRefresh'
import { useLang } from './hooks/useLang'

import { SvgDefs } from './components/svg/SvgDefs'

import { SparkleLayer } from './components/ui/SparkleLayer'
import { ScrollThread } from './components/ui/ScrollThread'
import { AudioToggle } from './components/ui/AudioToggle'
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

import { wedding } from './config/wedding.config'

export default function App() {
  const lenisRef = useSmoothScroll()
  const [opened, setOpened] = useState(false)

  // Hold the viewer on the gate until they open it.
  useScrollLock(!opened, lenisRef)
  useScrollRefresh()
  const lang = useLang()

  return (
    <>
      <SvgDefs />
      <SparkleLayer />
      <ScrollThread visible={opened} />
      <AudioToggle
        src={wedding.audio.src}
        label={lang === 'ur' ? wedding.urdu.audioLabel : wedding.audio.label}
        visible={opened}
      />

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
