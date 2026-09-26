import { useState } from 'react'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useScrollLock } from './hooks/useScrollLock'
import { useReveal } from './hooks/useReveal'
import { useLang, langAttrs } from './hooks/useLang'

import { SvgDefs } from './components/svg/SvgDefs'
import { GeometricPattern } from './components/svg/GeometricPattern'
import { Lantern } from './components/svg/Lantern'
import { Monogram } from './components/svg/Monogram'
import { EightStar, FloralVine, DomeIcon } from './components/svg/Ornaments'

import { GoldGlitterText } from './components/ui/GoldGlitterText'
import { SparkleField } from './components/ui/SparkleField'
import { PearlBokeh } from './components/ui/PearlBokeh'
import { ShimmerDust } from './components/ui/ShimmerDust'
import { SparkleLayer } from './components/ui/SparkleLayer'
import { OrnateFrame } from './components/ui/OrnateFrame'
import { ArchPanel } from './components/ui/ArchPanel'
import { LanguageToggle } from './components/ui/LanguageToggle'
import { Gate } from './components/sections/Gate'
import { Hero } from './components/sections/Hero'
import { QuranVerse } from './components/sections/QuranVerse'
import { Families } from './components/sections/Families'

import { wedding } from './config/wedding.config'
import { formatFullDate, formatTime, splitDate } from './lib/date'

export default function App() {
  const lenisRef = useSmoothScroll()
  const [opened, setOpened] = useState(false)

  // Hold the viewer on the gate until they open it.
  useScrollLock(!opened, lenisRef)
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  const dateRef = useReveal<HTMLDivElement>({ variant: 'scale-in' })
  const eventsRef = useReveal<HTMLDivElement>({
    variant: 'stagger-up',
    children: '[data-card]',
    stagger: 0.16,
  })
  const venueRef = useReveal<HTMLDivElement>({ variant: 'slide-left' })

  const main = splitDate(wedding.events[0].date)
  const eventName = (n: string) => (ur ? (wedding.urdu.events[n] ?? n) : n)

  return (
    <>
      <SvgDefs />
      <SparkleLayer />

      {!opened && <Gate onOpened={() => setOpened(true)} />}

      <LanguageToggle className="fixed top-3 right-3 z-[60]" />

      <main>
        <Hero active={opened} />

        <QuranVerse />

        <Families />

        {/* ═══════════════ SAVE THE DATE ═══════════════ */}
        <section className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]">
          <GeometricPattern scale={104} opacity={0.05} />
          <SparkleField count={8} tone="gold" />

          <div ref={dateRef} className="relative z-10 mx-auto max-w-[17rem]">
            <ArchPanel variant="ogee">
              <p
                className={`text-2xs tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
                lang={t.lang}
                dir={t.dir}
              >
                {ur ? wedding.urdu.saveTheDate : wedding.texts.saveTheDate}
              </p>
              <GoldGlitterText
                block
                as="p"
                className="nums-lining mt-2 font-display text-fluid-5xl leading-none"
                specks={12}
              >
                {main.day}
              </GoldGlitterText>
              <p className="font-display text-fluid-lg tracking-[0.2em] text-wine uppercase">
                {main.month}
              </p>
              <p className="nums-lining text-2xs mt-1 tracking-[0.2em] text-wine-soft">
                {main.weekday} · {main.year}
              </p>
            </ArchPanel>
          </div>
        </section>

        {/* ═══════════════ EVENTS ═══════════════ */}
        <section className="relative overflow-hidden bg-blush-soft px-[var(--page-gutter)] py-[var(--section-gap)]">
          <GeometricPattern scale={96} opacity={0.05} />

          <div ref={eventsRef} className="relative z-10 space-y-9">
            {wedding.events.map((e) => (
              <div data-card key={e.name}>
                <OrnateFrame tone="plain">
                  <p
                    className={`text-center text-wine ${ur ? 'font-urdu text-fluid-2xl leading-[2]' : 'font-display text-fluid-2xl'}`}
                    lang={t.lang}
                    dir={t.dir}
                  >
                    {eventName(e.name)}
                  </p>

                  <span className="my-3 flex items-center justify-center">
                    <EightStar className="w-3" />
                  </span>

                  <p className="nums-lining text-center font-display text-fluid-lg text-wine-deep">
                    {formatFullDate(e.date)}
                  </p>
                  <p className="nums-lining text-2xs text-center tracking-[0.2em] text-wine-soft">
                    {formatTime(e.time)}
                  </p>

                  <p className="mt-4 text-center font-display text-fluid-lg text-wine">
                    {e.venue}
                  </p>

                  <button
                    type="button"
                    className="text-2xs mt-5 w-full rounded-full bg-wine px-6 tracking-[0.2em] text-pearl-white uppercase transition-transform duration-300 active:scale-[0.98]"
                  >
                    Open in Maps
                  </button>
                </OrnateFrame>
              </div>
            ))}
          </div>
        </section>

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
