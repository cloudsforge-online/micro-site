/**
 * The sitemap and robots.txt nginx serves, regenerated and compared byte for byte.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * WHY THE BODIES ARE IN nginx.conf AT ALL
 *
 * A sitemap must carry ABSOLUTE URLs — the spec requires it and a crawler discards a relative
 * `<loc>` — and nothing built in this repository may name a hostname, because one image is served
 * from localhost, from a preview deployment and from the apex. `public/robots.txt` recorded
 * exactly that tension and resolved it by having no `Sitemap:` line at all, concluding that the
 * sitemap "belongs to whatever terminates TLS for the apex, which is the one component that knows
 * what the apex is."
 *
 * nginx is that component. It has `$host` on every request, and this surface IS the apex — so
 * `$host` is the apex and every sibling surface is a prefix on it. The bodies are therefore
 * composed per request, from a config file with no hostname in it.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * AND WHY THAT NEEDS THIS TEST
 *
 * A body pasted into a config file is a copy, and this repository has already been bitten by
 * exactly one of those: `index.html`'s title and description drifted from `src/lib/meta.ts`'s, the
 * suite stayed green, and every search result and social card carried a sentence the owner had
 * asked to have removed until somebody opened the served HTML rather than the page.
 *
 * So the block is treated as GENERATED OUTPUT that happens to live in a config file. This
 * regenerates it from `@cloudsforge/ui/sitemap` and from this repository's own route table, and
 * fails on a byte. Adding a product is then a registry row plus a route, and nginx follows.
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { ENV_LABELS, SURFACES } from '@cloudsforge/ui'
import { robotsTxt, sitemapXml } from '@cloudsforge/ui/sitemap'
import { ROUTES } from '../src/lib/routes.ts'
import { PRODUCT_PAGES } from '../src/content/products.ts'

const nginx = readFileSync(new URL('../nginx.conf', import.meta.url), 'utf8')

/** Every address this surface itself serves, from the two declarations that decide them. */
const SITE_PATHS = [
  ...ROUTES.map((r) => r.path),
  ...PRODUCT_PAGES.map((p) => `/products/${p.slug}`),
]

/** The single-quoted body of a `return 200 '…';` inside an exact-match location. */
function servedBody(path: string): string {
  const block = new RegExp(
    `location = ${path.replace('.', '\\.')} \\{([\\s\\S]*?)\\n    \\}`,
  ).exec(nginx)
  assert.ok(block, `nginx.conf has no exact-match location for ${path}`)
  // Anchored to a `return` at the start of its own line: `/robots.txt` also carries a CONDITIONAL
  // `if ($cf_env) { return 200 '…'; }` above it, and a regex that took the first match would read
  // the non-mainnet body and report the mainnet one as drifted.
  const body = /\n {8}return 200 '([\s\S]*?)';/.exec(block[1] ?? '')
  assert.ok(body, `the ${path} location does not return an unconditional literal body`)
  return body[1] ?? ''
}

describe('the sitemap nginx serves', () => {
  it('is exactly what the design system generates for this route table', () => {
    assert.equal(servedBody('/sitemap.xml'), sitemapXml('$scheme://$host', SITE_PATHS).trimEnd())
  })

  it('names no hostname — every address is composed from $host', () => {
    /*
     * THE ASSERTION THAT KEEPS THE ARTEFACT ENVIRONMENT-FREE, and the reason this arrangement is
     * allowed at all. A single literal apex here would make the image wrong on a preview
     * deployment and on testnet, silently, in the one document a crawler treats as authoritative.
     */
    const xml = servedBody('/sitemap.xml')
    assert.ok(!xml.includes('cloudsforge.online'), 'the sitemap names the production apex')
    assert.ok(!xml.includes('localhost'), 'the sitemap names localhost')
    for (const m of xml.matchAll(/<loc>([^<]*)<\/loc>/g)) {
      assert.match(m[1] ?? '', /^\$scheme:\/\/[a-z.]*\$host/, `a <loc> is not composed: ${m[1]}`)
    }
  })

  it('lists every surface a person can open, and nothing else', () => {
    const xml = servedBody('/sitemap.xml')
    for (const s of SURFACES) {
      const address = `$scheme://${s.subdomain === '' ? '' : `${s.subdomain}.`}$host${s.basePath ?? ''}`
      const present = xml.includes(`<loc>${address}</loc>`)
      const expected = s.servesUi && s.adminOnly !== true && s.key !== 'signin'
      assert.equal(present, expected, `${s.key}: present=${present}, expected=${expected}`)
    }
  })

  it('lists every route this site actually serves, so a crawler is not left to guess', () => {
    const xml = servedBody('/sitemap.xml')
    for (const path of SITE_PATHS) {
      const canonical = path.startsWith('/') ? path : `/${path}`
      const address = canonical === '/' ? '$scheme://$host' : `$scheme://$host${canonical}`
      assert.ok(xml.includes(`<loc>${address}</loc>`), `${path} is missing from the sitemap`)
    }
  })

  it('is served as XML, because a sitemap sent as text/html is a sitemap nobody reads', () => {
    // `types { }` as well as `default_type`: without emptying the table for this location, nginx
    // maps the `.xml` in the URI to `text/xml` from its own mime types and `default_type` never
    // applies. Verified against a real nginx, which is how the difference was noticed at all.
    assert.match(
      nginx,
      /location = \/sitemap\.xml \{[\s\S]*?types \{ \}[\s\S]*?default_type application\/xml;/,
    )
  })
})

describe('an environment that is not mainnet', () => {
  /**
   * The `map` that decides it, and the alternation of labels inside it.
   *
   * ── THE DEFECT THIS CLOSES, WHICH A UNIT TEST COULD NOT HAVE FOUND ──────────────────────────
   *
   * The sitemap composes each sibling as `<subdomain>.$host`. On `testnet.cloudsforge.online` —
   * an address this estate serves, because the apex surface on testnet has no subdomain to suffix
   * — that yields `foresight.testnet.cloudsforge.online`: the OLD two-label shape, which
   * `surfaces.ts` records at length as unreachable, because Cloudflare's Universal SSL is a
   * one-label wildcard and every two-label testnet hostname fails the handshake at the edge.
   *
   * It was found by booting nginx and asking it for the document with that Host header, not by
   * reading the config — the config is correct on the apex and correct-looking everywhere.
   */
  function alternation(): string[] {
    const map = /map \$host \$cf_env \{[\s\S]*?~\^[^\n]*?\(\?:([^)]*)\)\\\./.exec(nginx)
    assert.ok(map, 'the $cf_env map is missing from nginx.conf')
    return (map[1] ?? '').split('|')
  }

  it('recognises exactly the labels the registry reserves', () => {
    /*
     * ENV_LABELS is the estate's single list — `deploy/scripts/check-apex-prefix.py` reads the
     * same export. An alternation here that had drifted from it would either miss an environment
     * (and index it) or refuse a surface (and de-index a real one), and both fail silently.
     */
    assert.deepEqual(alternation().sort(), [...ENV_LABELS].sort())
  })

  it('refuses every crawler and serves no sitemap', () => {
    // Both halves matter and neither is sufficient. Driven for real against nginx: `testnet.` and
    // `hub-testnet.` both answer `Disallow: /` and 404 the sitemap, and the apex does neither.
    assert.match(nginx, /if \(\$cf_env\) \{ return 200 'User-agent: \*\\nDisallow: \/\\n'; \}/)
    assert.match(nginx, /location = \/sitemap\.xml \{[\s\S]*?if \(\$cf_env\) \{ return 404; \}/)
  })

  it('matches a suffixed subdomain as well as a bare environment apex', () => {
    // The environment is a SUFFIX on the first label now (`hub-testnet.`), and was an apex prefix
    // (`testnet.`) before. Both shapes still resolve — surfaces.ts keeps the old one deliberately —
    // so the pattern has to catch both or half the estate stays indexable on testnet.
    const map = /map \$host \$cf_env \{[\s\S]*?\n\}/.exec(nginx)
    assert.ok(map, 'the $cf_env map is missing')
    assert.match(map[0], /\(\?:\[\^\.\]\+-\)\?/, 'the map does not allow a suffixed subdomain')
  })
})

describe('robots.txt', () => {
  it('is exactly what the design system generates', () => {
    // Compared with its trailing newline intact: robots.txt is a line-oriented format and a
    // parser that reads the last line only when it is terminated is a parser that silently loses
    // the Sitemap directive.
    assert.equal(
      servedBody('/robots.txt'),
      robotsTxt({ indexable: true, sitemapUrl: '$scheme://$host/sitemap.xml' }),
    )
  })

  it('points at the sitemap with an absolute address, composed rather than typed', () => {
    // A relative `Sitemap:` line is invalid per the standard and is ignored; a literal one bakes in
    // a hostname. `$scheme://$host` is the only form that is both valid and environment-free.
    assert.match(servedBody('/robots.txt'), /^Sitemap: \$scheme:\/\/\$host\/sitemap\.xml$/m)
  })

  it('is no longer a static file, because an exact-match location would have shadowed it', () => {
    /*
     * `public/robots.txt` was deleted rather than left in place. `location = /robots.txt` wins over
     * the `location /` prefix that serves the static tree, so the file would have been deployed,
     * unreachable, and edited by the next reader to no effect — which is the worst of the three
     * states, worse than either serving it or not having it.
     */
    let present = true
    try {
      readFileSync(new URL('../public/robots.txt', import.meta.url))
    } catch {
      present = false
    }
    assert.equal(present, false, 'public/robots.txt is back, and nginx will never serve it')
  })
})
