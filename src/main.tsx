/**
 * The boot sequence. The order is not arbitrary.
 *
 *   1. Observability first, so an exception thrown by anything below is reported rather than lost.
 *      A crash during the first render is the single most valuable event this app can send.
 *   2. `bootstrapSession()` second, and AWAITED, so the SSO hand-off code in the URL fragment is
 *      redeemed before React mounts. It strips `#cf_code` from the address bar before the
 *      exchange goes over the wire — see the note in @cloudsforge/ui. Rendering first would show
 *      a signed-out shell to a user who has just signed in, and would leave the code on screen
 *      for the length of a network round trip.
 *   3. `initAnalytics()` third. It is deliberately AFTER the session bootstrap and BEFORE the
 *      render, and it does not load anything: it publishes Google Consent Mode defaults with
 *      every storage type denied, and re-injects the tag only if this reader has already accepted
 *      on a previous visit. A first-time reader gets no network request to Google at all until
 *      they press Accept in the banner, which is the only call site that grants.
 *   4. Render last.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@cloudsforge/ui/tokens.css'
import '@cloudsforge/ui/ui.css'
import './styles.css'
import { initAnalytics } from '@cloudsforge/ui'
import { App } from './app.tsx'
import { bootstrapSession } from './lib/api.ts'
import { initObs } from './lib/obs.ts'

initObs()

const container = document.getElementById('root')
if (!container) throw new Error('#root is missing from index.html')

void bootstrapSession().finally(() => {
  initAnalytics()
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
