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
import {
  cloudsforgeHosts,
  envLabel,
  splitEnvLabel,
  type CloudsForgeHosts,
  type SurfaceKey,
} from '@cloudsforge/ui'
import { viewedHosts } from './viewed.ts'

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

/**
 * This app's API base, resolved now. Call it per request; never cache it in a module constant.
 *
 * `viewedHosts()` rather than `cloudsforgeHosts()` is the whole of the in-place network view at
 * this layer (micro-org#459). It returns the map it was given, unchanged, until the reader picks
 * the other network in the bar, and the sibling estate's origins after that — so this line is a
 * no-op in development, in a preview deployment and for every reader who never touches the
 * switcher. The `-testnet` WEB hostnames are retired and 302 to their mainnet siblings, but `/v1`
 * on them is not: that path still answers from the testnet services, which is what makes reading
 * the other network from this page possible at all. See `lib/viewed.ts`.
 */
export function apiBase(): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return resolveApiBase(origin, viewedHosts(), PRODUCT)
}

/** The page origin, or a stable placeholder when there is no document (tests, prerender). */
export function pageOrigin(): string {
  return typeof window === 'undefined' ? 'http://localhost' : window.location.origin
}

/**
 * The mining page: `hosts().network` + the path the miner is mounted at.
 *
 * ── One function, because two literals is how the front page loses its only button ────────────
 *
 * The home page's standfirst is an INSTRUCTION — "press start on the mining page" — and until this
 * existed the page offered no way to obey it: `grep` for `href=` and `hosts()` in
 * `src/pages/home.tsx` returned nothing (docs/ecosystem/32-roadmap-ui-and-content.md §6.2). Two
 * places now send a reader here, the hero's primary action and the mining capability's second
 * link, and both call this rather than composing their own — a destination written twice is a
 * destination that gets corrected once.
 *
 * `hosts().network` is a registry lookup and resolves per environment, so a reader of the test
 * network is sent to the test network's miner rather than across the boundary the banner above
 * the navigation has just told them about.
 */
export function minePage(): string {
  return `${hosts().network}/mine`
}

/**
 * WHICH ESTATE THIS BUNDLE IS BEING READ ON: `''` for the live one, `'testnet'` for the rehearsal.
 *
 * ── Why this exists at all ────────────────────────────────────────────────────────────────────
 *
 * There was no environment awareness anywhere in `src`, and there are two estates serving this
 * bundle. Measured 2026-08-07 and recorded in docs/ecosystem/32-roadmap-ui-and-content.md §2: both
 * apexes answer 200 and serve the same asset. So a reader on the test network was told, by the
 * footer, that the platform is open to the public — while being shown throwaway money on a chain
 * that gets reset. `src/content/stages.ts` had already written the argument down, in the note
 * explaining why no testnet name may appear in `PUBLIC_SURFACES`: a reader sent to a testnet
 * address "is being shown a rehearsal … and nothing on the card that says so".
 *
 * ── It is derived exactly the way `cloudsforgeHosts()` derives its hosts, and by the same code ─
 *
 * The environment lives INSIDE the first hostname label, as a suffix — `hub-testnet.<apex>`, and
 * the bare `testnet.<apex>` for the apex surface, which has no subdomain to suffix. That is the
 * design system's model, not this site's, so `splitEnvLabel` is imported rather than reimplemented:
 * a second opinion about what a testnet hostname looks like would be a second thing to get wrong,
 * and it would be wrong silently — the banner would simply never appear.
 *
 * Local development is the LIVE label rather than an environment of its own. There is one dev
 * estate, a reader of it is the person building it, and "this is a rehearsal, go to the live site"
 * pointing at a localhost port would be noise. A hostname with two labels is an apex and has no
 * first label to spend on an environment, which is the same rule `cloudsforgeHosts()` applies.
 */
export function environment(): string {
  const host = typeof window === 'undefined' ? '' : window.location.hostname
  if (!host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) return ''
  const parts = host.split('.')
  if (parts.length <= 2) return ''
  return splitEnvLabel(parts[0] ?? '')?.env ?? ''
}

/** Is this the test network — the estate whose coins are not the real ones? */
export function isTestnet(): boolean {
  return environment() === 'testnet'
}

/**
 * A surface's address on the UNADORNED estate: the same registry entry, with the environment
 * label taken off the first hostname label.
 *
 * ── This is why the testnet banner's link is not a typed hostname ─────────────────────────────
 *
 * `src/content/pages.ts` forbids naming a hostname in copy and CI greps the whole of `src` for
 * one, so "go to the live site" cannot ship as an `href` somebody typed. It is composed instead
 * out of the two things that already know the answer: `cloudsforgeHosts()`, which resolves the
 * surface for the estate this page is on, and `envLabel(subdomain, '')`, the design system's own
 * inverse of the split above. Nothing here knows what the apex is called.
 *
 * On an estate with no environment label — the live one, a preview deployment, localhost — every
 * hostname is already unadorned and this returns the registry's answer untouched.
 */
export function liveUrl(key: SurfaceKey): string {
  const resolved = hosts()[key]
  const url = new URL(resolved)
  const parts = url.hostname.split('.')
  const split = parts.length > 2 ? splitEnvLabel(parts[0] ?? '') : null
  if (!split) return resolved
  const first = envLabel(split.subdomain, '')
  url.hostname = [first, ...parts.slice(1)].filter((label) => label.length > 0).join('.')
  // A surface may be a path on another surface (the wallet inside Hub), so the path is kept and
  // the bare `/` a URL adds to an origin is not — the registry's own entries carry neither.
  return `${url.origin}${url.pathname === '/' ? '' : url.pathname}`
}
