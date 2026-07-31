/**
 * Where this app talks to, resolved at runtime.
 *
 * `cloudsforgeHosts()` reads `window.location.hostname` on every call, so the same bundle links to
 * `http://localhost:3010` when served from localhost and to `https://hub.<apex>` when served from
 * the apex. Nothing here reads a build-time constant; see the note in vite.config.ts.
 *
 * This matters more here than anywhere else in the estate. A marketing site is the one surface
 * whose entire job is to send people somewhere else, so it holds more outbound links to more
 * surfaces than any product does. Every one of them is resolved through the registry, and CI greps
 * `src` for a literal hostname — a hard-coded `https://trade.cloudsforge.online` would be a second,
 * unversioned copy of the surface list, and the copy is always the one that ends up wrong.
 */
import { cloudsforgeHosts, type CloudsForgeHosts, type SurfaceKey } from '@cloudsforge/ui'

/**
 * The surface this application IS.
 *
 * `site` is the apex — subdomain `''` — and it is deliberately NOT a switcher entry: the logo in
 * the shared bar already links here, and a second route to one page costs a slot in a list whose
 * whole job is separation. Passing it as `current` therefore marks nothing as current, which is
 * correct: a reader on the marketing site is not inside any product.
 *
 * Like `hub`, it resolves to the company ember rather than to a product accent, which is why
 * `data-cf-product="site"` is set statically in index.html.
 */
export const PRODUCT: SurfaceKey = 'site'

/** The name reported to the observability ingest and shown in error copy. */
export const APP_NAME = 'site'

/**
 * The base URL for this app's OWN API.
 *
 * The marketing site has no API of its own and makes no request to one — the only network call in
 * the bundle is the session bootstrap against the account service, which is cross-origin from
 * everywhere and resolved separately. This function is carried from the template unchanged anyway,
 * because it is the thing the template's `test/hosts.test.ts` pins and because the day this site
 * grows a form that posts somewhere, the correct base must already be derived rather than typed.
 *
 * In production a surface and its API are the same origin — nginx serves the bundle, the service
 * serves `/v1` behind the same hostname — so the base is the empty string and requests stay
 * relative. Under `pnpm dev` the page is on Vite's port while the service is on the registry's
 * dev port, so the base is absolute and the request goes cross-origin.
 *
 * The difference is derived by COMPARING ORIGINS rather than by a `DEV` flag, because a flag is a
 * build-time constant and this repository has none: an image built for production and opened on
 * localhost would then point at a host that is not there.
 */
export function resolveApiBase(pageOrigin: string, hosts: CloudsForgeHosts, key: SurfaceKey): string {
  const own = hosts[key]
  // With no page origin there is nothing for a relative URL to resolve against, so the absolute
  // form is the only correct answer.
  if (!pageOrigin) return own
  // A surface may carry a basePath (the wallet is a path inside Hub), so compare ORIGINS rather
  // than whole URLs — otherwise every such surface would look cross-origin to itself.
  return new URL(own).origin === pageOrigin ? '' : own
}

/** Every CloudsForge base URL, for the current environment. */
export function hosts(): CloudsForgeHosts {
  return cloudsforgeHosts()
}

/** This app's API base, resolved now. Call it per request; never cache it in a module constant. */
export function apiBase(): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return resolveApiBase(origin, cloudsforgeHosts(), PRODUCT)
}

/** The page origin, or a stable placeholder when there is no document (tests, prerender). */
export function pageOrigin(): string {
  return typeof window === 'undefined' ? 'http://localhost' : window.location.origin
}
