import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { wedding } from './src/config/wedding.config.ts'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Fills the page title and the link-preview tags from the wedding config.
 *
 * WhatsApp and other link previews read these straight from the HTML,
 * before any JavaScript runs, so they cannot come from React. Writing them
 * by hand in index.html meant the names, and above all the absolute image
 * URL (previews ignore relative ones), drifting from the config the moment
 * the domain is set. Now `site.url` in the config is the one place to
 * change.
 *
 * The guest-list links get their own HTML, so a preview of /nikah or
 * /walima names only that celebration: the same page and assets (absolute
 * paths), with their own title, description and og:url. Vercel serves a
 * folder's index.html before applying the SPA rewrite.
 */
function invitationMeta(): Plugin {
  const names = `${wedding.bride.shortName} & ${wedding.groom.shortName}`
  const events = wedding.events.map((e) => e.name).join(' & ')
  const site = wedding.site.url.replace(/\/+$/, '')
  const title = (what: string) => `${names} invite you — ${what}`
  const values: Record<string, string> = {
    TITLE: escapeHtml(title(events)),
    NAMES: escapeHtml(names),
    DESCRIPTION: escapeHtml(wedding.site.description),
    SITE_URL: escapeHtml(site),
  }
  const variants: Record<string, { title: string; description: string }> = {
    nikah: { title: title('Nikah'), description: 'With the blessings of Allah, we invite you to share in our Nikah.' },
    walima: { title: title('Walima'), description: 'With the blessings of Allah, we invite you to share in our Walima.' },
  }
  let outDir = 'dist'
  return {
    name: 'invitation-meta',
    configResolved(config) {
      outDir = config.build.outDir
    },
    transformIndexHtml(html) {
      return html.replace(/%INVITE_(\w+)%/g, (m, key: string) => values[key] ?? m)
    },
    closeBundle() {
      const root = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const [path, v] of Object.entries(variants)) {
        const html = root
          .split(values.TITLE).join(escapeHtml(v.title))
          .split(values.DESCRIPTION).join(escapeHtml(v.description))
          .split(`${site}/"`).join(`${site}/${path}"`)
        mkdirSync(join(outDir, path), { recursive: true })
        writeFileSync(join(outDir, path, 'index.html'), html)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), invitationMeta()],
  build: {
    target: 'es2022',
    cssTarget: 'safari16',
  },
})
