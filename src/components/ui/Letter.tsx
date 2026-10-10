import { useMemo } from 'react'
import { useLang, langAttrs } from '../../hooks/useLang'
import { EventIcon } from '../svg/Ornaments'
import { TapLink } from './Tappable'
import { seeded } from '../../lib/seeded'
import { wedding } from '../../config/wedding.config'
import type { WeddingEvent } from '../../config/wedding.config'
import { formatShortDate, formatTimeRange } from '../../lib/date'

/** Google Maps directions to a place, by its name and address. */
function directionsUrl(event: WeddingEvent) {
  const q = encodeURIComponent(`${event.venue}, ${event.address}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`
}

/** "Friday, 13 Nov · After Asr" / "Saturday, 14 Nov · 7 – 10 PM" */
function whenLine(event: WeddingEvent, ur: boolean) {
  const date = formatShortDate(event.date)
  const short = 'timeShort' in event ? event.timeShort : undefined
  if (short) {
    const label = ur ? (wedding.urdu.timeLabels[event.name] ?? short) : short
    return { date, time: label, timeIsUrdu: ur }
  }
  const end = 'endTime' in event ? event.endTime : undefined
  return { date, time: formatTimeRange(event.time, end ?? event.time), timeIsUrdu: false }
}

const actionClass =
  'link-grow text-2xs inline-flex min-h-[var(--tap-min)] items-center gap-1.5 tracking-[0.16em] whitespace-nowrap text-wine'

/** One venue: icon, label, name, address, when, and directions. */
function VenueCard({ event, first }: { event: WeddingEvent; first: boolean }) {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const when = whenLine(event, ur)

  return (
    <div className={`text-center ${first ? '' : 'mt-5 border-t border-gold/30 pt-5'}`}>
      <EventIcon kind={'icon' in event ? event.icon : undefined} className="mx-auto w-12" />

      <p
        className={`text-2xs mt-2 tracking-[0.32em] text-wine-soft ${ur ? 'font-urdu' : 'font-body uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? (wedding.urdu.events[event.name] ?? event.name) : event.name}
      </p>

      <p className="mt-1 font-display text-fluid-xl leading-tight text-wine">
        <bdi lang="en" dir="ltr">
          {event.venue}
        </bdi>
      </p>

      <p className="text-fluid-sm mx-auto mt-1.5 max-w-[16rem] leading-relaxed text-wine-deep/80">
        <bdi lang="en" dir="ltr">
          {event.address}
        </bdi>
      </p>

      {/* One line: the date in English, the time in words or figures. */}
      <p className="nums-lining text-2xs mt-2.5 font-body tracking-[0.2em] text-wine-soft uppercase" dir={t.dir}>
        <bdi lang="en" dir="ltr">
          {when.date}
        </bdi>
        <span aria-hidden="true"> · </span>
        {when.timeIsUrdu ? (
          <span className="font-urdu normal-case tracking-normal" lang="ur" dir="rtl">
            {when.time}
          </span>
        ) : (
          <bdi lang="en" dir="ltr">
            {when.time}
          </bdi>
        )}
      </p>

      <div className="mt-3 flex items-center justify-center">
        <TapLink
          href={directionsUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${actionClass} ${ur ? 'font-urdu' : 'uppercase'}`}
        >
          <span>{ur ? wedding.urdu.getDirections : wedding.texts.getDirections}</span>
          <svg viewBox="0 0 12 12" className="w-2.5" aria-hidden="true">
            <path d="M2 10 L10 2 M4.5 2 L10 2 L10 7.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sr-only">{` — ${event.venue} (opens in a new tab)`}</span>
        </TapLink>
      </div>
    </div>
  )
}

/** A torn, deckled top edge, in the paper's colour. */
function DeckleEdge() {
  const d = useMemo(() => {
    const rnd = seeded('deckle')
    const w = 320
    const steps = 22
    const step = w / steps
    let path = `M0 14 L0 ${8 + rnd() * 3}`
    for (let i = 0; i < steps; i++) {
      const x = i * step
      path += ` Q${(x + step / 2).toFixed(1)} ${(2 + rnd() * 5).toFixed(1)} ${(x + step).toFixed(1)} ${(6 + rnd() * 5).toFixed(1)}`
    }
    return path + ` L${w} 14 Z`
  }, [])
  return (
    <svg viewBox="0 0 320 14" preserveAspectRatio="none" className="block h-[14px] w-full" aria-hidden="true">
      <path d={d} fill="var(--color-cream)" />
    </svg>
  )
}

/**
 * The letter inside the envelope: cream paper with a deckled top edge and
 * a thin gold inner border, an opening line, and the two venues — each
 * with its icon, name, address, date and time, and directions.
 */
export function Letter() {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  return (
    <div className="relative">
      <DeckleEdge />
      <div
        className="relative px-3 pb-3"
        style={{
          backgroundColor: 'var(--color-cream)',
          // Paper: a soft light from the top and a faint laid grain. Static.
          backgroundImage:
            'radial-gradient(120% 55% at 50% 0%, rgba(255,255,255,0.65), transparent 70%), repeating-linear-gradient(0deg, var(--color-cream-deep) 0 1px, transparent 1px 4px)',
          backgroundBlendMode: 'normal, soft-light',
          boxShadow: '0 18px 36px -24px rgba(94,18,39,0.45)',
        }}
      >
        <div className="relative border border-gold/45 px-4 pt-5 pb-5">
          <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] border border-gold/25" />

          <p
            className={`text-center text-wine-deep/85 ${ur ? 'font-urdu text-fluid-sm leading-[2.2]' : 'font-display text-fluid-base italic'}`}
            lang={t.lang}
            dir={t.dir}
          >
            {ur ? wedding.urdu.honouredLine : wedding.texts.honouredLine}
          </p>

          <div className="mt-4">
            {wedding.events.map((e, i) => (
              <VenueCard key={e.name} event={e} first={i === 0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
