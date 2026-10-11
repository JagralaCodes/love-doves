import { wedding } from '../config/wedding.config'
import type { WeddingEvent } from '../config/wedding.config'

/**
 * Who a link is for. The Nikah and the Walima have different guest lists,
 * so the family sends each guest one of three links:
 *
 *   /          everyone — both celebrations
 *   /nikah     Nikah guests — only the Nikah's date, place and countdown
 *   /walima    Walima guests — only the Walima's
 *
 * The language still rides on the hash (/walima#urdu). Read once from the
 * URL at load: a link is for one audience for its whole life.
 */
export type Audience = 'all' | 'nikah' | 'walima'

export function audienceFromUrl(url: string | URL = typeof window === 'undefined' ? '/' : window.location.href): Audience {
  const base = typeof window === 'undefined' ? 'http://invite.local' : window.location.origin
  let parsed: URL
  try {
    parsed = typeof url === 'string' ? new URL(url, base) : url
  } catch {
    return 'all'
  }
  const segment = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() ?? '').toLowerCase()
  if (segment === 'nikah') return 'nikah'
  if (segment === 'walima') return 'walima'
  return 'all'
}

let current: Audience | null = null

export function getAudience(): Audience {
  if (current === null) current = audienceFromUrl()
  return current
}

/** The celebrations this link's guest is invited to, in config order. */
export function visibleEvents(): readonly WeddingEvent[] {
  const a = getAudience()
  if (a === 'all') return wedding.events
  return wedding.events.filter((e) => e.name.toLowerCase() === a)
}

/** The celebration the date line, the scratch card and the countdown use. */
export function mainEvent(): WeddingEvent {
  return visibleEvents()[0] ?? wedding.events[0]
}

/** ISO instant of the main event's start, in India's offset. */
export function mainEventStart(): string {
  const e = mainEvent()
  return `${e.date}T${e.time}:00+05:30`
}
