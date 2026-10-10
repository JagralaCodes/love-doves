import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { HeartSeal } from '../svg/HeartSeal'
import { TriFoldLetter } from './TriFoldLetter'
import { sparkleBurstFrom } from '../../lib/sparkleBus'
import { glideTo } from '../../lib/scroll'

type Props = {
  /** The monogram pressed into the heart seal. */
  initials: string
  /** Caption under the envelope, e.g. "Slide the heart away to open". */
  prompt: string
  /** Accessible name of the seal. */
  openLabel: string
  lang?: string
  dir?: 'rtl' | 'ltr'
}

/* Everything is laid out for a 375px column and scaled by k = width/375. */
const BASE = 375
const STAGE_H = 660
const ENV = { w: 311, h: 206, top: 238 }
const FLAP_H = 124
/** The folded stack is the middle panel's height; top is smaller, bottom larger. */
const LETTER = { w: 286, top: 236, panels: [150, 190, 230] as [number, number, number] }
const SEAL = { w: 62, h: 58, y: 352 }
const HINT_TOP = 455
const HEARTS = 10
/** Release further than this from where the drag began, and it opens. */
const RELEASE = 50
const TOTAL = 2600

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const eOut = (x: number) => 1 - Math.pow(1 - x, 3)
const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const eOutBack = (x: number) => {
  const c = 1.4
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2)
}

type Heart = { dx: number; dy: number; r: number; d: number }
const HEART_PATHS: Heart[] = Array.from({ length: HEARTS }, (_, i) => ({
  dx: (i % 2 ? 1 : -1) * (120 + (i % 5) * 14),
  dy: -40 - (i % 4) * 45,
  r: (i % 2 ? 1 : -1) * (30 + i * 9),
  d: i * 30,
}))

/**
 * A sealed envelope with a tri-fold letter inside, opened by sliding the
 * heart seal off its flap.
 *
 * Built to the reference prototype's structure and timing: back panel,
 * letter, front pocket (two side folds and a bottom fold), flap, seal.
 * The section is sized for the OPENED letter from the start — the folded
 * letter sits where its middle panel will end up, and the top and bottom
 * panels unfold into space that is already reserved — so nothing on the
 * page moves when it opens.
 *
 * One rAF loop drives one `render(t)` from the moment of release, writing
 * transforms and opacities only. The flap's z-index swaps at 90°, the
 * letter's once its foot clears the pocket; the mid-fold darkening is an
 * overlay's opacity, not a filter. About 2.5 seconds in all.
 *
 * Under reduced motion only the opened letter is shown.
 */
export function Envelope({ initials, prompt, openLabel, lang, dir }: Props) {
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const envBackRef = useRef<HTMLDivElement>(null)
  const envFrontRef = useRef<HTMLDivElement>(null)
  const flapWrapRef = useRef<HTMLDivElement>(null)
  const flapRef = useRef<HTMLDivElement>(null)
  const flapShadeRef = useRef<HTMLDivElement>(null)
  const letterRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLButtonElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const heartsRef = useRef<HTMLDivElement>(null)

  const [width, setWidth] = useState(BASE)
  const k = width / BASE
  const [open, setOpen] = useState(reduced)

  // Where the seal was let go, relative to its home: the fly-off continues
  // along that line. The drag itself writes the seal's transform directly.
  const sealFrom = useRef({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const playing = useRef(reduced)
  const lastT = useRef(reduced ? TOTAL : 0)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () => setWidth(stage.clientWidth || BASE)
    read()
    const ro = new ResizeObserver(read)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  /** One frame of the opening, at t ms after release. Transforms only. */
  const render = useCallback(
    (t: number) => {
      lastT.current = t
      const px = (v: number) => v * k
      const seal = sealRef.current
      const hint = hintRef.current
      const flap = flapRef.current
      const flapWrap = flapWrapRef.current
      const shade = flapShadeRef.current
      const letter = letterRef.current
      const back = envBackRef.current
      const front = envFrontRef.current
      if (!letter) return

      // Seal: on along its swipe, spinning and shrinking, then gone.
      if (seal) {
        const s = eOut(seg(t, 0, 380))
        const from = sealFrom.current
        const sx = from.x + (from.x >= 0 ? 1 : -1) * px(220) * s
        const sy = from.y - px(140) * s
        seal.style.transform = `translate(${sx}px, ${sy}px) rotate(${s * 40}deg) scale(${1 - 0.35 * s})`
        seal.style.opacity = String(1 - seg(t, 150, 380))
      }
      if (hint) hint.style.opacity = String(1 - seg(t, 0, 250))

      // Flap: folds open; past the vertical it is behind everything.
      const f = eIO(seg(t, 350, 850))
      const ang = f * 180
      if (flap) flap.style.transform = `rotateX(${ang}deg)`
      if (flapWrap) flapWrap.style.zIndex = ang > 90 ? '0' : '6'
      if (shade) shade.style.opacity = String(0.12 * Math.sin(f * Math.PI))

      // Letter: up out of the pocket, then settles to the middle panel's
      // place. Above the pocket once its foot has cleared it.
      const up = eOut(seg(t, 800, 1350))
      const settle = eIO(seg(t, 1250, 1700))
      const ly = px(12) - px(170) * up + px(158) * settle
      letter.style.transform = `translateY(${ly}px)`
      letter.style.zIndex = t > 1150 ? '8' : '2'

      // Envelope: drops away under it.
      const drop = eIO(seg(t, 1250, 1700))
      for (const el of [back, front, flapWrap]) {
        if (!el) continue
        el.style.transform = `translateY(${drop * px(70)}px) scale(${1 - 0.06 * drop})`
        el.style.opacity = String(1 - drop)
      }

      // Panels unfold: top first, then bottom.
      const top = letter.querySelector<HTMLElement>('[data-panel="top"]')
      const bottom = letter.querySelector<HTMLElement>('[data-panel="bottom"]')
      const tA = eOutBack(seg(t, 1650, 2150))
      const bA = eOutBack(seg(t, 1950, 2450))
      if (top) top.style.transform = `translateZ(1px) rotateX(${-180 + 180 * tA}deg)`
      if (bottom) {
        bottom.style.transform = `translateZ(-1px) rotateX(${-180 + 180 * bA}deg)`
        bottom.style.opacity = String(seg(t, 1950, 2050))
      }

      // Hearts spray from the mouth, each on its own sine of life.
      const hearts = heartsRef.current?.children
      if (hearts) {
        for (let i = 0; i < hearts.length; i++) {
          const h = hearts[i] as HTMLElement
          const o = HEART_PATHS[i]
          const kk = seg(t, 1000 + o.d, 2000 + o.d)
          h.style.opacity = String(kk > 0 && kk < 1 ? Math.sin(kk * Math.PI) : 0)
          h.style.transform = `translate(${px(o.dx) * eOut(kk)}px, ${px(o.dy) * eOut(kk)}px) rotate(${o.r * kk}deg) scale(${0.8 + 0.6 * Math.sin(kk * Math.PI)})`
        }
      }
    },
    [k],
  )

  // Hold the current frame when the column is resized, and draw the first.
  useLayoutEffect(() => {
    render(lastT.current)
  }, [render])

  const finish = useCallback(() => {
    setOpen(true)
    // If the opened letter is not wholly on screen, bring it there.
    const letter = letterRef.current
    if (!letter) return
    const r = letter.getBoundingClientRect()
    const top = r.top - LETTER.panels[0] * k
    const bottom = r.top + (LETTER.panels[1] + LETTER.panels[2]) * k
    if (top < 0 || bottom > window.innerHeight) {
      glideTo(window.scrollY + (top + bottom) / 2 - window.innerHeight / 2)
    }
  }, [k])

  const play = useCallback(() => {
    if (playing.current) return
    playing.current = true
    sparkleBurstFrom(sealRef.current, { count: 26, tone: 'rose', power: 200 })
    const t0 = performance.now()
    const step = (now: number) => {
      const t = now - t0
      render(Math.min(t, TOTAL))
      if (t < TOTAL) requestAnimationFrame(step)
      else finish()
    }
    requestAnimationFrame(step)
  }, [render, finish])

  // ── the seal: drag it off, or tap it ────────────────────────────────
  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (playing.current || e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.style.transition = ''
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.hypot(dx, dy) > 4) d.moved = true
    sealFrom.current = { x: dx, y: dy }
    e.currentTarget.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.15}deg)`
  }
  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    const { x, y } = sealFrom.current
    if (Math.hypot(x, y) > RELEASE || !d.moved) {
      // Far enough, or a plain tap: it opens from here.
      play()
      return
    }
    // Not far enough: it springs back.
    sealFrom.current = { x: 0, y: 0 }
    e.currentTarget.style.transition = 'transform 0.45s cubic-bezier(0.22, 1.4, 0.36, 1)'
    e.currentTarget.style.transform = ''
  }
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      sealFrom.current = { x: 20, y: -30 }
      play()
    }
  }

  // Keyboard users: once open, focus moves onto the letter.
  useEffect(() => {
    if (open && !reduced && document.activeElement === document.body) {
      letterRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
    }
  }, [open, reduced])

  const envStyle = {
    left: (width - ENV.w * k) / 2,
    top: ENV.top * k,
    width: ENV.w * k,
    height: ENV.h * k,
  }

  return (
    // Full-bleed across the column, so the picture is the reference's at 375.
    <div
      ref={stageRef}
      className="relative mx-[calc(-1*var(--page-gutter))]"
      style={{ height: STAGE_H * k }}
    >
      {!reduced && (
        <>
          {/* 1. Back panel. */}
          <div ref={envBackRef} className="absolute" style={{ ...envStyle, zIndex: 1 }} aria-hidden="true">
            <div
              className="absolute inset-0 rounded-[10px]"
              style={{
                background: 'linear-gradient(var(--color-rose-deep), var(--color-rose-pink))',
                boxShadow: '0 18px 30px -14px rgba(155,44,74,0.35)',
              }}
            />
          </div>
        </>
      )}

      {/* 2. The letter, folded (or open, under reduced motion). */}
      <div className="absolute inset-x-0" style={{ top: LETTER.top * k }}>
        <TriFoldLetter
          ref={letterRef}
          width={LETTER.w * k}
          heights={[LETTER.panels[0] * k, LETTER.panels[1] * k, LETTER.panels[2] * k]}
        />
      </div>

      {!reduced && (
        <>
          {/* 3. Front pocket: two side folds meeting at 57%, a bottom fold
                 with its apex at 47%, a darker crease along it. */}
          <div ref={envFrontRef} className="pointer-events-none absolute" style={{ ...envStyle, zIndex: 5 }} aria-hidden="true">
            <svg viewBox="0 0 311 206" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
              <defs>
                <linearGradient id="envSide" x1="0" x2="1">
                  <stop offset="0" stopColor="var(--color-blush-deep)" />
                  <stop offset="1" stopColor="var(--color-rose-pink)" />
                </linearGradient>
                <linearGradient id="envBottom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color-blush)" />
                  <stop offset="1" stopColor="var(--color-blush-deep)" />
                </linearGradient>
              </defs>
              <path d="M10 0 L160 118 L10 206 Q0 206 0 196 V10 Q0 0 10 0Z" fill="url(#envSide)" />
              <path d="M301 0 L151 118 L301 206 Q311 206 311 196 V10 Q311 0 301 0Z" fill="url(#envSide)" />
              <path d="M0 196 L155.5 96 L311 196 Q311 206 301 206 H10 Q0 206 0 196Z" fill="url(#envBottom)" />
              <path d="M0 196 L155.5 96 L311 196" fill="none" stroke="var(--color-rose-deep)" strokeWidth="1" />
            </svg>
          </div>

          {/* 4. The flap, in its own perspective, hinged on its top edge. */}
          <div
            ref={flapWrapRef}
            className="pointer-events-none absolute"
            style={{ ...envStyle, zIndex: 6, perspective: '900px' }}
            aria-hidden="true"
          >
            <div
              ref={flapRef}
              className="absolute top-0 left-0 w-full"
              style={{ height: FLAP_H * k, transformOrigin: '50% 0' }}
            >
              <svg viewBox="0 0 311 124" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
                <defs>
                  <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--color-rose-deep)" />
                    <stop offset="1" stopColor="var(--color-rose-flap)" />
                  </linearGradient>
                </defs>
                <path d="M0 10 Q0 0 10 0 H301 Q311 0 311 10 L163 120 Q155.5 126 148 120Z" fill="url(#envFlap)" stroke="var(--color-rose-flap)" strokeWidth="1" />
              </svg>
              {/* Mid-fold darkening: an overlay's opacity, never a filter. */}
              <div
                ref={flapShadeRef}
                className="absolute inset-0"
                style={{
                  opacity: 0,
                  background: 'var(--color-wine-deep)',
                  clipPath: 'polygon(0 0, 100% 0, 52.4% 100%, 47.6% 100%)',
                }}
              />
            </div>
          </div>

          {/* 5. The seal, on the flap's tip. */}
          {!open && (
            <button
              ref={sealRef}
              type="button"
              aria-label={openLabel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: width / 2 - (SEAL.w * k) / 2,
                top: SEAL.y * k - (SEAL.h * k) / 2,
                width: SEAL.w * k,
                height: SEAL.h * k,
                zIndex: 7,
                touchAction: 'none',
              }}
            >
              <HeartSeal initials={initials} className="size-full" shadow />
            </button>
          )}

          {/* Hearts that spray from the mouth as the letter comes out. */}
          <div ref={heartsRef} className="pointer-events-none absolute" style={{ left: width / 2 - 6.5 * k, top: 250 * k, zIndex: 7 }} aria-hidden="true">
            {HEART_PATHS.map((_, i) => (
              <svg key={i} viewBox="-6 -6 12 12" className="absolute top-0 left-0" style={{ width: 13 * k, height: 13 * k, opacity: 0 }}>
                <path
                  d="M0 3.6C-1.2 1.4-5.6.4-5.6-2.6-5.6-5.2-2.4-6.4 0-3.8 2.4-6.4 5.6-5.2 5.6-2.6 5.6.4 1.2 1.4 0 3.6Z"
                  fill={i % 3 ? 'var(--color-wine-soft)' : 'var(--color-gold)'}
                />
              </svg>
            ))}
          </div>

          {/* The caption. Fades in the first quarter second. */}
          <p
            ref={hintRef}
            className={`text-2xs pointer-events-none absolute inset-x-0 text-center tracking-[0.28em] text-wine-soft ${
              lang === 'ur' ? 'font-urdu' : 'font-body uppercase'
            }`}
            style={{ top: HINT_TOP * k, zIndex: 9 }}
            lang={lang}
            dir={dir}
            aria-hidden={open || undefined}
          >
            {prompt}
          </p>
        </>
      )}
    </div>
  )
}
