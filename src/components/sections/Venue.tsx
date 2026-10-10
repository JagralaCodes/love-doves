import { seam } from '../../lib/seam'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { SparkleField } from '../ui/SparkleField'
import { Envelope } from '../ui/Envelope'
import { Letter } from '../ui/Letter'
import { JourneyLine } from '../ui/JourneyLine'

import { wedding } from '../../config/wedding.config'

/**
 * Where to find us: a letter sealed in an envelope, and under it a short
 * journey line from the first venue to the second.
 *
 * Peel the heart and the letter rises out with both venues on it — each
 * with directions and a copyable address. The envelope stays, tucked
 * behind the letter as a pocket.
 */
export function Venue() {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  return (
    <section
      data-thread="Venue"
      className="relative overflow-hidden bg-blush-soft px-[var(--page-gutter)] py-[var(--section-gap)]"
      style={seam('var(--color-pearl-white)', 'var(--color-blush-soft)')}
    >
      <GeometricPattern scale={96} opacity={0.045} />
      <SparkleField count={7} tone="gold" />

      <h2
        className={`text-2xs relative z-10 text-center tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? wedding.urdu.venueHeading : wedding.texts.venueHeading}
      </h2>

      <div className="relative z-10 mt-7">
        <Envelope
          initials={wedding.monogram}
          prompt={ur ? wedding.urdu.swipeUp : wedding.texts.swipeUp}
          openLabel={ur ? wedding.urdu.envelopePrompt : wedding.texts.envelopePrompt}
          lang={t.lang}
          dir={t.dir}
        >
          <Letter />
        </Envelope>
      </div>

      <div className="relative z-10">
        <JourneyLine />
      </div>
    </section>
  )
}
