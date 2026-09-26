import { useEffect, useRef } from 'react'
import { gsap, SplitText } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useFitText } from '../../hooks/useFitText'
import { useLang, langAttrs } from '../../hooks/useLang'

import { GeometricPattern } from '../svg/GeometricPattern'
import { Lantern } from '../svg/Lantern'
import { Crescent, EightStar, FloralVine } from '../svg/Ornaments'

import { GoldGlitterText } from '../ui/GoldGlitterText'
import { SparkleField } from '../ui/SparkleField'
import { PearlBokeh } from '../ui/PearlBokeh'
import { ShimmerDust } from '../ui/ShimmerDust'
import { FallingPetals } from '../ui/FallingPetals'
import { ScrollHint } from '../ui/ScrollHint'

import { wedding } from '../../config/wedding.config'
import { formatFullDate } from '../../lib/date'

/**
 * Spelled out rather than the U+FDFD ligature.
 *
 * Amiri does carry the ligature, but it draws as one very wide glyph with a
 * long connecting stroke that reads as a gap — and at any size large enough
 * to be legible it dominates a phone screen. The spelled-out form sets
 * properly, matches how the ayah is rendered further down, and scales.
 */
const BISMILLAH = 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'

type Props = {
  /** True once the gate has opened, so the hero animates on reveal. */
  active: boolean
}

/** Must match `background-size` / `background-position` on the foil utilities. */
const FOIL_SCALE = 1.4
const FOIL_OFFSET = 0.5

/**
 * Re-applies the gold foil to individual letters after a split.
 *
 * `background-clip: text` paints the gradient on ONE element and clips it
 * to that element's glyphs. Splitting moves each letter into its own
 * inline-block span, which becomes its own paint context — so the parent's
 * gradient stops reaching the letters and they render fully transparent.
 *
 * The fix is to give every letter the same gradient, sized to the whole
 * word and offset by that letter's position, so the seam is invisible and
 * the word still reads as one continuous piece of foil.
 */
function reFoilChars(chars: HTMLElement[], foilVar = '--foil-gold') {
  if (chars.length === 0) return

  // Measure the word from the letters themselves. SplitText may hoist them
  // out of the element that carried the gradient, so that element cannot be
  // relied on for the extent — it can be left empty and zero-width.
  const rects = chars.map((c) => c.getBoundingClientRect())
  const left = Math.min(...rects.map((r) => r.left))
  const right = Math.max(...rects.map((r) => r.right))
  const width = right - left
  if (width <= 0) return

  const bgWidth = width * FOIL_SCALE
  const originX = (width - bgWidth) * FOIL_OFFSET

  chars.forEach((char, i) => {
    const offset = rects[i].left - left
    char.style.backgroundImage = `var(${foilVar})`
    char.style.backgroundSize = `${bgWidth}px 100%`
    char.style.backgroundPosition = `${originX - offset}px 50%`
    char.style.backgroundClip = 'text'
    char.style.webkitBackgroundClip = 'text'
    char.style.color = 'transparent'
    char.style.webkitTextFillColor = 'transparent'
  })
}

export function Hero({ active }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  const fit = useFitText<HTMLDivElement>()

  useEffect(() => {
    if (!active) return
    const root = rootRef.current
    if (!root) return

    const splits: SplitText[] = []

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.fromTo(
          '[data-hero-item]',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: 'none', stagger: 0.06 },
        )
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

      // Bismillah wipes in behind a mask, then the gold rule draws beneath.
      tl.fromTo(
        '[data-bismillah]',
        { autoAlpha: 0, clipPath: 'inset(0 0 100% 0)', y: 12 },
        { autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1.3 },
      )
        .fromTo(
          '[data-rule]',
          { scaleX: 0 },
          { scaleX: 1, duration: 1, transformOrigin: 'center' },
          '-=0.7',
        )
        .fromTo('[data-crescent]', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1 }, '-=0.6')
        .fromTo('[data-invite]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9 }, '-=0.6')

      // Names, letter by letter.
      gsap.utils.toArray<HTMLElement>('[data-name]').forEach((el, i) => {
        const split = new SplitText(el, { type: 'chars' })
        splits.push(split)
        reFoilChars(split.chars as HTMLElement[], '--foil-rose')
        tl.fromTo(
          split.chars,
          { autoAlpha: 0, yPercent: 40, rotate: 3 },
          {
            autoAlpha: 1,
            yPercent: 0,
            rotate: 0,
            duration: 1,
            stagger: 0.045,
            ease: 'power3.out',
          },
          i === 0 ? '-=0.4' : '-=0.55',
        )
      })

      tl.fromTo('[data-amp]', { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.7 }, '-=0.8')
        .fromTo('[data-vine]', { autoAlpha: 0, scaleX: 0.6 }, { autoAlpha: 1, scaleX: 1, duration: 1 }, '-=0.5')
        .fromTo('[data-date]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.9 }, '-=0.7')
        .fromTo('[data-hint]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, '-=0.4')
    }, root)

    return () => {
      // Restore the original markup first, or screen readers are left
      // reading the names one letter at a time.
      splits.forEach((s) => s.revert())
      ctx.revert()
    }
  }, [active, reduced])

  // Move focus into the page once the gate is gone.
  useEffect(() => {
    if (active) headingRef.current?.focus()
  }, [active])

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-20"
    >
      <GeometricPattern scale={104} opacity={0.055} />
      <PearlBokeh count={6} />
      <ShimmerDust density={52} />
      <FallingPetals count={12} />
      <SparkleField count={10} tone="white" />

      <Lantern className="absolute -top-2 left-5 z-10" width="2.6rem" cord={26} swayDuration={6.2} />
      <Lantern
        className="absolute -top-2 right-6 z-10"
        width="2.1rem"
        cord={44}
        swayDuration={5.1}
        swayDelay={-1.8}
      />

      <div className="relative z-10 w-full text-center">
        {/* Bismillah */}
        <div
          data-hero-item
          data-bismillah
          ref={fit.containerRef}
          className="flex w-full justify-center"
        >
          <div
            ref={fit.contentRef}
            className="w-max shrink-0"
            // Scaled to the column rather than guessing a font size that
            // happens to fit — the Arabic's width varies with the face.
            style={{ transform: `scale(${fit.scale})`, transformOrigin: 'center' }}
          >
            <GoldGlitterText
              block
              lang="ar"
              dir="rtl"
              className="font-arabic text-[1.75rem] leading-[1.9] whitespace-nowrap"
              specks={10}
            >
              {BISMILLAH}
            </GoldGlitterText>
          </div>
        </div>

        <span
          data-hero-item
          data-rule
          aria-hidden="true"
          className="mx-auto mt-3 block h-px w-32 bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        <span data-hero-item data-crescent className="mt-8 block">
          <Crescent className="mx-auto w-14" title="Crescent and star" />
        </span>

        <p
          data-hero-item
          data-invite
          className={`text-2xs mt-5 tracking-[0.45em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
          lang={t.lang}
          dir={t.dir}
        >
          {ur ? wedding.urdu.inviteLine : wedding.texts.inviteLine}
        </p>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-7 outline-none"
          aria-label={`${wedding.bride.name} and ${wedding.groom.name}`}
        >
          <span data-hero-item data-name className="block">
            <GoldGlitterText
              block
              tone="rose"
              className="font-script text-fluid-5xl leading-[1.1]"
              specks={16}
            >
              {wedding.bride.name}
            </GoldGlitterText>
          </span>

          <span data-hero-item data-amp className="my-1 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
            <EightStar className="w-3.5" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
          </span>

          <span data-hero-item data-name className="block">
            <GoldGlitterText
              block
              tone="rose"
              className="font-script text-fluid-5xl leading-[1.1]"
              specks={16}
            >
              {wedding.groom.name}
            </GoldGlitterText>
          </span>
        </h1>

        <span data-hero-item data-vine className="mt-8 block">
          <FloralVine className="mx-auto w-52" />
        </span>

        <p
          data-hero-item
          data-date
          className="nums-lining mt-5 font-display text-fluid-lg tracking-wide text-wine"
        >
          {formatFullDate(wedding.events[0].date)}
        </p>
      </div>

      <span data-hero-item data-hint className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <ScrollHint />
      </span>
    </section>
  )
}
