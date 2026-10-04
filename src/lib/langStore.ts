/**
 * Which language the *translations* are shown in. Scripture stays in
 * Arabic; this only switches the translated and supporting lines.
 *
 * The language comes from the URL, so a link carries it. The invitation is
 * shared by sending someone a link, which means the link itself has to say
 * which language to open in — there is no toggle for the reader to find
 * and nothing useful to remember between visits.
 *
 *   /#urdu     /#english      ← works anywhere, no server config
 *   /urdu      /english       ← needs the SPA rewrite in vercel.json
 *
 * The hash form is the one to share. It survives any host, any static
 * server, and WhatsApp's link handling without a rewrite rule.
 *
 * An external store rather than a context: the readers are scattered
 * across every section, so a provider would mean wrapping the whole tree
 * to move one boolean.
 */

export type Lang = 'en' | 'ur'

/** Everything that means Urdu, in a hash or a path segment. */
const URDU = ['urdu', 'ur', 'اردو']
const ENGLISH = ['english', 'en']

/** Reads the language out of a URL. Falls back to English. */
export function langFromUrl(
  url: string | URL = typeof window === 'undefined' ? '/' : window.location.href,
): Lang {
  // A base is only needed for a relative input; it must not reach for
  // window, so this stays testable outside a browser.
  const base =
    typeof window === 'undefined' ? 'http://invite.local' : window.location.origin
  let parsed: URL
  try {
    parsed = typeof url === 'string' ? new URL(url, base) : url
  } catch {
    return 'en'
  }

  // The hash wins: it is the form meant for sharing, and it is the one a
  // reader can append by hand to a link they were already sent.
  // Split on ? and & too: share sheets and link trackers sometimes staple
  // their own parameters onto the end of whatever they were given, and
  // "#urdu?utm_source=whatsapp" should still open in Urdu.
  const hash = decodeURIComponent(parsed.hash.replace(/^#/, ''))
    .split(/[?&]/)[0]
    .toLowerCase()
  if (URDU.includes(hash)) return 'ur'
  if (ENGLISH.includes(hash)) return 'en'

  const segment = decodeURIComponent(
    parsed.pathname.split('/').filter(Boolean).pop() ?? '',
  ).toLowerCase()
  if (URDU.includes(segment)) return 'ur'

  return 'en'
}

let current: Lang = typeof window === 'undefined' ? 'en' : langFromUrl()
const listeners = new Set<() => void>()

export function getLang(): Lang {
  return current
}

/** Applied to <html> so the document's own language is honest. */
function syncDocument(lang: Lang) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.lang = lang
  // Only the translated blocks flip direction, not the page: the layout is
  // a single centred column and mirroring it would move the scroll bar and
  // every ornament for no gain.
  root.dataset.lang = lang
}

export function setLang(next: Lang) {
  if (next === current) return
  current = next
  syncDocument(next)
  for (const fn of listeners) fn()
}

export function subscribeLang(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/**
 * Keeps the language in step with the URL for the life of the page, so
 * editing the hash or using the back button actually changes the language
 * instead of leaving a stale one on screen.
 */
export function startLangUrlSync(): () => void {
  if (typeof window === 'undefined') return () => {}
  syncDocument(current)
  const onChange = () => setLang(langFromUrl())
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener('popstate', onChange)
  }
}
