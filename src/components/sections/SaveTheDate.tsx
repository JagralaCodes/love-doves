import { useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { Heart } from '../svg/Ornaments'
import { SparkleField } from '../ui/SparkleField'
import { FallingPetals } from '../ui/FallingPetals'
import { ScratchCard } from '../ui/ScratchCard'
import { ArchPanel } from '../ui/ArchPanel'
import { GoldGlitterText } from '../ui/GoldGlitterText'

import { wedding } from '../../config/wedding.config'
import { splitDate } from '../../lib/date'

/**
 * Save the Date, hidden under a sheet of gold foil inside an ogee arch.
 *
 * The scratch panel is inset within the arch rather than covering it, so
 * the frame stays intact while the foil comes away.
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
      {revealed && <FallingPetals count={14} shape="mixed" />}

      <p
        className={`text-2xs relative z-10 text-center tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? wedding.urdu.scratchPrompt : wedding.texts.scratchPrompt}
      </p>

      <div ref={ref} className="relative z-10 mx-auto mt-7 max-w-[17rem]">
        <ArchPanel variant="ogee">
          {/* The foil covers only the content well inside the arch. */}
          <ScratchCard
            className="w-full shadow-[inset_0_0_0_1px_rgba(166,124,31,0.35)]"
            threshold={0.55}
            brush={24}
            onRevealed={() => setRevealed(true)}
            revealLabel={ur ? wedding.urdu.tapToReveal : wedding.texts.tapToReveal}
          >
            <div className="px-2 py-3">
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
          </ScratchCard>
        </ArchPanel>
      </div>
    </section>
  )
}
