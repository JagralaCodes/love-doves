import { useState } from 'react'
import { useLang, langAttrs } from '../../hooks/useLang'
import { TapButton } from './Tappable'

import { wedding } from '../../config/wedding.config'
import type { WeddingEvent } from '../../config/wedding.config'
import { formatFullDate, formatTime } from '../../lib/date'
import { buildEventIcs, downloadIcs, slugify } from '../../lib/ics'

/** One line of the day: an event, or a moment that follows one. */
type Moment = {
  name: string
  /** "After Asr Namaz", or a clock range when there is no label. */
  when: string
  /** The Urdu for `when`, when it is a label rather than a clock time. */
  whenUr?: string
  venue?: string
  /** The event its calendar entry comes from. Absent on a follow-on. */
  event?: WeddingEvent
}

function momentsOf(event: WeddingEvent): Moment[] {
  const label = 'timeLabel' in event ? event.timeLabel : undefined
  const clock = `${formatTime(event.time)}${event.endTime ? ` — ${formatTime(event.endTime)}` : ''}`
  const first: Moment = {
    name: event.name,
    when: label ?? clock,
    whenUr: label ? wedding.urdu.timeLabels[event.name] : undefined,
    venue: event.venue,
    event,
  }
  if (!('followedBy' in event) || !event.followedBy) return [first]
  const next = event.followedBy
  return [
    first,
    { name: next.name, when: next.timeLabel, whenUr: wedding.urdu.timeLabels[next.name] },
  ]
}

/** The events grouped by day, in config order. */
function days() {
  const out: { date: string; moments: Moment[] }[] = []
  for (const event of wedding.events) {
    const day = out.find((d) => d.date === event.date)
    if (day) day.moments.push(...momentsOf(event))
    else out.push({ date: event.date, moments: momentsOf(event) })
  }
  return out
}

function CalendarButton({ event }: { event: WeddingEvent }) {
  const ur = useLang() === 'ur'
  const [saved, setSaved] = useState(false)

  const add = () => {
    const ics = buildEventIcs(event, {
      title: `${event.name} — ${wedding.bride.name} & ${wedding.groom.name}`,
      url: wedding.site.url,
      remindMinutes: 120,
    })
    downloadIcs(`${slugify(event.name)}-${event.date}.ics`, ics)
    setSaved(true)
  }

  return (
    <TapButton
      onClick={add}
      className={`link-grow text-2xs inline-flex min-h-[var(--tap-min)] items-center gap-1.5 tracking-[0.16em] whitespace-nowrap text-wine ${ur ? 'font-urdu' : 'uppercase'}`}
    >
      <span>
        {saved
          ? ur
            ? wedding.urdu.calendarSaved
            : wedding.texts.calendarSaved
          : ur
            ? wedding.urdu.addToCalendar
            : wedding.texts.addToCalendar}
      </span>
      <svg viewBox="0 0 12 12" className="w-2.5" aria-hidden="true">
        <path
          d={saved ? 'M2 6.4 L4.6 9 L10 3' : 'M6 1.5 L6 8.5 M3.2 5.8 L6 8.6 L8.8 5.8 M1.8 10.5 L10.2 10.5'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">{` — ${event.name}`}</span>
    </TapButton>
  )
}

/**
 * When everything happens, as a short timeline: each day, and on it each
 * moment with its timing in words. Where and how to get there is on the
 * venue envelope; this is the "when", and the place to save it.
 */
export function Schedule() {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  return (
    <div
      className="relative rounded-[1.1rem] border border-gold/30 bg-blush-soft/55 px-5 py-6 text-start"
      style={{ boxShadow: '0 16px 36px -28px rgba(94,18,39,0.45)' }}
      dir={t.dir}
    >
      {days().map(({ date, moments }, i) => (
        <div key={date} className={i > 0 ? 'mt-5 border-t border-gold/25 pt-5' : ''}>
          {/* Dates stay in English digits and order, isolated from RTL. */}
          <p className="nums-lining text-center font-display text-fluid-lg text-wine">
            <bdi lang="en" dir="ltr">
              {formatFullDate(date)}
            </bdi>
          </p>

          <ol className="mt-3">
            {moments.map((m, j) => (
              <li
                key={m.name}
                // A gold thread down the start edge, a bead at each moment.
                className={`relative ps-6 ${j < moments.length - 1 ? 'pb-4' : ''}`}
              >
                {j < moments.length - 1 && (
                  <span aria-hidden="true" className="absolute start-[0.3rem] top-3 bottom-0 w-px bg-gold/40" />
                )}
                <span
                  aria-hidden="true"
                  className="absolute start-0 top-[0.4rem] size-[0.65rem] rounded-full border border-gold bg-pearl-white"
                />

                <p
                  className={`text-2xs tracking-[0.3em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
                  lang={t.lang}
                >
                  {ur ? (wedding.urdu.events[m.name] ?? m.name) : m.name}
                </p>
                {/* English inside an Urdu line is isolated, so a clock
                    range is not reordered by the bidi algorithm. */}
                <p
                  className={`mt-0.5 text-wine ${ur && m.whenUr ? 'font-urdu text-fluid-base leading-[2]' : 'nums-lining font-display text-fluid-base'}`}
                  lang={ur && m.whenUr ? 'ur' : undefined}
                >
                  {ur && m.whenUr ? (
                    m.whenUr
                  ) : (
                    <bdi lang="en" dir="ltr">
                      {m.when}
                    </bdi>
                  )}
                </p>
                {m.venue && (
                  <p className="text-2xs mt-0.5 text-wine-soft">
                    <bdi lang="en" dir="ltr">
                      {m.venue}
                    </bdi>
                  </p>
                )}
                {m.event && <CalendarButton event={m.event} />}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
