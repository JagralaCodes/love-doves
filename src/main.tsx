import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { startLangUrlSync } from './lib/langStore'

/**
 * The invitation always starts at the gate.
 *
 * Browsers restore the previous scroll position on reload, so re-opening
 * the link dropped the viewer wherever they last stopped — which showed
 * through as a flash of some mid-page section behind the opening doors.
 * The gate is a fixed overlay and cannot mask that, so scroll restoration
 * is turned off and the page is pinned to the top before the first paint.
 */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}
window.scrollTo(0, 0)

// The language lives in the URL, so a shared link opens in the language
// it names. This also keeps it in step if the hash is edited or the
// viewer navigates back.
startLangUrlSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
