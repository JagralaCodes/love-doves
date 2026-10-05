import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
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
 */
function invitationMeta(): Plugin {
  const names = `${wedding.bride.shortName} & ${wedding.groom.shortName}`
  const events = wedding.events.map((e) => e.name).join(' & ')
  const site = wedding.site.url.replace(/\/+$/, '')
  const values: Record<string, string> = {
    TITLE: escapeHtml(`${names} — ${events}`),
    NAMES: escapeHtml(names),
    DESCRIPTION: escapeHtml(wedding.site.description),
    SITE_URL: escapeHtml(site),
  }
  return {
    name: 'invitation-meta',
    transformIndexHtml(html) {
      return html.replace(/%INVITE_(\w+)%/g, (m, key: string) => values[key] ?? m)
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
