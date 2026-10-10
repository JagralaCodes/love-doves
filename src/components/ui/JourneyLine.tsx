import { useEffect, useId, useRef } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import { prepareDraw, drawTo } from '../../lib/draw'
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
 * offset is scrubbed, so the drawing is one attribute per scroll step.
 *
 * The labels hang inward from each icon (left-aligned under the first,
 * right-aligned under the second), so neither can run past the column's
 * edge and be clipped on a narrow phone.
 */
export function JourneyLine() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const ur = useLang() === 'ur'
  const id = useId().replace(/:/g, '')
  const [first, second] = wedding.events

  useEffect(() => {
    const el = ref.current
    const path = el?.querySelector<SVGPathElement>('[data-draw]')
    const end = el?.querySelector<HTMLElement>('[data-end]')
    if (!el || !path || !end) return
    const length = prepareDraw(path)
    if (reduced) {
      drawTo(path, length, 1)
      return
    }
    end.style.opacity = '0.45'
    let lastGlow = ''
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      end: 'bottom 55%',
      scrub: 0.5,
      onUpdate: (self) => {
        drawTo(path, length, self.progress)
        // The far icon lights up as the line reaches it — written only
        // when it changes, so the icon is not repainted on every frame.
        const glow = (0.45 + 0.55 * Math.max(0, (self.progress - 0.7) / 0.3)).toFixed(2)
        if (glow !== lastGlow) {
          lastGlow = glow
          end.style.opacity = glow
        }
      },
    })
    return () => trigger.kill()
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

      <div className="absolute top-0 left-0 flex flex-col items-start">
        <span className="flex w-20 justify-center">
          <EventIcon kind={'icon' in first ? first.icon : undefined} className="w-10" />
        </span>
        <p className={`${labelClass} text-left`} lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>
          {label(first.name, first.date)}
        </p>
      </div>

      <div data-end className="absolute right-0 bottom-0 flex flex-col items-end">
        <span className="flex w-20 justify-center">
          <EventIcon kind={'icon' in second ? second.icon : undefined} className="w-10" />
        </span>
        <p className={`${labelClass} text-right`} lang={ur ? 'ur' : 'en'} dir={ur ? 'rtl' : 'ltr'}>
          {label(second.name, second.date)}
        </p>
      </div>
    </div>
  )
}
