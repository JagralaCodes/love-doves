import { useSyncExternalStore } from 'react'
import { getLang, subscribeLang } from '../lib/langStore'
import type { Lang } from '../lib/langStore'

/** Current translation language, re-rendering on change. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribeLang, getLang, getLang)
}

/**
 * Attributes a translated block needs so the browser shapes and aligns it
 * correctly — Urdu is right-to-left and wants the Nastaliq face and a much
 * roomier line box, since its descenders hang far below the baseline.
 */
export function langAttrs(lang: Lang) {
  return lang === 'ur'
    ? ({ lang: 'ur', dir: 'rtl', className: 'font-urdu leading-[2.6]' } as const)
    : ({ lang: 'en', dir: 'ltr', className: '' } as const)
}
