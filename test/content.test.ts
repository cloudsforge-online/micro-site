/**
 * Content integrity: the rules that make this site's copy checkable rather than merely careful.
 *
 * ── Why a marketing site has a test suite over its own prose ──────────────────────────────────
 *
 * Copy is the part of a public site nothing verifies. It is written once, reviewed by whoever is
 * nearby, and then it is true for however long it stays true — which for a platform under active
 * construction is weeks. The estate this replaces has already demonstrated every failure this file
 * guards against:
 *
 *   - a numeric claim that quietly stopped being true (EMBER credited at the chain tip, and the
 *     site went on saying so, "because nothing anywhere would ever have noticed");
 *   - a product list maintained by hand in eight places, of which the marketing site was one;
 *   - a page of copy describing a feature that no code path delivered.
 *
 * None of those is a spelling mistake, and none of them would be caught by a reviewer reading a
 * diff. They are caught by reading the copy as data, which is the only reason every sentence on
 * this site lives in `src/content` as a plain string rather than inside a component.
 *
 * ── What is checked ───────────────────────────────────────────────────────────────────────────
 *
 *   1. Every run of digits in published copy is registered in `src/content/claims.ts`.
 *   2. No hostname, URL or port appears in copy. Every link resolves through the registry.
 *   3. No price, percentage or currency symbol appears anywhere, which is a decision recorded in
 *      claims.ts and is exactly the kind of decision that erodes one sentence at a time.
 *   4. The set of product pages and the set of registry products are the same set.
 *   5. Every referenced brand image exists on disk.
 *   6. Nothing is empty, nothing is a placeholder, and no two pages share a headline.
 *
 * Every one of these can fail. Several of them did while this file was being written.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { PRODUCTS, SURFACES } from '@cloudsforge/ui'
import { CLAIMS, allowedNumbers } from '../src/content/claims.ts'
import { PRODUCT_PAGES, hubPage, productCards } from '../src/content/products.ts'
import { STAGE_LABEL, STAGE_MEANING } from '../src/content/stages.ts'
import {
  ABOUT,
  BUILD,
  HOME,
  NOT_FOUND,
  PLATFORM,
  PRODUCTS_INDEX,
  TESTNET_NOTICE,
} from '../src/content/pages.ts'
import { LEGAL_PAGES } from '../src/content/legal.ts'
import { ROUTES } from '../src/lib/routes.ts'

const root = fileURLToPath(new URL('..', import.meta.url))

/**
 * Keys whose values are identifiers or paths rather than prose.
 *
 * They are excluded from the copy walk because they are not copy: a slug is a URL segment, an
 * `ogImage` is a filename, and requiring `/og/hub.png` to be a registered numeric claim would make
 * the rule absurd and therefore make somebody relax it. Everything NOT on this list is treated as
 * something a reader might see, which is the safe default — a new field is scanned until somebody
 * deliberately exempts it.
 */
const NON_COPY_KEYS = new Set([
  'slug',
  'key',
  'linkTo',
  'accentKey',
  'ogImage',
  'stage',
  'status',
  'image',
])

interface CopyString {
  /** Where it came from, for a failure message that names the sentence. */
  readonly path: string
  readonly text: string
}

/** Walk a content value and collect every prose string in it, with its path. */
function collect(value: unknown, path: string, out: CopyString[]): void {
  if (typeof value === 'string') {
    out.push({ path, text: value })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collect(entry, `${path}[${index}]`, out))
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (NON_COPY_KEYS.has(key)) continue
      collect(entry, `${path}.${key}`, out)
    }
  }
}

/** Everything this site publishes, as strings. */
function publishedCopy(): CopyString[] {
  const out: CopyString[] = []
  collect(HOME, 'HOME', out)
  collect(PLATFORM, 'PLATFORM', out)
  collect(ABOUT, 'ABOUT', out)
  collect(BUILD, 'BUILD', out)
  collect(NOT_FOUND, 'NOT_FOUND', out)
  // The products index's own copy. It lived in JSX until the two counts in it went stale at once
  // — "Six surfaces" over seven pages, "The five products" over six — and a string in a component
  // is a string this walk cannot see. Anything added to `src/content` must be added here too, or
  // it is unscanned; that is the one manual step in this file and it is why the block above ends
  // with a floor on how many strings the walk must find.
  collect(PRODUCTS_INDEX, 'PRODUCTS_INDEX', out)
  // The testnet notice is chrome rather than a page — it is rendered above the navigation on every
  // address — and it is copy like everything else. Left out of this walk it would be the one
  // sentence on the site holding no register, no hostname scan and no placeholder check, which is
  // a poor thing for the sentence whose entire job is to be believed.
  collect(TESTNET_NOTICE, 'TESTNET_NOTICE', out)
  collect(PRODUCT_PAGES, 'PRODUCT_PAGES', out)
  collect(LEGAL_PAGES, 'LEGAL_PAGES', out)
  // The route summaries are rendered in the footer and on the 404, so they are copy too.
  collect(
    ROUTES.map((r) => ({ label: r.label, summary: r.summary })),
    'ROUTES',
    out,
  )
  // Stage labels reach the screen on every card. Registered here so a stage called "Q3" would be
  // caught by the number rule rather than by somebody noticing.
  collect(STAGE_LABEL, 'STAGE_LABEL', out)
  // The legend's sentences are rendered in full on the build page, so they are copy and are held
  // to every rule below — the number register included. A stage explained as "ready in Q3" would
  // otherwise reach the screen through the one content file nothing walked.
  collect(STAGE_MEANING, 'STAGE_MEANING', out)
  return out
}

const COPY = publishedCopy()

describe('the copy walk', () => {
  it('finds the whole site, so nothing below can pass over an empty list', () => {
    // The single most likely way this file stops protecting anything is a refactor that renames a
    // content export and leaves the walk finding nothing. A floor, checked first.
    assert.ok(COPY.length >= 150, `expected the site's copy, collected ${COPY.length} strings`)
  })

  it('reaches into nested structures rather than only the top level', () => {
    // Proves the recursion works: this string is four levels down.
    const deep = COPY.find((c) => c.path.startsWith('PRODUCT_PAGES[0].sections[0].body['))
    assert.ok(deep, 'the walk did not descend into a product page section body')
  })
})

describe('numbers', () => {
  const DIGITS = /\d+(?:[.,]\d+)*/g

  /**
   * The name of a published standard is a name, not a claim.
   *
   * "ERC-20" and "EIP-1559" are how a reader recognises the thing being described; there is no
   * version of either that could go stale, and registering them in `claims.ts` would put two
   * meaningless rows in a file whose entire value is that every row is checkable. They are removed
   * before the scan rather than allowlisted, so a genuine number that happens to follow one of
   * these words is still caught.
   */
  const STANDARD_NAMES = /\b(?:ERC|EIP|BIP|SLIP|secp)-?\d+\b/gi

  it('registers every number that appears in copy', () => {
    const allowed = allowedNumbers()
    const offences: string[] = []
    for (const { path, text: raw } of COPY) {
      const text = raw.replace(STANDARD_NAMES, '')
      for (const match of text.match(DIGITS) ?? []) {
        if (!allowed.has(match)) offences.push(`${path}: "${match}" in — ${text.slice(0, 90)}…`)
      }
    }
    assert.deepEqual(
      offences,
      [],
      `these numbers are not in src/content/claims.ts:\n  ${offences.join('\n  ')}`,
    )
  })

  it('has a register that is not empty, and whose entries are all distinct meanings', () => {
    const entries = Object.entries(CLAIMS)
    assert.ok(entries.length >= 8, `the register holds ${entries.length} claims`)
    const meanings = entries.map(([, c]) => c.meaning)
    assert.equal(new Set(meanings).size, meanings.length, 'two claims share a meaning')
  })

  it('cites a source for every claim, and every source names a file', () => {
    for (const [key, entry] of Object.entries(CLAIMS)) {
      assert.ok(entry.source.length > 20, `${key} has no real source`)
      // A source is a path into the estate or a named package. Either way it says WHERE, which is
      // the whole point — "internal" or "the docs" would pass a length check and tell nobody
      // anything.
      assert.match(
        entry.source,
        /(\.ts|\.md|\.css|nginx\.conf|@cloudsforge\/)/,
        `${key}'s source does not name a file or a package: ${entry.source}`,
      )
    }
  })

  it('leaves no claim in the register that the site never prints', () => {
    // An orphan is a number somebody removed from a sentence and left registered, and the next
    // person to need a number reaches for the nearest plausible-looking entry.
    const printed = new Set(COPY.flatMap(({ text }) => text.match(DIGITS) ?? []))
    for (const [key, entry] of Object.entries(CLAIMS)) {
      // `products` is registered but deliberately never printed as a digit — the count is spelled
      // as a word and derived from the registry. Its entry exists so the count has a source and so
      // the test below has something to compare against.
      if (key === 'products') continue

      // A claim need not be a NUMBER. `chainNames` is the list of custodied chains as prose, and it
      // is registered for the reason this whole file exists: the count beside it was derived and
      // re-derived itself to 6, while the names were typed and would have gone on saying five
      // chains in the same sentence. A registered value with no digits cannot be matched against
      // the digit scan, so it is matched against the copy directly — which is the stronger check of
      // the two, and the one that would notice the string being edited in place.
      // `/\d/` and NOT `DIGITS.test(...)`: `DIGITS` carries the `g` flag, so `.test` advances
      // `lastIndex` and returns a different answer on the next claim in this very loop. A stateful
      // regex in a predicate is its own defect and it would have made this check alternate.
      if (!/\d/.test(entry.rendered)) {
        assert.ok(
          COPY.some(({ text }) => text.includes(entry.rendered)),
          `${key} (${entry.rendered}) is registered but appears in no copy`,
        )
        continue
      }
      assert.ok(printed.has(entry.rendered), `${key} (${entry.rendered}) is registered but unused`)
    }
  })

  it('keeps the registered product count equal to the registry', () => {
    assert.equal(CLAIMS.products.rendered, String(PRODUCTS.length))
  })

  it('keeps the registered platform-test count equal to the statements rendered', () => {
    // The home page prints `PLATFORM.tests.length`, so this is what ties the register to the thing
    // actually on screen rather than to a second opinion about it.
    assert.equal(CLAIMS.platformTests.rendered, String(PLATFORM.tests.length))
  })
})

describe('hostnames and links', () => {
  it('names no CloudsForge hostname in copy', () => {
    // A literal hostname is a second, unversioned copy of the surface registry, and the copy is the
    // one that ends up wrong. CI greps the whole of `src` for the same string; this catches it in
    // the sentence, with the sentence quoted.
    for (const { path, text } of COPY) {
      assert.ok(!text.includes('cloudsforge.online'), `${path} names a hostname`)
    }
  })

  it('contains no URL of any kind', () => {
    for (const { path, text } of COPY) {
      assert.ok(!/https?:\/\//.test(text), `${path} contains a URL: ${text.slice(0, 80)}`)
      assert.ok(!text.includes('localhost'), `${path} names localhost`)
    }
  })

  it('contains no port number, which is what a dev URL leaves behind', () => {
    for (const { path, text } of COPY) {
      assert.ok(!/:\d{4}\b/.test(text), `${path} contains a port`)
    }
  })
})

describe('prices', () => {
  /**
   * The site publishes no price, and this is the guard on that decision.
   *
   * The reasoning is in `src/content/claims.ts`: three figures from the monetisation model were
   * checked against the services that implement them and all three had drifted. A decision like
   * that does not survive on its own — it erodes one sentence at a time, each of which looks
   * harmless — so it is a test.
   */
  it('quotes no currency amount', () => {
    for (const { path, text } of COPY) {
      assert.ok(!/[$£€¥]/.test(text), `${path} contains a currency symbol`)
      assert.ok(!/\bUSD\b|\bcents?\b/.test(text), `${path} quotes a currency`)
    }
  })

  it('quotes no percentage or basis-point rate', () => {
    for (const { path, text } of COPY) {
      assert.ok(!/\d\s*%|\bper cent\b|\bpercent\b/.test(text), `${path} quotes a percentage`)
      assert.ok(!/\bbps\b|\bbasis points?\b/.test(text), `${path} quotes a rate in basis points`)
    }
  })
})

describe('placeholders', () => {
  it('contains no unfinished marker left in prose', () => {
    // The legal pages mark undrafted sections structurally, with a `status` field the renderer
    // reads. A TODO in a sentence is the shape that ships.
    for (const { path, text } of COPY) {
      assert.ok(!/\bTODO\b|\bFIXME\b|\bTBD\b|lorem ipsum/i.test(text), `${path} contains a placeholder`)
    }
  })

  it('has no empty or one-word string anywhere in it', () => {
    for (const { path, text } of COPY) {
      assert.ok(text.trim().length > 1, `${path} is empty`)
    }
  })
})

describe('the product pages and the registry', () => {
  it('names only surfaces the registry knows', () => {
    const known = new Set(SURFACES.map((s) => s.key))
    for (const page of PRODUCT_PAGES) {
      assert.ok(known.has(page.key), `${page.slug} is not a registry surface`)
      assert.ok(known.has(page.linkTo), `${page.slug} links to an unknown surface`)
    }
  })

  it('covers every registry product, and invents none', () => {
    // Both directions. A product with no page vanishes from the site silently; a page with no
    // product is a page about something that does not exist.
    const paged = new Set(PRODUCT_PAGES.filter((p) => p.key !== 'hub').map((p) => p.key))
    const registered = new Set(PRODUCTS.map((s) => s.key))
    assert.deepEqual([...paged].sort(), [...registered].sort())
  })

  it('has a page for Hub, which is a surface rather than a product', () => {
    assert.equal(hubPage().key, 'hub')
    // …and Hub is NOT one of the cards, because the vision is explicit that the container must
    // never appear in a product grid as a peer.
    assert.ok(!productCards().some(({ surface }) => surface.key === 'hub'))
  })

  it('gives every page a slug equal to its registry key', () => {
    // The slug is the URL. Deriving it from the key rather than typing it is what stops
    // /products/forge-trade and /products/trade both existing, one of which 404s.
    for (const page of PRODUCT_PAGES) assert.equal(page.slug, page.key)
  })

  it('gives every page a distinct headline and a distinct blurb', () => {
    const headlines = PRODUCT_PAGES.map((p) => p.headline)
    assert.equal(new Set(headlines).size, headlines.length, 'two products share a headline')
    const blurbs = PRODUCT_PAGES.map((p) => p.blurb)
    assert.equal(new Set(blurbs).size, blurbs.length, 'two products share a blurb')
  })

  it('gives every page at least three sections, each with a body', () => {
    for (const page of PRODUCT_PAGES) {
      assert.ok(page.sections.length >= 3, `${page.slug} has ${page.sections.length} sections`)
      for (const section of page.sections) {
        assert.ok(section.body.length >= 1, `${page.slug} › ${section.title} has no body`)
        for (const paragraph of section.body) {
          assert.ok(paragraph.length > 60, `${page.slug} › ${section.title} has a stub paragraph`)
        }
      }
    }
  })

  it('gives every page section titles that are distinct within it', () => {
    for (const page of PRODUCT_PAGES) {
      const titles = page.sections.map((s) => s.title)
      assert.equal(new Set(titles).size, titles.length, `${page.slug} repeats a section title`)
    }
  })
})

describe('the spine', () => {
  /**
   * The positioning line names the currency.
   *
   * It read "One crypto world." — a category noun and a word this estate had already given a
   * different meaning to, naming nothing. The replacement names EMBER, and this is what stops a
   * later rewrite drifting back to a category: the whole site is a footnote to this one line, and a
   * line that could be any crypto company's is a line that was not worth the space.
   */
  it('names EMBER, which is the one thing here that is nobody else\'s', () => {
    assert.match(HOME.spine, /\bEMBER\b/, `the spine no longer names the currency: ${HOME.spine}`)
  })

  it('does not sell the architecture on the front page', () => {
    // "The loop is the product" was removed on the owner's instruction. It argued that the parts
    // are joined up — a second-order virtue — to a reader who had not yet been told what the
    // first-order thing was. Asserted over the whole of the home page rather than over the one
    // heading, because the sentence's natural home if reintroduced is a lede.
    for (const { path, text } of COPY.filter((c) => c.path.startsWith('HOME'))) {
      assert.ok(!/the loop is the product/i.test(text), `${path} restores the loop framing`)
    }
  })
})

describe('stages', () => {
  it('says something specific about every surface, not just its stage label', () => {
    // A stageNote that restates the label is a field somebody filled in to make the type happy.
    for (const page of PRODUCT_PAGES) {
      assert.ok(page.stageNote.length > 60, `${page.slug} has a stub stage note`)
      assert.notEqual(page.stageNote.trim(), STAGE_LABEL[page.stage])
    }
  })

  it('gives every surface a different note', () => {
    const notes = PRODUCT_PAGES.map((p) => p.stageNote)
    assert.equal(new Set(notes).size, notes.length, 'two surfaces share a stage note')
  })

  it('claims nothing serves the public, on the page that says so', () => {
    // The honesty block is the load-bearing sentence on this site. It is asserted by content rather
    // than by presence, because a section that keeps its heading and loses its meaning is the exact
    // way this claim would be softened.
    //
    // ── This assertion was CHANGED, and the reason belongs next to it ──────────────────────────
    //
    // It used to require the heading "nothing is deployed" and the sentence "not one of them is
    // running". Both were true when they were written and both are now false: the estate runs end
    // to end behind a gateway with its own certificate authority. Leaving the assertion as it was
    // would have forced the site to keep publishing a false sentence in order to stay green —
    // which is a test holding copy hostage to a fact that has expired.
    //
    // The claim moved rather than weakened. "Nothing runs" became "nothing serves the public",
    // which is the stronger of the two to have to keep true.
    //
    // AND ON 2026-08-05 IT MOVED AGAIN, for the third time: the estate went public, so "nothing is
    // serving the public" is now false too and this assertion would have held the copy hostage to
    // a fact that had expired — exactly what the paragraph above warns against.
    //
    // So what is pinned is no longer a single sentence but the SHAPE of the honest disclosure,
    // which is what actually protects a reader. Being reachable is the flattering half; each of
    // these is a limit that a crypto reader will otherwise supply the opposite of, and every one
    // is independently true today.
    assert.ok(
      /open to the public/i.test(BUILD.honesty.title),
      'the honesty block no longer says the estate is open, which it is',
    )
    const honesty = BUILD.honesty.body.join(' ')
    for (const [what, pattern] of [
      // Was /no market, no listing and no price/ until 2026-08-10, when the operator set an
      // administered price of $0.0001 through `PUT /admin/prices/:asset` and the estate began
      // showing it. "No price" was then false while "no market" and "no listing" stayed true, so
      // the pin moves to what is true — and gains the half that now carries the disclosure, which
      // is that the figure is one we set rather than one anybody paid. Dropping the pin instead
      // would have let the whole clause quietly disappear the next time the copy was touched.
      ['EMBER has no market or listing', /no market and no listing/i],
      ['the EMBER price is ours, not a traded one', /price you see for it is one we set ourselves/i],
      ['nobody outside has used it', /nobody outside the project has used/i],
      ['one machine, no failover', /no redundancy, no failover/i],
      // Was "no backup that has ever been restored" until 2026-08-10. micro-org#214 rehearsed a
      // restore on the live host, so the old wording was false; the same issue found the nightly
      // backup run queued, unclaimed and producing nothing, so the limit itself is real and only
      // its wording was wrong. A pin that becomes false is moved to what is true, never dropped.
      ['the scheduled backup has never run', /no scheduled backup that has ever run/i],
    ] as const) {
      assert.ok(pattern.test(honesty), `the honesty block no longer says: ${what}`)
    }
  })
})

/**
 * The one sentence on this site that is addressed to a reader of the OTHER estate.
 *
 * Both apexes serve the same bundle — measured 2026-08-07 and recorded in
 * docs/ecosystem/32-roadmap-ui-and-content.md §2 — so until this notice existed, the testnet apex
 * told a reader the platform was "Open to the public" over throwaway money on a chain that gets
 * reset. `src/content/stages.ts` had already written the argument down and could not act on it,
 * because there was no environment awareness anywhere in `src`.
 */
describe('the testnet notice', () => {
  it('names the network, and states the two things a reader cannot check for themselves', () => {
    // Literals, not the constant: everything in this file that compares copy to the module the
    // page renders from moves when the module moves. These three are the product decision.
    assert.match(TESTNET_NOTICE.title, /test network/i, 'the notice no longer names the network')
    assert.match(
      TESTNET_NOTICE.body,
      /the coins are not the real ones/i,
      'the notice no longer denies that the money here is real, which is the whole of it',
    )
    assert.match(
      TESTNET_NOTICE.body,
      /reset without notice/i,
      'the notice no longer says the chain is reset, so a reader may keep something here',
    )
  })

  it('offers the way out, and names it as a destination rather than as a mechanism', () => {
    assert.match(TESTNET_NOTICE.linkLabel, /live site/i)
    // Rule 5 of the track this was written under: a claim that invites verification carries the
    // link that permits it. The href itself cannot be here — nothing under `src` may spell a
    // hostname — so what is pinned here is that the label exists and `test/hosts.test.ts` pins
    // what `liveUrl()` composes.
    assert.ok(TESTNET_NOTICE.linkLabel.trim().length > 8)
  })

  it('denies no capability the test network actually has', () => {
    // The failure this forbids is a real one in this estate, recorded in §4.2 of the same
    // document: `network-site` still tells a reader the testnet "is unreachable from outside"
    // while `POST eth_chainId` to its public RPC answers. A caveat that overstates is retracted
    // later at the cost of everything around it, so the words are scanned here.
    const notice = Object.values(TESTNET_NOTICE).join(' ')
    for (const forbidden of [/unreachable/i, /\bbroken\b/i, /\boffline\b/i, /temporar/i]) {
      assert.ok(!forbidden.test(notice), `the notice claims more than a rehearsal: ${notice}`)
    }
  })

  it('is rendered in the chrome, above the navigation, and only on the test network', () => {
    /*
     * READ OUT OF THE COMPONENT, because nothing else can see this one.
     *
     * The browser suite serves this bundle from localhost, where `environment()` is correctly
     * empty and the notice correctly does not render — so a scenario in `test/journeys` cannot
     * assert it exists, and a notice that was declared, tested as a string, and wired to nothing
     * would pass every other check in this file.
     *
     * Comments are stripped first, for the reason the CI hostname grep strips them: the component
     * explains itself by naming both `isTestnet` and `SiteNav` in prose, and a raw scan would pass
     * against a version of it that renders nothing at all.
     */
    const source = readFileSync(new URL('../src/components/shell.tsx', import.meta.url), 'utf8')
    const code = source
      .split('\n')
      .filter((line) => !/^\s*(?:\/\*|\*|\/\/)/.test(line))
      .join('\n')

    const notice = code.indexOf('<EnvironmentNotice />')
    const nav = code.indexOf('<SiteNav />')
    assert.ok(notice > -1, 'the shell no longer renders the environment notice')
    assert.ok(nav > -1, 'the shell no longer renders its own navigation')
    assert.ok(notice < nav, 'the environment notice is below the navigation rather than above it')
    assert.match(
      code,
      /if \(!isTestnet\(\)\) return null/,
      'the environment notice no longer checks the environment, so it renders on the live estate too',
    )
  })
})

describe('images', () => {
  it('references only brand assets that exist on disk', () => {
    // A card whose image 404s renders as a grey box in every link preview, and nothing on the page
    // itself looks wrong — so the only place this is catchable is here.
    for (const page of PRODUCT_PAGES) {
      const file = new URL(`../public${page.ogImage}`, import.meta.url)
      assert.ok(existsSync(file), `${page.slug}'s card is missing: public${page.ogImage}`)
    }
  })

  it('ships the site-level card, the favicons and robots.txt', () => {
    for (const file of [
      'public/og-1200x630.png',
      'public/favicon-32x32.png',
      'public/favicon-192x192.png',
      'public/favicon-512x512.png',
      'public/robots.txt',
    ]) {
      assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `${file} is missing`)
    }
    assert.ok(root.length > 0)
  })
})
