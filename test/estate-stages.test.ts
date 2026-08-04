/**
 * Every stage this site publishes, recomputed from the estate that owns it.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * THIS TEST OPENS SIBLING REPOSITORIES. IT DOES NOT SKIP WHEN THEY ARE ABSENT.
 *
 * Same rule, and the same reason, as `./estate-claims.test.ts`: a check that turns itself off when
 * its inputs are missing produces the same green tick as one that ran. If `micro-deploy` and
 * `micro-beacon` are not checked out, this FAILS and says what to check out.
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * ── Why this file had to exist ────────────────────────────────────────────────────────────────
 *
 * The stage was a hand-typed string with a hand-typed sentence beside it, and it went stale in the
 * direction nobody audits. Six of seven surfaces published "Being built" while every one of them
 * was declared in the estate's compose file, running healthy, and driven by `beacon smoke` in real
 * Chromium through the real gateway. One note said the application a creator would use was "not
 * yet rebuilt" while `mint-web` was up and answering; the products index said a developer platform
 * "is not built" while `devplatform` and `devportal-web` were both running.
 *
 * Not one of those was a lie anybody told. They were true sentences left up, which is the same
 * failure as the numbers register before `./estate-claims.test.ts` opened the files it cited — and
 * it is worse in one respect, because a claim that UNDERSTATES is never investigated. Nobody goes
 * looking for evidence that a thing exists after being told it does not.
 *
 * ── What a stage means here, operationally ────────────────────────────────────────────────────
 *
 *   `running`   every container in `RUNS_ON[key]` is a declared service in the estate's compose
 *               file, AND the surface key is one the smoke tier drives.
 *   `tested`    neither of the above. The code passes its own tests somewhere else; nothing here
 *               runs it where a person could reach it.
 *   `open`      the surface has a hostname in `PUBLIC_AT` and that name is published by the
 *               estate's own mainnet Cloudflare Tunnel configuration.
 *
 * Both halves of `running` are required and neither is sufficient. A service in a compose file
 * proves something was meant to run; only the smoke tier proves a person could have opened it, and
 * it is the tier that can prove it because it intercepts nothing and fails structurally if a
 * request intercept ever appears in its own source.
 *
 * ── `open` WAS ASSERTED EMPTY UNTIL 2026-08-05, AND IS NOW DERIVED ────────────────────────────
 *
 * What stood here read: "there is an address on the public internet. There is not one, so this is
 * asserted EMPTY — and that assertion is the single most load-bearing line in this file."
 *
 * On 2026-08-05 the estate went public and that assertion started failing, correctly, naming all
 * seven surfaces. It was not relaxed; it was INVERTED, and the inversion is checked in both
 * directions:
 *
 *   * a surface published as `open` with no hostname in the tunnel configuration fails, which is
 *     the overstatement direction and the one a marketing page drifts in;
 *   * a surface WITH a public hostname still published as `running` also fails, which is the
 *     understatement direction — the one that is never investigated, because nobody goes looking
 *     for evidence that a thing exists after being told it does not. That is the exact failure
 *     recorded at the top of this file, and it would have recurred today without this half.
 *
 * The tunnel configuration is the right source because it is CAUSAL: that file is what makes the
 * address exist, so it cannot agree with a surface that is not really published. It is still not
 * sufficient on its own — a name can be configured and have no DNS record, which is true right now
 * of `worlds-api.cloudsforge.online` — so `test/public-endpoints.test.ts` fetches each one.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { PRODUCT_PAGES } from '../src/content/products.ts'
import { BUILD } from '../src/content/pages.ts'
import {
  PUBLIC_AT,
  RUNS_ON,
  SELF_CUSTODY_REPOS,
  STAGE_GLYPH,
  STAGE_LABEL,
  STAGE_MEANING,
  STAGE_ORDER,
  type Stage,
} from '../src/content/stages.ts'

/** The working tree the sibling repositories sit in: `micro-site/..`. */
const ESTATE = fileURLToPath(new URL('../..', import.meta.url))

const COMPOSE = `${ESTATE}deploy/compose/docker-compose.estate.yml`
const SMOKE = `${ESTATE}beacon/src/browser/smoke.ts`
/** The file that actually causes the public addresses to exist. */
const TUNNEL = `${ESTATE}deploy/cloudflared/config.mainnet.public.yml`
/** Its testnet twin, read only to prove none of ITS names is published. */
const TUNNEL_TESTNET = `${ESTATE}deploy/cloudflared/config.testnet.public.yml`

const REQUIRED: ReadonlyArray<{ file: string; repo: string; dir: string }> = [
  { file: COMPOSE, repo: 'micro-deploy', dir: 'deploy' },
  { file: SMOKE, repo: 'micro-beacon', dir: 'beacon' },
  { file: TUNNEL, repo: 'micro-deploy', dir: 'deploy' },
  { file: TUNNEL_TESTNET, repo: 'micro-deploy', dir: 'deploy' },
]

/* ─────────────────────────── reading the estate ─────────────────────────── */

/**
 * Every service declared in the estate's compose file.
 *
 * Parsed from the `services:` block only, and by indentation. Reading the whole file for a
 * `name:`-shaped token would match volume names, network names, the `x-` anchors at the top and
 * every service NAMED INSIDE A COMMENT — and this file's comments name services constantly, which
 * is exactly the shape of guard this estate keeps discovering is green for the wrong reason.
 */
export function composeServices(text: string): Set<string> {
  const out = new Set<string>()
  let inServices = false
  for (const raw of text.split('\n')) {
    if (/^services:\s*$/.test(raw)) {
      inServices = true
      continue
    }
    if (inServices && /^[^\s#]/.test(raw)) break // a new top-level key ends the block
    if (!inServices) continue
    const match = /^ {2}([a-z0-9][a-z0-9_-]*):\s*(#.*)?$/.exec(raw)
    if (match?.[1]) out.add(match[1])
  }
  return out
}

/**
 * The surface keys the smoke tier drives.
 *
 * Read from the `SMOKE_SURFACES` declaration and not from the whole file, for the reason the
 * `products` derivation in `./estate-claims.test.ts` records at length: a count or a list taken
 * over a file somebody else is editing has to say WHERE it is looking, or it silently absorbs the
 * next thing that happens to match.
 */
export function smokeSurfaces(text: string): Set<string> {
  const start = text.indexOf('export const SMOKE_SURFACES')
  assert.notEqual(start, -1, 'beacon no longer exports SMOKE_SURFACES')
  const end = text.indexOf('export function surfaceUrl', start)
  assert.notEqual(end, -1, 'the SMOKE_SURFACES declaration is no longer followed by surfaceUrl')
  return new Set([...text.slice(start, end).matchAll(/key: '([^']+)'/g)].map((m) => m[1] as string))
}

/**
 * Every hostname the estate's tunnel publishes.
 *
 * Read as `hostname:` entries under `ingress:`. A `hostname` key is only meaningful there, and
 * matching the token anywhere in the file would pick it up out of the comments — this file's
 * comments discuss hostnames at length, which is the same hazard `composeServices` guards against.
 *
 * The catch-all rule at the end of a cloudflared config has no `hostname` and so contributes
 * nothing, which is correct: it is what answers 404 for everything not named above it.
 */
export function tunnelHostnames(text: string): Set<string> {
  const out = new Set<string>()
  let inIngress = false
  for (const raw of text.split('\n')) {
    if (/^ingress:\s*$/.test(raw)) {
      inIngress = true
      continue
    }
    if (inIngress && /^[^\s#]/.test(raw)) break
    if (!inIngress) continue
    const match = /^\s*-?\s*hostname:\s*([A-Za-z0-9.-]+)\s*(#.*)?$/.exec(raw)
    if (match?.[1]) out.add(match[1])
  }
  return out
}

/**
 * The stage the estate supports for a surface. Pure, so the self-tests below can drive it.
 *
 * `open` is checked FIRST and independently of the other two. A surface answering on the public
 * internet is open whether or not this site's compose list happens to name every container behind
 * it — the reader's experience is the address, and a bookkeeping gap here must not be able to
 * publish a quieter status than the truth.
 */
export function stageFor(
  key: string,
  needs: readonly string[],
  services: ReadonlySet<string>,
  walked: ReadonlySet<string>,
  published: ReadonlySet<string>,
): Stage {
  if (published.has(key)) return 'open'
  const deployed = needs.every((service) => services.has(service))
  return deployed && walked.has(key) ? 'running' : 'tested'
}

/* ───────────────────────────────── the checks ──────────────────────────────── */

describe('the estate is present for the stage check', () => {
  it('has every sibling repository the stages are derived from', () => {
    const missing = REQUIRED.filter(({ file }) => !existsSync(file))
    assert.deepEqual(
      missing.map((m) => m.dir),
      [],
      'this check reads the estate and will not skip without it. Check out ' +
        missing.map((m) => `cloudsforge-online/${m.repo} into ../${m.dir}`).join(', ') +
        '. In CI this is done by .github/workflows/ci.yml.',
    )
  })
})

describe('the readers themselves', () => {
  /**
   * Prove each reader can fail before trusting either against the real estate.
   *
   * Without this, `composeServices` returning an empty set would make every surface `tested`, and
   * `smokeSurfaces` returning everything would make every surface `running` — and in both cases
   * the suite would be perfectly green while measuring nothing.
   */
  it('parses services out of a services block and not out of anything else', () => {
    const services = composeServices(
      [
        'x-common: &common',
        '  image: nope',
        'volumes:',
        '  pgdata:',
        'services:',
        '  # a comment naming market-web and hub-api, which are not declarations',
        '  postgres:',
        '    image: postgres:17',
        '  mint-web:',
        '    build: .',
        '    environment:',
        '      not-a-service: 1',
        'networks:',
        '  estate:',
      ].join('\n'),
    )
    assert.deepEqual([...services].sort(), ['mint-web', 'postgres'])
  })

  it('reads only the SMOKE_SURFACES declaration', () => {
    const keys = smokeSurfaces(
      [
        "const DECOY = [{ key: 'not-a-surface' }]",
        'export const SMOKE_SURFACES: readonly SmokeSurface[] = [',
        "  { key: 'hub', subdomain: 'hub' },",
        "  { key: 'market', subdomain: 'market' },",
        ']',
        'export function surfaceUrl() {}',
        "const AFTER = [{ key: 'also-not-a-surface' }]",
      ].join('\n'),
    )
    assert.deepEqual([...keys].sort(), ['hub', 'market'])
  })

  it('refuses to answer at all when the declaration is gone', () => {
    // A reader that returns an empty set for a file it did not understand is the defect. It must
    // throw, so a rename in `micro-beacon` fails this build rather than quietly demoting the site.
    assert.throws(() => smokeSurfaces('nothing here'), /no longer exports SMOKE_SURFACES/)
  })

  it('requires BOTH deployment and a browser before it will say running', () => {
    const both = new Set(['a-web'])
    const none = new Set<string>()
    assert.equal(stageFor('a', ['a-web'], both, new Set(['a']), none), 'running')
    assert.equal(stageFor('a', ['a-web'], both, new Set(), none), 'tested', 'deployed but not opened')
    assert.equal(stageFor('a', ['a-web'], new Set(), new Set(['a']), none), 'tested', 'walked, absent')
    // And every named container, not just one of them.
    assert.equal(stageFor('a', ['a-web', 'a-api'], both, new Set(['a']), none), 'tested')
  })

  it('says open only when the surface is published, and regardless of the rest', () => {
    const published = new Set(['a'])
    assert.equal(stageFor('a', ['a-web'], new Set(['a-web']), new Set(['a']), published), 'open')
    // Publication outranks the other two: a public address is a public address.
    assert.equal(stageFor('a', ['a-web'], new Set(), new Set(), published), 'open')
    // And nothing else can produce `open`.
    assert.equal(stageFor('a', ['a-web'], new Set(['a-web']), new Set(['a']), new Set()), 'running')
  })

  it('reads hostnames out of the ingress block and not out of anything else', () => {
    const names = tunnelHostnames(
      [
        'tunnel: abc',
        'credentials-file: /etc/x.json',
        '# a comment naming hostname: not-real.cloudsforge.online',
        'ingress:',
        '  - hostname: hub.cloudsforge.online',
        '    service: https://127.0.0.1:443',
        '    originRequest:',
        '      noTLSVerify: true',
        '  - hostname: market.cloudsforge.online',
        '    service: https://127.0.0.1:443',
        '  # the catch-all, which has no hostname and must contribute nothing',
        '  - service: http_status:404',
        'warp-routing:',
        '  enabled: false',
      ].join('\n'),
    )
    assert.deepEqual([...names].sort(), ['hub.cloudsforge.online', 'market.cloudsforge.online'])
  })

  it('finds nothing when there is no ingress block, rather than scraping the file', () => {
    // The failure this pins: a reader that matched `hostname:` anywhere would return the name in
    // the comment above, and a surface would be published as open on the strength of a comment.
    assert.deepEqual([...tunnelHostnames('# hostname: fake.cloudsforge.online\nother: 1')], [])
  })
})

describe('the stage of every surface, recomputed', () => {
  const services = composeServices(readFileSync(COMPOSE, 'utf8'))
  const walked = smokeSurfaces(readFileSync(SMOKE, 'utf8'))
  const tunnel = tunnelHostnames(readFileSync(TUNNEL, 'utf8'))
  /** Surface keys whose published hostname the estate really serves. */
  const published = new Set(
    Object.entries(PUBLIC_AT)
      .filter(([, host]) => tunnel.has(host))
      .map(([key]) => key),
  )

  it('found a real estate, so nothing below is comparing two empty sets', () => {
    assert.ok(services.size >= 40, `the compose file declared ${services.size} services`)
    assert.ok(walked.size >= 10, `the smoke tier drives ${walked.size} surfaces`)
    assert.ok(tunnel.size >= 15, `the mainnet tunnel publishes ${tunnel.size} hostnames`)
  })

  it('publishes no hostname the estate does not actually serve', () => {
    // The overstatement direction. A name typed into PUBLIC_AT that the tunnel never routes would
    // put "Open to the public" on a page pointing at nothing.
    const unrouted = Object.entries(PUBLIC_AT)
      .filter(([, host]) => !tunnel.has(host))
      .map(([key, host]) => `${key} claims ${host}, which the mainnet tunnel does not publish`)
    assert.deepEqual(unrouted, [])
  })

  it('never publishes a testnet hostname, which would fail at Cloudflare before reaching us', () => {
    // Universal SSL covers the single-label wildcard only, so `hub.testnet.cloudsforge.online`
    // fails the TLS handshake at the edge. Configured is not reachable, and this is the one place
    // that distinction can be enforced rather than remembered.
    const testnet = tunnelHostnames(readFileSync(TUNNEL_TESTNET, 'utf8'))
    const leaked = Object.entries(PUBLIC_AT)
      .filter(([, host]) => testnet.has(host) || /\.testnet\./.test(host))
      .map(([key, host]) => `${key} publishes ${host}, which is a testnet name`)
    assert.deepEqual(leaked, [])
  })

  it('names, for every page, the containers it depends on', () => {
    // Both directions. A page with no entry would be unverifiable; an entry with no page is a
    // licence lying around for whatever is next given that key.
    assert.deepEqual(
      PRODUCT_PAGES.map((p) => p.key).sort(),
      Object.keys(RUNS_ON).sort(),
    )
  })

  it('agrees with the estate about every one of them', () => {
    const disagreements = PRODUCT_PAGES.flatMap((page) => {
      const needs = RUNS_ON[page.key] ?? []
      const actual = stageFor(page.key, needs, services, walked, published)
      if (actual === page.stage) return []
      const absent = needs.filter((s) => !services.has(s))
      return [
        `${page.slug} is published as ${JSON.stringify(page.stage)} but the estate gives ` +
          `${JSON.stringify(actual)} — ` +
          (absent.length > 0 ? `not declared in compose: ${absent.join(', ')}. ` : '') +
          (walked.has(page.key) ? '' : 'the smoke tier does not drive this surface. ') +
          (published.has(page.key) ? 'it HAS a public address. ' : 'it has no public address. '),
      ]
    })
    assert.deepEqual(disagreements, [])
  })

  it('calls a surface open when, and only when, it has a public address', () => {
    // Both directions in one assertion, which is the point. Until 2026-08-05 this file asserted
    // that NOTHING was open; when the estate went public that assertion failed naming all seven
    // surfaces, and it was inverted rather than relaxed.
    //
    // The second direction is the one worth the trouble: a surface that is publicly reachable and
    // still published as "Running in-house" understates, and an understatement is never
    // investigated — which is the exact failure recorded at the top of this file.
    const openPages = PRODUCT_PAGES.filter((p) => p.stage === 'open').map((p) => p.key).sort()
    const reachable = [...published].sort()
    assert.deepEqual(
      openPages,
      reachable,
      'the set of surfaces published as open disagrees with the set the estate actually serves.',
    )
  })
})

describe('the self-custody wallets, whose stage is recorded rather than derived', () => {
  const services = composeServices(readFileSync(COMPOSE, 'utf8'))
  const walked = smokeSurfaces(readFileSync(SMOKE, 'utf8'))

  it('cannot be running, and that floor is derived even though the stage is not', () => {
    // The positive half — that each builds and its suite passes — lives in another repository's
    // pipeline and this site has no business asserting a green tick it did not watch. The NEGATIVE
    // half is checkable here and is the direction the risk points: overstatement.
    for (const repo of SELF_CUSTODY_REPOS) {
      assert.ok(!services.has(repo), `${repo} is now a service in the estate; its stage is stale`)
      assert.ok(!walked.has(repo), `${repo} is now driven by the smoke tier; its stage is stale`)
    }
  })

  it('does not confuse them with the custodial wallet service, which IS deployed', () => {
    // `wallet` is the custodial service and it is a container in the estate. The two make opposite
    // promises about who holds the keys, so this is the naming collision it would be most
    // expensive to get wrong on a marketing page.
    assert.ok(services.has('wallet'), 'the custodial wallet service is no longer deployed')
    assert.ok(!SELF_CUSTODY_REPOS.includes('wallet'))
  })

  it('says on the page that it is recorded, and by whom', () => {
    // A recorded claim whose recorder exists only in a source comment is a recorded claim the
    // reader was given no way to weigh. Asserted by meaning, so removing the word does not pass.
    assert.match(BUILD.wallets.recordedBy, /recorded/i)
    assert.match(BUILD.wallets.recordedBy, /cannot be|not.*derived/i)
    assert.ok(BUILD.wallets.recordedBy.length > 120, 'the recorder note is a stub')
  })
})

describe('the vocabulary', () => {
  it('gives every stage a label, a glyph and a meaning, and orders all of them', () => {
    const stages = Object.keys(STAGE_LABEL) as Stage[]
    assert.deepEqual([...STAGE_ORDER].sort(), [...stages].sort())
    for (const stage of stages) {
      assert.ok(STAGE_GLYPH[stage], `${stage} has no glyph`)
      assert.ok(STAGE_MEANING[stage].length > 60, `${stage}'s meaning is a stub`)
      // The meaning must not merely restate the label, which is the field somebody fills in to
      // make the type happy.
      assert.notEqual(STAGE_MEANING[stage].trim(), STAGE_LABEL[stage])
    }
  })

  it('keeps the glyphs distinct, because colour is never the only channel', () => {
    const glyphs = Object.values(STAGE_GLYPH)
    assert.equal(new Set(glyphs).size, glyphs.length, 'two stages share a glyph')
  })

  it('never labels a stage with a bare past participle', () => {
    // "Built" alone is read as "live, and I may sign up", which is the misreading this whole
    // vocabulary exists to prevent. Every label has to say where the thing IS.
    for (const [stage, label] of Object.entries(STAGE_LABEL)) {
      assert.ok(!/^(Built|Done|Complete|Finished|Shipped|Live)$/i.test(label), `${stage}: ${label}`)
    }
  })
})
