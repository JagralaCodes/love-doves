import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { seam } from '../../lib/seam'
import { useWordReveal } from '../../hooks/useWordReveal'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { archHeadPath, JAMB_INSET } from '../svg/archGeometry'
import { EightStar, Heart } from '../svg/Ornaments'
import { SparkleField } from '../ui/SparkleField'
import { FallingPetals } from '../ui/FallingPetals'

import { wedding } from '../../config/wedding.config'

/**
 * The ayah, revealed word by word as the reader scrolls through it, inside
 * a multifoil arch whose outline draws itself in.
 *
 * The Arabic and the translation get separate scrubs so each reads at its
 * own pace rather than racing the other.
 */
export function QuranVerse() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<SVGPathElement>(null)
  const reduced = useReducedMotion()
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  const arabicRef = useWordReveal<HTMLParagraphElement>({
    start: 'top 82%',
    end: 'bottom 62%',
    overlap: 0.3,
  })

  // Re-keyed on language so the hook re-splits when the text swaps.
  const transRef = useWordReveal<HTMLParagraphElement>({
    start: 'top 88%',
    end: 'bottom 70%',
    overlap: 0.35,
  })

  // The arch outline draws itself as the frame comes into view.
  useEffect(() => {
    const path = headRef.current
    const section = sectionRef.current
    if (!path || !section) return

    if (reduced) {
      gsap.set(path, { drawSVG: '100%' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        path,
        { drawSVG: '50% 50%' },
        {
          drawSVG: '0% 100%',
          duration: 1.6,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        },
      )
      gsap.fromTo(
        '[data-jamb]',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.2,
          ease: 'power2.out',
          transformOrigin: 'top center',
          stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [reduced])

  // Word widths change with the language; re-measure after the swap.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 80)
    return () => window.clearTimeout(id)
  }, [lang])

  const inset = `${JAMB_INSET * 100}%`

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-blush px-[var(--page-gutter)] py-[var(--section-gap)]"
      style={seam('var(--color-pearl-white)', 'var(--color-blush)')}
    >
      <GeometricPattern scale={88} opacity={0.07} color="#9b2c4a" />
      <SparkleField count={6} tone="rose" />
      <FallingPetals count={8} shape="heart" />

      <div className="word-reveal relative z-10 mx-auto max-w-[19rem]">
        {/* arch head */}
        <div className="relative">
          <svg
            viewBox="0 0 200 150"
            preserveAspectRatio="none"
            className="block w-full"
            style={{ aspectRatio: '200 / 93' }}
            aria-hidden="true"
          >
            <path
              ref={headRef}
              d={archHeadPath('multifoil')}
              fill="none"
              stroke="url(#goldFoil)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="pointer-events-none absolute inset-x-0 bottom-[6%] flex justify-center">
            <Heart className="w-4" title="" />
          </div>
        </div>

        {/* body */}
        <div className="relative" style={{ marginInline: inset, marginTop: -1 }}>
          <span
            data-jamb
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-px"
            style={{ background: 'var(--foil-gold)', opacity: 0.85 }}
          />
          <span
            data-jamb
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-px"
            style={{ background: 'var(--foil-gold)', opacity: 0.85 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
            style={{ background: 'var(--foil-gold)', opacity: 0.85 }}
          />

          <div className="relative px-5 pt-4 pb-8 text-center">
            <p
              ref={arabicRef}
              lang="ar"
              dir="rtl"
              className="font-arabic text-fluid-lg leading-[2.1] text-wine-deep"
            >
              {wedding.texts.quranArabic}
            </p>

            <span className="my-5 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold/45" />
              <EightStar className="w-2.5" />
              <span className="h-px w-8 bg-gold/45" />
            </span>

            <p
              ref={transRef}
              key={lang}
              className={`text-fluid-sm leading-relaxed text-wine-deep/85 ${ur ? t.className : 'italic'}`}
              lang={t.lang}
              dir={t.dir}
            >
              {ur ? wedding.urdu.quranTranslation : wedding.texts.quranEnglish}
            </p>

            <p
              data-no-split
              className={`text-2xs mt-4 tracking-[0.3em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
              lang={t.lang}
              dir={t.dir}
            >
              {ur ? wedding.urdu.quranReference : wedding.texts.quranReference}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
