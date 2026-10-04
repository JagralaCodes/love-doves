import { useState } from 'react'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useScrollLock } from './hooks/useScrollLock'
import { useReveal } from './hooks/useReveal'
import { useLang, langAttrs } from './hooks/useLang'

import { SvgDefs } from './components/svg/SvgDefs'
import { GeometricPattern } from './components/svg/GeometricPattern'
import { Lantern } from './components/svg/Lantern'
import { Monogram } from './components/svg/Monogram'
import { FloralVine, DomeIcon } from './components/svg/Ornaments'

import { GoldGlitterText } from './components/ui/GoldGlitterText'
import { SparkleField } from './components/ui/SparkleField'
import { PearlBokeh } from './components/ui/PearlBokeh'
import { ShimmerDust } from './components/ui/ShimmerDust'
import { SparkleLayer } from './components/ui/SparkleLayer'
import { Gate } from './components/sections/Gate'
import { Hero } from './components/sections/Hero'
import { QuranVerse } from './components/sections/QuranVerse'
import { Families } from './components/sections/Families'
import { SaveTheDate } from './components/sections/SaveTheDate'
import { Events } from './components/sections/Events'

import { wedding } from './config/wedding.config'

export default function App() {
  const lenisRef = useSmoothScroll()
  const [opened, setOpened] = useState(false)

  // Hold the viewer on the gate until they open it.
  useScrollLock(!opened, lenisRef)
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  const venueRef = useReveal<HTMLDivElement>({ variant: 'slide-left' })

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

        {/* ═══════════════ VENUE ═══════════════ */}
        <section className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]">
          <SparkleField count={6} tone="gold" />
          <div ref={venueRef} className="relative z-10 text-center">
            <DomeIcon className="mx-auto w-24" title="Masjid dome and minarets" />
            <p
              className={`text-2xs mt-6 tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
              lang={t.lang}
              dir={t.dir}
            >
              {ur ? wedding.urdu.venueHeading : wedding.texts.venueHeading}
            </p>
            <p className="mt-2 font-display text-fluid-xl text-wine">
              {wedding.events[0].venue}
            </p>
            <p className="text-fluid-sm mt-1 text-wine-soft">
              {wedding.events[0].address}
            </p>
          </div>
        </section>

        {/* ═══════════════ CLOSING ═══════════════ */}
        <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-wine-deep px-[var(--page-gutter)] py-[var(--section-gap)]">
          <GeometricPattern scale={112} opacity={0.08} color="#d4af37" />
          <ShimmerDust density={58} tone="gold" />
          <SparkleField count={13} tone="gold" />
          <PearlBokeh count={4} tone="dark" />

          <Lantern
            className="absolute top-6 left-7 z-10"
            width="1.9rem"
            cord={20}
            swayDuration={6.8}
          />
          <Lantern
            className="absolute top-10 right-8 z-10"
            width="1.5rem"
            cord={16}
            swayDuration={5.6}
            swayDelay={-2.4}
          />

          <div className="relative z-10 text-center">
            <Monogram
              initials={wedding.monogram}
              className="mx-auto w-24"
              variant="cartouche"
            />

            <p
              lang="ar"
              dir="rtl"
              className="mt-8 font-arabic text-fluid-lg leading-[2] text-rose-pink"
            >
              {wedding.texts.closingDuaArabic}
            </p>

            <FloralVine className="mx-auto my-6 w-48" />

            <p
              className={`text-fluid-sm text-blush/85 ${ur ? t.className : 'italic'}`}
              lang={t.lang}
              dir={t.dir}
            >
              {ur ? wedding.urdu.closingDuaMeaning : wedding.texts.closingDuaMeaning}
            </p>

            <GoldGlitterText
              block
              as="p"
              tone="dark"
              className={`mt-9 ${ur ? 'font-urdu text-fluid-xl leading-[2.4]' : 'font-display text-fluid-2xl'}`}
              specks={12}
            >
              {ur ? wedding.urdu.thankYou : wedding.texts.thankYou}
            </GoldGlitterText>
          </div>
        </section>
      </main>
    </>
  )
}
