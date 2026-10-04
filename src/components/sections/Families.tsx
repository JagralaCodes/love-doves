import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { Monogram } from '../svg/Monogram'
import { EightStar } from '../svg/Ornaments'
import { HeartKnot } from '../svg/HeartKnot'
import { RopeHeart } from '../svg/RopeHeart'
import { archHeadPath, JAMB_INSET } from '../svg/archGeometry'
import { SparkleField } from '../ui/SparkleField'
import { GoldGlitterText } from '../ui/GoldGlitterText'
import { Seam } from '../ui/Seam'

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
            fill="url(#archFaceTop)"
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
        {/* Inside the arch head. It used to hang at -14%, straddling
            the springline, so it read as stuck to the seam rather
            than seated in the arch. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[7%] flex justify-center">
          <Monogram initials={initial} className="w-14" variant="roundel" />
        </div>
      </div>

      <div
        className="card-lift relative bg-blush-soft"
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

        <div className="relative px-5 pt-7 pb-7 text-center">
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
          [...cards, ...gsap.utils.toArray<HTMLElement>('[data-join]')],
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: section, start: 'top 80%', once: true },
          },
        )
        // No scrubbing and no drawing-on: the cord and rope are already tied.
        gsap.set('[data-rope], [data-rope-glow]', { autoAlpha: 1 })
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

      // The heart arrives on its own.
      gsap.fromTo(
        '[data-heart-enter]',
        { autoAlpha: 0, scale: 0.4 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1.1,
          ease: 'back.out(1.7)',
          delay: 0.45,
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        },
      )

      // The cord draws itself as the section passes, so it reads as being
      // paid out from the bride's card, around the heart, to the groom's.
      // Scrubbed rather than played: the viewer's scroll is what feeds it.
      const cords = gsap.utils.toArray<SVGPathElement>('[data-cord]')
      if (cords.length) {
        gsap.set(cords, { drawSVG: '0%' })
        gsap
          .timeline({
            scrollTrigger: {
              trigger: '[data-join]',
              start: 'top 88%',
              end: 'bottom 55%',
              scrub: 0.8,
            },
          })
          .to('[data-cord="in"]', { drawSVG: '100%', ease: 'none' })
          // Both halves of the loop pay out together, parting around the heart.
          .to('[data-cord="back"], [data-cord="front"]', { drawSVG: '100%', ease: 'none' })
          .to('[data-cord="out"]', { drawSVG: '100%', ease: 'none' })
      }

      // The rope: a heart tied between the families as the viewer scrolls,
      // with a lit bead riding the drawing tip. Scrubbed over a long range
      // so it is paced by the scroll, not played at it.
      const rope = section.querySelector<SVGPathElement>('[data-rope]')
      const glow = section.querySelector<SVGPathElement>('[data-rope-glow]')
      const bead = section.querySelector<SVGCircleElement>('[data-rope-bead]')
      const core = section.querySelector<SVGCircleElement>('[data-rope-bead-core]')
      if (rope && glow && bead && core) {
        const length = rope.getTotalLength()
        gsap.set([rope, glow], { drawSVG: '0%', autoAlpha: 1 })
        gsap.set([bead, core], { autoAlpha: 0 })
        gsap.to([rope, glow], {
          drawSVG: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-rope-wrap]',
            start: 'top 82%',
            end: 'bottom 38%',
            scrub: 0.6,
            onUpdate: (self) => {
              const at = rope.getPointAtLength(length * self.progress)
              const visible = self.progress > 0.005 && self.progress < 0.995
              gsap.set([bead, core], {
                attr: { cx: at.x, cy: at.y },
                autoAlpha: visible ? 1 : 0,
              })
            },
          },
        })
      }
    }, section)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]"
    >
      <GeometricPattern scale={96} opacity={0.05} />
      <Seam from="var(--color-blush)" />
      <SparkleField count={7} tone="rose" />

      <h2
        className={`text-2xs relative z-10 text-center tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? wedding.urdu.familiesHeading : wedding.texts.familiesHeading}
      </h2>

      <div className="relative z-10 mt-7 flex flex-col items-stretch gap-3">
        <FamilyCard
          side="left"
          initial={wedding.bride.name.charAt(0)}
          name={wedding.bride.name}
          relation={ur ? wedding.urdu.daughterOf : wedding.texts.daughterOf}
          parents={wedding.bride.parents}
          rtl={ur}
          lang={t.lang}
        />

        {/* The motif that joins the two families. The cord draws itself
            as the section scrolls, running from the bride's card, around
            the heart, and on to the groom's. */}
        <span data-join className="-my-3 flex justify-center">
          <HeartKnot className="w-[5.5rem]" title="A heart joining the two families" />
        </span>

        {/* From the heart down to the groom's card, the rope ties a heart as
            the viewer scrolls, then drops through its middle to land on the
            card below. -mt pulls it up to meet the knot's out-cord; -mb
            lets its final drop run straight into the arch's apex. */}
        <div data-rope-wrap className="-mt-6 -mb-7 flex justify-center">
          <RopeHeart className="w-[11.5rem]" />
        </div>

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
