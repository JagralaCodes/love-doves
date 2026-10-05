import { useEffect, useRef } from 'react'
import { useCountdown } from '../../hooks/useCountdown'
import { useReveal } from '../../hooks/useReveal'
import { useLang, langAttrs } from '../../hooks/useLang'
import { useReducedMotion } from '../../hooks/useReducedMotion'

import { GeometricPattern } from '../svg/GeometricPattern'
import { Crescent, Heart } from '../svg/Ornaments'
import { SparkleField } from '../ui/SparkleField'
import { PearlBokeh } from '../ui/PearlBokeh'
import { RollingNumber } from '../ui/RollingNumber'
import { GoldGlitterText } from '../ui/GoldGlitterText'
import { HeartConfetti } from '../ui/HeartConfetti'

import { wedding } from '../../config/wedding.config'
import { cell } from '../../lib/countdown'
import { sparkleBurstFrom } from '../../lib/sparkleBus'

/**
 * The ONE countdown on the site, and the last thing on the page — so the
 * invitation closes on "see you soon" rather than on a form.
 *
 * A night sky: wine-deep, a crescent, slow stars, the girih drifting. The
 * digits roll like a mechanical counter instead of swapping. When the day
 * arrives the clock gives way to "Alhamdulillah, the day is here" and a
 * burst of hearts.
 */
export function Countdown() {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const reduced = useReducedMotion()
  const left = useCountdown(wedding.countdownTarget)
  const ref = useReveal<HTMLDivElement>({ variant: 'stagger-up', children: '[data-unit]', stagger: 0.12 })
  const doneRef = useRef<HTMLDivElement>(null)
  const firedRef = useRef(false)

  // One celebration when the clock reaches zero while someone is watching.
  useEffect(() => {
    if (!left.done || firedRef.current) return
    firedRef.current = true
    sparkleBurstFrom(doneRef.current, { count: 60, tone: 'mixed', power: 300 })
  }, [left.done])

  const units: [string, string][] = [
    [ur ? wedding.urdu.days : wedding.texts.days, cell(left.days)],
    [ur ? wedding.urdu.hours : wedding.texts.hours, cell(left.hours)],
    [ur ? wedding.urdu.minutes : wedding.texts.minutes, cell(left.minutes)],
    [ur ? wedding.urdu.seconds : wedding.texts.seconds, cell(left.seconds)],
  ]

  return (
    <section
      className="relative overflow-hidden bg-wine-deep px-[var(--page-gutter)] py-[var(--section-gap)]"
      // Night after the closing's dusk: the same wine at the top, so the two
      // sections meet without a line, deepening downward toward the dawn
      // glow at the horizon.
      style={{ background: 'linear-gradient(180deg, #5e1227 0%, #45101f 48%, #330a17 100%)' }}
    >
      <GeometricPattern scale={112} opacity={0.07} color="#d4af37" />
      <SparkleField count={18} tone="white" />
      <PearlBokeh count={3} tone="dark" />

      {/* A soft dawn at the horizon, so the sky is not one flat colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(155,44,74,0.55) 0%, rgba(94,18,39,0) 70%)',
        }}
      />

      <div className="relative z-10 text-center">
        <Crescent className="mx-auto w-12" />

        <h2
          className={`text-2xs mt-6 tracking-[0.35em] text-gold-light/85 ${ur ? 'font-urdu' : 'uppercase'}`}
          lang={t.lang}
          dir={t.dir}
        >
          {ur ? wedding.urdu.countdownHeading : wedding.texts.countdownHeading}
        </h2>

        {left.done ? (
          <div ref={doneRef} className="relative mt-8">
            {!reduced && (
              <div className="pointer-events-none absolute -inset-x-10 -inset-y-16">
                <HeartConfetti count={48} />
              </div>
            )}
            <GoldGlitterText
              block
              as="p"
              tone="dark"
              className={`${ur ? 'font-urdu text-fluid-2xl leading-[2.2]' : 'font-display text-fluid-3xl'}`}
              specks={14}
              lang={t.lang}
              dir={t.dir}
            >
              {ur ? wedding.urdu.dayIsHere : wedding.texts.dayIsHere}
            </GoldGlitterText>
          </div>
        ) : (
          <>
            <div
              ref={ref}
              className="mx-auto mt-7 grid max-w-[22rem] grid-cols-4 gap-2"
              role="timer"
              aria-live="off"
              aria-label={`${left.days} ${wedding.texts.days}, ${left.hours} ${wedding.texts.hours}, ${left.minutes} ${wedding.texts.minutes}`}
            >
              {units.map(([label, value]) => (
                <div
                  key={label}
                  data-unit
                  className="rounded-[1rem] border border-gold/25 bg-white/[0.04] px-1 pt-3 pb-2.5 backdrop-blur-[2px]"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(245,225,164,0.12)' }}
                >
                  <RollingNumber
                    value={value}
                    className="font-display text-fluid-3xl text-gold-light"
                  />
                  <span
                    className={`text-2xs mt-1.5 block tracking-[0.25em] text-rose-pink/80 ${ur ? 'font-urdu' : 'uppercase'}`}
                    lang={t.lang}
                    dir={t.dir}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <span className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-8 bg-gold/40" />
              <Heart className="w-2.5" />
              <span className="h-px w-8 bg-gold/40" />
            </span>

            <p
              className={`text-2xs mt-3 tracking-[0.3em] text-blush/70 ${ur ? 'font-urdu' : 'uppercase'}`}
              lang={t.lang}
              dir={t.dir}
            >
              {ur ? wedding.urdu.countdownTo : wedding.texts.countdownTo}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
