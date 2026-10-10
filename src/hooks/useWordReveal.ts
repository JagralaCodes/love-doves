import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motionPrefs'
import { wordProgressAt } from '../lib/wordProgress'

type Options = {
  /** How much neighbouring words overlap, 0–1. */
  overlap?: number
  start?: string
  end?: string
  disabled?: boolean
  /**
   * 'scroll' scrubs the reveal to the scroll position, so it sits wherever
   * the reader stops. 'time' plays it once, over `duration` seconds, from
   * the moment the passage comes into view — and always finishes.
   */
  mode?: 'scroll' | 'time'
  /** Seconds, for `mode: 'time'`. */
  duration?: number
  /** Seconds before a timed reveal begins. */
  delay?: number
}

/**
 * Reveals text word by word — scrubbed to the scroll, or played once on
 * entering view.
 *
 * Words are split by walking text nodes rather than rewriting innerHTML,
 * so inline markup, whitespace and — crucially for Arabic — the shaping
 * inside each word survive. Each word is wrapped in place and the original
 * text nodes are restored on teardown.
 *
 * Progress drives a per-word `--word-progress`; CSS interpolates the
 * visible state from it. Under reduced motion nothing is split at all.
 */
export function useWordReveal<T extends HTMLElement = HTMLDivElement>(
  options: Options = {},
) {
  const ref = useRef<T | null>(null)
  const {
    overlap = 0.25,
    start = 'top 85%',
    end = 'bottom 60%',
    disabled,
    mode = 'scroll',
    duration = 2.2,
    delay = 0,
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    // Reduced motion: leave the text exactly as authored.
    if (prefersReducedMotion()) {
      el.style.setProperty('--word-progress', '1')
      return
    }

    // ── split ──────────────────────────────────────────────────────────
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        if (parent.closest('[data-no-split]')) return NodeFilter.FILTER_REJECT
        const tag = parent.tagName
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_ACCEPT
      },
    })

    const textNodes: Text[] = []
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

    const words: HTMLElement[] = []
    /** Enough to put the DOM back exactly as it was. */
    const restores: { original: Text; inserted: Node[]; parent: Node }[] = []

    for (const node of textNodes) {
      const parent = node.parentNode
      if (!parent) continue

      // Capture the separators too, so spacing is preserved verbatim.
      const parts = node.nodeValue!.split(/(\s+)/).filter(Boolean)
      const frag = document.createDocumentFragment()
      const inserted: Node[] = []

      for (const part of parts) {
        if (/^\s+$/.test(part)) {
          const ws = document.createTextNode(part)
          frag.appendChild(ws)
          inserted.push(ws)
        } else {
          const span = document.createElement('span')
          span.className = 'reveal-word'
          span.textContent = part
          frag.appendChild(span)
          inserted.push(span)
          words.push(span)
        }
      }

      restores.push({ original: node, inserted, parent })
      parent.replaceChild(frag, node)
    }

    if (words.length === 0) return

    // ── map scroll progress onto the words ─────────────────────────────
    const count = words.length

    const apply = (progress: number) => {
      for (let i = 0; i < count; i++) {
        const local = wordProgressAt(progress, i, count, overlap)
        words[i].style.setProperty('--word-progress', local.toFixed(3))
      }
    }

    apply(0)

    let tween: gsap.core.Tween | undefined
    const trigger =
      mode === 'time'
        ? ScrollTrigger.create({
            trigger: el,
            start,
            once: true,
            onEnter: () => {
              // Promoted for exactly the seconds they move, then released.
              for (const w of words) w.style.willChange = 'opacity, transform'
              const p = { v: 0 }
              tween = gsap.to(p, {
                v: 1,
                duration,
                delay,
                ease: 'none',
                onUpdate: () => apply(p.v),
                onComplete: () => {
                  for (const w of words) w.style.willChange = ''
                },
              })
            },
          })
        : ScrollTrigger.create({
            trigger: el,
            start,
            end,
            scrub: true,
            onUpdate: (self) => apply(self.progress),
          })

    // Word geometry depends on the webfont; re-measure once it lands.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

    return () => {
      tween?.kill()
      trigger.kill()
      // Put the original text nodes back so the DOM is left as authored.
      for (const { original, inserted, parent } of restores) {
        if (!inserted.length) continue
        const first = inserted[0]
        if (first.parentNode === parent) parent.replaceChild(original, first)
        for (let i = 1; i < inserted.length; i++) {
          inserted[i].parentNode?.removeChild(inserted[i])
        }
      }
    }
  }, [overlap, start, end, disabled, mode, duration, delay])

  return ref
}
