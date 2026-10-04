# TODO — Muslim Wedding Invitation (Nikah & Walima)

Status key: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 1 — Setup & foundations  ✅ DONE
- [x] Install deps: tailwindcss v4 + @tailwindcss/vite, gsap, motion, lenis
- [x] Strip Vite scaffold (App.css, demo assets, icons.svg, boilerplate index.css)
- [x] Self-host fonts into `public/fonts/` (Amiri, Cormorant Garamond, Pinyon Script, Jost)
- [x] `src/styles/theme.css` — palette, fonts, spacing, easing as CSS variables + `@theme`
- [x] `src/config/wedding.config.ts` — single source of truth (dummy data for now)
- [x] `src/lib/date.ts` — one shared date/time formatting helper
- [x] `src/lib/gsap.ts` — register ScrollTrigger, DrawSVGPlugin, SplitText once
- [x] `src/hooks/useSmoothScroll.ts` — Lenis + GSAP ticker + ScrollTrigger sync
- [x] `src/hooks/useReducedMotion.ts` — `prefers-reduced-motion` listener
- [x] `src/hooks/useScrollLock.ts` — lock scroll until gate opens
- [x] `index.html` — font preloads, meta, viewport, theme-color
- [x] Folder structure: `components/sections/`, `components/ui/`, `components/svg/`, `hooks/`, `lib/`, `config/`, `styles/`
- [x] Dev server runs clean, `tsc -b` passes
- [x] `src/hooks/useReveal.ts` — varied scroll-reveal variants

## Phase 1.5 — Palette swap + dreamy effects  ✅ DONE
- [x] Repalette `theme.css`: pearl-white / blush / rose-pink / wine / wine-deep / gold trio
- [x] Re-tint shadows to warm rose; new `--foil-gold`, `--foil-rose`, `--glow-gold`, `--glow-white`
- [x] `@theme static` so no token is pruned
- [x] `ui/GoldGlitterText` — gradient clip + shine sweep + twinkling specks + soft halo
- [x] `ui/SparkleField` — 4-point white/gold/rose stars, pop-twinkle-fade
- [x] `ui/ShimmerDust` — canvas dust drifting across hero + countdown
- [x] `ui/FallingPetals` — canvas petals tumbling on their own axis
- [x] `ui/PearlBokeh` — blurred white/pink orbs drifting
- [x] `ui/SparkleLayer` — pointer trail + reveal bursts on one fixed canvas
- [x] `lib/sparkleBus` — fire a burst from anywhere (unit tested, 5/5)
- [x] `lib/canvasScene` — shared DPR/resize/offscreen-pause engine on GSAP's ticker
- [x] `lib/device` — tier detection; trail off on low-end, counts scaled on mid
- [x] `PROMPT.md` section 3 updated to the new design system
- [ ] Wire bursts into scratch card / swipe cards / envelope / RSVP success (Phases 5-8)

## Phase 1.6 — Mobile-first pass  ✅ DONE
- [x] Type scale re-anchored to 360-480px (phone is the design target, not the fallback)
- [x] One phone-width column: `#root` capped at 30rem, centred on blush on wider screens
- [x] Safe-area padding for notch + home indicator
- [x] `overscroll-behavior-y: none` so pull-to-refresh cannot fight the gate/scratch card
- [x] 44px minimum touch targets; `touch-action: manipulation`; no tap-highlight flash
- [x] Inputs forced to >=16px so iOS does not zoom on focus
- [x] `ui/Ornament` — gold/rose divider with 8-point star
- [x] `ui/ArchCard` — mihrab arch frame with gold hairline
- [x] `ui/ScrollHint` — scroll cue
- [x] Fixed: GoldGlitterText forced `inline-block`, overlapping the Bismillah and names
- [x] Fixed: Cormorant old-style figures made dates render at x-height (`nums-lining`)
- [x] Deepened the foil gradient — pale gold was failing contrast on white
- [x] Bokeh split into light/dark tones; was smudging pink behind the hero names
- [x] Verified no horizontal overflow at phone width

## Phase 2 — SVG graphics library  ✅ DONE
- [x] `svg/SvgDefs` — one hidden SVG of shared gold/rose/blush gradients, referenced by id
- [x] `svg/GeometricPattern` — seamless girih tile (8-point star + corner quarters + lattice), drifting
- [x] `svg/MihrabArch` — real arch geometry: ogee (Mughal onion), two-centred pointed, multifoil
- [x] `svg/Lantern` — fanoos with pierced lattice, pivots from the cord not its centre
- [x] `svg/Ornaments` — Crescent, EightStar, CornerFlourish, FloralVine, DomeIcon
- [x] `svg/Monogram` — initials in a girih roundel or lobed cartouche
- [x] `ui/ArchFrame` — arch that wraps content of any height (fixed-aspect head + stretching jambs)
- [x] `ui/ArchPanel` — fixed-aspect ogee panel for the date
- [x] `ui/OrnateFrame` — rectangular panel, doubled rule, corner brackets, star keystone
- [x] Removed `ui/ArchCard` — the half-dome read as a headstone
- [x] Urdu: Noto Nastaliq Urdu self-hosted, `--font-urdu`, roomier line box
- [x] `ui/LanguageToggle` + `lib/langStore` — EN / اردو for translations; Arabic scripture unchanged
- [x] Copy trimmed; graphics now carry the sections instead of paragraphs
- [ ] `svg/GateDoors` + `svg/WaxSeal` — deferred to Phase 3, where they are animated
- [ ] `svg/Bismillah` calligraphy path for DrawSVG — deferred to Phase 3

## Phase 3 — Gate + Hero  ✅ DONE
- [x] `svg/GateDoors` — carved leaves, ogee arch head, girih panels, ring pulls
- [x] `svg/WaxSeal` — monogram seal split along a shared fracture so it can break
- [x] `sections/Gate` — seal cracks, doors swing in 3D, light floods, gold burst
- [x] Scroll locked until opened; gate constrained to the phone column
- [x] Keyboard operable (button autofocused); ref guard stops a double-fire
- [x] Reduced motion: gate fades instead of swinging
- [x] `sections/Hero` — Bismillah mask-wipe, SplitText names, lanterns, particles
- [x] `hooks/useGlyphSupport` — measures U+FDFD, falls back to spelled-out Arabic
- [x] Fixed: SplitText broke `background-clip:text`, leaving the names invisible

## Phase 4 — Quran verse + Families  ✅ DONE
- [x] `hooks/useWordReveal` — TreeWalker split preserving markup, whitespace and Arabic shaping
- [x] `lib/wordProgress` — scroll-to-word mapping, unit tested (7 counts x 3 overlaps)
- [x] Fixed: single-word passages could never finish revealing (span exceeded 1)
- [x] `sections/QuranVerse` — ayah + translation scrub at their own pace
- [x] Multifoil arch outline draws itself in with DrawSVG; jambs wipe down
- [x] `sections/Families` — pointed-arch cards arriving from opposite edges
- [x] Monogram roundels on the springline; heart-crescent joins the two
- [x] `svg/Ornaments` — Heart and HeartCrescent added
- [x] Hearts fall among the petals; pointer/touch nudges them aside
- [x] Blur on hidden words limited to high-tier devices

## Phase 5 — Save the Date (scratch card)  ✅ DONE
- [x] `ui/ScratchCard` — foil drawn procedurally: raking gradient, brushed grain, girih lattice
- [x] `destination-out` scratching, segment-interpolated so fast drags leave no gaps
- [x] `touch-action: none` so a scratch does not scroll the page
- [x] Coverage sampled on release, not per frame — getImageData stalls the pipeline
- [x] 55% cleared -> foil fades, gold/rose burst, petals and hearts fall
- [x] "Or tap to reveal" fallback; auto-revealed under reduced motion
- [x] sr-only live region reports scratch progress
- [x] DPR capped at 2; repaints whole on resize
- [x] `setPointerCapture` guarded — it throws on an unknown pointer id
- [x] `sections/SaveTheDate` — foil inside the ogee arch panel

## Phase 6 — Event swipe cards ✅ DONE
- [x] `sections/Events.tsx` — deck of cards from `wedding.events`
- [x] `ui/EventDeck.tsx` — generic deck; only the top card holds content, the
      ones behind are bare frames (no duplicate text, no hidden tab stops)
- [x] Motion drag, tilt while dragging, throw past threshold, snap back if short
- [x] `lib/deckThrow.ts` — the throw rule, extracted and unit tested (14 cases)
- [x] Dots + prev/next arrow buttons, arrow/Home/End keys, wraps both ways
- [x] `lib/ics.ts` — client-side .ics generation + download (27 assertions)
- [x] "View on map" + "Add to calendar" per card, as hairline text links
- [x] Swipe hint that retires itself on first drag

### Carried forward, deliberately
The brief asked for "Open in Maps" / "Add to Calendar" **buttons**. They are
hairline text links instead — the filled, bordered treatment is exactly what
made the earlier card look like a postage stamp. Same two actions, same
tap targets, quieter.

### Verified
- .ics: structure, floating local DTSTART/DTEND, 2h default, midnight rollover,
  RFC 5545 escaping, 75-octet folding, surrogate-pair safety, round-trip decode
- Live: real button click produces a 620-byte `text/calendar` blob named
  `nikah-2026-11-13.ics`, label flips to "Saved"
- Deck: arrows, dots, wrapping, `aria-current` and live-region sync
- Fixed: the throw threshold was `window.innerWidth * 0.28`. The invitation is
  a fixed ~480px column, so on a desktop window that demanded a 478px drag —
  wider than the card — and the deck could not be swiped at all. Now
  card-relative.

### Still needs a real device
- The drag gesture itself end-to-end (the automated tab freezes rAF, so
  Motion's frameloop never advances there; the decision rule is unit tested)

## Phase 7 — Countdown + Venue reveal
- [ ] `sections/Countdown.tsx` — THE ONLY countdown on the site
- [ ] Rolling/flipping digits, days/hours/mins/secs, single interval, tab-blur safe
- [ ] Night sky: crescent + twinkling stars (CSS/SVG, no canvas needed)
- [ ] Reaching zero -> "Alhamdulillah, the day is here"
- [ ] `sections/Venue.tsx` — closed envelope, tap or swipe up to open
- [ ] Dotted gold path draws on scroll toward the dome icon

## Phase 8 — RSVP + Closing
- [ ] `sections/Rsvp.tsx` — Name / Family Name / Members (1-20) required, optional dua
- [ ] "Please RSVP by [deadline]" from config
- [ ] Web3Forms POST, subject `RSVP: [Name] [Family] - [N] members`
- [ ] Validation, loading state, double-submit guard, friendly error
- [ ] Self-drawing gold SVG check + "Jazakallah Khair, we received your RSVP"
- [ ] `sections/Closing.tsx` — lanterns rise, closing dua, thank you, family names

## Phase 9 — Polish
- [ ] Vary the reveal per section (fade-up / mask wipe / draw-in / scale / stagger)
- [ ] Audit: only `transform` + `opacity` animated
- [ ] Reduced-motion pass across every section (no particles, no parallax)
- [ ] Responsive pass at 360 / 390 / 768 / 1440
- [ ] a11y: heading order, focus rings, contrast, SVG labels, keyboard on all interactions
- [ ] OG tags + generated OG image (monogram + names + date, no photos) — blush/gold treatment
- [ ] Contrast audit: gold on white is the risk area; wine for body text
- [ ] Lighthouse mobile 90+; check no CLS, fonts preloaded
- [ ] Bundle is 573 kB / 190 kB gzip — GSAP + Motion + Lenis all ship.
      Code-split, or drop one animation library.

## Phase 10 — Ship
- [ ] `npm run build` clean, preview verified
- [ ] `vercel.json` if needed
- [ ] Vercel deploy steps written out

---

## Blocked on you
- [ ] Real names, parents, dates, times, venues, addresses, Maps links
- [ ] Web3Forms access key + receiver email
- [ ] Ambient audio file -> `public/audio/ambience.mp3` (optional)
- [ ] Final domain, for absolute OG image URL
