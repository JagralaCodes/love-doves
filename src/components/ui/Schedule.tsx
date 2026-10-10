import { useLang, langAttrs } from '../../hooks/useLang'
import { EventIcon } from '../svg/Ornaments'

import { wedding } from '../../config/wedding.config'
import type { WeddingEvent } from '../../config/wedding.config'
import { formatFullDate, formatTime } from '../../lib/date'

/** One line of the day: an event, or a moment that follows one. */
type Moment = {
  name: string
  /** "After Asr Namaz", or a clock range when there is no label. */
  when: string
  /** The Urdu for `when`, when it is a label rather than a clock time. */
  whenUr?: string
  venue?: string
  /** Which gold line icon stands beside it. */
  icon?: string
}

function momentsOf(event: WeddingEvent): Moment[] {
  const label = 'timeLabel' in event ? event.timeLabel : undefined
  const end = 'endTime' in event ? event.endTime : undefined
  const clock = `${formatTime(event.time)}${end ? ` — ${formatTime(end)}` : ''}`
  const first: Moment = {
    name: event.name,
    when: label ?? clock,
    whenUr: label ? wedding.urdu.timeLabels[event.name] : undefined,
    venue: event.venue,
    icon: 'icon' in event ? event.icon : undefined,
  }
  if (!('followedBy' in event) || !event.followedBy) return [first]
  const next = event.followedBy
  return [
    first,
    { name: next.name, when: next.timeLabel, whenUr: wedding.urdu.timeLabels[next.name], icon: next.icon },
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

/**
 * When everything happens, as a short timeline: each day, and on it each
 * moment with its icon and its timing in words. Where, and how to get
 * there, is on the letter in the envelope; this is the "when".
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

          <ol className="mt-4">
            {moments.map((m, j) => (
              <li
                key={m.name}
                // A gold thread down the start edge, an icon at each moment.
                className={`relative ps-12 ${j < moments.length - 1 ? 'pb-5' : ''}`}
              >
                {j < moments.length - 1 && (
                  <span aria-hidden="true" className="absolute start-[0.95rem] top-9 bottom-0 w-px bg-gold/35" />
                )}
                <span aria-hidden="true" className="absolute start-0 top-0 w-8">
                  <EventIcon kind={m.icon} className="w-8" />
                </span>

                <p
                  className={`text-2xs tracking-[0.3em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
                  lang={t.lang}
                >
                  {ur ? (wedding.urdu.events[m.name] ?? m.name) : m.name}
                </p>
                {/* English inside an Urdu line is isolated, so a clock
                    range is not reordered by the bidi algorithm. */}
                <p
                  className={`mt-0.5 text-wine ${ur && m.whenUr ? 'font-urdu text-fluid-lg leading-[2]' : 'nums-lining font-display text-fluid-lg'}`}
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
                  <p className="text-fluid-sm mt-0.5 text-wine-soft">
                    <bdi lang="en" dir="ltr">
                      {m.venue}
                    </bdi>
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
