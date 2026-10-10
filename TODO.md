# TODO — love-doves

Everything personal lives in `src/config/wedding.config.ts`. Share links as
`/#urdu` or `/#english`.

## Where things stand

Built, committed, on `origin/main`: gate, hero, verse, families, save-the-date,
events deck, URL-based language, favicon, real names/dates/venues/maps links.

Also committed: Tier 1 + 2 of the motion plan (Venue envelope, RSVP,
Closing, Countdown, Families rope, press feedback, tighter spacing), Tier 3
(parallax, section hand-offs, hero re-entry, progress thread, audio toggle),
lint debt cleared (23 → 0), dead code removed.

**How QA was done:** the Chrome extension would not connect, so the page was
driven headless through the locally installed Chrome (puppeteer-core in a
scratch folder, not a project dependency) at 360 / 390 / 768, English and
`#urdu`, with and without reduced motion — screenshots reviewed, plus DOM
and pixel probes for geometry and hairlines. Zero console errors, no
horizontal overflow at any width.

**Next session, in order:** Lighthouse mobile run, a look at 1440px, then
Ship (§4). Everything else open below needs a real phone or something from
the Blocked list.

Everything below is in priority order.

---

## 1. Visual QA

Done headless (see above). What is left open needs a real phone in hand:
touch feel, pacing, and the parts gated on the Web3Forms key.

**Gate → Hero**
- [x] ~~Four hearts stacked~~ → **one heart** now; tap it and it falls, carrying its monogram; heart-counter dots removed
- [x] Door frame's top edge moved down a step (1.75rem) below the springline, crossing behind the heart's tip
- [x] Doors swing, gate fades, hero plays in — no oval flash, no finished-page flash, no stale scroll
- [x] "Huda" / "Mohammed" fully legible in script; Bismillah tails not clipped; crescent + star correct

**Families** — *rebuilt from `heart-snake-prototype-v3.html`*; the knot, cord and rope are gone (`HeartKnot.tsx`, `RopeHeart.tsx` deleted)
- [x] Cards in the prototype's arched style (gold line + inner hairline, initial in a gold star), drawn to their real size so the arch never stretches; still HTML text, EN + UR
- [x] **Heart snake** (`ui/HeartSnake.tsx`): scroll down → 20 glossy hearts slither out from behind the bride's card, swing round and slip behind the groom's; scroll up → a second stream runs back groom → bride by its own route. Head-to-tail wine → blush ramp, gold every sixth heart, travelling slither + heartbeat, glow
- [x] Better tracking than the prototype: follows the smoothed scroll only while the crossing is on screen (so the first stream leaves the bride's card as you arrive), glides to a stop instead of freezing, caps jumps, layout read only on resize, canvas behind the cards (no per-frame SVG filters), paused off-screen / hidden tab
- [x] Arrival: the receiving card's gold edge flares, its star gives a beat, sparkles where the hearts went in
- [x] Reduced motion: a still trail across the gap. Verified at 360 / 390 (EN + UR), down and up, no console errors
- [ ] Feel the speed on a real phone (`SPEED` 2.2 route-px per scroll-px in `HeartSnake.tsx`)

**Save the Date**
- [x] Foil fills the whole ogee arch, spun-gold look; scratch threshold fires at ~55%; heart confetti bursts

**Events** — *the card stack is gone* (`Events.tsx`, `EventDeck.tsx`, `deckThrow.ts` deleted). Venues + maps live on the envelope; the "when" moved above the reply form:
- [x] **Schedule** (`ui/Schedule.tsx`), above the form: grouped by day, a gold thread with a bead per moment — Fri 13 Nov: Nikah *after Asr Namaz* (Masjid e Abu Bakar) → Rukhsati *after Maghrib Namaz*; Sat 14 Nov: Walima 7–10 PM (Central Plaza Banquet). EN + UR, RTL checked
- [x] "Add to calendar" kept, per event; the Nikah entry runs through the Rukhsati and names it in the description
- [ ] Press squeeze / hover underline — feel only; check on a real phone

**Venue**
- [x] **Envelope, reworked to your notes:** nothing peeks out while sealed; the heart sticker sits in the dead centre; it is *peeled*, not tapped — slide or flick it away (a tap only wiggles it as a hint; keyboard: Enter/Space); then the flap swings back, the card climbs out *behind* the front pocket (lower half still inside), comes forward and settles while the envelope falls away. No layout jump; sealed card is `inert`
- [ ] Envelope: feel the peel threshold on a real phone (`PEEL_DISTANCE` 64px / `PEEL_VELOCITY` 600 in `Envelope.tsx`)
- [x] Gold route draws toward the masjid on scroll; dome rises to meet it
- [ ] Both map links open the right pins — links are correct in config; open them once on a phone

**Reply form** — *no more "RSVP" on screen*: heading "Our joy is incomplete without you" (UR: آپ کے بغیر ہماری خوشی ادھوری ہے), a line asking them to tell us they're coming, button "Count us in" (UR: ہم ضرور آئیں گے), thanks "we can't wait to welcome you". The email subject still starts "RSVP:" so it sorts in the inbox
- [x] Labels float (now transform-only, on the start side in RTL)
- [x] Validation inline / empty submit shakes — verified, no request is sent on an empty submit
- [x] Shows "RSVP opens soon" while the key is a placeholder (correct until the key is in)
- [x] Success draws the ring + check + thank-you; error shows the retry message — verified with the network mocked (payload checked: key, subject "RSVP: <name> <family> - N members", guests, dua, honeypot)
- [ ] Send ONE real RSVP from the live site and confirm which inbox it lands in

**Closing → Countdown**
- [x] Lanterns drop in from hooks; dua wipes in; family names + "With love and duas"
- [x] Countdown is the LAST section; digits roll (not swap); only changed columns move; day/hour labels in Urdu under `#urdu`
- [x] Spacing: no section reads as an island; nothing feels cramped

**Cross-cutting**
- [ ] Tap anywhere on touch → tiny glowing hearts; drag → trail — real-phone check
- [x] `#urdu` flips every label, RTL only on translated blocks
- [x] Reduced motion (`prefers-reduced-motion`): everything collapses to fades, no scrubbing, countdown digits swap

## 2. Tier 3 — Depth and cinematic flow

- [x] **Parallax layering**: lanterns, bokeh, pattern at 0.3–0.6× scroll; content at 1× (GSAP ScrollTrigger scrub, transform only)
- [x] **Section hand-offs**: soft gradient seams between sections, esp. RSVP (light) → Closing (wine) → Countdown so it reads as dusk falling
- [x] Hero re-entry: scroll-scrubbed gold rule + crescent rise when scrolling back up
- [x] **Ambient audio toggle**: fanoos-glow button, opt-in only, remembers choice — built; stays hidden until `public/audio/ambience.mp3` exists (see Blocked), then appears by itself
- [x] Section progress: a thin gold thread down the gutter that fills with scroll

## 3. Tier 4 — Polish, performance, accessibility (old Phase 9)

- [x] **Fix the 23 pre-existing lint errors**: `useFitText` refs read during render (Hero), `Math.random` in `useMemo` (GoldGlitterText, PearlBokeh, SparkleField), fast-refresh exports (MihrabArch), irregular whitespace (date.ts — the NNBSP is intentional; add a disable comment)
- [x] Audit: only `transform` + `opacity` animated anywhere (Motion best-practice); fix any layout-property tweens
- [x] Reduced-motion pass across every section — no particles, no parallax, no scrub
- [ ] Responsive pass — 360 / 390 / 768 done (no overflow); 1440 still to look at
- [x] a11y: heading order, focus rings, contrast, SVG labels, keyboard on every interaction
  — *axe-core: 0 violations (was: invalid aria-label from SplitText, `wine-soft` at 4.24:1 → darkened to #a44a61, 5.1:1). Every section now has a heading. Keyboard reaches scratch fallback, deck, dots, envelope seal; sealed card no longer focusable*
- [x] **Bundle**: Save the Date onwards split into a lazy chunk (all of Motion goes with it). Critical path 612 → 428 kB, 200 → 143 kB gzip
- [x] **OG image** `public/og.jpg` (73 KB, source in `design/og-card.html`) + absolute `og:image` built from `site.url`; **apple-touch-icon PNG**
- [x] `<title>` and OG title with the couple's names — filled from the config at build time (`invitationMeta` in `vite.config.ts`)
- [ ] Lighthouse mobile 90+, no CLS, fonts preloaded
- [x] Dead code: delete `WaxSeal.tsx`, `HeartCrescent` in Ornaments, `ArchPanel`/`OrnateFrame`/`Ornament` if unused

## 4. Ship (old Phase 10)

- [ ] `npm run build` clean; `vite preview` walked end to end
- [ ] `vercel.json` SPA rewrite is in — confirm `/urdu` works on the deployed URL
- [ ] Deploy to Vercel; set the final domain in `site.url`
- [ ] Test the WhatsApp link preview and the `/#urdu` link from an actual phone

---

## 5. UI polish pass (10 Oct, from claude-code-prompt.md)

Done, in order, each checked headless at 390×844 and 360×740 (the Chrome
extension still does not connect, so DevTools device mode + the Performance
panel on a real phone remain for you — see "Blocked on you").

- [x] **Global**: sparkle layer uses pre-rendered sprites (no per-particle shadowBlur), stops drawing when nothing is alive, half the particles on ≤4 cores / <400px; canvas scenes can report idle; Lenis `syncTouch: false` (native touch); arrival glow and music glow are opacity, not filter / box-shadow animations. Hard-coded rgba() still exists in older seams/shadows — new code uses tokens.
- [x] **Gate**: release on pointerdown, never visibility:hidden while fading in, touch-action manipulation; doors start while the heart falls; hero plays in behind them. Measured: hero starts 0.5s, names fully visible **2.2s** after the tap (was ~5s).
- [x] **Hero**: date line `13 · 11 · 2026` under the names; scroll hint is an in-flow bouncing chevron that fades on first scroll — 32px clear of the NIKAH & WALIMA line at both sizes.
- [x] **Quran verse**: word reveal plays once over ~2.2s on entering view (Arabic, then the translation a beat later) — always finishes.
- [x] **Heart snake**: freezes with the page (one frame per scroll event; 0 draws during a 1s pause); one sweep each way (bride-left → groom-right down, groom-left → bride-right up); one stream at a time (in within 10px, out within 20px); head 30px → tail 14px; SPEED 1.6; no per-frame allocations/gBCR.
- [x] **Scratch card**: clears at 60% with one gold burst; the extra confetti canvas there is gone.
- [x] **Envelope → letter** (the main change): letter rises out, envelope stays as a pocket 40px below it; cream paper, deckle edge, gold border, "We would be honoured by your presence at", two venue cards with icon / label / name / address / "Friday, 13 Nov · After Asr" / "Saturday, 14 Nov · 7 – 10 PM" / **Get directions** (Google Maps directions). *Copy address removed at your request.* Reduced motion shows it open. The box grows once at open with a matching scroll jump so the envelope never moves on screen.
- [x] **Journey line**: 220px, masjid "Nikah · Fri 13 Nov" → chandelier "Walima · Sat 14 Nov", dotted gold path drawn by a scrubbed dash mask. Dead space gone.
- [x] **Progress thread**: 2px gradient fill, dots for Invite · Verse · Families · Date · Venue · Celebrations · RSVP that light as the thread reaches them, heart on the tip.
- [x] **Celebrations**: Add-to-calendar gone everywhere, `lib/ics.ts` deleted; venue names 13px, times 18px; gold icons (masjid / doli / chandelier).
- [x] **RSVP**: "Joyfully attending" / "Sadly can't make it" first, then name, family, − / + guests (1–10, attending only), dua; 16px inputs; button shrinks into a heart with a gold burst, then "JazakAllahu Khairan — we've saved your seat." or "We'll miss you — please keep us in your duas." Web3Forms payload now carries `attending` and `members`. *"Reply by" line removed at your request.*
- [x] **Closing**: no 88svh minimum; 20px from the vine to the first line; lines in by ~2s.
- [x] **Share on WhatsApp**: floating bottom-right (safe area), after the gate; message + the page's own URL.
- [x] **Music**: top-right, off by default, HEAD-checks the file on mount and only creates the audio on the first tap. Still appears only once `public/audio/ambience.mp3` exists.
- [x] `npm run build` clean; tsc + eslint clean; axe: 0 violations; CLS 0.0000 while scrolling.
- [ ] **Performance on a phone** — headless Chrome has no GPU, so its 4× CPU numbers overstate the cost: p50 frame 16.8ms, p95 ~34ms, max 150ms, 0–1 long task (52ms), at 390 and 360. Please do the DevTools 4× check on a real device; the likely heavy spots are the hero's blurred bokeh orbs and the drop-shadowed sparkle stars.

## Blocked on you

- [x] **Nikah time** — now "after **Asr** Namaz" (was Zuhr), shown as words (EN + UR)
- [x] **Rukhsati** — "after Maghrib Namaz", same day as the Nikah (`followedBy` on the Nikah in the config)
- [ ] Confirm the clock time behind it: the countdown assumes Nikah **4:45 PM** (Asr ≈ 4:25 in Mira Road mid-Nov) — set `time` / `countdownTarget` to the masjid's jamaat time if different
- [ ] **Walima is now Sat 14 Nov** (moved from the 15th) — confirm 7–10 PM still holds
- [ ] Rukhsati: confirm it is on 13 Nov, and whether it has its own venue (e.g. from the bride's home) — none is shown for it now
- [x] **Web3Forms access key** — in; the RSVP form is live
- [ ] **Where RSVPs land:** Web3Forms sends to the email the KEY was created for — not to anything in our config (`receiverEmail` is a note only). To use another inbox, create a new access key for that address and swap it into `rsvp.formAccessKey`
- [ ] In the Web3Forms dashboard, restrict the key to the final domain once it exists
- [x] Monogram — now `H & M` in the config
- [x] Bride's parents' surname — Saliya → **Dhukka** (Fahad Dhukka & Memuna Fahad Dhukka)
- [ ] Urdu proofread by a native speaker (all strings in `wedding.urdu`)
- [ ] Final domain → `site.url` in the config; the OG image URL, canonical and `.ics` links all follow it
- [ ] Music file → `public/audio/ambience.mp3` (optional; the top-right toggle appears once it exists)
- [ ] **Something in your IDE keeps rewriting `Rsvp.tsx`** with `clsx(...)` wrappers (not a dependency) and an old form body — an open editor buffer auto-saving? Close that tab or reload it from disk, or it will clobber the committed version again
