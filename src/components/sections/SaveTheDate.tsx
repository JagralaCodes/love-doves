import { useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { Heart } from '../svg/Ornaments'
import { archClosedPath } from '../svg/MihrabArch'
import { SparkleField } from '../ui/SparkleField'
import { ScratchCard } from '../ui/ScratchCard'
import { HeartConfetti } from '../ui/HeartConfetti'
import { GoldGlitterText } from '../ui/GoldGlitterText'

import { wedding } from '../../config/wedding.config'
import { splitDate } from '../../lib/date'

/** The foil's silhouette, in the arch's own 200 x 260 coordinate space. */
const ARCH = { d: archClosedPath('ogee'), width: 200, height: 260 }

/**
 * Save the Date, hidden under a sheet of gold foil cut to an ogee arch.
 *
 * The foil IS the arch. It used to be a rounded rectangle sitting inside
 * an arch frame, which read as a sticker stuck onto the invitation rather
 * than as part of it — so the sheet now takes the arch's own outline and
 * the frame is what is left behind once the gold is scratched away.
 */
export function SaveTheDate() {
  const [revealed, setRevealed] = useState(false)
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  const ref = useReveal<HTMLDivElement>({ variant: 'scale-in' })
  const main = splitDate(wedding.events[0].date)

  return (
    <section className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]">
      <GeometricPattern scale={104} opacity={0.05} />
      <SparkleField count={8} tone="gold" />

      <p
        className={`text-2xs relative z-10 text-center tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? wedding.urdu.scratchPrompt : wedding.texts.scratchPrompt}
      </p>

      <div ref={ref} className="relative z-10 mx-auto mt-7 max-w-[17rem]">
        <ScratchCard
          shape={ARCH}
          className="w-full"
          threshold={0.55}
          brush={24}
          onRevealed={() => setRevealed(true)}
          revealLabel={ur ? wedding.urdu.tapToReveal : wedding.texts.tapToReveal}
        >
          {/* What the foil is hiding: the arch itself, with the date set
              into its lower, straight-sided portion. */}
          <div className="relative" style={{ aspectRatio: '200 / 260' }}>
            <svg
              viewBox="0 0 200 260"
              className="absolute inset-0 size-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d={ARCH.d} fill="url(#archFaceTop)" />
              <path
                d={ARCH.d}
                fill="none"
                stroke="url(#goldFoil)"
                strokeWidth="2"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="absolute inset-x-0 bottom-0 flex h-[62%] flex-col items-center justify-center px-7 text-center">
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
                className="nums-lining mt-1 font-display text-fluid-5xl leading-none"
                specks={12}
              >
                {main.day}
              </GoldGlitterText>

              <p className="font-display text-fluid-lg tracking-[0.2em] text-wine uppercase">
                {main.month}
              </p>

              <span className="my-2 flex items-center justify-center gap-2" aria-hidden="true">
                <span className="h-px w-6 bg-gold/45" />
                <Heart className="w-2.5" />
                <span className="h-px w-6 bg-gold/45" />
              </span>

              <p className="nums-lining text-2xs tracking-[0.2em] text-wine-soft">
                {main.weekday} · {main.year}
              </p>
            </div>
          </div>
        </ScratchCard>

        {/* Fires once, on mount — so it plays exactly when the foil goes. */}
        {revealed && (
          <div className="pointer-events-none absolute -inset-x-16 -inset-y-10 z-20">
            <HeartConfetti count={60} />
          </div>
        )}
      </div>
    </section>
  )
}
