import { useLang } from '../../hooks/useLang'
import { setLang } from '../../lib/langStore'

/**
 * Switches the translated lines between English and Urdu.
 *
 * A toggle rather than showing both: stacking three languages made every
 * section a wall of text. The Arabic of the Qur'an stays put either way.
 */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const lang = useLang()

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-full border border-gold/40 bg-pearl-white/85 backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Translation language"
    >
      {(
        [
          ['en', 'EN', 'English'],
          ['ur', 'اردو', 'Urdu'],
        ] as const
      ).map(([code, label, full]) => {
        const active = lang === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            aria-label={`Show translations in ${full}`}
            className={`px-3.5 text-2xs tracking-[0.18em] transition-colors duration-300 ${
              active ? 'bg-wine text-pearl-white' : 'text-wine-soft'
            } ${code === 'ur' ? 'font-urdu text-[0.85rem] leading-none' : ''}`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
