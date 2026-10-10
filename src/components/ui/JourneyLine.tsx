import { useEffect, useId, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useLang } from '../../hooks/useLang'
import { EventIcon } from '../svg/Ornaments'
import { wedding } from '../../config/wedding.config'
import { formatTinyDate } from '../../lib/date'

/** From under the first icon's label to above the second icon. */
const ROUTE = 'M40 66 C40 134, 248 88, 248 154'

/**
 * A compact journey from the first venue to the second: two small gold
 * icons with a label each, joined by a dotted gold path that draws itself
 * as the viewer scrolls. The dots are a mask over a solid path whose dash
 * offset is scrubbed, so the drawing is one compositor-friendly property.
 */
export function JourneyLine() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const ur = useLang() === 'ur'
  const id = useId().replace(/:/g, '')
  const [first, second] = wedding.events

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const target = `[data-draw]`
      const end = el.querySelector('[data-end]')
      if (reduced) {
        gsap.set(target, { drawSVG: '100%' })
        return
      }
      gsap.set(end, { opacity: 0.45 })
      gsap.fromTo(
        target,
        { drawSVG: '0%' },
        {
          drawSVG: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            end: 'bottom 55%',
            scrub: 0.5,
            onUpdate: (self) => {
              // The far icon lights up as the line reaches it.
              gsap.set(end, { opacity: 0.45 + 0.55 * Math.max(0, (self.progress - 0.7) / 0.3) })
            },
          },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [reduced])

  const label = (name: string, date: string) => (
    <>
      {ur ? (wedding.urdu.events[name] ?? name) : name}
      <span aria-hidden="true"> · </span>
      <bdi lang="en" dir="ltr">
        {formatTinyDate(date)}
      </bdi>
    </>
  )

  const labelClass = `text-2xs mt-1 whitespace-nowrap tracking-[0.18em] text-wine-soft ${ur ? 'font-urdu' : 'font-body uppercase'}`

  return (
    <div ref={ref} className="relative mx-auto mt-8 h-[220px] w-full max-w-[18rem]">
      <svg viewBox="0 0 288 220" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <mask id={`${id}m`} maskUnits="userSpaceOnUse">
            <path data-draw d={ROUTE} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
          </mask>
        </defs>
        {/* The whole route, faint, so the space reads as a path not yet taken. */}
        <path d={ROUTE} fill="none" stroke="url(#goldFoil)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 7" opacity="0.28" />
        {/* The same dots, revealed by the drawing mask. */}
        <path d={ROUTE} fill="none" stroke="url(#goldFoil)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 7" mask={`url(#${id}m)`} />
      </svg>

      <div className="absolute top-0 left-0 flex w-20 flex-col items-center text-center">
        <EventIcon kind={'icon' in first ? first.icon : undefined} className="w-10" />
        <p className={labelClass} lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>
          {label(first.name, first.date)}
        </p>
      </div>

      <div data-end className="absolute right-0 bottom-0 flex w-20 flex-col items-center text-center">
        <EventIcon kind={'icon' in second ? second.icon : undefined} className="w-10" />
        <p className={labelClass} lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>
          {label(second.name, second.date)}
        </p>
      </div>
    </div>
  )
}
