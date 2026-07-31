/**
 * Per-route document metadata: the title, the description, the canonical address and the card.
 *
 * ── Why this is a pure function and not a component ───────────────────────────────────────────
 *
 * Everything below takes a pathname and returns data. It touches no DOM, so `test/meta.test.ts`
 * can assert the title of every address this site serves — including the ones nobody remembers to
 * open — without a browser. The application of that data to `document` is four lines at the
 * bottom, and it is the only part that is untestable here.
 *
 * The site this replaces set its metadata from a hand-maintained map keyed by route, and the map
 * had already fallen behind: `/pay` described a survival game for as long as it took somebody to
 * open the tab and read it. Deriving the title from the same content the page renders is what
 * makes that particular drift impossible rather than merely unlikely.
 *
 * ── The limitation, stated rather than glossed ────────────────────────────────────────────────
 *
 * This is a single-page application with ONE `index.html`. Titles and descriptions below are
 * applied by script on navigation, which browsers and the crawlers that execute JavaScript will
 * see, and which the link-preview fetchers used by chat and social clients — which generally do
 * not execute JavaScript — will not. Those will see the site-level card in `index.html` for every
 * address.
 *
 * Fixing that properly means emitting one pre-rendered HTML file per route and teaching nginx to
 * serve it, which conflicts with the enumerated-route arrangement that makes an unknown address
 * answer 404. That trade has not been made; it is written down here so the next person makes it
 * deliberately instead of discovering the gap in a link preview.
 *
 * ── No hostnames ─────────────────────────────────────────────────────────────────────────────
 *
 * Nothing here names a host. A canonical URL and an Open Graph image URL both want to be absolute,
 * so the absolute form is assembled at RUNTIME from the origin the page was served on. One image
 * therefore serves localhost, a preview deployment and production, which is the property the whole
 * repository is arranged around.
 */
import { PRODUCT_PAGES } from '../content/products.ts'
import { LEGAL_PAGES } from '../content/legal.ts'
import { ABOUT, BUILD, HOME, NOT_FOUND, PLATFORM } from '../content/pages.ts'

/** The company name, as it appears in a title. */
export const SITE_NAME = 'CloudsForge'

/** The site-level card, used by every page that has no card of its own. */
export const DEFAULT_IMAGE = '/og-1200x630.png'

/**
 * The products index has no content module of its own — it is assembled from the registry and the
 * product pages — so its description lives here, beside the route that uses it.
 */
export const PRODUCTS_INDEX_BLURB =
  'The CloudsForge control centre and the products that sit on it: mine the currency, make things with it, trade it, sell what you made, and play in worlds that end.'

export interface PageMeta {
  /** The full contents of `<title>`. Already suffixed; never suffixed twice. */
  readonly title: string
  /** The meta description and the Open Graph description. One sentence or two. */
  readonly description: string
  /** The canonical path, always beginning with `/` and never ending with one (except the root). */
  readonly path: string
  /** The Open Graph card, as a path. Made absolute against the page origin at runtime. */
  readonly image: string
}

/**
 * Normalise a pathname before matching.
 *
 * `/products/` and `/products` are the same page and must not produce two canonicals; a trailing
 * slash on a path that is not the root is the classic way one page acquires two addresses and
 * splits its own indexing between them.
 */
export function normalisePath(pathname: string): string {
  if (!pathname.startsWith('/')) return normalisePath(`/${pathname}`)
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

/** Suffix a page title with the company name, unless it already IS the company name. */
export function titleFor(pageTitle: string): string {
  return pageTitle === SITE_NAME ? SITE_NAME : `${pageTitle} — ${SITE_NAME}`
}

/**
 * The metadata for an address.
 *
 * Unknown addresses get the not-found metadata rather than the home page's. A 404 that presents
 * itself as the front door in a browser tab and in a link preview is the same dishonesty as a 404
 * served with a 200, one layer up.
 */
export function metaFor(pathname: string): PageMeta {
  const path = normalisePath(pathname)

  if (path === '/') {
    // The one title that is not suffixed with the company name, because it starts with it.
    return {
      title: `${SITE_NAME} — ${HOME.spine}`,
      description: HOME.blurb,
      path: '/',
      image: DEFAULT_IMAGE,
    }
  }

  const segments = path.split('/').filter(Boolean)
  const head = segments[0]

  if (head === 'products') {
    const slug = segments[1]
    if (slug === undefined) {
      return {
        title: titleFor('Products'),
        description: PRODUCTS_INDEX_BLURB,
        path: '/products',
        image: DEFAULT_IMAGE,
      }
    }
    const page = PRODUCT_PAGES.find((p) => p.slug === slug)
    // A second segment that is not a product is not a product page, and a third segment is not a
    // page at all — both fall through to the not-found metadata below.
    if (page && segments.length === 2) {
      return {
        title: titleFor(`${page.linkLabel} — ${page.headline}`),
        description: page.blurb,
        path: `/products/${page.slug}`,
        image: page.ogImage,
      }
    }
    return notFoundMeta(path)
  }

  if (head === 'platform' && segments.length === 1) {
    return {
      title: titleFor(PLATFORM.headline),
      description: PLATFORM.blurb,
      path: '/platform',
      image: DEFAULT_IMAGE,
    }
  }

  if (head === 'build' && segments.length === 1) {
    return {
      title: titleFor(BUILD.headline),
      description: BUILD.blurb,
      path: '/build',
      image: DEFAULT_IMAGE,
    }
  }

  if (head === 'about' && segments.length === 1) {
    return {
      title: titleFor(ABOUT.headline),
      description: ABOUT.blurb,
      path: '/about',
      image: DEFAULT_IMAGE,
    }
  }

  const legal = segments.length === 1 && head !== undefined ? LEGAL_PAGES.find((p) => p.slug === head) : undefined
  if (legal) {
    return {
      title: titleFor(legal.title),
      description: legal.blurb,
      path: `/${legal.slug}`,
      image: DEFAULT_IMAGE,
    }
  }

  return notFoundMeta(path)
}

function notFoundMeta(path: string): PageMeta {
  return {
    title: titleFor(NOT_FOUND.headline),
    description: NOT_FOUND.blurb,
    // The canonical of a 404 is the address that was asked for. Pointing it at the home page would
    // tell a crawler that a broken link is a valid alias for the front door.
    path,
    image: DEFAULT_IMAGE,
  }
}

/* ─────────────────────────── tags, as data ─────────────────────────── */

export type TagKind = 'name' | 'property'

export interface MetaTag {
  readonly kind: TagKind
  readonly key: string
  readonly content: string
}

/**
 * The tags a page needs, given its metadata and the origin it is being served from.
 *
 * `origin` is passed in rather than read from `window`, which is what makes this testable and what
 * keeps the module free of a hostname. An empty origin yields relative URLs — correct for a
 * prerender or a test, and never wrong in a browser, where the origin is always available.
 */
export function metaTags(meta: PageMeta, origin: string): readonly MetaTag[] {
  const absolute = (p: string): string => (origin === '' ? p : `${origin}${p}`)
  return [
    { kind: 'name', key: 'description', content: meta.description },
    { kind: 'property', key: 'og:type', content: 'website' },
    { kind: 'property', key: 'og:site_name', content: SITE_NAME },
    { kind: 'property', key: 'og:title', content: meta.title },
    { kind: 'property', key: 'og:description', content: meta.description },
    { kind: 'property', key: 'og:url', content: absolute(meta.path) },
    { kind: 'property', key: 'og:image', content: absolute(meta.image) },
    { kind: 'name', key: 'twitter:card', content: 'summary_large_image' },
    { kind: 'name', key: 'twitter:title', content: meta.title },
    { kind: 'name', key: 'twitter:description', content: meta.description },
  ]
}

/** The canonical link's href, absolute against the serving origin. */
export function canonicalHref(meta: PageMeta, origin: string): string {
  return origin === '' ? meta.path : `${origin}${meta.path}`
}

/* ───────────────────────── applying it, in a browser ───────────────── */

/**
 * Write the metadata into the document.
 *
 * The only part of this module that is not a pure function, and it is kept to the smallest
 * possible surface for that reason. It updates existing tags in place rather than appending, so a
 * navigation does not leave the previous page's description in the head beside the current one.
 */
export function applyMeta(meta: PageMeta, origin: string): void {
  if (typeof document === 'undefined') return
  document.title = meta.title

  for (const tag of metaTags(meta, origin)) {
    const selector = `meta[${tag.kind}="${tag.key}"]`
    let element = document.head.querySelector(selector)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(tag.kind, tag.key)
      document.head.appendChild(element)
    }
    element.setAttribute('content', tag.content)
  }

  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', canonicalHref(meta, origin))
}
