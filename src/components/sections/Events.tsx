import { useState } from 'react'
import { useReveal } from '../../hooks/useReveal'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { EightStar, Heart } from '../svg/Ornaments'
import { SparkleField } from '../ui/SparkleField'
import { EventDeck } from '../ui/EventDeck'
import { GoldGlitterText } from '../ui/GoldGlitterText'

import { wedding } from '../../config/wedding.config'
import type { WeddingEvent } from '../../config/wedding.config'
import { formatFullDate, formatTime } from '../../lib/date'
import { buildEventIcs, downloadIcs, slugify } from '../../lib/ics'

/** A quiet text action. Deliberately not a filled pill — see the card note. */
function CardAction({
  as = 'button',
  href,
  onClick,
  children,
  icon,
  srSuffix,
}: {
  as?: 'button' | 'a'
  href?: string
  onClick?: () => void
  children: React.ReactNode
  icon: React.ReactNode
  srSuffix?: string
}) {
  const inner = (
    <>
      <span className="border-b border-gold/50 pb-1">{children}</span>
      {icon}
      {srSuffix && <span className="sr-only">{srSuffix}</span>}
    </>
  )

  const className =
    'text-2xs inline-flex items-center gap-1.5 tracking-[0.2em] text-wine uppercase transition-opacity duration-300 hover:opacity-70'

  return as === 'a' ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  )
}

/** One event, as the face of a card in the deck. */
function EventCard({ event }: { event: WeddingEvent }) {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const [saved, setSaved] = useState(false)

  const addToCalendar = () => {
    const ics = buildEventIcs(event, {
      title: `${event.name} — ${wedding.bride.name} & ${wedding.groom.name}`,
      url: wedding.site.url,
      remindMinutes: 120,
    })
    downloadIcs(`${slugify(event.name)}-${event.date}.ics`, ics)
    setSaved(true)
  }

  const name = ur ? (wedding.urdu.events[event.name] ?? event.name) : event.name

  return (
    <article
      // A fixed minimum height keeps every card in the deck the same size,
      // so the stack behind the top one lines up whatever the address length.
      className="relative flex min-h-[26rem] flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border border-gold/30 bg-blush-soft px-6 py-9 text-center"
      style={{ boxShadow: '0 18px 40px -26px rgba(94,18,39,0.45)' }}
    >
      {/* An inset hairline, so the edge reads as pressed rather than boxed in. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[7px] rounded-[1.05rem] border border-gold/20"
      />

      <span aria-hidden="true" className="relative">
        <EightStar className="w-3" />
      </span>

      <h3
        className={`relative mt-5 text-wine ${
          ur ? 'font-urdu text-fluid-2xl leading-[2]' : 'font-display text-fluid-3xl'
        }`}
        lang={t.lang}
        dir={t.dir}
      >
        {name}
      </h3>

      <GoldGlitterText
        block
        as="p"
        tone="rose"
        className="nums-lining relative mt-3 font-display text-fluid-lg"
        specks={6}
        shine={false}
      >
        {formatFullDate(event.date)}
      </GoldGlitterText>

      <p className="nums-lining text-2xs relative mt-1.5 tracking-[0.35em] text-wine-soft">
        {formatTime(event.time)}
        {event.endTime ? ` — ${formatTime(event.endTime)}` : ''}
      </p>

      <span
        className="relative my-6 flex items-center justify-center gap-3"
        aria-hidden="true"
      >
        <span className="h-px w-8 bg-gold/40" />
        <Heart className="w-2.5" />
        <span className="h-px w-8 bg-gold/40" />
      </span>

      <p className="relative font-display text-fluid-xl text-wine">{event.venue}</p>
      <p className="text-fluid-sm relative mx-auto mt-2 max-w-[16rem] leading-relaxed text-wine-soft">
        {event.address}
      </p>

      {event.note && (
        <p className="text-fluid-sm relative mt-4 max-w-[15rem] leading-relaxed text-wine-mist italic">
          {event.note}
        </p>
      )}

      {/* Two quiet text actions divided by a hairline — no pills, no stamp. */}
      <div className="relative mt-7 flex items-center justify-center gap-4">
        <CardAction
          as="a"
          href={event.mapsLink}
          srSuffix={` — ${event.venue} (opens in a new tab)`}
          icon={
            <svg viewBox="0 0 12 12" className="w-2.5" aria-hidden="true">
              <path
                d="M2 10 L10 2 M4.5 2 L10 2 L10 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        >
          {ur ? wedding.urdu.viewOnMap : wedding.texts.viewOnMap}
        </CardAction>

        <span aria-hidden="true" className="h-3 w-px bg-gold/35" />

        <CardAction
          onClick={addToCalendar}
          icon={
            <svg viewBox="0 0 12 12" className="w-2.5" aria-hidden="true">
              {saved ? (
                <path
                  d="M2 6.4 L4.6 9 L10 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M6 1.5 L6 8.5 M3.2 5.8 L6 8.6 L8.8 5.8 M1.8 10.5 L10.2 10.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          }
        >
          {saved
            ? ur
              ? wedding.urdu.calendarSaved
              : wedding.texts.calendarSaved
            : ur
              ? wedding.urdu.addToCalendar
              : wedding.texts.addToCalendar}
        </CardAction>
      </div>
    </article>
  )
}

/**
 * The events, as a deck the viewer throws through.
 *
 * The Maps and Calendar actions stay as hairline text links rather than the
 * filled buttons the brief sketched: the filled, bordered treatment was
 * what made the earlier card look like a postage stamp.
 */
export function Events() {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const [hinted, setHinted] = useState(false)

  const ref = useReveal<HTMLDivElement>({ variant: 'scale-in' })

  const cardLabel = (event: WeddingEvent, i: number, total: number) =>
    `${event.name}, card ${i + 1} of ${total}`

  return (
    <section className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]">
      <GeometricPattern scale={96} opacity={0.04} />
      <SparkleField count={8} tone="rose" />

      <h2
        className={`text-2xs relative z-10 text-center tracking-[0.35em] text-wine-soft ${
          ur ? 'font-urdu' : 'uppercase'
        }`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? wedding.urdu.eventsHeading : wedding.texts.eventsHeading}
      </h2>

      <div ref={ref} className="relative z-10 mt-8">
        <EventDeck
          items={wedding.events}
          label={cardLabel}
          prevLabel={ur ? wedding.urdu.previousEvent : wedding.texts.previousEvent}
          nextLabel={ur ? wedding.urdu.nextEvent : wedding.texts.nextEvent}
          onFirstDrag={() => setHinted(true)}
        >
          {(event) => <EventCard key={event.name} event={event} />}
        </EventDeck>

        {/* The hint retires itself the moment the viewer swipes. */}
        {wedding.events.length > 1 && (
          <p
            aria-hidden="true"
            className={`text-2xs mt-5 flex items-center justify-center gap-2 tracking-[0.3em] text-wine-soft/70 transition-opacity duration-500 ${
              ur ? 'font-urdu' : 'uppercase'
            } ${hinted ? 'opacity-0' : 'opacity-100'}`}
          >
            <SwipeChevrons />
            {ur ? wedding.urdu.swipeHint : wedding.texts.swipeHint}
          </p>
        )}
      </div>
    </section>
  )
}

/** Two chevrons drifting left, hinting the throw direction. */
function SwipeChevrons() {
  return (
    <svg viewBox="0 0 22 10" className="w-5 shrink-0" aria-hidden="true">
      {[0, 1].map((i) => (
        <path
          key={i}
          d={`M${9 - i * 6} 1 L${3 - i * 6 + 6} 5 L${9 - i * 6} 9`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: `swipe-drift 2.4s var(--ease-in-out-slow) ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </svg>
  )
}
