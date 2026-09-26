/**
 * Which language the *translations* are shown in. Scripture stays in
 * Arabic; this only switches the translated and supporting lines.
 *
 * An external store rather than a context: the toggle sits in one corner
 * of the page and the readers are scattered across every section, so a
 * provider would mean wrapping the whole tree to move one boolean.
 */

export type Lang = 'en' | 'ur'

const KEY = 'invite-lang'

let current: Lang = 'en'
const listeners = new Set<() => void>()

// Restore the viewer's last choice. Storage can throw in private mode.
try {
  const saved = localStorage.getItem(KEY)
  if (saved === 'en' || saved === 'ur') current = saved
} catch {
  /* fall back to English */
}

export function getLang(): Lang {
  return current
}

export function setLang(next: Lang) {
  if (next === current) return
  current = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* preference simply will not persist */
  }
  for (const fn of listeners) fn()
}

export function toggleLang() {
  setLang(current === 'en' ? 'ur' : 'en')
}

export function subscribeLang(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
