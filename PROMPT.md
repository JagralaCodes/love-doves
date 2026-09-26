# Build: Muslim Wedding Invitation Website (Nikah & Walima)

You are a senior creative front-end developer. Build a beautiful, animated, mobile-first wedding invitation website with a warm, loving, Islamic feel. It must feel premium, like a luxury digital invitation. Most guests will open it from a WhatsApp link on their phone, so mobile is the main target.

## 1. Tech Stack (use latest stable versions)

- Vite + React + TypeScript
- Tailwind CSS (design tokens in CSS variables)
- GSAP + ScrollTrigger (scroll reveals), DrawSVGPlugin (line drawing), SplitText (letter reveals). All GSAP plugins are free now.
- Motion (`motion/react`) for swipe, drag, and tap interactions
- Lenis for smooth scrolling, synced with ScrollTrigger
- Canvas API for the scratch-card effect
- Google Fonts: Amiri or Aref Ruqaa (Arabic), Cormorant Garamond (headings), a script font like Pinyon Script (names), Inter or Jost (body)
- Deploy target: Vercel (static build)

## 2. Hard Rules (Islamic design)

- NO photos and NO images of people, animals, or any living beings. Not even icons of faces.
- Use only graphics: Islamic geometric patterns (8-point stars, girih, arabesque), mihrab arches, lanterns (fanoos), crescent and stars, floral vines (non-living-being floral is fine), domes, calligraphy.
- Build all graphics as inline SVG so they can animate and stay sharp.
- No background music by default. Add an optional toggle for a soft ambient sound (no instruments) that stays OFF until the user taps it.
- Keep the tone modest, elegant, and loving.

## 3. Design System

### Palette (global CSS variables in `theme.css`)
- --pearl-white: #FFFFFF (main page background)
- --blush: #FCE4EA (soft section backgrounds, cards)
- --rose-pink: #F4B8C6 (accents, borders, hearts, petals)
- --wine: #9B2C4A (headings, names, buttons)
- --wine-deep: #5E1227 (dark sections, countdown background, body text)
- --gold: #D4AF37 (main metallic accent)
- --gold-light: #F5E1A4 (gold highlights and shine)
- --gold-dark: #A67C1F (gold shadows and depth)

Overall feel: soft, dreamy, romantic, and luxurious. Mostly white and blush,
with wine for depth, and gold + white sparkle for magic.

### Golden Glitter Text
- Use for: couple names, Bismillah, the date reveal, section titles, and "Jazakallahu Khairan".
- Text fill is a gold gradient (gold-dark -> gold -> gold-light -> gold -> gold-dark) using `background-clip: text`.
- A shine sweep moves slowly across the text every few seconds.
- Tiny gold glitter specks twinkle on top of the letters (small canvas or SVG layer, random twinkle timing).
- Soft gold glow behind the text (subtle text-shadow, not neon).

### White Glitter and Sparkle Elements
- Small 4-point white star sparkles that pop in, twinkle, and fade at random spots around key sections.
- A soft white shimmer dust layer floating slowly across the hero and countdown.
- Sparkle trail that follows the finger or mouse (light, fades fast). Disable on low-end devices.
- White sparkle burst when something is revealed (scratch card, swipe cards, envelope opening, RSVP success).

### More Dreamy Effects
- Pearl bokeh: soft blurred white and pink circles drifting slowly in the background of the hero and closing sections.
- Falling petals: soft pink petals drifting down across the hero and closing sections, slow and sparse.

### Structure
- Gold should look like real foil: gradients and a subtle shimmer animation, never flat yellow.
- Background: faint repeating geometric pattern, slowly drifting.
- Rounded arch shapes as section frames.
- Arabic text must use `lang="ar"` and `dir="rtl"`.

## 4. Global Config (Single Source of Truth)

Put ALL personal content in ONE file: `src/config/wedding.config.ts`.
No names, dates, times, places, numbers, or texts may be hardcoded in any component. Every component must import from this file. If I change a value here, it must update everywhere on the site.

Use this structure:

export const wedding = {
bride: { name: "[BRIDE NAME]", parents: "[BRIDE'S PARENTS]" },
groom: { name: "[GROOM NAME]", parents: "[GROOM'S PARENTS]" },
monogram: "[B & G]",

countdownTarget: "[YYYY-MM-DDTHH:mm:00+05:30]", // the one main event

events: [
{
name: "Nikah",
date: "[YYYY-MM-DD]",
time: "[TIME]",
venue: "[VENUE NAME]",
address: "[FULL ADDRESS]",
mapsLink: "[GOOGLE MAPS LINK]",
},
{
name: "Walima",
date: "[YYYY-MM-DD]",
time: "[TIME]",
venue: "[VENUE NAME]",
address: "[FULL ADDRESS]",
mapsLink: "[GOOGLE MAPS LINK]",
},
],

texts: {
inviteLine: "You are invited",
quranArabic: "[Surah Ar-Rum 30:21 Arabic]", // verify on quran.com
quranEnglish: "[Translation]",
closingDua: "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fi khayr",
closingDuaMeaning: "[Meaning]",
thankYou: "Jazakallahu Khairan",
},

rsvp: {
deadline: "[YYYY-MM-DD]",
formAccessKey: "[WEB3FORMS ACCESS KEY]",
receiverEmail: "[YOUR EMAIL]",
},
};

- Dates must be formatted from these values using one shared helper (e.g. "Saturday, 12 December 2026").
- Theme colors and fonts must also be global, in one `theme.css` file as CSS variables.

## 5. Sections (in order)

### 5.1 Opening Screen (Gate)

- Full-screen closed arch doors (two carved wooden/gold SVG doors) with a wax-seal monogram in the center.
- Text: "You are invited" + "Tap to open".
- On tap: seal cracks, doors swing open in 3D (perspective), light pours out, and the site is revealed.
- Lock scroll until opened.

### 5.2 Hero

- Bismillah calligraphy draws itself in gold (DrawSVG), or use ﷽ with a shimmer reveal.
- Couple names reveal letter by letter (SplitText) in script font, joined by an animated "&" or a small heart-crescent motif.
- Lanterns gently swing from the top. Gold particles float.
- Scroll hint arrow.

### 5.3 Quran Verse

- Arabic verse fades in word by word on scroll, then the English translation below.
- Ornamental frame border draws around it.

### 5.4 The Families

- Two arch cards side by side (stacked on mobile): bride's side and groom's side, with parents' names.
- Cards rise and slide in from opposite sides on scroll. No photos, use monogram graphics.

### 5.5 Save the Date (Scratch Card)

- A gold-foil scratch card inside an arch frame. Text above: "Scratch to reveal our special day".
- Canvas foil is drawn procedurally (gold gradient + noise + faint geometric pattern).
- Scratch with finger or mouse using `destination-out`. Use `touch-action: none` on the canvas so it doesn't fight page scroll.
- When about 55% is cleared: fade out the foil, show the date big and bold, and burst gold stars / petals.
- Include a "Tap to reveal" fallback button for accessibility.

### 5.6 Events (Swipe Cards)

- A stack of event cards (Nikah, Walima, etc.), like a deck.
- Swipe left/right (Motion drag) to throw the top card away and reveal the next. Card tilts while dragging. Snaps back if the swipe is too short.
- Also add dots and arrow buttons for non-swipe users.
- Each card: event name, date, time, venue, "Open in Maps" button, "Add to Calendar" button (generate an .ics file on the client).

### 5.7 Countdown (only one on the whole site)

- Only ONE countdown on the entire site. Do not add countdowns anywhere else.
- It counts down to `wedding.countdownTarget` from the config file.
- Show days, hours, minutes, seconds. Numbers flip or roll when they change.
- Night-sky background with a crescent and twinkling stars.
- When the time is reached, replace it with: "Alhamdulillah, the day is here".

### 5.8 Venue Reveal

- A closed envelope or door. Tap or swipe up to open it and reveal the venue name, address, and a Maps button.
- A dotted gold path draws on scroll leading to a small mosque/dome icon.

### 5.9 RSVP Form (emailed to me)

- Place this at the end, just before the Closing section.
- Fields (all required):
  - Name → placeholder "Ahemad"
  - Family Name → placeholder "Jagrala"
  - Members Attending → number input, placeholder "4", min 1, max 20
- Optional: a short dua/message box.
- On submit, send the response to my email using Web3Forms (free, no backend). Use the access key and email from the config file.
- Email subject: "RSVP: [Name] [Family Name] – [Members] members".
- Show a loading state on the button, then a gold check that draws itself with SVG + "Jazakallah Khair, we received your RSVP".
- Show a friendly error message if sending fails.
- Validate fields before sending. Prevent double submit.
- Show "Please RSVP by [deadline]" above the form, from the config file.

### 5.10 Closing

- Lanterns slowly rise upward. The closing dua appears.
- Text: "Your presence and duas mean the world to us" + "Jazakallahu Khairan".
- Families' names at the bottom.

## 6. Animation Rules

- Every section has a scroll reveal, but vary them (fade-up, mask wipe, draw-in, scale-in, stagger). Don't repeat the same one everywhere.
- Use easing that feels soft and elegant (e.g. `power3.out`, `expo.out`). Nothing bouncy or cheap.
- Animate only `transform` and `opacity` for 60fps.
- Respect `prefers-reduced-motion`: show content with simple fades, no parallax or particles.

## 7. Quality Requirements

- Mobile-first. Test at 360px, 390px, 768px, 1440px.
- Lighthouse score 90+ on mobile.
- Fonts preloaded. No layout shift.
- Add Open Graph meta tags and a graphic OG image (monogram + names + date, no photos) so the WhatsApp link preview looks beautiful.
- Accessible: proper headings, alt text on SVGs, keyboard support for all interactions, good color contrast.
- Clean folder structure: `components/sections/`, `components/ui/`, `hooks/`, `lib/`.

## 8. How to Work

Build in phases. After each phase, run the dev server, check for errors, and fix them before moving on.

1. Setup: project, Tailwind, fonts, design tokens, Lenis + GSAP wiring, config file.
2. SVG graphics library: patterns, arches, lanterns, doors, crescent, monogram, ornamental borders.
3. Opening gate + Hero.
4. Quran verse + Families.
5. Scratch card.
6. Swipe event cards + .ics + Maps.
7. Countdown + Venue reveal.
8. RSVP + Closing.
9. Polish: timing, spacing, reduced motion, performance, OG tags.
10. Build for production and give me Vercel deploy steps.

Before you start, list your plan and any questions. Then begin Phase 1.
