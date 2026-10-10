/**
 * Registers GSAP's one plugin exactly once and re-exports the pieces the
 * app uses, so components never register plugins themselves.
 *
 * Only the core and ScrollTrigger: the names are split into letters by a
 * few lines of DOM (sections/Hero), and lines are drawn with
 * stroke-dashoffset (lib/draw) — neither is worth a plugin in the bundle.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Shared defaults so every tween feels like part of one system. */
gsap.defaults({ ease: 'power3.out', duration: 0.9 })

/** ScrollTrigger fires a touch later than default, so reveals feel deliberate. */
ScrollTrigger.defaults({ start: 'top 82%', toggleActions: 'play none none none' })

export { gsap, ScrollTrigger }
