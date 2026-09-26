import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { Monogram } from '../svg/Monogram'
import { HeartCrescent, EightStar } from '../svg/Ornaments'
import { archHeadPath, JAMB_INSET } from '../svg/MihrabArch'
import { SparkleField } from '../ui/SparkleField'
import { GoldGlitterText } from '../ui/GoldGlitterText'

import { wedding } from '../../config/wedding.config'

type CardProps = {
  initial: string
  name: string
  relation: string
  parents: string
  side: 'left' | 'right'
  rtl: boolean
  lang: string
}

/** One family's card, framed by a pointed arch. */
function FamilyCard({ initial, name, relation, parents, side, rtl, lang }: CardProps) {
  const inset = `${JAMB_INSET * 100}%`

  return (
    <div data-family-card data-side={side} className="relative">
      <div className="relative">
        <svg
          viewBox="0 0 200 150"
          preserveAspectRatio="none"
          className="block w-full"
          style={{ aspectRatio: '200 / 78' }}
          aria-hidden="true"
        >
          <path
            d={`${archHeadPath('pointed')} L186 150 L14 150 Z`}
            fill="url(#blushFace)"
          />
          <path
            d={archHeadPath('pointed')}
            fill="none"
            stroke="url(#goldFoil)"
            strokeWidth="2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-[-14%] flex justify-center">
          <Monogram initials={initial} className="w-14" variant="roundel" />
        </div>
      </div>

      <div
        className="relative bg-blush-soft"
        style={{ marginInline: inset, marginTop: -1 }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-px"
          style={{ background: 'var(--foil-gold)', opacity: 0.8 }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-px"
          style={{ background: 'var(--foil-gold)', opacity: 0.8 }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'var(--foil-gold)', opacity: 0.8 }}
        />

        <div className="relative px-5 pt-10 pb-7 text-center">
          <GoldGlitterText
            block
            as="h3"
            tone="rose"
            className="font-script text-fluid-2xl leading-tight"
            specks={8}
          >
            {name}
          </GoldGlitterText>

          <p
            className={`text-2xs mt-3 tracking-[0.3em] text-wine-soft ${rtl ? 'font-urdu' : 'uppercase'}`}
            lang={lang}
            dir={rtl ? 'rtl' : 'ltr'}
          >
            {relation}
          </p>

          <span className="my-3 flex items-center justify-center">
            <EightStar className="w-2.5" />
          </span>

          <p className="text-fluid-sm font-display leading-snug text-wine-deep">
            {parents}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * The two families, side by side.
 *
 * The cards arrive from opposite edges and rise as they settle, so the
 * pair reads as coming together rather than as two items fading in.
 */
export function Families() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-family-card]')

      if (reduced) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: section, start: 'top 80%', once: true },
          },
        )
        return
      }

      cards.forEach((card) => {
        const fromLeft = card.dataset.side === 'left'
        gsap.fromTo(
          card,
          { autoAlpha: 0, x: fromLeft ? -64 : 64, y: 44, rotate: fromLeft ? -2 : 2 },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: { trigger: section, start: 'top 78%', once: true },
          },
        )
      })

      gsap.fromTo(
        '[data-join]',
        { autoAlpha: 0, scale: 0.5 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: 'expo.out',
          delay: 0.5,
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]"
    >
      <GeometricPattern scale={96} opacity={0.05} />
      <SparkleField count={7} tone="rose" />

      <h2
        className={`text-2xs relative z-10 text-center tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? wedding.urdu.familiesHeading : wedding.texts.familiesHeading}
      </h2>

      <div className="relative z-10 mt-9 flex flex-col items-stretch gap-6">
        <FamilyCard
          side="left"
          initial={wedding.bride.name.charAt(0)}
          name={wedding.bride.name}
          relation={ur ? wedding.urdu.daughterOf : wedding.texts.daughterOf}
          parents={wedding.bride.parents}
          rtl={ur}
          lang={t.lang}
        />

        {/* the motif that joins the two families */}
        <span data-join className="flex items-center justify-center gap-4">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/60" />
          <HeartCrescent className="w-11" title="Heart and crescent" />
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/60" />
        </span>

        <FamilyCard
          side="right"
          initial={wedding.groom.name.charAt(0)}
          name={wedding.groom.name}
          relation={ur ? wedding.urdu.sonOf : wedding.texts.sonOf}
          parents={wedding.groom.parents}
          rtl={ur}
          lang={t.lang}
        />
      </div>
    </section>
  )
}
