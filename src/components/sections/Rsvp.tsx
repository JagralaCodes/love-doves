import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { gsap } from '../../lib/gsap'
import { useReveal } from '../../hooks/useReveal'
import { useLang, langAttrs } from '../../hooks/useLang'
import { useReducedMotion } from '../../hooks/useReducedMotion'

import { GeometricPattern } from '../svg/GeometricPattern'
import { EightStar } from '../svg/Ornaments'
import { SparkleField } from '../ui/SparkleField'
import { TapButton } from '../ui/Tappable'
import { GoldGlitterText } from '../ui/GoldGlitterText'

import { wedding } from '../../config/wedding.config'
import { formatDate } from '../../lib/date'
import { sparkleBurstFrom } from '../../lib/sparkleBus'
import { seam } from '../../lib/seam'

type Status = 'idle' | 'sending' | 'sent' | 'error'
type Errors = Partial<Record<'name' | 'family' | 'members', string>>

const ENDPOINT = 'https://api.web3forms.com/submit'
const MAX_MEMBERS = 20

/** Until a real key is pasted into the config, the form cannot post. */
const KEY_READY = !/^\[.*\]$/.test(wedding.rsvp.formAccessKey) && wedding.rsvp.formAccessKey.length > 10

/**
 * Will you join us? — the one thing the invitation actually needs a guest
 * to do, so it is treated as a moment rather than a form.
 *
 * Labels sit inside the field and lift when it is filled; the button has
 * real press physics; success draws a gold check and fires a burst;
 * failure shakes gently and says so in plain words. A hidden honeypot
 * field and a sending guard keep bots and double-taps out.
 */
export function Rsvp() {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const reduced = useReducedMotion()
  const ref = useReveal<HTMLDivElement>({ variant: 'mask-wipe' })

  const [name, setName] = useState('')
  const [family, setFamily] = useState('')
  const [members, setMembers] = useState('')
  const [dua, setDua] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const sendingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  const s = (en: string, urdu: string) => (ur ? urdu : en)
  const required = s(wedding.texts.required, wedding.urdu.required)

  const validate = (): Errors => {
    const e: Errors = {}
    if (!name.trim()) e.name = required
    if (!family.trim()) e.family = required
    const n = Number(members)
    if (!members.trim() || !Number.isInteger(n) || n < 1 || n > MAX_MEMBERS) e.members = `1–${MAX_MEMBERS}`
    return e
  }

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (sendingRef.current || !KEY_READY) return

    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      shake()
      return
    }

    sendingRef.current = true
    setStatus('sending')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: wedding.rsvp.formAccessKey,
          subject: `RSVP: ${name.trim()} ${family.trim()} - ${members} members`,
          from_name: `${name.trim()} ${family.trim()}`,
          name: name.trim(),
          family: family.trim(),
          members: Number(members),
          message: dua.trim(),
          // The hidden honeypot: people never see it, bots tick it, and
          // Web3Forms drops any submission where it is set.
          botcheck: Boolean(formRef.current?.querySelector<HTMLInputElement>('[name="botcheck"]')?.checked),
        }),
      })
      const json = (await res.json()) as { success?: boolean }
      if (!res.ok || !json.success) throw new Error('rejected')
      setStatus('sent')
    } catch {
      setStatus('error')
      shake()
    } finally {
      sendingRef.current = false
    }
  }

  const shake = () => {
    if (reduced || !formRef.current) return
    gsap.fromTo(
      formRef.current,
      { x: 0 },
      { x: 0, duration: 0.5, ease: 'none', keyframes: { x: [0, -7, 6, -4, 3, 0] } },
    )
  }

  // Success: the check draws itself, then the hearts go up.
  useEffect(() => {
    if (status !== 'sent') return
    const el = doneRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      const check = el.querySelector('[data-check]')
      const ring = el.querySelector('[data-ring]')
      if (reduced) {
        gsap.set([check, ring], { autoAlpha: 1 })
        return
      }
      gsap
        .timeline({ onComplete: () => sparkleBurstFrom(el, { count: 44, tone: 'mixed', power: 240 }) })
        .fromTo(ring, { drawSVG: '50% 50%', autoAlpha: 1 }, { drawSVG: '0% 100%', duration: 0.9, ease: 'power2.inOut' })
        .fromTo(check, { drawSVG: '0%', autoAlpha: 1 }, { drawSVG: '100%', duration: 0.55, ease: 'power2.out' }, '-=0.35')
    }, el)
    return () => ctx.revert()
  }, [status, reduced])

  const fieldClass = (bad?: string) =>
    `peer w-full rounded-[0.75rem] border bg-white/70 px-4 pt-5 pb-2 font-body text-wine-deep outline-none transition-colors duration-300 placeholder-transparent focus:border-wine/60 focus:bg-white ${
      bad ? 'border-wine/60' : 'border-gold/35'
    }`
  // Floating labels, transform only. The label never moves in layout: it
  // rests centred in the field and floats by translate + scale from its
  // start edge (left in English, right in Urdu). The old version animated
  // `top` and `font-size`, re-laying out the form on every frame of focus.
  // Logical `start-4`, so the label sits on the reading side in RTL too.
  const FLOAT =
    'peer-focus:-translate-y-[calc(50%+0.66rem)] peer-focus:scale-[0.74] peer-[:not(:placeholder-shown)]:-translate-y-[calc(50%+0.66rem)] peer-[:not(:placeholder-shown)]:scale-[0.74]'
  const labelBase =
    'pointer-events-none absolute start-4 origin-left text-fluid-sm text-wine-soft transition-transform duration-200 ease-out rtl:origin-right'
  const labelClass = `${labelBase} top-1/2 -translate-y-1/2 ${FLOAT}`
  // The textarea's label rests on its first line rather than its middle.
  const areaLabelClass = `${labelBase} top-4 peer-focus:-translate-y-[0.62rem] peer-focus:scale-[0.74] peer-[:not(:placeholder-shown)]:-translate-y-[0.62rem] peer-[:not(:placeholder-shown)]:scale-[0.74]`

  return (
    <section
      className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]"
      style={seam('var(--color-blush-soft)', 'var(--color-pearl-white)')}
    >
      <GeometricPattern scale={100} opacity={0.045} />
      <SparkleField count={7} tone="rose" />

      <div ref={ref} className="relative z-10 mx-auto max-w-[20rem] text-center">
        <EightStar className="mx-auto w-3" />
        <GoldGlitterText
          block
          as="h2"
          tone="rose"
          className={`mt-4 ${ur ? 'font-urdu text-fluid-2xl leading-[2]' : 'font-script text-fluid-3xl leading-tight'}`}
          specks={10}
          lang={t.lang}
          dir={t.dir}
        >
          {ur ? wedding.urdu.rsvpHeading : wedding.rsvp.heading}
        </GoldGlitterText>
        <p
          className={`nums-lining text-2xs mt-3 tracking-[0.3em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
          lang={t.lang}
          dir={t.dir}
        >
          {s(wedding.texts.rsvpBy, wedding.urdu.rsvpBy)} ·{' '}
          {/* Isolated: inside an RTL Urdu line, "5 November 2026" was being
              reordered by the bidi algorithm into "November 2026 5". */}
          <bdi lang="en" dir="ltr" className="font-body tracking-[0.12em]">
            {formatDate(wedding.rsvp.deadline)}
          </bdi>
        </p>

        {status === 'sent' ? (
          <div ref={doneRef} className="mt-8">
            <svg viewBox="0 0 80 80" className="mx-auto w-20" aria-hidden="true">
              <circle data-ring cx="40" cy="40" r="34" fill="none" stroke="url(#goldFoil)" strokeWidth="1.8" style={{ visibility: 'hidden' }} />
              <path data-check d="M24 41 L35 52 L57 29" fill="none" stroke="url(#goldFoil)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ visibility: 'hidden' }} />
            </svg>
            <p
              className={`mt-5 text-wine ${ur ? 'font-urdu text-fluid-lg leading-[2.2]' : 'font-display text-fluid-lg'}`}
              lang={t.lang}
              dir={t.dir}
              role="status"
            >
              {s(wedding.texts.rsvpThanks, wedding.urdu.rsvpThanks)}
            </p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-7 space-y-3 text-start" dir={t.dir}>
            {/* Honeypot: real people never see it; bots fill it. */}
            <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            <Field id="rsvp-name" label={s(wedding.texts.rsvpName, wedding.urdu.rsvpName)} error={errors.name} fieldClass={fieldClass} labelClass={labelClass}>
              <input id="rsvp-name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder=" " autoComplete="name" className={fieldClass(errors.name)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'rsvp-name-err' : undefined} />
            </Field>

            <Field id="rsvp-family" label={s(wedding.texts.rsvpFamily, wedding.urdu.rsvpFamily)} error={errors.family} fieldClass={fieldClass} labelClass={labelClass}>
              <input id="rsvp-family" name="family" value={family} onChange={(e) => setFamily(e.target.value)} placeholder=" " autoComplete="family-name" className={fieldClass(errors.family)} aria-invalid={!!errors.family} aria-describedby={errors.family ? 'rsvp-family-err' : undefined} />
            </Field>

            <Field id="rsvp-members" label={s(wedding.texts.rsvpMembers, wedding.urdu.rsvpMembers)} error={errors.members} fieldClass={fieldClass} labelClass={labelClass}>
              <input id="rsvp-members" name="members" type="number" inputMode="numeric" min={1} max={MAX_MEMBERS} value={members} onChange={(e) => setMembers(e.target.value)} placeholder=" " className={`${fieldClass(errors.members)} nums-lining`} aria-invalid={!!errors.members} aria-describedby={errors.members ? 'rsvp-members-err' : undefined} />
            </Field>

            <div className="relative">
              <textarea id="rsvp-dua" name="message" value={dua} onChange={(e) => setDua(e.target.value)} placeholder=" " rows={3} className={`${fieldClass()} resize-none leading-relaxed`} />
              <label htmlFor="rsvp-dua" className={areaLabelClass}>
                {s(wedding.texts.rsvpDua, wedding.urdu.rsvpDua)}
              </label>
            </div>

            <div className="pt-2 text-center">
              <TapButton
                type="submit"
                disabled={status === 'sending' || !KEY_READY}
                className="inline-flex min-h-[var(--tap-min)] items-center justify-center gap-2 rounded-full bg-wine px-8 py-3 font-display text-fluid-base tracking-[0.12em] text-pearl-white shadow-[0_12px_28px_-14px_rgba(94,18,39,0.7)] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {status === 'sending' && (
                  <span className="size-3 animate-spin rounded-full border border-pearl-white/40 border-t-pearl-white" aria-hidden="true" />
                )}
                {status === 'sending'
                  ? s(wedding.texts.rsvpSending, wedding.urdu.rsvpSending)
                  : s(wedding.texts.rsvpSubmit, wedding.urdu.rsvpSubmit)}
              </TapButton>

              {!KEY_READY && (
                <p className="text-2xs mt-3 tracking-[0.25em] text-wine-soft uppercase" lang={t.lang} dir={t.dir}>
                  {s(wedding.texts.rsvpDisabled, wedding.urdu.rsvpDisabled)}
                </p>
              )}
              {status === 'error' && (
                <p className="text-fluid-sm mt-3 text-wine" role="alert" lang={t.lang} dir={t.dir}>
                  {s(wedding.texts.rsvpError, wedding.urdu.rsvpError)}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  error,
  children,
  labelClass,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
  fieldClass: (bad?: string) => string
  labelClass: string
}) {
  return (
    <div className="relative">
      {children}
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {error && (
        <span id={`${id}-err`} className="text-2xs absolute end-4 top-1/2 -translate-y-1/2 tracking-[0.15em] text-wine uppercase">
          {error}
        </span>
      )}
    </div>
  )
}
