/**
 * The ONE place dates and times are formatted.
 * Config stores machine-readable values ("2026-12-12", "11:00");
 * every component renders them through these helpers, so the
 * format stays identical across the whole site.
 */

const LOCALE = 'en-GB'

/** "2026-12-12" -> a Date at local midnight (no timezone drift). */
function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** "11:00" -> { hours: 11, minutes: 0 } */
function parseTime(hhmm: string): { hours: number; minutes: number } {
  const [h, min] = hhmm.split(':').map(Number)
  return { hours: h ?? 0, minutes: min ?? 0 }
}

/** Combine a config date + time into a real Date in the viewer's zone. */
export function toDateTime(date: string, time: string): Date {
  const d = parseDate(date)
  const { hours, minutes } = parseTime(time)
  d.setHours(hours, minutes, 0, 0)
  return d
}

/** "Saturday, 12 December 2026" */
export function formatFullDate(iso: string): string {
  return parseDate(iso).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "12 December 2026" */
export function formatDate(iso: string): string {
  return parseDate(iso).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "Saturday" */
export function formatWeekday(iso: string): string {
  return parseDate(iso).toLocaleDateString(LOCALE, { weekday: 'long' })
}

/** { day: "12", month: "December", year: "2026" } — for the big scratch reveal. */
export function splitDate(iso: string): {
  day: string
  month: string
  year: string
  weekday: string
} {
  const d = parseDate(iso)
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString(LOCALE, { month: 'long' }),
    year: String(d.getFullYear()),
    weekday: d.toLocaleDateString(LOCALE, { weekday: 'long' }),
  }
}

/** "13 · 11 · 2026" — the date as a small-caps line under the names. */
export function formatDotDate(iso: string): string {
  const d = parseDate(iso)
  return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
    .map((n) => String(n).padStart(2, '0'))
    .join(' · ')
}

/** "Friday, 13 Nov" */
export function formatShortDate(iso: string): string {
  const d = parseDate(iso)
  const weekday = d.toLocaleDateString(LOCALE, { weekday: 'long' })
  const month = d.toLocaleDateString(LOCALE, { month: 'short' })
  return `${weekday}, ${d.getDate()} ${month}`
}

/** "7 – 10 PM", or "11 AM – 1 PM" when the two sides differ. */
export function formatTimeRange(start: string, end: string): string {
  const compact = (hhmm: string) => {
    const { hours, minutes } = parseTime(hhmm)
    const h12 = hours % 12 || 12
    const mer = hours < 12 ? 'AM' : 'PM'
    return { text: minutes ? `${h12}:${String(minutes).padStart(2, '0')}` : `${h12}`, mer }
  }
  const a = compact(start)
  const b = compact(end)
  return a.mer === b.mer ? `${a.text} – ${b.text} ${a.mer}` : `${a.text} ${a.mer} – ${b.text} ${b.mer}`
}

/** "11:00" -> "11:00 AM" */
export function formatTime(hhmm: string): string {
  const { hours, minutes } = parseTime(hhmm)
  const d = new Date(2000, 0, 1, hours, minutes)
  return d
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\u202f/g, ' ')
}

/** Pads a countdown unit to two digits. */
export function pad2(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0')
}
