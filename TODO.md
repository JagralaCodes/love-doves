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

Everything below is in priority order.

---

## 1. Visual QA

Done headless (see above). What is left open needs a real phone in hand:
touch feel, pacing, and the parts gated on the Web3Forms key.

**Gate → Hero**
- [x] Four hearts stacked concentric, no offset; monogram on every heart, stays on a falling one
- [x] Doors swing, gate fades, hero plays in — no oval flash, no finished-page flash, no stale scroll
- [x] "Huda" / "Mohammed" fully legible in script; Bismillah tails not clipped; crescent + star correct

**Families**
- [x] Arch head → body is one surface (no seam); roundel sits inside the arch head
- [x] Heart beats; cord draws bride → around heart → groom on scroll
  — *the straight cords were invisible (gradient on a zero-width bbox); fixed*
- [x] **Rope**: starts at the heart, ties a full heart shape, drops onto the groom's card; bead rides the tip
  — *measured: now starts where the knot's cord ends and its drop runs under the groom's arch, so it meets the apex at 360/390/768*
- [ ] Rope pacing *feels* immersive, not rushed — needs a real thumb on a phone; tune `start`/`end` on `[data-rope-wrap]`
- [x] Rope's final drop lands exactly on the arch apex

**Save the Date**
- [x] Foil fills the whole ogee arch, spun-gold look; scratch threshold fires at ~55%; heart confetti bursts

**Events**
- [x] Swipe slides straight (no tilt); thrown card returns to the back; cards behind are filled in; loops forever
- [x] "Add to calendar" downloads a valid `.ics` (intercepted and checked: escaping, folding, floating times, alarm)
- [x] Card actions on one line, underlines aligned, 44px tap targets
- [ ] Press squeeze / hover underline — feel only; check on a real phone

**Venue**
- [x] Envelope: tap seal OR pull card up opens it; flap swings behind the card; card rises; envelope fades; no layout jump
- [x] Gold route draws toward the masjid on scroll; dome rises to meet it
- [ ] Both map links open the right pins — links are correct in config; open them once on a phone

**RSVP**
- [x] Labels float (now transform-only, on the start side in RTL)
- [ ] Validation inline / empty submit shakes — can only be exercised once the Web3Forms key is in (the button is disabled until then)
- [x] Shows "RSVP opens soon" while the key is a placeholder (correct until the key is in)
- [ ] With a real key: success draws the ring + check, sparkles, thank-you; error shakes + message

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
- [ ] Responsive pass at 360 / 390 / 768 / 1440 (desktop just centres the column)
- [ ] a11y: heading order, focus rings, contrast (gold on white is the risk), SVG labels, keyboard on every interaction (gate hearts, deck, envelope, scratch fallback)
- [ ] **Bundle 604 kB / 199 kB gzip**: lazy-load deck, scratch card, confetti, envelope below the fold; consider dropping Lenis or Motion
- [ ] **OG image** (monogram + names + date, blush/gold, no photos) + absolute `og:image` URL; **apple-touch-icon PNG** (iOS ignores the SVG)
- [ ] `<title>` and OG title with the couple's names
- [ ] Lighthouse mobile 90+, no CLS, fonts preloaded
- [x] Dead code: delete `WaxSeal.tsx`, `HeartCrescent` in Ornaments, `ArchPanel`/`OrnateFrame`/`Ornament` if unused

## 4. Ship (old Phase 10)

- [ ] `npm run build` clean; `vite preview` walked end to end
- [ ] `vercel.json` SPA rewrite is in — confirm `/urdu` works on the deployed URL
- [ ] Deploy to Vercel; set the final domain in `site.url`
- [ ] Test the WhatsApp link preview and the `/#urdu` link from an actual phone

---

## Blocked on you

- [ ] **Nikah time** — still the `11:00` placeholder; the countdown and the `.ics` both use it
- [ ] **Web3Forms access key** — free at https://web3forms.com; RSVP is disabled until it's in
- [ ] RSVP deadline — moved to 5 Nov (was after the wedding); confirm
- [ ] Monogram — currently `H & S`; `H & M` (Huda & Mohammed)?
- [ ] Urdu proofread by a native speaker (all strings in `wedding.urdu`)
- [ ] Final domain, for the absolute OG image URL
- [ ] Ambient audio file → `public/audio/ambience.mp3` (optional; enables the toggle)
