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
 *   `open`      there is an address on the public internet. There is not one, so this is asserted
 *               EMPTY — and that assertion is the single most load-bearing line in this file.
 *
 * Both halves of `running` are required and neither is sufficient. A service in a compose file
 * proves something was meant to run; only the smoke tier proves a person could have opened it, and
 * it is the tier that can prove it because it intercepts nothing and fails structurally if a
 * request intercept ever appears in its own source.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { PRODUCT_PAGES } from '../src/content/products.ts'
import { BUILD } from '../src/content/pages.ts'
import {
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

const REQUIRED: ReadonlyArray<{ file: string; repo: string; dir: string }> = [
  { file: COMPOSE, repo: 'micro-deploy', dir: 'deploy' },
  { file: SMOKE, repo: 'micro-beacon', dir: 'beacon' },
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

/** The stage the estate supports for a surface. Pure, so `selfCheck` below can drive it. */
export function stageFor(
  key: string,
  needs: readonly string[],
  services: ReadonlySet<string>,
  walked: ReadonlySet<string>,
): Stage {
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
    assert.equal(stageFor('a', ['a-web'], both, new Set(['a'])), 'running')
    assert.equal(stageFor('a', ['a-web'], both, new Set()), 'tested', 'deployed but never opened')
    assert.equal(stageFor('a', ['a-web'], new Set(), new Set(['a'])), 'tested', 'walked but absent')
    // And every named container, not just one of them.
    assert.equal(stageFor('a', ['a-web', 'a-api'], both, new Set(['a'])), 'tested')
  })
})

describe('the stage of every surface, recomputed', () => {
  const services = composeServices(readFileSync(COMPOSE, 'utf8'))
  const walked = smokeSurfaces(readFileSync(SMOKE, 'utf8'))

  it('found a real estate, so nothing below is comparing two empty sets', () => {
    assert.ok(services.size >= 40, `the compose file declared ${services.size} services`)
    assert.ok(walked.size >= 10, `the smoke tier drives ${walked.size} surfaces`)
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
      const actual = stageFor(page.key, needs, services, walked)
      if (actual === page.stage) return []
      const absent = needs.filter((s) => !services.has(s))
      return [
        `${page.slug} is published as ${JSON.stringify(page.stage)} but the estate gives ` +
          `${JSON.stringify(actual)} — ` +
          (absent.length > 0 ? `not declared in compose: ${absent.join(', ')}. ` : '') +
          (walked.has(page.key) ? '' : 'the smoke tier does not drive this surface.'),
      ]
    })
    assert.deepEqual(disagreements, [])
  })

  it('publishes nothing as open to the public, because nothing is', () => {
    // The load-bearing assertion of this file, and the one that must be hardest to delete. It is
    // asserted over the pages AND over the wallets block, so a surface promoted by hand fails here
    // rather than on somebody noticing the chip went green.
    const claimed = PRODUCT_PAGES.filter((p) => p.stage === 'open').map((p) => p.slug)
    assert.deepEqual(
      claimed,
      [],
      'a surface claims to be open to the public. There is no address on the public internet for ' +
        'anything in this estate; if that has changed, this test is where the change is argued.',
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
