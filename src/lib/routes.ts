/**
 * The route table, as data, in one place.
 *
 * ── Why this is not just a list inside app.tsx ─────────────────────────────────────────────────
 *
 * Three files describe this site's addresses and all three have to agree:
 *
 *   1. `src/app.tsx` — which component renders at each path,
 *   2. `src/components/shell.tsx` — which of them the navigation offers,
 *   3. `nginx.conf` — which of them are served the app shell at all.
 *
 * The third is the one that bites, and it bites late. nginx enumerates the real routes and 404s
 * everything else ON PURPOSE, so that a wrong address answers 404 rather than 200. That matters
 * more on this surface than on any other in the estate: this is the site crawlers index, that link
 * checkers walk, and that people paste into chat. The application this one replaces answers
 * `200 OK` for every address in existence, which means its "page not found" screen is a document
 * search engines are entitled to index, and a deploy that drops `/products/worlds` looks exactly
 * like a deploy that did not.
 *
 * The price of that honesty is this list, in triplicate. So the navigation is DERIVED from here
 * rather than restated, and `test/routes.test.ts` reads `nginx.conf` and `app.tsx` and fails the
 * build when either has drifted. "Remember to update nginx.conf" is not a mechanism; a test is.
 *
 * This module deliberately imports nothing — not React, not the router, not the design system — so
 * the test that reads it does not have to boot a browser to find out what the routes are.
 *
 * ── One consequence, which cost this file a false sentence ────────────────────────────────────
 *
 * Importing nothing means importing the surface registry is not available here either, so a
 * `summary` below CANNOT be derived from a count. It follows that no summary may CONTAIN one. This
 * one did — "the control centre and the five products that sit on it" — and it was still saying
 * five after a sixth product was registered, in the footer of every page and in the metadata
 * description of `/products`. It was invisible to `test/content.test.ts` because that scan matches
 * digits and "five" is a word.
 *
 * So the rule for this file is: summaries describe, they do not count. Anything that needs a number
 * belongs in `src/content`, where it can be computed from the registry.
 */

export interface SiteRoute {
  /** The top-level path segment, without a leading slash. `''` is the index route. */
  readonly path: string
  /** The header navigation label, or null for a route that is reachable but not offered. */
  readonly label: string | null
  /** True when the route owns everything beneath it (`/products/worlds`). */
  readonly wildcard: boolean
  /** One line for the footer and for the route's own metadata description fallback. */
  readonly summary: string
}

export const ROUTES: readonly SiteRoute[] = [
  { path: '', label: 'Home', wildcard: false, summary: 'EMBER, and the ecosystem built on top of it.' },
  // Wildcard: `/products` is the index and `/products/<key>` is one surface's page.
  //
  // nginx serves those with two location blocks, and the second ENUMERATES the slugs rather than
  // matching a prefix. The prefix version served the shell for everything under /products/, so
  // /products/pay answered 200 — an address an old link genuinely carries, since Forge Pay was a
  // destination in the previous estate and is now a page inside Forge Hub. test/routes.test.ts
  // reads that list against PRODUCT_PAGES in both directions.
  {
    /**
     * ── The label says Ecosystem and the path still says products ─────────────────────────────
     *
     * Deliberate, and it is the one place the rename stops. The owner's instruction was to speak
     * of an ecosystem rather than of products, and the copy does throughout. The URL does not,
     * because a redirect is NOT available as a softener here: this site's whole position is that
     * an unknown address answers 404 rather than 200 (see the header of this file), so renaming
     * the route turns every link anybody already holds — `/products`, and the seven
     * `/products/<key>` pages nginx enumerates — into a 404, to save a word in an address bar.
     *
     * ── ONE REASON THAT USED TO BE GIVEN HERE IS NOT TRUE, AND IS REMOVED RATHER THAN KEPT ────
     *
     * It said the rename was blocked because "`@cloudsforge/ui` renders the shared footer on every
     * surface in the estate and links `/products` from it", so a rename would 404 a link on
     * sixteen surfaces. **The shared footer links no `/products` path at all.** Its three
     * navigation columns are surface HOSTNAMES resolved through `cloudsforgeHosts()`, and its only
     * two site-relative links are `/terms` and `/privacy` (`ui/packages/ui/src/index.tsx:884-887`,
     * and the fourth column at :1008-1021). Nothing outside this repository links `/products`;
     * `micro-billing`'s `/products` is an unrelated API route.
     *
     * The conclusion survives the correction — the inbound links are reason enough — but the
     * dependency did not exist, and a false reason is worse than a thin one: it names a party
     * whose agreement would have to be sought before this could ever be done.
     */
    path: 'products',
    label: 'Ecosystem',
    wildcard: true,
    summary: 'The control centre and the destinations that sit on it.',
  },
  {
    path: 'platform',
    label: 'Platform',
    wildcard: false,
    summary: 'One account, one wallet, one portfolio — and the statements that define it.',
  },
  {
    path: 'build',
    label: 'Build status',
    wildcard: false,
    summary: 'What runs in-house, what is built and not shipped, and how each of those is checked.',
  },
  {
    path: 'about',
    label: 'About',
    wildcard: false,
    summary: 'What this ecosystem is for, and what it refuses to become.',
  },
  // The legal pages are reachable from the footer rather than the header. They are not what a
  // reader came for, and a nav slot spent on Terms is a slot not spent on a product.
  {
    path: 'terms',
    label: null,
    wildcard: false,
    summary:
      'Terms of service — the licensing and the mechanisms written out, the rest marked as needing counsel.',
  },
  {
    path: 'privacy',
    label: null,
    wildcard: false,
    summary: 'Privacy notice — what this site does, and what has still to be drafted.',
  },
]

/** What the header renders, with the leading slash a `NavLink` wants. */
export const NAV: ReadonlyArray<{ to: string; label: string }> = ROUTES.filter(
  (route): route is SiteRoute & { label: string } => route.label !== null,
).map((route) => ({ to: route.path === '' ? '/' : `/${route.path}`, label: route.label }))

/** Every path nginx has to serve the shell for, excluding the index. */
export const NON_INDEX_PATHS: readonly string[] = ROUTES.filter((r) => r.path !== '').map(
  (r) => r.path,
)

/** The legal pages, for the footer. Derived, so adding one does not mean editing the footer. */
export const LEGAL_PATHS: readonly string[] = ['terms', 'privacy']
