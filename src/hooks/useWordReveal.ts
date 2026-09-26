import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/motionPrefs'
import { deviceTier } from '../lib/device'
import { wordProgressAt } from '../lib/wordProgress'

type Options = {
  /** How much neighbouring words overlap, 0–1. */
  overlap?: number
  start?: string
  end?: string
  /** Soften un-revealed words with a blur. High-tier devices only. */
  blur?: boolean
  disabled?: boolean
}

/**
 * Reveals text word by word as the reader scrolls through it.
 *
 * Words are split by walking text nodes rather than rewriting innerHTML,
 * so inline markup, whitespace and — crucially for Arabic — the shaping
 * inside each word survive. Each word is wrapped in place and the original
 * text nodes are restored on teardown.
 *
 * Scroll progress drives a per-word `--word-progress`; CSS interpolates
 * the visible state from it. Under reduced motion nothing is split at all.
 */
export function useWordReveal<T extends HTMLElement = HTMLDivElement>(
  options: Options = {},
) {
  const ref = useRef<T | null>(null)
  const { overlap = 0.25, start = 'top 85%', end = 'bottom 60%', blur, disabled } = options

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    // Reduced motion: leave the text exactly as authored.
    if (prefersReducedMotion()) {
      el.style.setProperty('--word-progress', '1')
      return
    }

    // Blur is a filter, not a compositor-friendly property, and this runs on
    // dozens of inline spans at once — so only where there is headroom.
    const useBlur = blur ?? deviceTier() === 'high'
    if (!useBlur) el.style.setProperty('--word-blur', '0px')

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

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      scrub: true,
      onUpdate: (self) => apply(self.progress),
    })

    // Word geometry depends on the webfont; re-measure once it lands.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

    return () => {
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
  }, [overlap, start, end, blur, disabled])

  return ref
}
