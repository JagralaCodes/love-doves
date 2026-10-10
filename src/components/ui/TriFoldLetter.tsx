import { forwardRef } from 'react'
import { useLang, langAttrs } from '../../hooks/useLang'
import { EventIcon } from '../svg/Ornaments'
import { wedding } from '../../config/wedding.config'
import type { WeddingEvent } from '../../config/wedding.config'
import { formatShortDate, formatTimeRange } from '../../lib/date'

/** Google Maps directions to a place, by its name and address. */
function directionsUrl(event: WeddingEvent) {
  const q = encodeURIComponent(`${event.venue}, ${event.address}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`
}

/** "FRIDAY, 13 NOV · AFTER ASR" / "SATURDAY, 14 NOV · 7 – 10 PM" */
function whenLine(event: WeddingEvent, ur: boolean) {
  const date = formatShortDate(event.date)
  const short = 'timeShort' in event ? event.timeShort : undefined
  if (short) return { date, time: ur ? (wedding.urdu.timeLabels[event.name] ?? short) : short, timeIsUrdu: ur }
  const end = 'endTime' in event ? event.endTime : undefined
  return { date, time: formatTimeRange(event.time, end ?? event.time), timeIsUrdu: false }
}

/** A small gold rule with a diamond, above and below the opening line. */
function Rule() {
  return (
    <svg viewBox="0 0 90 10" className="h-[0.625em] w-[5.6em]" aria-hidden="true">
      <path d="M0 5h36M54 5h36" stroke="var(--color-gold)" strokeWidth="0.8" />
      <path d="M45 0l4 5-4 5-4-5z" fill="var(--color-gold)" />
    </svg>
  )
}

/** One venue's face: icon, label, name, address, when, directions. */
function VenueFace({ event }: { event: WeddingEvent }) {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const when = whenLine(event, ur)
  return (
    <>
      <EventIcon kind={'icon' in event ? event.icon : undefined} className="w-[2.3em]" />
      <p
        className={`mt-[0.35em] text-[0.6875em] tracking-[0.32em] text-wine-soft ${ur ? 'font-urdu' : 'font-body uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? (wedding.urdu.events[event.name] ?? event.name) : event.name}
      </p>
      <p className="mt-[0.15em] font-display text-[1.3125em] leading-tight text-wine">
        <bdi lang="en" dir="ltr">
          {event.venue}
        </bdi>
      </p>
      <p className="mt-[0.3em] max-w-[18em] font-body text-[0.62em] leading-[1.45] text-wine-mist">
        <bdi lang="en" dir="ltr">
          {event.address}
        </bdi>
      </p>
      <p className="nums-lining mt-[0.6em] font-body text-[0.656em] tracking-[0.2em] text-wine uppercase" dir={t.dir}>
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
      <a
        href={directionsUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-[0.6em] inline-flex min-h-[2.4em] items-center gap-[0.4em] border-b border-gold pb-[0.15em] font-body text-[0.56em] tracking-[0.25em] text-wine-deep ${ur ? 'font-urdu' : 'uppercase'}`}
        lang={t.lang}
      >
        <span>{ur ? wedding.urdu.getDirections : wedding.texts.getDirections}</span>
        <span aria-hidden="true">↗</span>
        <span className="sr-only">{` — ${event.venue} (opens in a new tab)`}</span>
      </a>
    </>
  )
}

type Props = {
  /** Width of the letter in px; everything inside scales from it. */
  width: number
  /** Heights of the top, middle and bottom panels in px. */
  heights: [number, number, number]
}

/**
 * The tri-fold letter: three panels of cream paper. Open, they read as one
 * sheet: the same paper, one continuous inner border, no shadow or crease
 * along the folds.
 *
 *   top     hinged on the middle's top edge, folded DOWN over it; its back
 *           is the cover (monogram, "With love"), its front the opening line
 *   middle  the Nikah
 *   bottom  hinged on the middle's bottom edge, folded UP behind it; the Walima
 *
 * Folded, the stack is one panel tall and sits inside the envelope. The
 * envelope's timeline rotates the top and bottom panels open. Type is set
 * in em off a root size proportional to the width, so the layout is the
 * same picture at every phone width.
 *
 * The forwarded ref is the letter's root — the thing the timeline moves.
 */
export const TriFoldLetter = forwardRef<HTMLDivElement, Props>(function TriFoldLetter({ width, heights }, ref) {
  const [topH, panel, bottomH] = heights
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const [nikah, walima] = wedding.events

  const face =
    'absolute inset-0 flex flex-col items-center justify-center px-[1.1em] text-center [backface-visibility:hidden]'
  const border = 'pointer-events-none absolute inset-[0.5em] border border-gold/55'

  return (
    <div
      ref={ref}
      data-letter
      className="absolute left-1/2"
      style={{
        width,
        height: panel,
        marginLeft: -width / 2,
        // 16px at the reference width of 375; the panels' type follows.
        fontSize: (width / 286) * 16,
        perspective: '1100px',
      }}
    >
      {/* Bottom panel — the Walima, folded up behind the middle. */}
      <div
        data-panel="bottom"
        className="absolute left-0 w-full [transform-style:preserve-3d]"
        style={{ top: panel, height: bottomH, transformOrigin: '50% 0', zIndex: 1, background: 'var(--color-paper)' }}
      >
        <div className={face} style={{ background: 'var(--color-paper)' }}>
          <VenueFace event={walima} />
        </div>
        <span className={`${border} border-t-0`} style={{ top: -1 }} />
      </div>

      {/* Middle panel — the Nikah. */}
      <div
        data-panel="middle"
        className="absolute left-0 top-0 w-full [transform-style:preserve-3d]"
        style={{ height: panel, zIndex: 2, background: 'var(--color-paper)' }}
      >
        <div className={face} style={{ background: 'var(--color-paper)' }}>
          <VenueFace event={nikah} />
        </div>
        <span className={`${border} border-t-0 border-b-0`} style={{ top: -1, bottom: -1 }} />
      </div>

      {/* Top panel — hinged on the middle's top edge, folded down over it. */}
      <div
        data-panel="top"
        className="absolute left-0 w-full [transform-style:preserve-3d]"
        style={{ top: -topH, height: topH, transformOrigin: '50% 100%', zIndex: 3, background: 'var(--color-paper)' }}
      >
        {/* Front: the opening line, seen once unfolded. */}
        <div className={face} style={{ background: 'var(--color-paper)' }}>
          <Rule />
          <p
            className={`mt-[0.75em] text-wine ${ur ? 'font-urdu text-[0.95em] leading-[2]' : 'font-display text-[1.1875em] leading-[1.3] italic'}`}
            lang={t.lang}
            dir={t.dir}
          >
            {ur ? wedding.urdu.honouredLine : wedding.texts.honouredLine}
          </p>
          <span className="mt-[0.75em]">
            <Rule />
          </span>
        </div>
        {/* Back: the cover, what shows while the letter is folded. */}
        <div
          className={face}
          style={{ transform: 'rotateX(180deg)', background: 'linear-gradient(160deg, #fffdf7, var(--color-cream-deep))' }}
        >
          <p className="font-script text-[2.75em] leading-none text-gold-dark" lang="en" dir="ltr">
            {wedding.monogram}
          </p>
          <p
            className={`mt-[0.4em] text-[0.625em] tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'font-body uppercase'}`}
            lang={t.lang}
            dir={t.dir}
          >
            {ur ? wedding.urdu.coverLine : wedding.texts.coverLine}
          </p>
          <span className={border} />
        </div>
        <span className={`${border} border-b-0`} style={{ bottom: -1 }} />
      </div>
    </div>
  )
})
