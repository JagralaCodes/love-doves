import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { useLang, langAttrs } from '../../hooks/useLang'
import { useReducedMotion } from '../../hooks/useReducedMotion'

import { GeometricPattern } from '../svg/GeometricPattern'
import { DomeIcon, Heart } from '../svg/Ornaments'
import { SparkleField } from '../ui/SparkleField'
import { Envelope } from '../ui/Envelope'
import { TapLink } from '../ui/Tappable'
import { Seam } from '../ui/Seam'

import { wedding } from '../../config/wedding.config'

/**
 * The gold route: a gentle S from under the card down to the masjid.
 * In a 200 x 220 box; drawn on by scroll once the envelope is open.
 */
const ROUTE = 'M100 0 C100 40, 40 60, 52 100 C64 140, 150 150, 136 190 C130 206, 112 214, 100 220'

/**
 * Where to find us, sealed in an envelope.
 *
 * Open it (tap the wax heart, or pull the card up) and the venues are on
 * the card. Then, as the viewer scrolls on, a dotted gold path draws
 * itself from the card down to the masjid — the destination revealed at
 * the end of a route rather than printed as an address.
 */
export function Venue() {
  const sectionRef = useRef<HTMLElement>(null)
  const [opened, setOpened] = useState(false)
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const reduced = useReducedMotion()

  // The route draws only after the envelope is open, so it is not a line
  // leading away from a sealed envelope.
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !opened) return

    const ctx = gsap.context(() => {
      const path = section.querySelector<SVGPathElement>('[data-route]')
      const dome = section.querySelector('[data-dome]')
      if (!path) return

      if (reduced) {
        gsap.set([path, dome], { autoAlpha: 1 })
        return
      }

      gsap.set(path, { drawSVG: '0%', autoAlpha: 1 })
      gsap.set(dome, { autoAlpha: 0, y: 14, scale: 0.9 })

      gsap
        .timeline({
          scrollTrigger: {
            trigger: '[data-route-wrap]',
            start: 'top 85%',
            end: 'bottom 60%',
            scrub: 0.7,
          },
        })
        .to(path, { drawSVG: '100%', ease: 'none' })
        // The masjid rises to meet the road as it arrives.
        .to(dome, { autoAlpha: 1, y: 0, scale: 1, ease: 'power2.out', duration: 0.35 }, '-=0.3')
    }, section)

    return () => ctx.revert()
  }, [opened, reduced])

  const heading = ur ? wedding.urdu.venueHeading : wedding.texts.venueHeading

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-blush-soft px-[var(--page-gutter)] py-[var(--section-gap)]"
    >
      <GeometricPattern scale={96} opacity={0.045} />
      <Seam from="var(--color-pearl-white)" />
      <SparkleField count={7} tone="gold" />

      <h2
        className={`text-2xs relative z-10 text-center tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {heading}
      </h2>

      <div className="relative z-10 mt-7">
        <Envelope
          initials={wedding.monogram}
          prompt={ur ? wedding.urdu.swipeUp : wedding.texts.swipeUp}
          openLabel={ur ? wedding.urdu.envelopePrompt : wedding.texts.envelopePrompt}
          onOpened={() => setOpened(true)}
        >
          <div className="px-5 py-4 text-center">
            {wedding.events.map((e, i) => (
              <div key={e.name} className={i > 0 ? 'mt-3 border-t border-gold/25 pt-3' : ''}>
                <p
                  className={`text-2xs tracking-[0.3em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
                  lang={t.lang}
                  dir={t.dir}
                >
                  {ur ? (wedding.urdu.events[e.name] ?? e.name) : e.name}
                </p>
                <p className="mt-0.5 font-display text-fluid-lg leading-tight text-wine">{e.venue}</p>
                <p className="text-2xs mt-1 leading-relaxed text-wine-soft">{e.address}</p>
                <TapLink
                  href={e.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-grow text-2xs mt-1.5 inline-flex items-center gap-1.5 tracking-[0.2em] text-wine uppercase"
                >
                  <span>{ur ? wedding.urdu.viewOnMap : wedding.texts.viewOnMap}</span>
                  <svg viewBox="0 0 12 12" className="w-2.5" aria-hidden="true">
                    <path d="M2 10 L10 2 M4.5 2 L10 2 L10 7.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="sr-only">{` — ${e.venue} (opens in a new tab)`}</span>
                </TapLink>
              </div>
            ))}
          </div>
        </Envelope>
      </div>

      {/* The road to the masjid. Present from the start so the layout is
          stable; invisible until the envelope opens. */}
      <div
        data-route-wrap
        className="relative z-10 mx-auto mt-2 w-full max-w-[13rem]"
        style={{ opacity: opened ? 1 : 0, transition: 'opacity 0.5s ease' }}
        aria-hidden={!opened || undefined}
      >
        <svg viewBox="0 0 200 220" className="block w-full" aria-hidden="true">
          <path
            d={ROUTE}
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="1 7"
            opacity="0.3"
          />
          <path
            data-route
            d={ROUTE}
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{ visibility: 'hidden' }}
          />
        </svg>

        <div data-dome className="-mt-2 flex flex-col items-center">
          <DomeIcon className="w-24" title="Masjid dome and minarets" />
          <span className="mt-3 flex items-center gap-2" aria-hidden="true">
            <span className="h-px w-6 bg-gold/45" />
            <Heart className="w-2.5" />
            <span className="h-px w-6 bg-gold/45" />
          </span>
        </div>
      </div>
    </section>
  )
}
