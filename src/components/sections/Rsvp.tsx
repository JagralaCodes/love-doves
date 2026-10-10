import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap } from '../../lib/gsap'
import { useReveal } from '../../hooks/useReveal'
import { useLang, langAttrs } from '../../hooks/useLang'
import { useReducedMotion } from '../../hooks/useReducedMotion'

import { GeometricPattern } from '../svg/GeometricPattern'
import { EightStar, Heart } from '../svg/Ornaments'
import { SparkleField } from '../ui/SparkleField'
import { TapButton } from '../ui/Tappable'
import { GoldGlitterText } from '../ui/GoldGlitterText'
import { Schedule } from '../ui/Schedule'

import { wedding } from '../../config/wedding.config'
import { sparkleBurstFrom } from '../../lib/sparkleBus'
import { seam } from '../../lib/seam'

type Status = 'idle' | 'sending' | 'sent' | 'error'
type Choice = 'yes' | 'no'
type Errors = Partial<Record<'name' | 'family', string>>

const ENDPOINT = 'https://api.web3forms.com/submit'
const MIN_GUESTS = 1
const MAX_GUESTS = 10

/** Until a real key is pasted into the config, the form cannot post. */
const KEY_READY = !/^\[.*\]$/.test(wedding.rsvp.formAccessKey) && wedding.rsvp.formAccessKey.length > 10

/**
 * When it all happens, then the reply — the one thing the invitation
 * actually needs a guest to do, so it is treated as a moment rather than
 * a form, and asked warmly rather than as an "RSVP".
 *
 * Step one is a choice: attending, or sadly not. Only then the form:
 * name, family, a − / + guest count (for those attending) and an
 * optional dua. Inputs are 16px, so iOS does not zoom in on focus. On
 * send the button shrinks away and a heart springs up in its place with a
 * gold burst, then the thank-you. Failure shakes gently and says so.
 */
export function Rsvp() {
  const lang = useLang()
  const t = langAttrs(lang)
  const ur = lang === 'ur'
  const reduced = useReducedMotion()
  const ref = useReveal<HTMLDivElement>({ variant: 'mask-wipe' })

  const [choice, setChoice] = useState<Choice | null>(null)
  const [name, setName] = useState('')
  const [family, setFamily] = useState('')
  const [guests, setGuests] = useState(2)
  const [dua, setDua] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const sendingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  const s = (en: string, urdu: string) => (ur ? urdu : en)
  const required = s(wedding.texts.required, wedding.urdu.required)
  const attending = choice === 'yes'

  const validate = (): Errors => {
    const e: Errors = {}
    if (!name.trim()) e.name = required
    if (!family.trim()) e.family = required
    return e
  }

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (sendingRef.current || !KEY_READY || !choice) return

    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      shake()
      return
    }

    sendingRef.current = true
    setStatus('sending')
    try {
      const who = `${name.trim()} ${family.trim()}`
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: wedding.rsvp.formAccessKey,
          subject: attending ? `RSVP: ${who} - attending, ${guests} guests` : `RSVP: ${who} - not attending`,
          from_name: who,
          name: name.trim(),
          family: family.trim(),
          attending: attending ? 'yes' : 'no',
          members: attending ? guests : 0,
          message: dua.trim(),
          // The hidden honeypot: people never see it, bots tick it, and
          // Web3Forms drops any submission where it is set.
          botcheck: Boolean(formRef.current?.querySelector<HTMLInputElement>('[name="botcheck"]')?.checked),
        }),
      })
      const json = (await res.json()) as { success?: boolean }
      if (!res.ok || !json.success) throw new Error('rejected')
      // The button shrinks away first; the heart takes its place.
      await new Promise<void>((done) => {
        const btn = buttonRef.current
        if (!btn || reduced) return done()
        gsap.to(btn, { scale: 0.2, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done })
      })
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

  // Sent: the heart springs up with a gold burst, then the words.
  useEffect(() => {
    if (status !== 'sent') return
    const el = doneRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      const heart = el.querySelector('[data-heart]')
      const words = el.querySelector('[data-words]')
      if (reduced) {
        gsap.set([heart, words], { autoAlpha: 1 })
        return
      }
      gsap
        .timeline()
        .fromTo(heart, { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' })
        .call(() => sparkleBurstFrom(heart, { count: 36, tone: 'gold', power: 220 }), [], 0.12)
        .fromTo(words, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.45')
    }, el)
    return () => ctx.revert()
  }, [status, reduced])

  // 16px, so iOS does not zoom the page when a field is focused.
  const fieldClass = (bad?: string) =>
    `peer w-full rounded-[0.75rem] border bg-white/70 px-4 pt-5 pb-2 font-body text-base text-wine-deep outline-none transition-colors duration-300 placeholder-transparent focus:border-wine/60 focus:bg-white ${
      bad ? 'border-wine/60' : 'border-gold/35'
    }`
  // Floating labels, transform only. The label never moves in layout: it
  // rests centred in the field and floats by translate + scale from its
  // start edge (left in English, right in Urdu).
  const FLOAT =
    'peer-focus:-translate-y-[calc(50%+0.66rem)] peer-focus:scale-[0.74] peer-[:not(:placeholder-shown)]:-translate-y-[calc(50%+0.66rem)] peer-[:not(:placeholder-shown)]:scale-[0.74]'
  const labelBase =
    'pointer-events-none absolute start-4 origin-left text-fluid-sm text-wine-soft transition-transform duration-200 ease-out rtl:origin-right'
  const labelClass = `${labelBase} top-1/2 -translate-y-1/2 ${FLOAT}`
  // The textarea's label rests on its first line rather than its middle.
  const areaLabelClass = `${labelBase} top-4 peer-focus:-translate-y-[0.62rem] peer-focus:scale-[0.74] peer-[:not(:placeholder-shown)]:-translate-y-[0.62rem] peer-[:not(:placeholder-shown)]:scale-[0.74]`

  const chipClass = (on: boolean) =>
    `flex-1 rounded-[1rem] border px-3 py-4 font-display text-fluid-base leading-snug transition-colors duration-300 ${
      on ? 'border-wine bg-wine text-pearl-white' : 'border-gold/45 bg-white/60 text-wine'
    } ${ur ? 'font-urdu leading-[1.9]' : ''}`
  const stepClass =
    'grid size-[var(--tap-min)] place-items-center rounded-full border border-gold/50 bg-white/70 font-display text-fluid-lg text-wine disabled:opacity-35'

  return (
    <section
      className="relative overflow-hidden bg-pearl-white px-[var(--page-gutter)] py-[var(--section-gap)]"
      style={seam('var(--color-blush-soft)', 'var(--color-pearl-white)')}
    >
      <GeometricPattern scale={100} opacity={0.045} />
      <SparkleField count={7} tone="rose" />

      <div ref={ref} className="relative z-10 mx-auto max-w-[20rem] text-center">
        <h2
          className={`text-2xs tracking-[0.35em] text-wine-soft ${ur ? 'font-urdu' : 'uppercase'}`}
          lang={t.lang}
          dir={t.dir}
        >
          {s(wedding.texts.eventsHeading, wedding.urdu.eventsHeading)}
        </h2>
        <div data-thread="Celebrations" className="mt-5">
          <Schedule />
        </div>

        <span data-thread="RSVP" className="mt-9 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-8 bg-gold/40" />
          <EightStar className="w-3" />
          <span className="h-px w-8 bg-gold/40" />
        </span>
        <GoldGlitterText
          block
          as="h2"
          tone="rose"
          className={`mt-4 ${ur ? 'font-urdu text-fluid-2xl leading-[2]' : 'font-script text-fluid-3xl leading-tight'}`}
          specks={10}
          lang={t.lang}
          dir={t.dir}
        >
          {s(wedding.texts.rsvpHeading, wedding.urdu.rsvpHeading)}
        </GoldGlitterText>
        <p
          className={`text-fluid-sm mt-3 text-wine-soft ${ur ? 'font-urdu leading-[2.1]' : 'leading-relaxed'}`}
          lang={t.lang}
          dir={t.dir}
        >
          {s(wedding.texts.rsvpInvite, wedding.urdu.rsvpInvite)}
        </p>

        {status === 'sent' ? (
          <div ref={doneRef} className="mt-8">
            <span data-heart className="mx-auto block w-16" style={{ visibility: 'hidden' }}>
              <Heart className="w-full" />
            </span>
            <p
              data-words
              className={`mt-5 text-wine ${ur ? 'font-urdu text-fluid-lg leading-[2.2]' : 'font-display text-fluid-lg'}`}
              lang={t.lang}
              dir={t.dir}
              role="status"
              style={{ visibility: 'hidden' }}
            >
              {attending
                ? s(wedding.texts.rsvpThanks, wedding.urdu.rsvpThanks)
                : s(wedding.texts.rsvpThanksNo, wedding.urdu.rsvpThanksNo)}
            </p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-7 text-start" dir={t.dir}>
            {/* Honeypot: real people never see it; bots fill it. */}
            <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

            {/* Step one: the choice. */}
            <div className="flex gap-3" role="group" aria-label={s(wedding.texts.rsvpHeading, wedding.urdu.rsvpHeading)}>
              <TapButton onClick={() => setChoice('yes')} aria-pressed={choice === 'yes'} className={chipClass(choice === 'yes')} lang={t.lang}>
                {s(wedding.texts.rsvpYes, wedding.urdu.rsvpYes)}
              </TapButton>
              <TapButton onClick={() => setChoice('no')} aria-pressed={choice === 'no'} className={chipClass(choice === 'no')} lang={t.lang}>
                {s(wedding.texts.rsvpNo, wedding.urdu.rsvpNo)}
              </TapButton>
            </div>

            {/* The rest appears once they have chosen. */}
            <AnimatePresence initial={false}>
              {choice && (
                <motion.div
                  key="fields"
                  className="space-y-3 pt-4"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Field id="rsvp-name" label={s(wedding.texts.rsvpName, wedding.urdu.rsvpName)} error={errors.name} labelClass={labelClass}>
                    <input id="rsvp-name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder=" " autoComplete="name" className={fieldClass(errors.name)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'rsvp-name-err' : undefined} />
                  </Field>

                  <Field id="rsvp-family" label={s(wedding.texts.rsvpFamily, wedding.urdu.rsvpFamily)} error={errors.family} labelClass={labelClass}>
                    <input id="rsvp-family" name="family" value={family} onChange={(e) => setFamily(e.target.value)} placeholder=" " autoComplete="family-name" className={fieldClass(errors.family)} aria-invalid={!!errors.family} aria-describedby={errors.family ? 'rsvp-family-err' : undefined} />
                  </Field>

                  {attending && (
                    <div className="flex items-center justify-between rounded-[0.75rem] border border-gold/35 bg-white/70 px-4 py-2">
                      <span id="rsvp-guests-label" className={`text-fluid-sm text-wine-soft ${ur ? 'font-urdu' : ''}`}>
                        {s(wedding.texts.rsvpMembers, wedding.urdu.rsvpMembers)}
                      </span>
                      <div className="flex items-center gap-3" role="group" aria-labelledby="rsvp-guests-label">
                        <TapButton
                          onClick={() => setGuests((g) => Math.max(MIN_GUESTS, g - 1))}
                          disabled={guests <= MIN_GUESTS}
                          aria-label={s(wedding.texts.rsvpFewer, wedding.urdu.rsvpFewer)}
                          className={stepClass}
                          lift={false}
                        >
                          −
                        </TapButton>
                        <span className="nums-lining w-6 text-center font-display text-fluid-xl text-wine" aria-live="polite" lang="en" dir="ltr">
                          {guests}
                        </span>
                        <TapButton
                          onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
                          disabled={guests >= MAX_GUESTS}
                          aria-label={s(wedding.texts.rsvpMore, wedding.urdu.rsvpMore)}
                          className={stepClass}
                          lift={false}
                        >
                          +
                        </TapButton>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <textarea id="rsvp-dua" name="message" value={dua} onChange={(e) => setDua(e.target.value)} placeholder=" " rows={3} className={`${fieldClass()} resize-none leading-relaxed`} />
                    <label htmlFor="rsvp-dua" className={areaLabelClass}>
                      {s(wedding.texts.rsvpDua, wedding.urdu.rsvpDua)}
                    </label>
                  </div>

                  <div className="pt-2 text-center">
                    <div ref={buttonRef} className="inline-block">
                      <TapButton
                        type="submit"
                        disabled={status === 'sending' || !KEY_READY}
                        className={`inline-flex min-h-[var(--tap-min)] items-center justify-center gap-2 rounded-full bg-wine px-8 py-3 font-display text-fluid-base tracking-[0.12em] text-pearl-white shadow-[0_12px_28px_-14px_rgba(94,18,39,0.7)] disabled:cursor-not-allowed disabled:opacity-55 ${ur ? 'font-urdu' : ''}`}
                        lang={t.lang}
                      >
                        {status === 'sending' && (
                          <span className="size-3 animate-spin rounded-full border border-pearl-white/40 border-t-pearl-white" aria-hidden="true" />
                        )}
                        {status === 'sending'
                          ? s(wedding.texts.rsvpSending, wedding.urdu.rsvpSending)
                          : attending
                            ? s(wedding.texts.rsvpSubmit, wedding.urdu.rsvpSubmit)
                            : s(wedding.texts.rsvpSubmitNo, wedding.urdu.rsvpSubmitNo)}
                      </TapButton>
                    </div>

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
                </motion.div>
              )}
            </AnimatePresence>
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
