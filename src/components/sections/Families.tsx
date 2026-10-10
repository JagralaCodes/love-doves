import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { gsap } from '../../lib/gsap'
import { seam } from '../../lib/seam'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { SparkleField } from '../ui/SparkleField'
import { GoldGlitterText } from '../ui/GoldGlitterText'
import { HeartSnake } from '../ui/HeartSnake'

import { wedding } from '../../config/wedding.config'

/** The arch's shoulders sit this far down, as a share of the card's width. */
const SHOULDER = 0.247

/**
 * A pointed-dome arch over a straight-sided body, drawn to the card's real
 * size so it never stretches: outer gold line, inner hairline, and a gold
 * glow that flares when a stream of hearts arrives.
 */
function arch(x0: number, y0: number, x1: number, y1: number, shoulder: number) {
  const w = x1 - x0
  const cy = y0 + 0.3 * (shoulder - y0)
  return `M${x0} ${shoulder} Q${x0 + 0.043 * w} ${cy} ${x0 + w / 2} ${y0} Q${x1 - 0.043 * w} ${cy} ${x1} ${shoulder} V${y1} H${x0} Z`
}

function CardFrame({ w, h }: { w: number; h: number }) {
  const id = useId()
  const s = w * SHOULDER
  const outer = arch(0.8, 0.8, w - 0.8, h - 0.8, s)
  const inner = arch(10, 11, w - 10, h - 10, s + 3)
  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="absolute inset-0 overflow-visible"
      style={{ filter: 'drop-shadow(0 8px 18px rgba(155,44,74,0.12))' }}
    >
      <defs>
        <linearGradient id={`${id}face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".35" stopColor="#fdeef1" />
          <stop offset="1" stopColor="#fbe7ec" />
        </linearGradient>
      </defs>
      <path d={outer} fill={`url(#${id}face)`} stroke="url(#goldFoil)" strokeWidth="1.6" />
      <path d={inner} fill="none" stroke="#e7cf8a" strokeWidth="0.6" />
      {/* A soft halo: two wide translucent strokes, not a blur filter,
          so fading it is opacity alone. */}
      <path data-glow d={outer} fill="none" stroke="var(--color-gold-light)" strokeWidth="9" opacity="0" strokeOpacity="0.35" />
      <path data-glow d={outer} fill="none" stroke="var(--color-gold-light)" strokeWidth="4" opacity="0" strokeOpacity="0.8" />
    </svg>
  )
}

type CardProps = {
  cardRef: RefObject<HTMLDivElement | null>
  initial: string
  name: string
  relation: string
  parents: string
  side: 'from' | 'to'
  rtl: boolean
  lang: string
}

/** One family's card: the arch, the initial in a star, the name. */
function FamilyCard({ cardRef, initial, name, relation, parents, side, rtl, lang }: CardProps) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return
    const read = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cardRef])

  return (
    <div ref={cardRef} data-family-card data-side={side} className="relative mx-auto w-[74%] max-w-[19rem]">
      {size && <CardFrame w={size.w} h={size.h} />}

      {/* Padding in % is of the card's width, so the star always sits
          under the dome whatever the screen. */}
      <div className="relative px-4 pb-8 text-center" style={{ paddingTop: '10%' }}>
        <svg data-star viewBox="-20 -20 40 40" className="mx-auto block w-[2.6rem]" aria-hidden="true">
          <path
            d="M0-17l5 7 9-2-2 9 7 5-7 5 2 9-9-2-5 7-5-7-9 2 2-9-7-5 7-5-2-9 9 2z"
            fill="#fff"
            stroke="url(#goldFoil)"
            strokeWidth="1.2"
          />
          <text y="6" textAnchor="middle" className="font-script" fontSize="16" fill="#b8892a">
            {initial}
          </text>
        </svg>

        <GoldGlitterText
          block
          as="h3"
          tone="rose"
          className="mt-4 font-script text-fluid-2xl leading-tight"
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

        <span aria-hidden="true" className="mx-auto my-3 block size-1.5 rounded-full bg-gold" />

        <p className="text-fluid-sm font-display leading-snug text-wine-deep">{parents}</p>
      </div>
    </div>
  )
}

/**
 * The two families, one above the other, joined by a stream of hearts.
 *
 * Scroll down and the hearts slither out from behind the bride's card,
 * swing round and slip behind the groom's; scroll up and a second stream
 * carries them back. Each card glows as hearts arrive at it.
 */
export function Families() {
  const sectionRef = useRef<HTMLElement>(null)
  const brideRef = useRef<HTMLDivElement>(null)
  const groomRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  // The cards rise in from opposite sides, as two families coming together.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-family-card]')
      if (reduced) {
        gsap.fromTo(cards, { autoAlpha: 0 }, {
          autoAlpha: 1,
          duration: 0.5,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 80%', once: true },
        })
        return
      }
      cards.forEach((card) => {
        const fromLeft = card.dataset.side === 'from'
        gsap.fromTo(
          card,
          { autoAlpha: 0, x: fromLeft ? -56 : 56, y: 40, rotate: fromLeft ? -2 : 2 },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 85%', once: true },
          },
        )
      })
    }, section)

    return () => ctx.revert()
  }, [reduced])

  // Hearts arriving: the card's gold edge flares and its star gives a beat.
  const onArrive = useCallback((card: 'from' | 'to') => {
    const el = (card === 'from' ? brideRef : groomRef).current
    if (!el) return
    gsap.fromTo(el.querySelectorAll('[data-glow]'), { opacity: 1 }, { opacity: 0, duration: 1.3, ease: 'power2.out' })
    gsap.fromTo(
      el.querySelector('[data-star]'),
      { scale: 1.22 },
      { scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)', transformOrigin: '50% 50%' },
    )
  }, [])

  return (
    <section
      ref={sectionRef}
      data-thread="Families"
      className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]"
      style={seam('var(--color-blush)', 'var(--color-pearl-white)')}
    >
      <GeometricPattern scale={96} opacity={0.05} />
      <SparkleField count={7} tone="rose" />

      <HeartSnake boxRef={sectionRef} fromRef={brideRef} toRef={groomRef} onArrive={onArrive} />

      <h2
        className={`text-2xs relative z-10 text-center tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
        lang={t.lang}
        dir={t.dir}
      >
        {ur ? wedding.urdu.familiesHeading : wedding.texts.familiesHeading}
      </h2>

      {/* The gap between the cards is the hearts' crossing. */}
      <div className="relative z-10 mt-8 flex flex-col gap-[7.5rem]">
        <FamilyCard
          cardRef={brideRef}
          side="from"
          initial={wedding.bride.name.charAt(0)}
          name={wedding.bride.name}
          relation={ur ? wedding.urdu.daughterOf : wedding.texts.daughterOf}
          parents={wedding.bride.parents}
          rtl={ur}
          lang={t.lang}
        />
        <FamilyCard
          cardRef={groomRef}
          side="to"
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
