import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useLang, langAttrs } from '../../hooks/useLang'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useParallax } from '../../hooks/useParallax'

import { GeometricPattern } from '../svg/GeometricPattern'
import { Lantern } from '../svg/Lantern'
import { Monogram } from '../svg/Monogram'
import { FloralVine, Heart } from '../svg/Ornaments'
import { GoldGlitterText } from '../ui/GoldGlitterText'
import { SparkleField } from '../ui/SparkleField'
import { PearlBokeh } from '../ui/PearlBokeh'
import { ShimmerDust } from '../ui/ShimmerDust'
import { FallingPetals } from '../ui/FallingPetals'

import { wedding } from '../../config/wedding.config'
import { seam } from '../../lib/seam'

/**
 * The finale. Lanterns rise into place as the section comes on, the dua
 * wipes in from behind a mask, hearts drift down, and the two families
 * sign off together. Ends on the monogram.
 */
export function Closing() {
  const ref = useRef<HTMLElement>(null)
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const reduced = useReducedMotion()
  const lanternsRef = useParallax<HTMLDivElement>({ travel: 60, mode: 'lift' })

  useEffect(() => {
    const section = ref.current
    if (!section) return

    const ctx = gsap.context(() => {
      const trigger = { trigger: section, start: 'top 75%', once: true }

      if (reduced) {
        gsap.fromTo(
          '[data-rise], [data-line]',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: 'none', stagger: 0.08, scrollTrigger: trigger },
        )
        return
      }

      // Lanterns are hung from above: they come down from their hooks and
      // settle, rather than fading in where they already were.
      gsap.fromTo(
        '[data-rise]',
        { autoAlpha: 0, y: -60 },
        { autoAlpha: 1, y: 0, duration: 1.6, ease: 'expo.out', stagger: 0.18, scrollTrigger: trigger },
      )

      const tl = gsap.timeline({ scrollTrigger: trigger, defaults: { ease: 'expo.out' } })
      tl.fromTo('[data-mono]', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1.2 }, 0.2)
        .fromTo(
          '[data-dua]',
          { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)', y: 14 },
          { autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.3 },
          '-=0.6',
        )
        .fromTo('[data-vine]', { autoAlpha: 0, scaleX: 0.5 }, { autoAlpha: 1, scaleX: 1, duration: 1 }, '-=0.7')
        .fromTo('[data-line]', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14 }, '-=0.5')
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden bg-wine-deep px-[var(--page-gutter)] py-[var(--section-gap)]"
      // Dusk: the light page above fades through blush and rose into the
      // wine of evening, rather than dropping into it at a hard line.
      style={seam('var(--color-pearl-white)', 'var(--color-wine-deep)', {
        height: '20rem',
        via: [
          ['#efd3da', 0.14],
          ['#b87687', 0.34],
          ['#6b182e', 0.62],
        ],
      })}
    >
      <GeometricPattern scale={112} opacity={0.08} color="#d4af37" />
      <ShimmerDust density={52} tone="gold" />
      <SparkleField count={12} tone="gold" />
      <PearlBokeh count={4} tone="dark" />
      <FallingPetals count={10} shape="heart" />

      {/* Own layer, so the lanterns can lift away on scroll without
          fighting their drop-in, which animates the spans inside. */}
      <div ref={lanternsRef} className="pointer-events-none absolute inset-0 z-10">
        <span data-rise className="absolute top-0 left-6">
          <Lantern width="2rem" cord={22} swayDuration={6.8} />
        </span>
        <span data-rise className="absolute top-0 right-7">
          <Lantern width="1.6rem" cord={38} swayDuration={5.6} swayDelay={-2.4} />
        </span>
        <span data-rise className="absolute top-0 left-[46%] hidden min-[380px]:block">
          <Lantern width="1.2rem" cord={10} swayDuration={7.4} swayDelay={-1.1} lit />
        </span>
      </div>

      <div className="relative z-10 text-center">
        <span data-mono className="block">
          <Monogram initials={wedding.monogram} className="mx-auto w-24" variant="cartouche" />
        </span>

        <p
          data-dua
          lang="ar"
          dir="rtl"
          className="mt-8 font-arabic text-fluid-lg leading-[2] text-rose-pink"
        >
          {wedding.texts.closingDuaArabic}
        </p>

        <span data-vine className="my-5 block origin-center">
          <FloralVine className="mx-auto w-48" />
        </span>

        <p
          data-line
          className={`text-fluid-sm text-blush/85 ${ur ? t.className : 'italic'}`}
          lang={t.lang}
          dir={t.dir}
        >
          {ur ? wedding.urdu.closingDuaMeaning : wedding.texts.closingDuaMeaning}
        </p>

        <p
          data-line
          className={`text-fluid-sm mt-5 text-blush/70 ${ur ? t.className : ''}`}
          lang={t.lang}
          dir={t.dir}
        >
          {ur ? wedding.urdu.presenceLine : wedding.texts.presenceLine}
        </p>

        <span data-line className="block">
          <GoldGlitterText
            block
            as="p"
            tone="dark"
            className={`mt-7 ${ur ? 'font-urdu text-fluid-xl leading-[2.4]' : 'font-display text-fluid-2xl'}`}
            specks={12}
            lang={t.lang}
            dir={t.dir}
          >
            {ur ? wedding.urdu.thankYou : wedding.texts.thankYou}
          </GoldGlitterText>
        </span>

        {/* Both families sign off together. */}
        <div data-line className="mt-8">
          <span className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-10 bg-gold/40" />
            <Heart className="w-2.5" />
            <span className="h-px w-10 bg-gold/40" />
          </span>
          <p className="mt-4 font-display text-fluid-sm leading-relaxed text-gold-light/85">
            {wedding.bride.parents}
          </p>
          <p className="font-display text-fluid-sm leading-relaxed text-gold-light/85">
            {wedding.groom.parents}
          </p>
          <p
            className={`text-2xs mt-3 tracking-[0.3em] text-rose-pink/75 ${ur ? 'font-urdu' : 'uppercase'}`}
            lang={t.lang}
            dir={t.dir}
          >
            {ur ? wedding.urdu.withLove : wedding.texts.withLove}
          </p>
        </div>
      </div>
    </section>
  )
}
