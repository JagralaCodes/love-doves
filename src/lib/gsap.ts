/**
 * Registers every GSAP plugin exactly once and re-exports the
 * pieces the app uses, so components never register plugins
 * themselves (double registration is a common source of bugs).
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText)

/** Shared defaults so every tween feels like part of one system. */
gsap.defaults({ ease: 'power3.out', duration: 0.9 })

/** ScrollTrigger fires a touch later than default, so reveals feel deliberate. */
ScrollTrigger.defaults({ start: 'top 82%', toggleActions: 'play none none none' })

export { gsap, ScrollTrigger, DrawSVGPlugin, SplitText }
