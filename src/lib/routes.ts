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
  { path: '', label: 'Home', wildcard: false, summary: 'One crypto world, and the loop that joins it up.' },
  // Wildcard: `/products` is the index and `/products/<key>` is one surface's page.
  //
  // nginx serves those with two location blocks, and the second ENUMERATES the slugs rather than
  // matching a prefix. The prefix version served the shell for everything under /products/, so
  // /products/pay answered 200 — an address an old link genuinely carries, since Forge Pay was a
  // destination in the previous estate and is now a page inside Forge Hub. test/routes.test.ts
  // reads that list against PRODUCT_PAGES in both directions.
  {
    path: 'products',
    label: 'Products',
    wildcard: true,
    summary: 'The control centre and the five products that sit on it.',
  },
  {
    path: 'platform',
    label: 'Platform',
    wildcard: false,
    summary: 'One account, one wallet, one portfolio — and the eleven statements that define it.',
  },
  {
    path: 'build',
    label: 'Build status',
    wildcard: false,
    summary: 'What is built, what is not, and what is not deployed.',
  },
  { path: 'about', label: 'About', wildcard: false, summary: 'What CloudsForge is for, and what it refuses to be.' },
  // The legal pages are reachable from the footer rather than the header. They are not what a
  // reader came for, and a nav slot spent on Terms is a slot not spent on a product.
  {
    path: 'terms',
    label: null,
    wildcard: false,
    summary: 'Terms of service — drafted where the answer is engineering, marked where it is not.',
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
