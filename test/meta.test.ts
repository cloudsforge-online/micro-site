/**
 * Per-route metadata: the title, the description, the canonical address and the card.
 *
 * ── Why this is worth a suite of its own ──────────────────────────────────────────────────────
 *
 * Metadata is the part of a site nobody looks at. It is rendered in a browser tab, in a search
 * result and in a link preview — three places the person who wrote it never opens — so a wrong
 * title survives indefinitely. The site this replaces had `/pay` describing a survival game, from
 * a hand-maintained map that had simply fallen behind the routes.
 *
 * `metaFor` is a pure function of the pathname, so every address this site serves can be checked
 * here, including the ones nobody remembers to open. What cannot be checked without a browser is
 * `applyMeta`, which is four lines and is the only impure thing in the module.
 *
 * ── The length budgets ────────────────────────────────────────────────────────────────────────
 *
 * Titles and descriptions are truncated by search engines and by link-preview cards, and the cut
 * lands mid-clause. The budgets below are deliberately loose — this is not an attempt to hit an
 * exact pixel width, which varies by client anyway. They exist to catch the two failures that
 * actually happen: a description that is a whole standfirst pasted in, and a title that is a
 * headline with a company name glued onto it.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  DEFAULT_IMAGE,
  SITE_NAME,
  canonicalHref,
  metaFor,
  metaTags,
  normalisePath,
  titleFor,
} from '../src/lib/meta.ts'
import { PRODUCT_PAGES } from '../src/content/products.ts'
import { LEGAL_PAGES } from '../src/content/legal.ts'
import { ROUTES } from '../src/lib/routes.ts'

/** Every address this site is supposed to serve, built from the declarations rather than typed. */
const ADDRESSES: readonly string[] = [
  ...ROUTES.map((r) => (r.path === '' ? '/' : `/${r.path}`)),
  ...PRODUCT_PAGES.map((p) => `/products/${p.slug}`),
]

describe('path normalisation', () => {
  it('treats a trailing slash as the same address', () => {
    // Two addresses for one page splits its indexing between them, and the canonical is the only
    // thing that fixes it — so it must not itself vary with the slash.
    assert.equal(normalisePath('/products/'), '/products')
    assert.equal(normalisePath('/products'), '/products')
  })

  it('keeps the root as a single slash', () => {
    assert.equal(normalisePath('/'), '/')
    assert.equal(normalisePath(''), '/')
  })

  it('collapses several trailing slashes', () => {
    assert.equal(normalisePath('/about///'), '/about')
  })

  it('adds the leading slash a relative path is missing', () => {
    assert.equal(normalisePath('about'), '/about')
  })
})

describe('titles', () => {
  it('suffixes a page title with the company name', () => {
    assert.equal(titleFor('Products'), `Products — ${SITE_NAME}`)
  })

  it('does not suffix the company name with itself', () => {
    assert.equal(titleFor(SITE_NAME), SITE_NAME)
  })

  it('gives the home page a title that leads with the company', () => {
    // The one page whose title is not "<page> — CloudsForge": the front door introduces the name
    // rather than qualifying itself with it.
    const meta = metaFor('/')
    assert.ok(meta.title.startsWith(SITE_NAME), meta.title)
    assert.ok(!meta.title.endsWith(SITE_NAME), 'the home title is suffixed as well as prefixed')
  })

  it('gives every address a distinct title', () => {
    const titles = ADDRESSES.map((a) => metaFor(a).title)
    assert.equal(new Set(titles).size, titles.length, 'two addresses share a title')
  })

  it('names the company exactly once in every title', () => {
    for (const address of ADDRESSES) {
      const title = metaFor(address).title
      const occurrences = title.split(SITE_NAME).length - 1
      assert.equal(occurrences, 1, `${address}: "${title}"`)
    }
  })

  it('keeps every title inside the budget a search result gives it', () => {
    for (const address of ADDRESSES) {
      const title = metaFor(address).title
      assert.ok(title.length <= 90, `${address} title is ${title.length} characters: ${title}`)
      assert.ok(title.length >= 15, `${address} title is too short: ${title}`)
    }
  })
})

describe('descriptions', () => {
  it('gives every address a distinct description', () => {
    const descriptions = ADDRESSES.map((a) => metaFor(a).description)
    assert.equal(new Set(descriptions).size, descriptions.length, 'two addresses share a description')
  })

  it('keeps every description inside the budget a preview card gives it', () => {
    // The failure this catches is a standfirst pasted in as a description, which is the shape it
    // arrives in when somebody is being efficient.
    //
    // The ceiling was 210 and is now 160. 210 was loose enough to pass four descriptions that a
    // search result cuts off mid-clause — which is the failure this test names, so the budget was
    // set above the thing it was measuring.
    for (const address of ADDRESSES) {
      const { description } = metaFor(address)
      assert.ok(description.length <= 160, `${address} description is ${description.length} characters`)
      assert.ok(description.length >= 60, `${address} description is ${description.length} characters`)
    }
  })

  it('writes descriptions as sentences rather than as fragments', () => {
    for (const address of ADDRESSES) {
      const { description } = metaFor(address)
      assert.match(description, /[.!?]$/, `${address} description does not end a sentence`)
      assert.match(description, /^[A-Z“"]/, `${address} description does not start a sentence`)
    }
  })
})

describe('canonicals', () => {
  it('returns the address that was asked for, normalised', () => {
    for (const address of ADDRESSES) {
      assert.equal(metaFor(address).path, address)
      assert.equal(metaFor(`${address === '/' ? '/' : `${address}/`}`).path, address)
    }
  })

  it('makes the canonical absolute against the serving origin', () => {
    const meta = metaFor('/about')
    assert.equal(canonicalHref(meta, 'https://example.test'), 'https://example.test/about')
  })

  it('falls back to a relative canonical when there is no origin', () => {
    // A prerender or a test has no origin. A relative canonical is worth less than an absolute one
    // and is a great deal better than one naming the wrong host.
    assert.equal(canonicalHref(metaFor('/about'), ''), '/about')
  })

  it('gives a 404 the address that was asked for, not the home page', () => {
    // Pointing the canonical of an unknown address at `/` tells a crawler that a broken link is a
    // valid alias for the front door, which is how a dead URL stays in an index.
    assert.equal(metaFor('/no/such/page').path, '/no/such/page')
  })
})

describe('cards', () => {
  it('gives every product page its own card', () => {
    for (const page of PRODUCT_PAGES) {
      assert.equal(metaFor(`/products/${page.slug}`).image, page.ogImage)
    }
  })

  it('gives every other page the site-level card', () => {
    for (const route of ROUTES) {
      const address = route.path === '' ? '/' : `/${route.path}`
      assert.equal(metaFor(address).image, DEFAULT_IMAGE)
    }
  })

  it('uses a path rather than a URL, so one bundle serves every host', () => {
    for (const address of ADDRESSES) {
      assert.match(metaFor(address).image, /^\//, `${address} card is not a path`)
    }
  })
})

describe('unknown addresses', () => {
  it('gets the not-found metadata rather than the home page metadata', () => {
    const meta = metaFor('/nope')
    assert.notEqual(meta.title, metaFor('/').title)
    assert.match(meta.title, /no page at this address/i)
  })

  it('treats an unknown product as unknown', () => {
    // `/products/pay` is a plausible guess — Forge Pay was a destination in the previous estate and
    // is now a page inside Hub. It must 404 rather than quietly render the index.
    assert.match(metaFor('/products/pay').title, /no page at this address/i)
  })

  it('treats a third segment under a real product as unknown', () => {
    assert.match(metaFor('/products/trade/pricing').title, /no page at this address/i)
  })

  it('does not mistake a legal slug for a nested address', () => {
    assert.match(metaFor('/terms/extra').title, /no page at this address/i)
  })
})

describe('the tags', () => {
  const meta = metaFor('/products/worlds')
  const tags = metaTags(meta, 'https://example.test')
  const find = (key: string) => tags.find((t) => t.key === key)

  it('emits the description under both its names', () => {
    assert.equal(find('description')?.content, meta.description)
    assert.equal(find('og:description')?.content, meta.description)
    assert.equal(find('twitter:description')?.content, meta.description)
  })

  it('emits the title under both its names', () => {
    assert.equal(find('og:title')?.content, meta.title)
    assert.equal(find('twitter:title')?.content, meta.title)
  })

  it('makes the card and the address absolute', () => {
    assert.equal(find('og:url')?.content, 'https://example.test/products/worlds')
    assert.equal(find('og:image')?.content, 'https://example.test/og/worlds.png')
  })

  it('asks for a large card, since every card in this brand is a wide image', () => {
    assert.equal(find('twitter:card')?.content, 'summary_large_image')
  })

  it('uses the right attribute for each vocabulary', () => {
    // Open Graph reads `property`; the description and the Twitter tags read `name`. Emitting an
    // og tag as `name` is the classic way a card silently stops rendering.
    for (const tag of tags) {
      assert.equal(tag.kind, tag.key.startsWith('og:') ? 'property' : 'name', tag.key)
    }
  })

  it('leaves every tag with content', () => {
    for (const tag of tags) assert.ok(tag.content.length > 0, `${tag.key} is empty`)
  })

  it('names no host of its own', () => {
    // The only hostname in the output is the one passed in, which came from the browser.
    for (const tag of metaTags(meta, '')) {
      assert.ok(!tag.content.includes('cloudsforge.online'), tag.key)
    }
  })
})

/* ─────────── the served document, which is not the rendered page ─────────── */

/**
 * `index.html` carries the home page's metadata, byte for byte.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * THIS IS THE ONE PLACE ON THIS SITE WHERE COPY LIVES OUTSIDE `src/content`, AND IT GOT AWAY.
 *
 * Everything else on this site is data, so `test/content.test.ts` can walk it. A static document
 * cannot import, so the shell's title and description are TYPED — and a typed string in a file the
 * copy walk does not read is exactly the defect that walk exists to prevent, sitting in the most
 * publicly visible file in the repository.
 *
 * It shipped. The site was rewritten to lead with EMBER; every content file changed; 254 tests
 * passed; and `<title>` went on saying "One crypto world." — the one line the owner had explicitly
 * asked to have removed. The browser tab, the search result and every chat and social card carried
 * it, because a link-preview fetcher renders the SERVED DOCUMENT and never the page. Two artefacts,
 * one of them unguarded.
 *
 * So the shell is now checked against `metaFor('/')`, which is what a browser applies at runtime.
 * They must be identical: a reader who follows a link and a crawler that never runs the bundle are
 * entitled to the same sentence, and any difference between them is a difference nobody can see
 * from inside the application.
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 */
describe('the static shell', () => {
  const shell = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const home = metaFor('/')

  /** The content of a `<meta>` by `name` or `property`, whichever the shell used. */
  const metaContent = (key: string): string | undefined =>
    new RegExp(`<meta[^>]*(?:name|property)="${key}"[^>]*content="([^"]*)"`, 's').exec(shell)?.[1] ??
    // The shell wraps long tags across lines with the attributes reordered, so try the other order
    // before concluding a tag is absent. A regex that quietly matched nothing would make every
    // assertion below a comparison against `undefined`, which is the shape of a test that cannot
    // fail — and the reason this file exists is a check that could not.
    new RegExp(`<meta\\s+(?:name|property)="${key}"\\s+content="([^"]*)"`, 's').exec(shell)?.[1]

  it('found the tags it is about to assert on', () => {
    // The floor. Without it, a rename in index.html turns every check below into a no-op.
    for (const key of ['description', 'og:title', 'og:description', 'og:image']) {
      assert.ok(metaContent(key) !== undefined, `index.html has no ${key} this test can read`)
    }
    assert.match(shell, /<title>[^<]+<\/title>/)
  })

  it('carries the same title a browser would apply to the home page', () => {
    const title = /<title>([^<]*)<\/title>/.exec(shell)?.[1]
    assert.equal(
      title,
      home.title,
      'the served document and the rendered page disagree about the home page title. ' +
        'A link preview and a search result show the served one, and nothing in the application ' +
        'can see it.',
    )
    assert.equal(metaContent('og:title'), home.title)
  })

  it('carries the same description', () => {
    assert.equal(metaContent('description'), home.description)
    assert.equal(metaContent('og:description'), home.description)
  })

  it('carries no sentence the site has retired', () => {
    // The specific phrase, asserted directly as well as by equality above. The equality check is
    // the real guard; this one names the failure so a future reader of a red run is told what
    // happened rather than shown two long strings that differ somewhere in the middle.
    assert.ok(
      !/One crypto world/i.test(shell),
      'index.html still carries the retired positioning line',
    )
    assert.ok(!/the loop is the product/i.test(shell))
  })

  it('names the currency, like every other front door on this site', () => {
    assert.match(shell, /\bEMBER\b/)
  })

  it('points at a card that exists on disk', () => {
    const image = metaContent('og:image')
    assert.ok(image, 'the shell ships no card')
    assert.ok(
      existsSync(new URL(`../public${image}`, import.meta.url)),
      `the shell's card is missing: public${image}`,
    )
  })
})

describe('every legal page', () => {
  it('is addressable and titled after itself', () => {
    for (const page of LEGAL_PAGES) {
      assert.match(metaFor(`/${page.slug}`).title, new RegExp(page.title))
    }
  })
})
