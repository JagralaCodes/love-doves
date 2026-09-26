# Love Doves — Nikah & Walima Invitation

An animated, mobile-first digital wedding invitation. Most guests open it from
a WhatsApp link on a phone, so the phone is the design target: the whole site
is one column capped at 30rem, centred on a blush backdrop on wider screens.

## Stack

| | |
|---|---|
| Build | Vite 8 + React 19 + TypeScript |
| Styling | Tailwind v4 (CSS-first, tokens in `src/styles/theme.css`) |
| Motion | GSAP 3.15 — ScrollTrigger, DrawSVG, SplitText |
| Scroll | Lenis, driven by GSAP's ticker |
| Gestures | Motion (`motion/react`) |
| Fonts | Self-hosted — Amiri, Noto Nastaliq Urdu, Cormorant Garamond, Pinyon Script, Jost |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # serve the build locally
```

## Editing the content

**Everything personal lives in one file: `src/config/wedding.config.ts`.**
Names, dates, times, venues, addresses, map links, copy and the RSVP settings
all read from it. No component hardcodes content — change a value there and it
updates everywhere.

Dates are stored machine-readable (`2026-12-12`, `11:00`) and formatted for
display by the single helper in `src/lib/date.ts`, so the format stays
identical across the site.

> The values currently in the config are **dummy placeholders**. Replace them
> before sharing the link.

### Still to fill in

- Real names, parents, dates, times, venues and Google Maps links
- A free [Web3Forms](https://web3forms.com) access key — the RSVP form stays
  disabled until `rsvp.formAccessKey` is set
- Optional ambience at `public/audio/ambience.mp3` (the toggle hides itself if
  the file is absent)
- The deployed URL, for the absolute Open Graph image path

### Urdu

The EN / اردو toggle switches translations only — Qur'anic Arabic is never
substituted. **The Urdu in the config needs a native speaker's proofread
before the link goes out.**

## Design rules

These are deliberate constraints, not preferences:

- **No photographs, and no depictions of people, animals or any living being** —
  not even face icons. Ornament is geometric (girih, 8-point stars),
  architectural (mihrab arches, domes, lanterns), floral, or calligraphic.
  Hearts are symbols, not living beings, and are used for the love accents.
- All graphics are inline SVG so they animate and stay sharp.
- No audio plays by default.
- Only `transform` and `opacity` are animated, for 60fps. The one exception is
  the blur on un-revealed words, which is limited to high-tier devices.
- `prefers-reduced-motion` is honoured everywhere: no particles, no parallax,
  no swinging gate — content simply fades in.

## Layout

```
src/
  config/       wedding.config.ts — the single source of truth
  components/
    sections/   full page sections (Gate, Hero, QuranVerse, Families, …)
    ui/         reusable pieces (frames, glitter text, particle layers)
    svg/        the graphics library (arches, lanterns, ornaments, doors)
  hooks/        scroll, reveal, language, reduced-motion, glyph support
  lib/          gsap setup, date helpers, canvas engine, device tiers
  styles/       theme.css — palette, fonts, type scale, easings
```

## Branches

- `main` — stable
- `staging` — active development

## Deploying

Static build, targeted at Vercel:

```bash
npm run build    # outputs to dist/
```
