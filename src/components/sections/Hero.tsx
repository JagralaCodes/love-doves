import { useEffect, useLayoutEffect, useRef } from 'react'
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

/**
 * Makes split letters legible again after SplitText.
 *
 * The names were losing their descenders: "Zauja" rendered as "Zauа" and
 * "Zaujj" as "Zauu". It was never clipping or a missing glyph — it was
 * `background-clip: text` applied per letter.
 *
 * Splitting puts each letter in its own inline-block span, which becomes
 * its own paint context, so the parent's gradient stops reaching it. The
 * previous fix re-applied the gradient to every letter. But a letter's
 * background box is only as wide as its ADVANCE width, and Pinyon Script
 * is a swash face whose `j` hangs far outside that box. The overflowing
 * part of the glyph had no background to be clipped from, so it simply
 * painted nothing — the letter was there, and invisible.
 *
 * So the split letters take a solid colour instead. That is the state the
 * names are meant to end in anyway, it cannot clip whatever the face does
 * with its swashes, and the foil stays on the unsplit headings.
 */
function solidifyChars(chars: HTMLElement[], color: string) {
  chars.forEach((char) => {
    // Clear the inherited foil before colouring, or the transparent fill
    // from the parent utility wins and the letter stays invisible.
    char.style.backgroundImage = 'none'
    char.style.backgroundClip = 'initial'
    char.style.webkitBackgroundClip = 'initial'
    char.style.color = color
    char.style.webkitTextFillColor = color
    // Swashes overhang their advance box; let them.
    char.style.overflow = 'visible'
  })
}

export function Hero({ active }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'

  // Destructured, not held as `fit.x`: the hooks linter treats any
  // property read off an object that carries refs as a ref read in render.
  const { containerRef: fitBox, contentRef: fitContent, scale: fitScale } =
    useFitText<HTMLDivElement>()

  // Read off the events rather than hardcoded, so adding a third
  // celebration to the config puts it here too.
  const eventNames = wedding.events
    .map((e) => (ur ? (wedding.urdu.events[e.name] ?? e.name) : e.name))
    .join(ur ? ' اور ' : ' & ')

  // Hide the hero BEFORE the gate opens, not when its own timeline starts.
  //
  // The entrance only runs once `active` flips, which happens at the end of
  // the gate's timeline. Until then the hero sat in its natural, fully
  // rendered state — so as the gate faded out you saw the finished page for
  // a few frames, and it then snapped back to the start of the animation and
  // played in. Setting the start state on mount closes that window.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reduced || active) return
    const ctx = gsap.context(() => {
      gsap.set('[data-hero-item]', { autoAlpha: 0 })
    }, root)
    return () => ctx.revert()
  }, [active, reduced])

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
        solidifyChars(split.chars as HTMLElement[], 'var(--color-wine)')
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
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-14"
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
          ref={fitBox}
          className="flex w-full justify-center"
        >
          <div
            ref={fitContent}
            className="w-max shrink-0"
            // Scaled to the column rather than guessing a font size that
            // happens to fit — the Arabic's width varies with the face.
            style={{ transform: `scale(${fitScale})`, transformOrigin: 'center' }}
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
          aria-label={`${wedding.bride.shortName} and ${wedding.groom.shortName}`}
        >
          <span data-hero-item data-name className="block">
            <GoldGlitterText
              block
              tone="rose"
              className="font-script text-fluid-5xl leading-[1.1]"
              specks={16}
            >
              {wedding.bride.shortName}
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
              {wedding.groom.shortName}
            </GoldGlitterText>
          </span>
        </h1>

        <span data-hero-item data-vine className="mt-6 block">
          <FloralVine className="mx-auto w-52" />
        </span>

        {/* The two celebrations, not the date. Each event carries its own
            date on its card further down, and the countdown has the one
            that matters — repeating it here just crowded the names. */}
        <p
          data-hero-item
          data-date
          className={`mt-5 text-wine ${
            ur
              ? 'font-urdu text-fluid-xl leading-[2]'
              : 'font-display text-fluid-lg tracking-[0.18em] uppercase'
          }`}
          lang={t.lang}
          dir={t.dir}
        >
          {eventNames}
        </p>
      </div>

      <span data-hero-item data-hint className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <ScrollHint />
      </span>
    </section>
  )
}
