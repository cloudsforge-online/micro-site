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
 *   `open`      the surface is listed in `PUBLIC_SURFACES` and the hostname derived for it is
 *               published by the estate's own mainnet Cloudflare Tunnel configuration.
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
 * of the estate's own `worlds-api` name — so `test/public-endpoints.test.ts` fetches each one.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { PRODUCT_PAGES } from '../src/content/products.ts'
import { BUILD } from '../src/content/pages.ts'
import { ENV_LABELS, SURFACES, splitEnvLabel, surface, type SurfaceKey } from '@cloudsforge/ui'
import {
  PLANNED_SURFACES,
  PUBLIC_SURFACES,
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

/**
 * The estate's own route check, read for one declaration: which surfaces are DELIBERATELY not
 * served. See the planned-surfaces suite for why a name in the tunnel stopped being proof.
 */
const ROUTE_CHECK = `${ESTATE}deploy/scripts/surface-routes.py`
/** The deployment configuration, as a directory: every file that can set a variable. */
const COMPOSE_DIR = `${ESTATE}deploy/compose`
/** Where the trading service decides whether it is allowed to spend money. */
const TRADE_ENV = `${ESTATE}trade/src/env.ts`
/**
 * The exchange's contracts, and the suite that runs them.
 *
 * The Forge Exchange page says the pool contracts are already written and already driven through
 * Hearth's own virtual machine. That is the one claim on a page about a plan that is a claim about
 * code, so it is read from the code — see the evidence suite at the bottom of this file.
 */
const AMM_DIR = `${ESTATE}hearth/contracts/src`
const AMM_SUITE = `${ESTATE}hearth/node/test/dex.js`

const REQUIRED: ReadonlyArray<{ file: string; repo: string; dir: string }> = [
  { file: COMPOSE, repo: 'micro-deploy', dir: 'deploy' },
  { file: SMOKE, repo: 'micro-beacon', dir: 'beacon' },
  { file: TUNNEL, repo: 'micro-deploy', dir: 'deploy' },
  { file: TUNNEL_TESTNET, repo: 'micro-deploy', dir: 'deploy' },
  { file: ROUTE_CHECK, repo: 'micro-deploy', dir: 'deploy' },
  // Read by the incompleteness suite at the bottom of this file, and listed here for the same
  // reason as the rest: a marker saying a product does not work yet is a claim about the running
  // estate, and a claim about the running estate that cannot open a file must fail, not skip.
  { file: TRADE_ENV, repo: 'micro-trade', dir: 'trade' },
  // `hearth`, not `micro-hearth`: the chain predates the micro- estate and kept its name.
  { file: AMM_SUITE, repo: 'hearth', dir: 'hearth' },
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
 * The surfaces the estate declares it deliberately does not route.
 *
 * Read from the `EXPECTED_UNROUTED` declaration alone, for the reason every reader above records:
 * that script's prose names surfaces constantly — `account`, `worlds-api`, `foresight-admin` and
 * `explorer` all appear in its docstring — so a scan of the file would return a set assembled out
 * of an argument rather than out of a declaration.
 *
 * The keys only. The reason strings are that repository's to maintain and this one has no business
 * asserting their wording.
 */
export function expectedUnrouted(text: string): Set<string> {
  const start = text.indexOf('EXPECTED_UNROUTED = {')
  assert.notEqual(start, -1, 'micro-deploy no longer declares EXPECTED_UNROUTED')
  const end = text.indexOf('\n}', start)
  assert.notEqual(end, -1, 'the EXPECTED_UNROUTED declaration is not closed')
  // Key-and-value lines only: a comment inside that dict is prose, and one of them is exactly the
  // string `# (no entry needed: the check resolves by SUBDOMAIN, not by key)`.
  return new Set(
    [...text.slice(start, end).matchAll(/^\s*"([a-z][a-z0-9-]*)":\s*"/gm)].map((m) => m[1] as string),
  )
}

/**
 * The apex the estate publishes on, read out of its own tunnel configuration.
 *
 * Derived as the shortest name present, rather than written down. Every other hostname in that
 * file is a subdomain of it, so the apex is the one with the fewest labels — and deriving it is
 * what keeps the literal string out of this repository, which is the rule `PUBLIC_SURFACES`
 * exists to respect. A hard-coded apex here would reintroduce exactly the second copy that CI
 * rejected the first draft of this change for.
 *
 * ── The premise is now ASSERTED, because it stopped being true of every file in the estate ────
 *
 * "Every other hostname is a subdomain of the shortest one" holds of the mainnet configuration and
 * used to hold of the testnet one, back when testnet was an apex prefix and its names really did
 * sit under `testnet.<apex>`. Since testnet became a suffix on the subdomain the two environments
 * SHARE an apex: the testnet file's shortest name is the bare environment label, and every other
 * name in it is that name's SIBLING rather than its child. Deriving an apex from that file would
 * now return a wrong answer and say nothing, so the premise is checked instead of assumed.
 */
export function apexOf(hostnames: ReadonlySet<string>): string {
  const sorted = [...hostnames].sort((a, b) => a.split('.').length - b.split('.').length)
  const apex = sorted[0]
  assert.ok(apex !== undefined, 'the tunnel configuration publishes no hostname at all')
  assert.deepEqual(
    sorted.filter((host) => host !== apex && !host.endsWith(`.${apex}`)),
    [],
    `these hostnames are not under the derived apex ${apex}, so it is not an apex`,
  )
  return apex
}

/**
 * Where a surface answers publicly ON MAINNET: its registry subdomain, under the estate's apex.
 *
 * The environment is the empty one, and since both environments share an apex that is now a
 * property of the FIRST LABEL rather than of the apex — `hub.<apex>` is mainnet precisely because
 * its first label carries no environment suffix. `namesAnEnvironment` below is the inverse test,
 * and is what stops a name composed here from being a testnet one.
 */
export function hostFor(key: string, apex: string): string {
  const sub = surface(key as SurfaceKey).subdomain
  return sub === '' ? apex : `${sub}.${apex}`
}

/**
 * True when a hostname names a NON-PRODUCTION ENVIRONMENT, in either shape.
 *
 * ── This replaced `/\.testnet\./`, which by then could not fail ───────────────────────────────
 *
 * Until 2026-08-05 testnet was an apex PREFIX (`hub.testnet.<apex>`) and that regex matched it.
 * The environment then moved to a SUFFIX on the subdomain (`hub-testnet.<apex>`), because
 * Cloudflare's Universal SSL is a single-label wildcard and the two-label shape failed the TLS
 * handshake at the edge — configured and unreachable. After that move NO HOSTNAME THIS ESTATE
 * COMPOSES CAN MATCH `/\.testnet\./`, so the check below was green because it was measuring
 * nothing. That is the same defect as a check that skips, and it is the one this repository keeps
 * finding.
 *
 * Both shapes are recognised. The old one still resolves on purpose — `cloudsforgeHosts()` keeps
 * its `KNOWN_SUBS` branch so a bundle is correct on an old hostname — and a name in the old shape
 * would be exactly as wrong on a marketing page as a name in the new one.
 *
 * The environment words are NOT listed here. `ENV_LABELS` and `splitEnvLabel` come from the
 * surface registry, which is the same source `cloudsforgeHosts()` resolves with and the same one
 * `deploy/scripts/check-apex-prefix.py` reads. A local list of environment names would be the
 * second, unversioned copy that this whole file exists to refuse.
 */
export function namesAnEnvironment(host: string): boolean {
  const [first = '', ...rest] = host.split('.')
  // The new shape: an environment suffix on the first label, or the bare label for the apex
  // surface — which is this site, whose subdomain is the empty string.
  if (splitEnvLabel(first) !== null) return true
  // The old shape: the environment was a label of the apex.
  return rest.some((label) => ENV_LABELS.has(label))
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
  // A page that names NO containers names a plan, and an empty dependency list must never read as
  // "everything it needs is deployed" — which is what `every` over an empty list would say, and
  // it would grade an unstarted product `tested` by vacuous truth. The both-directions guard for
  // this branch is the PLANNED_SURFACES suite below: planned pages and empty-needs pages must be
  // the same set, and nothing in that set may appear in compose, the smoke tier or either tunnel.
  if (needs.length === 0) return 'planned'
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

  it('reads the unrouted declaration and not the argument around it', () => {
    const keys = expectedUnrouted(
      [
        '"""Every surface must have a router. account and exchange are discussed here.',
        'BEFORE = {"decoy": "not the declaration"}',
        'EXPECTED_UNROUTED = {',
        '    # a comment naming "hub": which is prose, not an entry',
        '    "account": "no repository serves it",',
        '    "exchange": "planned, and nothing serves it",',
        '    # (no entry needed: the check resolves by SUBDOMAIN, not by key)',
        '}',
        'AFTER = {"also-decoy": "still not the declaration"}',
      ].join('\n'),
    )
    assert.deepEqual([...keys].sort(), ['account', 'exchange'])
  })

  it('refuses to answer when that declaration is gone, rather than exempting nothing', () => {
    // An empty set here would silently re-arm the tunnel probe against a name the estate says
    // nothing is behind — a red build for a correct estate, which gets fixed by deleting a check.
    assert.throws(() => expectedUnrouted('nothing here'), /no longer declares EXPECTED_UNROUTED/)
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

  it('derives the apex as the name every other one sits under', () => {
    assert.equal(apexOf(new Set(['hub.example.com', 'example.com', 'a.b.example.com'])), 'example.com')
  })

  it('refuses a set whose shortest name is not an apex of the rest', () => {
    // The shape the testnet tunnel now has: the shortest name is the environment's own apex
    // surface and every other name is its sibling, not its child. Deriving an apex from that would
    // compose `hub.testnet.example.com` for every surface — names nothing serves — and would say
    // nothing about it.
    assert.throws(
      () => apexOf(new Set(['testnet.example.com', 'hub-testnet.example.com'])),
      /not under the derived apex/,
    )
  })

  it('reads an environment out of a hostname in both shapes', () => {
    // The new shape: a suffix on the first label, including the bare label the apex surface takes.
    assert.equal(namesAnEnvironment('hub-testnet.cloudsforge.online'), true)
    assert.equal(namesAnEnvironment('testnet.cloudsforge.online'), true)
    // ── AND THE NON-TESTNET LABEL IS SPELT ON A SUBDOMAIN THAT IS NOT MOVING ──────────────────
    //
    // This read `market-staging.…` and went red the day Forge Market became `<apex>/market`,
    // for precisely the reason the paragraph below records for `worlds-api-testnet`: the check
    // splits the environment off the first label and then asks whether the HEAD is a known
    // registry subdomain. `market` is not one any more — its row carries `subdomain: ''` and
    // `basePath: '/market'` — so the name is left alone as its own apex, correctly, and
    // asserting `true` here asserted that a hostname the estate no longer serves still names an
    // environment.
    //
    // `admin` replaces it rather than `create` or `pool`, and the choice is the point.
    // `docs/apex-consolidation.md` moves fourteen surfaces onto the apex and keeps seven groups
    // on subdomains for reasons it calls non-negotiable; `admin` is in the second set. Any
    // product surface picked here would fail this test again on the wave that moves it, one
    // repository away from the change that caused it, which is how a green suite teaches nobody
    // anything. The rule under test is `<known-subdomain>-<env>`, so the fixture should name a
    // subdomain that stays one.
    assert.equal(namesAnEnvironment('admin-staging.cloudsforge.online'), true)
    // ── THE HYPHENATED CASE IS INVERTED, AND micro-ui INVERTED ITS OWN FOR THE SAME REASON ────
    //
    // This line used to assert `namesAnEnvironment('worlds-api-testnet.…') === true` — the one
    // live case for splitting the environment off the LAST hyphen rather than the first. That
    // surface was retired when the game API was folded into `api.` (see the `api` row's comment
    // in the registry, which records the hostname measured dead on 2026-08-05). `worlds-api` is
    // therefore no longer a known subdomain, the HEAD check in `splitEnvLabel` fails, and the
    // name is left alone as its own apex — correctly. Asserting `true` there asserted that a
    // retired surface still existed, which is how a dead name keeps looking alive.
    //
    // The rule is unchanged and still `lastIndexOf`; it simply has no case left to exercise. So
    // the fact that MAKES it unexercisable is pinned instead, derived from the registry rather
    // than typed here. The day anyone adds a hyphenated subdomain this fails and says so, which
    // is the only moment the last-hyphen case can be written against something real.
    assert.deepEqual(
      SURFACES.filter((s) => s.subdomain.includes('-')).map((s) => s.key),
      [],
      'a registry subdomain now contains a hyphen — restore the last-hyphen assertion beside this.',
    )
    // And the retired name reads as no environment at all, which is the same refusal-to-guess
    // that stops `marketing-testnet.cloudsforge.online` — a name this estate does not own — from
    // resolving every sibling link on it into this estate.
    assert.equal(namesAnEnvironment('worlds-api-testnet.cloudsforge.online'), false)
    assert.equal(namesAnEnvironment('marketing-testnet.cloudsforge.online'), false)
    // The old two-label shape, which still resolves and would be just as wrong on this page.
    assert.equal(namesAnEnvironment('hub.testnet.cloudsforge.online'), true)
    // And mainnet, including the three names most easily mistaken for an environment: the apex
    // itself, a hyphenated subdomain, and a subdomain that merely contains no hyphen at all.
    assert.equal(namesAnEnvironment('cloudsforge.online'), false)
    assert.equal(namesAnEnvironment('worlds-api.cloudsforge.online'), false)
    assert.equal(namesAnEnvironment('hub.cloudsforge.online'), false)
    assert.equal(namesAnEnvironment('developers.cloudsforge.online'), false)
  })
})

describe('the stage of every surface, recomputed', () => {
  const services = composeServices(readFileSync(COMPOSE, 'utf8'))
  const walked = smokeSurfaces(readFileSync(SMOKE, 'utf8'))
  const tunnel = tunnelHostnames(readFileSync(TUNNEL, 'utf8'))
  const apex = apexOf(tunnel)
  /** Surface keys whose published hostname the estate really serves. */
  const published = new Set(PUBLIC_SURFACES.filter((key) => tunnel.has(hostFor(key, apex))))

  it('found a real estate, so nothing below is comparing two empty sets', () => {
    assert.ok(services.size >= 40, `the compose file declared ${services.size} services`)
    assert.ok(walked.size >= 10, `the smoke tier drives ${walked.size} surfaces`)
    assert.ok(tunnel.size >= 15, `the mainnet tunnel publishes ${tunnel.size} hostnames`)
  })

  it('publishes no hostname the estate does not actually serve', () => {
    // The overstatement direction. A name typed into PUBLIC_AT that the tunnel never routes would
    // put "Open to the public" on a page pointing at nothing.
    const unrouted = PUBLIC_SURFACES.filter((key) => !tunnel.has(hostFor(key, apex))).map(
      (key) => `${key} claims ${hostFor(key, apex)}, which the mainnet tunnel does not publish`,
    )
    assert.deepEqual(unrouted, [])
  })

  it('never publishes a hostname belonging to another environment', () => {
    // Both environments now share an apex and testnet's names ANSWER, so the network tier can no
    // longer catch this by failing to connect — see the note in `test/public-endpoints.test.ts`.
    // This is the only place the distinction survives.
    //
    // Two ways of catching it, and neither subsumes the other. The first compares against the
    // testnet tunnel's own ingress list, which is causal: it catches a name this estate really
    // does serve on testnet. The second reads the environment out of the name itself, which
    // catches one that is in no tunnel file at all — a staging name, or a testnet name added here
    // before it was added there.
    const testnet = tunnelHostnames(readFileSync(TUNNEL_TESTNET, 'utf8'))
    const leaked = PUBLIC_SURFACES.filter(
      (key) => testnet.has(hostFor(key, apex)) || namesAnEnvironment(hostFor(key, apex)),
    ).map((key) => `${key} publishes ${hostFor(key, apex)}, which is not a mainnet name`)
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

describe('the planned surfaces, whose chip must fail the moment anything runs', () => {
  const services = composeServices(readFileSync(COMPOSE, 'utf8'))
  const walked = smokeSurfaces(readFileSync(SMOKE, 'utf8'))
  const tunnel = tunnelHostnames(readFileSync(TUNNEL, 'utf8'))
  const testnetTunnel = tunnelHostnames(readFileSync(TUNNEL_TESTNET, 'utf8'))
  const apex = apexOf(tunnel)

  it('publishes planned on exactly the pages that name no containers', () => {
    // Three sets, one identity. The pages wearing the chip, the pages with an empty RUNS_ON
    // entry, and PLANNED_SURFACES have to agree, or one of them is a claim nobody derived.
    const wearing = PRODUCT_PAGES.filter((p) => p.stage === 'planned').map((p) => p.key).sort()
    const empty = Object.entries(RUNS_ON)
      .filter(([, needs]) => needs.length === 0)
      .map(([key]) => key)
      .sort()
    assert.deepEqual(wearing, [...PLANNED_SURFACES].sort())
    assert.deepEqual(empty, [...PLANNED_SURFACES].sort())
  })

  const unrouted = expectedUnrouted(readFileSync(ROUTE_CHECK, 'utf8'))

  it('finds no trace of a planned surface anywhere the estate runs things', () => {
    // The direction a marketing chip must fail: the day exchange is a compose service, a smoke
    // surface or a SERVED hostname, "Planned, not built" has quietly become an understatement of
    // a different kind — a live thing described as an idea — and the build refuses until the chip
    // is upgraded on the measurement.
    //
    // ── THE TUNNEL STOPPED PROVING A SURFACE IS SERVED, AND THIS IS THE REPAIR ────────────────
    //
    // Both ingress lists are GENERATED from the registry by `deploy/cloudflared/gen.py`: one
    // hostname per row, whether or not anything is behind it. So the day `exchange` became a
    // registry row, its name appeared in both files and this assertion failed — while nothing
    // whatsoever served it. A check that fails on a registry edit is measuring the registry, and
    // this suite exists to measure the ESTATE.
    //
    // The repair is not to drop the tunnel probe, which is still the thing that catches a name
    // quietly published. It is to read the estate's own answer to "is this deliberately not
    // served": `EXPECTED_UNROUTED` in `deploy/scripts/surface-routes.py`, where every entry is a
    // claim checked IN BOTH DIRECTIONS by that script — a surface listed as intentionally
    // routerless that has since gained a router fails micro-deploy's own CI, and the entry has to
    // be deleted in the same commit that adds the router. That deletion is what fails this.
    //
    // So the exemption cannot rot: it survives exactly as long as the estate keeps asserting that
    // nothing is behind the name, in the repository that would know.
    for (const key of PLANNED_SURFACES) {
      assert.ok(!services.has(key), `${key} is now a service in the estate; the chip is stale`)
      assert.ok(!walked.has(key), `${key} is now driven by the smoke tier; the chip is stale`)
      for (const [label, names] of [
        ['publicly routed', tunnel],
        ['routed on testnet', testnetTunnel],
      ] as const) {
        assert.ok(
          !names.has(hostFor(key, apex)) || unrouted.has(key),
          `${key} is now ${label} and the estate no longer lists it as deliberately unrouted; ` +
            'the chip is stale',
        )
      }
    }
  })

  it('is exempted by an estate that still says nothing is behind the name', () => {
    // The reader that grants the exemption above, proven able to fail. An `expectedUnrouted` that
    // returned everything — a rename, a reformat, a file that moved — would make the tunnel probe
    // vacuous and say nothing about it, which is the failure mode every reader in this file is
    // written against.
    assert.ok(unrouted.size > 0, 'the estate no longer records any surface as deliberately unrouted')
    assert.ok(!unrouted.has('hub'), 'the reader is matching things outside the declaration')
    for (const key of PLANNED_SURFACES) {
      assert.ok(
        unrouted.has(key),
        `${key} is published as planned, and micro-deploy does not record it as unrouted. ` +
          'Either something serves it now, or the entry was deleted without upgrading this chip.',
      )
    }
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

describe('the second status: open, and switched off', () => {
  /**
   * For each surface carrying the registry's `incomplete` marker: the switch that would clear it,
   * and the file where that switch's default is written.
   *
   * A marker with no entry here fails the first check below, and that is the whole design. "There
   * is nothing to do here" is a claim about the RUNNING estate — the same class of claim as a
   * stage chip — and this file has one rule for those: it opens the file rather than believing the
   * sentence. Without this table a marker is a copywriter's opinion, and the failure mode is not
   * that it is wrong today but that it stays up for a year after the switch is thrown, which is
   * precisely the direction recorded at the top of this file as the one nobody investigates.
   */
  const INCOMPLETE_EVIDENCE: Readonly<Record<string, { flag: string; source: string }>> = {
    trade: { flag: 'TRADE_LIVE_ENABLED', source: TRADE_ENV },
  }

  /** Every tracked file in the estate's compose directory that can set a variable. */
  const deploymentFiles = (): string[] => {
    const here = readdirSync(COMPOSE_DIR, { withFileTypes: true })
    const files = here
      .filter((e) => e.isFile() && (e.name.endsWith('.yml') || e.name.endsWith('.env')))
      .map((e) => `${COMPOSE_DIR}/${e.name}`)
    const env = readdirSync(`${COMPOSE_DIR}/env`, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.env'))
      .map((e) => `${COMPOSE_DIR}/env/${e.name}`)
    return [...files, ...env]
  }

  it('marks nothing it cannot produce the switch for', () => {
    const marked = SURFACES.filter((s) => s.incomplete !== undefined)
      .map((s) => s.key)
      .sort()
    assert.deepEqual(
      marked,
      Object.keys(INCOMPLETE_EVIDENCE).sort(),
      'a surface is published as incomplete with no switch named here, or a switch is named for a ' +
        'surface that no longer says so. Both are a marker nobody can check.',
    )
  })

  it('finds the switch in the service, defaulted off', () => {
    for (const [key, { flag, source }] of Object.entries(INCOMPLETE_EVIDENCE)) {
      const text = readFileSync(source, 'utf8')
      // The declaration, not a mention: the flag name immediately followed by the default. A bare
      // `text.includes(flag)` would match the long comment at the top of that same file, which
      // discusses this variable at length — the comment-matching hazard every reader above guards
      // against, and the one this estate keeps rediscovering.
      assert.match(
        text,
        new RegExp(`'${flag}',\\s*false`),
        `${key} is published as incomplete, but ${flag} is no longer declared with a false default ` +
          `in ${source}. Either the service changed and the marker is stale, or the flag was renamed.`,
      )
    }
  })

  it('fails the day the estate switches one on', () => {
    // The staleness direction, and the reason this suite is worth its length. The marker's sentence
    // is only true while nothing sets the flag; the moment a deployment does, the product works and
    // the site is still telling people it does not.
    //
    // ── WHAT THIS CAN AND CANNOT SEE ──────────────────────────────────────────────────────────
    //
    // Every TRACKED file in the compose directory, which is where the estate's variables are set
    // and reviewed. It cannot see `compose/estate/tokens.env`, which is untracked and lives only on
    // the app host — so an operator could in principle set the flag there without failing this.
    // That gap is narrow and deliberate: the alternative is a test that needs a host it cannot
    // reach and skips when it has not got one, which is the failure this whole file was written
    // against. The runtime half is already covered elsewhere — the service publishes its own
    // refusal in its capabilities response and `trade-web` renders that, not this sentence.
    const setters: string[] = []
    for (const { flag } of Object.values(INCOMPLETE_EVIDENCE)) {
      for (const file of deploymentFiles()) {
        if (readFileSync(file, 'utf8').includes(flag)) setters.push(`${flag} in ${file}`)
      }
    }
    assert.deepEqual(
      setters,
      [],
      'the estate now sets a switch that a surface is still published as missing. Clear the ' +
        '`incomplete` marker in the registry, or explain why the deployment names it.',
    )
  })

  it('never marks a surface a person cannot open', () => {
    // The marker means "you can open it and there is nothing to do". On a surface nobody can reach
    // it would be a second, quieter way of saying `planned` — and `content/stages.ts` argues at
    // length that two vocabularies for one fact is how a page ends up contradicting itself.
    for (const page of PRODUCT_PAGES) {
      if (surface(page.key).incomplete === undefined) continue
      assert.notEqual(
        page.stage,
        'planned',
        `${page.slug} is published as planned AND as incomplete; a plan has nothing to be short of`,
      )
    }
  })
})

describe("the plan's own evidence: written, and nowhere near deployed", () => {
  /*
   * ── THE ONE CLAIM ON A PLAN'S PAGE THAT IS A CLAIM ABOUT CODE ─────────────────────────────────
   *
   * The Forge Exchange page carries a section headed "The contracts are written; nothing is
   * deployed", and it is there because the first draft said the opposite — "none of it is built,
   * there is no repository" — while `hearth/contracts/src` held the whole AMM and
   * `hearth/node/test/dex.js` had been driving it through this project's own EVM for weeks.
   *
   * That is the understatement direction, and the header of this file says why it is the worse
   * one: nobody goes looking for evidence that a thing exists after being told it does not. It got
   * caught by opening the repository the page is about, which is what these two tests now do on
   * every run.
   */
  const AMM = ['WEMBER.sol', 'HearthV2Factory.sol', 'HearthV2Pair.sol', 'HearthV2Router02.sol']

  it('finds the pool contracts the page says are already written', () => {
    for (const file of AMM) {
      assert.ok(
        existsSync(`${AMM_DIR}/${file}`),
        `${file} is gone from hearth/contracts/src; the exchange page claims it exists`,
      )
    }
  })

  it("finds the suite that drives them through the chain's own virtual machine", () => {
    // Named contracts rather than the filename alone: a `dex.js` that no longer deploys the router
    // is not the evidence the page cites, and would leave this green while the sentence went false.
    const suite = readFileSync(AMM_SUITE, 'utf8')
    for (const contract of ['WEMBER', 'HearthV2Factory', 'HearthV2Router02']) {
      assert.match(suite, new RegExp(contract), `hearth's dex suite no longer drives ${contract}`)
    }
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
