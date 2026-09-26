/**
 * Client-side .ics generation — no server, no dependency.
 *
 * Builds one VEVENT per wedding event and hands it to the browser as a
 * download, so "Add to calendar" works from a WhatsApp in-app browser as
 * well as from Safari or Chrome.
 *
 * Times are written as FLOATING local time (no Z, no TZID): a floating
 * time means "11:00 wherever you are", which for a physical venue is what
 * a guest standing outside it needs to read on their phone. Emitting UTC
 * would be correct only if we also shipped the venue's timezone rules,
 * and getting that wrong by an hour is a far worse failure than a guest
 * abroad seeing the local wall-clock time of the ceremony.
 */

import { toDateTime } from './date'

const PRODID = '-//love-doves//wedding invitation//EN'
/** Fallback length when an event has no endTime, in hours. */
const DEFAULT_DURATION_H = 2

export type CalendarEvent = {
  name: string
  /** YYYY-MM-DD */
  date: string
  /** HH:mm, 24h */
  time: string
  /** HH:mm, 24h. Optional — defaults to two hours after `time`. */
  endTime?: string
  venue: string
  address: string
  note?: string
}

type Options = {
  /** Calendar entry title. Defaults to the event name. */
  title?: string
  /** Extra line appended to the description, e.g. the invitation URL. */
  url?: string
  /** Minutes before the event to alarm. 0 or undefined adds no alarm. */
  remindMinutes?: number
}

/** RFC 5545 escaping for TEXT values. Backslash first, or it doubles up. */
function escapeText(value: string): string {
  return value
    .replace(/\/g, '\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\,')
    .replace(/\r?\n/g, '\n')
}

/**
 * Content lines are folded at 75 octets with a leading space on each
 * continuation. Splitting on code points rather than UTF-16 units keeps a
 * surrogate pair (or an Urdu cluster) from being torn in half — a line a
 * few octets over is tolerated everywhere, a broken character is not.
 */
function fold(line: string): string {
  const chars = [...line]
  if (chars.length <= 75) return line
  const parts = [chars.slice(0, 75).join('')]
  for (let i = 75; i < chars.length; i += 74) {
    parts.push(' ' + chars.slice(i, i + 74).join(''))
  }
  return parts.join('\r\n')
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 20261113T110000 — floating local time. */
function floatingStamp(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  )
}

/** 20260926T101500Z — DTSTAMP must be UTC. */
function utcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

/** "The Emerald Hall" -> "the-emerald-hall" */
export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'event'
  )
}

/** A complete single-event calendar file, CRLF-terminated as the spec requires. */
export function buildEventIcs(event: CalendarEvent, options: Options = {}): string {
  const start = toDateTime(event.date, event.time)
  const end = event.endTime
    ? toDateTime(event.date, event.endTime)
    : new Date(start.getTime() + DEFAULT_DURATION_H * 3600_000)

  const dtStart = floatingStamp(start)
  const description = [event.note, options.url].filter(Boolean).join('\n\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    // Stable per event, so re-adding updates the entry instead of
    // creating a duplicate.
    `UID:${slugify(event.name)}-${dtStart}@love-doves.invite`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${floatingStamp(end)}`,
    `SUMMARY:${escapeText(options.title ?? event.name)}`,
    `LOCATION:${escapeText(`${event.venue}, ${event.address}`)}`,
    ...(description ? [`DESCRIPTION:${escapeText(description)}`] : []),
    ...(options.url ? [`URL:${escapeText(options.url)}`] : []),
    'TRANSP:OPAQUE',
  ]

  if (options.remindMinutes) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `TRIGGER:-PT${Math.round(options.remindMinutes)}M`,
      `DESCRIPTION:${escapeText(options.title ?? event.name)}`,
      'END:VALARM',
    )
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

/** Saves a built calendar file to the viewer's device. */
export function downloadIcs(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  // Must be in the document for the click to count in Firefox.
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking immediately cancels the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
