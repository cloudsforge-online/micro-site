/**
 * The three descriptions of this site's addresses, checked against each other.
 *
 *   1. `src/lib/routes.ts` — the declaration, from which the navigation and the footer are derived.
 *   2. `src/app.tsx`       — which component renders at each path.
 *   3. `nginx.conf`        — which addresses are served the app shell at all.
 *
 * The third is what makes this test worth having. nginx enumerates the real routes and 404s
 * everything else on purpose, so that a wrong address answers 404 rather than 200 — and this is
 * the surface where that matters most, because it is the one crawlers index and link checkers
 * walk.
 *
 * The price of that honesty is that a route added to the router and not to nginx works perfectly
 * under `pnpm dev` and 404s on the first hard refresh in production. That failure survives review
 * because nothing about the diff looks wrong. This test is the mechanism instead.
 *
 * `app.tsx` is read as TEXT rather than imported: importing would pull in React, the router and
 * every page, and this suite deliberately has no DOM.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { LEGAL_PATHS, NAV, NON_INDEX_PATHS, ROUTES } from '../src/lib/routes.ts'
import { PRODUCT_PAGES } from '../src/content/products.ts'
// `/surfaces` and not the package root: `servesOwnBundle` is the registry's own discriminator and
// is exported from the module that owns it. The root re-exports the DATA and not this predicate.
import { SURFACES, servesOwnBundle } from '@cloudsforge/ui/surfaces'

const read = (file: string): string => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')

const appSource = read('src/app.tsx')
const nginx = read('nginx.conf')

/**
 * `app.tsx` with its comments removed.
 *
 * The same lesson as `directives` below, learned twice in one repository. The header of `app.tsx`
 * explains at length why there is no `ProtectedRoute` on this surface — and the assertion that
 * there is no `ProtectedRoute` then matched the explanation and failed on a correct file.
 *
 * That is precisely the defect the web template shipped in its 404 CI step, and it is worth
 * recording that it recurs the moment anyone writes a grep-shaped rule next to a written-down
 * reason. A guard that fires on its own rationale trains people to delete the guard, so the rule
 * is about CODE and the prose is stripped before it is applied.
 */
const appCode = appSource
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')

/**
 * nginx.conf with its comments removed.
 *
 * The file's own header quotes the directive it forbids, in order to explain why the routes are
 * enumerated by hand, so a grep over the raw text matches the warning and fails on a correct file.
 * The web template's `ci.yml` had exactly that bug and failed on its own pristine config; the rule
 * is about DIRECTIVES, so the prose is stripped before checking it.
 */
const directives = nginx
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('#'))
  .join('\n')

/** The alternation inside nginx's flat `location ~ ^/(…)/?$` block: the top-level pages. */
function nginxFlatPaths(): string[] {
  const match = /location\s+~\s+\^\/\(([^)]+)\)\/\?\$/.exec(directives)
  assert.ok(match, 'nginx.conf has no enumerated top-level route block')
  return (match[1] ?? '').split('|').map((p) => p.trim())
}

/**
 * The alternation inside nginx's `location ~ ^/products/(…)/?$` block: the product slugs.
 *
 * This block exists because the first version of it did not. It was written as a prefix —
 * `^/(products|…)(/|$)` — which served the app shell for EVERY address under `/products/`, so
 * `/products/pay` answered `200 OK`. React rendered the not-found page inside it and the status
 * line said success, which is exactly the failure this whole configuration exists to prevent, in
 * the one place nobody thought to look. It was found by running the built image and probing it,
 * not by reading the file.
 */
function nginxProductSlugs(): string[] {
  const match = /location\s+~\s+\^\/products\/\(([^)]+)\)\/\?\$/.exec(directives)
  assert.ok(match, 'nginx.conf does not enumerate the product slugs')
  return (match[1] ?? '').split('|').map((p) => p.trim())
}

describe('the route declaration', () => {
  it('is not empty, so this whole file cannot pass for the wrong reason', () => {
    assert.ok(ROUTES.length >= 7, `expected the route table, found ${ROUTES.length} entries`)
  })

  it('has exactly one index route', () => {
    assert.equal(ROUTES.filter((r) => r.path === '').length, 1)
  })

  it('declares no duplicate path', () => {
    const paths = ROUTES.map((r) => r.path)
    assert.equal(new Set(paths).size, paths.length)
  })

  it('declares no path with a slash: these are TOP-LEVEL segments', () => {
    // nginx matches on the first segment and everything under it. A declaration of
    // `products/trade` would produce a location block that does not mean what it says.
    for (const route of ROUTES) {
      assert.ok(!route.path.includes('/'), `${route.path} is not a top-level segment`)
    }
  })

  it('gives every route a summary, since the footer and the 404 both render it', () => {
    for (const route of ROUTES) {
      assert.ok(route.summary.length > 15, `${route.path || '/'} has no summary`)
    }
  })

  it('declares exactly one wildcard, which is the products prefix', () => {
    const wildcards = ROUTES.filter((r) => r.wildcard).map((r) => r.path)
    assert.deepEqual(wildcards, ['products'])
  })
})

describe('the navigation', () => {
  it('is derived from the declaration rather than restated', () => {
    const labelled = ROUTES.filter((r) => r.label !== null)
    assert.equal(NAV.length, labelled.length)
    assert.deepEqual(
      NAV.map((n) => n.to),
      labelled.map((r) => (r.path === '' ? '/' : `/${r.path}`)),
    )
  })

  it('points the first entry at the index, with the leading slash a NavLink needs', () => {
    assert.equal(NAV[0]?.to, '/')
  })

  it('does not offer the legal pages, which belong in the footer', () => {
    // A nav slot spent on Terms is a slot not spent on a product. They are reachable, linked and
    // indexed — just not competing for the header.
    const offered = NAV.map((n) => n.to)
    for (const path of LEGAL_PATHS) {
      assert.ok(!offered.includes(`/${path}`), `/${path} must not be a header entry`)
    }
  })

  it('lists every legal path as a real route', () => {
    // The other direction: a legal path in the footer that is not a route is a link to a 404 on
    // every page of the site at once.
    const declared = new Set(ROUTES.map((r) => r.path))
    for (const path of LEGAL_PATHS) assert.ok(declared.has(path), `/${path} is not routed`)
  })
})

describe('the router', () => {
  it('has a <Route> for every declared path', () => {
    for (const route of ROUTES) {
      if (route.path === '') {
        assert.match(appSource, /<Route\s+index/, 'no index route in app.tsx')
        continue
      }
      assert.ok(appSource.includes(`path="${route.path}"`), `app.tsx has no path="${route.path}"`)
    }
  })

  it('nests the product pages under the products prefix', () => {
    // Asserted because a refactor to two top-level routes would work perfectly under `pnpm dev`
    // and quietly need an nginx change nobody would make.
    assert.match(appSource, /<Route path="products">/)
    assert.ok(appSource.includes('path=":slug"'), 'the product detail route is missing')
  })

  it('routes no path the declaration does not know about', () => {
    const declared = new Set(NON_INDEX_PATHS)
    for (const match of appSource.matchAll(/path="([^"]+)"/g)) {
      const path = match[1] ?? ''
      if (path === '*' || path === ':slug') continue // the catch-all and the nested parameter
      assert.ok(declared.has(path), `app.tsx routes ${path}, which lib/routes.ts does not declare`)
    }
  })

  it('keeps the catch-all, which is what renders the honest 404 page', () => {
    assert.ok(appSource.includes('path="*"'))
    assert.ok(appSource.includes('NotFoundPage'))
  })

  it('gates nothing, because every page here is public', () => {
    // The template ships a session gate. A marketing site that bounces a reader to sign in before
    // telling them what the company does is the most self-defeating thing this surface could do,
    // so the wrapper was removed on instantiation — asserted, because re-adding it during a
    // copy-paste from another frontend would look entirely normal in a diff.
    assert.ok(!appCode.includes('ProtectedRoute'), 'a route was put behind a session gate')
    // The reason it is absent is still written down, since it is the only thing that stops the
    // next person adding it back "for consistency" with the other frontends.
    assert.match(appSource, /No ProtectedRoute/)
  })
})

describe('nginx', () => {
  it('enumerates every declared top-level path', () => {
    const served = new Set([...nginxFlatPaths(), 'products'])
    for (const path of NON_INDEX_PATHS) {
      assert.ok(served.has(path), `nginx.conf does not serve /${path}; it will 404 on a hard refresh`)
    }
  })

  it('enumerates nothing the site does not route', () => {
    // The other direction: a stale entry serves the shell with a 200 for an address that renders
    // the not-found page, which is the exact dishonesty the enumeration exists to prevent.
    const declared = new Set(NON_INDEX_PATHS)
    for (const path of nginxFlatPaths()) {
      assert.ok(declared.has(path), `nginx.conf serves /${path}, which this site does not route`)
    }
  })

  it('serves the products index on its own', () => {
    // Separately from the slugs, because `/products` and `/products/<slug>` are two shapes and one
    // pattern covering both is how the slug list stopped being enforced in the first place.
    assert.match(directives, /location\s+~\s+\^\/products\/\?\$/)
  })

  it('serves exactly the product pages that exist, and no other slug', () => {
    /*
     * Both directions, and this is the assertion that would have caught the defect that produced
     * this block. `/products/pay` answered 200 for as long as the rule was a prefix — and it is
     * not a hypothetical address: Forge Pay was a destination in the previous estate and is now a
     * page inside Forge Hub, so it is exactly what an old link carries.
     */
    const served = nginxProductSlugs()
    const declared = PRODUCT_PAGES.map((p) => p.slug)
    assert.deepEqual([...served].sort(), [...declared].sort())
  })

  it('serves no product slug the router would answer with the not-found page', () => {
    // Named individually: these three are the addresses most likely to be linked from outside and
    // are all pages that no longer exist. Each must reach nginx's 404 rather than the shell.
    for (const retired of ['pay', 'crucible', 'forgemint']) {
      assert.ok(
        !nginxProductSlugs().includes(retired),
        `nginx.conf serves /products/${retired} with a 200`,
      )
    }
  })

  it('serves the index explicitly', () => {
    assert.match(nginx, /location\s+=\s+\/\s*\{/)
  })

  it('accepts a trailing slash on every route', () => {
    // `/about/` is an address people link to. 404ing it would be pedantry rather than honesty, and
    // src/lib/meta.ts normalises the two spellings onto one canonical so they cannot split their
    // own indexing.
    for (const block of [nginxFlatPaths, nginxProductSlugs]) {
      assert.ok(block().length > 0)
    }
    assert.equal((directives.match(/\/\?\$/g) ?? []).length >= 3, true, 'a route block is slash-strict')
  })

  it('never falls back to index.html with a 200 for an unknown path', () => {
    assert.equal(
      /try_files\s+\$uri\s+(\$uri\/\s+)?\/index\.html/.test(directives),
      false,
      'the catch-all falls back to the shell with a 200',
    )
    assert.ok(directives.includes('error_page 404 /index.html'))
    // …and the comment that explains the rule is still there, since it is the only reason anybody
    // reading this file later will understand why the routes are enumerated by hand.
    assert.match(nginx, /404, not 200/)
  })

  it('does not let a missing asset fall through to the shell', () => {
    // A JavaScript request answered with HTML fails with a syntax error that names the wrong file.
    assert.match(directives, /location\s+\^~\s+\/assets\/\s*\{[\s\S]*?try_files\s+\$uri\s+=404;/)
  })

  it('gives the hashed bundle a longer life than the brand images', () => {
    // Two cache rules, and getting them the wrong way round is invisible until an OG card is stuck
    // in a crawler's cache for a year. The `^~` on /assets/ is what makes the ordering hold.
    assert.match(directives, /location \^~ \/assets\/[\s\S]*?immutable/)
    assert.match(directives, /\\\.\(png\|svg\|ico\|webp\)\$[\s\S]*?max-age=86400/)
  })

  it('never caches index.html', () => {
    // It is the file that names the current asset hashes, so a stale copy pins a browser to a
    // deploy that no longer exists.
    assert.match(directives, /location = \/index\.html\s*\{[\s\S]*?no-store/)
  })

  it('sets the security headers the shared bar session warrants', () => {
    for (const header of ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy']) {
      assert.ok(directives.includes(header), `${header} is not set`)
    }
  })
})

/**
 * The sitemap, against the routes it is supposed to list.
 *
 * A sitemap is the one artefact on this site whose errors are invisible from the site: a missing
 * entry is a page a crawler is never told about, and a stale entry points a crawler at an address
 * this server answers 404 for — which is worse than the omission, because it is the site publishing
 * a link to its own missing page.
 *
 * Both directions, therefore, and against the same two declarations every other check here uses.
 */
describe('the sitemap', () => {
  /** Every `<loc>` in the nginx sitemap block, with the host variable stripped. */
  const locs = (): string[] => {
    const block = /location = \/sitemap\.xml \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    return [...block.matchAll(/<loc>https:\/\/\$host(\/[^<]*)<\/loc>/g)].map((m) => m[1] ?? '')
  }

  it('names no hostname, and derives one from the request instead', () => {
    // The reason this site shipped without a sitemap at all. The rule has not been relaxed — the
    // artefact still names no host — so this is what keeps a literal from creeping back in.
    const block = /location = \/sitemap\.xml \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    assert.ok(block.length > 0, 'nginx.conf no longer serves a sitemap')
    assert.ok(!block.includes('cloudsforge.online'), 'the sitemap names a hostname')
    assert.ok(block.includes('https://$host'), 'the sitemap does not derive its host from the request')
  })

  it('writes the scheme as a literal, because $scheme is http at this origin', () => {
    // ── THIS SHIPPED WRONG AND WAS MEASURED WRONG, WHICH IS WHY IT HAS A TEST OF ITS OWN ────────
    //
    // The block was authored `$scheme://$host`, which reads as the careful choice and is the
    // opposite of one. TLS ends at Cloudflare: cloudflared speaks plain HTTP to the gateway and the
    // gateway speaks plain HTTP to this container, so `$scheme` is `http` for every reader who
    // arrived over `https`. Measured at the apex on 2026-08-19, before the fix:
    //
    //     Sitemap: http://cloudsforge.online/sitemap.xml
    //
    // Every `<loc>` was the same. A sitemap whose scheme disagrees with the canonical scheme of the
    // page it describes is how a site tells a crawler that each of its addresses is a different,
    // redirecting one. The HOST must still come from the request and the assertion above keeps it
    // that way — this one is about the scheme alone, and it asserts the ABSENCE of `$scheme`
    // because the failure mode is a well-meaning revert, not a typo.
    const block = /location = \/sitemap\.xml \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    assert.ok(!block.includes('$scheme'), 'the sitemap is back on $scheme, which is http at this origin')
    const robots = /location = \/robots\.txt \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    assert.ok(!robots.includes('$scheme'), 'robots.txt is back on $scheme, which is http at this origin')
  })

  it('lists every page this site serves', () => {
    const listed = new Set(locs())
    assert.ok(listed.has('/'), 'the home page is not in the sitemap')
    assert.ok(listed.has('/products'), 'the products index is not in the sitemap')
    for (const path of NON_INDEX_PATHS) {
      assert.ok(listed.has(`/${path}`), `/${path} is served but is not in the sitemap`)
    }
    for (const page of PRODUCT_PAGES) {
      assert.ok(listed.has(`/products/${page.slug}`), `/products/${page.slug} is not in the sitemap`)
    }
  })

  it('lists nothing this site would answer 404 for', () => {
    const known = new Set(['/', '/products', ...NON_INDEX_PATHS.map((p) => `/${p}`), ...PRODUCT_PAGES.map((p) => `/products/${p.slug}`)])
    for (const loc of locs()) {
      assert.ok(known.has(loc), `the sitemap points a crawler at ${loc}, which this site does not serve`)
    }
  })

  it('refuses to publish either file on a non-apex host', () => {
    // The estate serves ONE image from the apex, the testnet host and a laptop. A testnet page in
    // an index competes with the mainnet page it is a copy of, under a hostname that pays in
    // worthless EMBER — and the testnet copy is the newer document, which is the one a crawler
    // prefers. Both guards, because either alone still invites the crawl.
    assert.match(directives, /map \$host \$cf_env \{/, 'nginx.conf no longer classifies the host')
    const sitemap = /location = \/sitemap\.xml \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    assert.match(sitemap, /if \(\$cf_env\) \{ return 404; \}/, 'the sitemap is published on every host')
    const robots = /location = \/robots\.txt \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    assert.match(robots, /if \(\$cf_env\) \{ return 200 'User-agent: \*\\nDisallow: \/\\n'; \}/,
      'robots.txt does not refuse crawlers on an environment host')
  })

  it('lists each address exactly once', () => {
    // A duplicate is not fatal to a crawler and it is a reliable sign the block was edited by hand
    // rather than against the declarations, which is the state this test exists to catch.
    const all = locs()
    assert.equal(new Set(all).size, all.length, 'the sitemap lists an address twice')
  })

  it('serves robots.txt from the server, with the same rules as the static file', () => {
    // The static `public/robots.txt` is what `pnpm dev` and `vite preview` serve; nginx serves its
    // own copy in production because only the server knows the host the Sitemap line needs. Two
    // copies is exactly the shape this repository distrusts, so they are compared rather than
    // trusted: the rules must match, and only the Sitemap line may differ.
    const block = /location = \/robots\.txt \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    assert.ok(block.includes('Sitemap: https://$host/sitemap.xml'), 'robots.txt does not point at the sitemap')
    // The nginx copy is inside a `return 200 '…'`, so the first rule shares a line with the
    // directive that emits it. Stripping the directive is what makes the two comparable at all —
    // EVERY occurrence, because the block also carries the one-line environment refusal above it,
    // and stripping only the first left the real rules still prefixed.
    const rules = (text: string): string[] =>
      text
        .replaceAll("return 200 '", '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^(User-agent|Allow|Disallow):/i.test(line))
    const statik = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8')
    assert.deepEqual(rules(block), rules(statik), 'public/robots.txt and the served robots.txt disagree')
  })

  it('carries the rules of the other bundles mounted on this apex, because it is the only place they fit', () => {
    // ── robots.txt IS AN ORIGIN-ROOT FILE, AND THIS ORIGIN IS NO LONGER ONE BUNDLE ──────────────
    //
    // A crawler fetches /robots.txt and nothing else — there is no such thing as a robots.txt for a
    // subdirectory. Forge Journal was a hostname with a robots.txt of its own until the apex
    // consolidation; it is now `/journal` here, and `micro-journal-web` DELETED its copy in the
    // same wave rather than mounting it at `/journal/robots.txt`, which is a file nothing fetches.
    //
    // So its rules live in this block or they live nowhere, and the test is here rather than there
    // for the same reason. Two lines: the search page is not a document, and the journal publishes
    // its own sitemap because this server cannot know a per-article `lastmod`.
    //
    // A second `Sitemap:` line is the ordinary way to announce a second sitemap; they are not
    // exclusive and a crawler reads both.
    const block = /location = \/robots\.txt \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    assert.ok(
      block.includes('Disallow: /journal/search'),
      'the journal deleted its own robots.txt and this one does not carry its search rule',
    )
    assert.ok(
      block.includes('Sitemap: https://$host/journal/sitemap.xml'),
      "the journal's sitemap is announced from nowhere, so its articles are found only by crawling",
    )
  })

  it('announces a sitemap for every surface consolidated onto this origin', () => {
    /*
     * ── DERIVED FROM THE REGISTRY, BECAUSE THE NAMED VERSION ALREADY MISSED ONE ────────────────
     *
     * The assertion above names `journal` and was written in wave 1. Wave 2 added
     * `Sitemap: https://$host/exchange/sitemap.xml` to nginx.conf and nothing asserted it, so the
     * exchange's sitemap was announced on the strength of somebody remembering. Wave 3a is the
     * third, eleven more follow, and a list of literals here would need editing eleven more times
     * — each time in a repository that is not the one being moved.
     *
     * So the set comes from `SURFACES`: a row with an EMPTY subdomain and a `basePath` is the
     * registry's one-line statement that the surface is a folder on this origin, and this file is
     * the only robots.txt that folder will ever have. `site` itself has no `basePath` and is
     * excluded by construction; its own `/sitemap.xml` is asserted separately above.
     *
     * WHY EVERY ONE OF THEM, RATHER THAN THE ONES THAT HAPPEN TO PUBLISH A SITEMAP. Discoverability
     * is the entire argument for the consolidation — `docs/apex-consolidation.md` opens with
     * authority thrown away on a subdomain — and a surface that arrives here without a sitemap has
     * traded a hostname a crawler already knew for a folder it has no reason to look in. If a
     * future surface genuinely should not have one, the honest form of that is a row in this test
     * saying which and why, not silence.
     */
    const block = /location = \/robots\.txt \{[\s\S]*?\n    \}/.exec(directives)?.[0] ?? ''
    const mounted = SURFACES.filter((s) => s.subdomain === '' && s.basePath && servesOwnBundle(s))
    // The vacuity guard, and it is `> 0` rather than a count ON PURPOSE. It read `>= 3` for one
    // CI run and failed there for the wrong reason: micro-site's CI checks out micro-ui at
    // whatever `main` is when the job starts, so the number of consolidated surfaces is a moving
    // target this repository does not control. Pinning it would also be the literal-that-rots this
    // whole test was written to remove, one number instead of one line. What must not happen is
    // the loop finding NOTHING and reporting success, and that is what this says.
    assert.ok(mounted.length > 0, 'the registry lists no consolidated surface, so this asserts nothing')
    for (const s of mounted) {
      assert.ok(
        block.includes(`Sitemap: https://$host${s.basePath}/sitemap.xml`),
        `${s.key} is served at ${s.basePath} on this origin and its sitemap is announced from ` +
          `nowhere — it deleted its own robots.txt when it moved, so this file is the only place ` +
          `a crawler can be told the sitemap exists`,
      )
    }
  })
})
