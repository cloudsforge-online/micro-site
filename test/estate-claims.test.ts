/**
 * Every number this site publishes, recomputed from the estate that owns it.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * THIS TEST OPENS SIBLING REPOSITORIES. IT DOES NOT SKIP WHEN THEY ARE ABSENT.
 *
 * `src/content/claims.ts` used to say, of its own citations: "the repositories it names are not
 * checked out when this suite runs in CI, so no test can open them." That sentence was true, and
 * it was the whole defect. Under it, four of eleven citations drifted to the wrong line, one named
 * a file that has never existed, and one value was copied out of a block whose heading reads
 * "MEASURED NUMBERS, CORRECTED" — from the paragraph being corrected rather than the correction.
 *
 * So `.github/workflows/ci.yml` now checks out `micro-contracts` and `micro-docs` next to
 * `micro-ui`, and this file resolves the citations against them. If they are missing the run FAILS
 * with a message saying what to check out. It does not skip. A check that quietly turns itself off
 * when its inputs are absent is worse than no check, because the green tick is the same either way.
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * The mechanism is in `./claims/verify.ts`, which is deliberately free of anything specific to this
 * repository — see its header for what moving it into `@cloudsforge/ui` would take. This file holds
 * only the parts that ARE specific: which file each of this site's numbers comes out of, and how.
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { PRODUCTS } from '@cloudsforge/ui'
import { CLAIMS } from '../src/content/claims.ts'
import { ABOUT, BUILD, HOME, NOT_FOUND, PLATFORM, PRODUCTS_INDEX } from '../src/content/pages.ts'
import { PRODUCT_PAGES } from '../src/content/products.ts'
import { LEGAL_PAGES } from '../src/content/legal.ts'
import { checkRegistry, selfTest, type Derivation, type Exemption } from './claims/verify.ts'

const REPO = fileURLToPath(new URL('..', import.meta.url))
/** The working tree the sibling repositories sit in: `micro-site/..`. */
const ESTATE = fileURLToPath(new URL('../..', import.meta.url))

/**
 * The repositories this site's citations reach into, and the name to check each out under.
 *
 * Listed rather than globbed. A glob would make "the repository is missing" and "the repository is
 * named something else" the same silent outcome, and the second is what actually happens — CI
 * checks out `cloudsforge-online/micro-contracts` INTO a directory called `contracts`, and getting
 * that mapping wrong is how the org's own web template shipped a pipeline that could never install.
 */
const REQUIRED_SIBLINGS: ReadonlyArray<{ dir: string; repo: string; witness: string }> = [
  { dir: 'contracts', repo: 'micro-contracts', witness: 'packages/chain/src/index.ts' },
  { dir: 'docs', repo: 'micro-docs', witness: 'ecosystem/01-product-vision.md' },
  { dir: 'ui', repo: 'micro-ui', witness: 'packages/ui/src/tokens.css' },
  { dir: 'brand', repo: 'micro-brand', witness: 'TRADEMARKS.md' },
  // The two the STAGE derivation reads. `test/estate-stages.test.ts` names them again in its own
  // message, but they are listed here as well so that a checkout gone missing is reported once,
  // early, with the whole list — rather than as two unrelated failures in two files.
  { dir: 'deploy', repo: 'micro-deploy', witness: 'compose/docker-compose.estate.yml' },
  { dir: 'beacon', repo: 'micro-beacon', witness: 'src/browser/smoke.ts' },
]

/* ───────────────────────────── how each number is recomputed ───────────────────────────── */

/** The `CHAINS.EMBER` object literal, so a depth is never read out of BTC's entry by accident. */
function emberBlock(chainSpec: string): string {
  const start = chainSpec.indexOf('EMBER: Object.freeze({')
  assert.notEqual(start, -1, 'contracts no longer declares CHAINS.EMBER as a frozen literal')
  const end = chainSpec.indexOf('}),', start)
  return chainSpec.slice(start, end)
}

function field(block: string, name: string): number {
  const match = new RegExp(`${name}:\\s*(\\d+)`).exec(block)
  if (!match?.[1]) throw new Error(`no ${name} in the EMBER chain spec`)
  return Number(match[1])
}

/** Superscript digits, for `10⁻⁶` as the tessera design writes it. */
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹'

const CHAIN_SPEC = 'contracts/packages/chain/src/index.ts'
const TOKENS = 'ui/packages/ui/src/tokens.css'

const DERIVATIONS: Readonly<Record<string, Derivation>> = {
  emberConfirmations: {
    reads: CHAIN_SPEC,
    witness: /confirmations:\s*\d+/,
    derive: (text) => String(field(emberBlock(text), 'confirmations')),
  },

  emberReorgAlarmDepth: {
    reads: CHAIN_SPEC,
    witness: /reorgAlarmDepth:\s*\d+/,
    derive: (text) => String(field(emberBlock(text), 'reorgAlarmDepth')),
  },

  /**
   * The wait, multiplied out rather than read back.
   *
   * 60 blocks × 15 seconds = 900 seconds = 15 minutes. That the block time and the wait are both
   * 15 is a coincidence of this chain's parameters and it is exactly the sort of coincidence that
   * makes a copied figure look right — so the block time is parsed from the file's own prose and
   * the depth from the constant, and the two are multiplied. Change either and this fails.
   */
  emberConfirmationMinutes: {
    reads: CHAIN_SPEC,
    witness: /-second block time/,
    derive: (text) => {
      const blockTime = /(\d+)-second block time/.exec(text)
      if (!blockTime?.[1]) throw new Error('the chain spec no longer states its block time')
      const seconds = field(emberBlock(text), 'confirmations') * Number(blockTime[1])
      assert.equal(seconds % 60, 0, 'the confirmation wait is no longer a whole number of minutes')
      return String(seconds / 60)
    },
  },

  chains: {
    reads: CHAIN_SPEC,
    witness: /ON_CHAIN_ASSETS/,
    derive: (text) => {
      const list = /ON_CHAIN_ASSETS:[^=]*=\s*Object\.freeze\(\[([^\]]*)\]/.exec(text)
      if (!list?.[1]) throw new Error('ON_CHAIN_ASSETS is no longer a frozen array literal')
      return String(list[1].split(',').filter((entry) => entry.trim().length > 0).length)
    },
  },

  /**
   * Sparks per EMBER, from the exponent the design states.
   *
   * Reads `10⁻⁶` and raises ten to it, rather than matching the string "1,000,000" — a check that
   * looked for the answer in the document would pass against a document that had been changed to
   * agree with a wrong site.
   */
  sparksPerEmber: {
    reads: 'docs/ecosystem/23-tessera.md',
    witness: /A Spark is 10⁻/,
    derive: (text) => {
      const match = /A Spark is 10⁻(.)\s*EMBER/.exec(text)
      const exponent = match?.[1] === undefined ? -1 : SUPERSCRIPT.indexOf(match[1])
      if (exponent < 1) throw new Error('the Spark exponent is no longer stated in §8.1')
      // And the sentence that keeps it a denomination rather than a currency. Without this the
      // ratio could survive a redefinition of Sparks into a second asset code, which is the one
      // outcome §8.1 calls the most important thing in the section.
      assert.match(
        text,
        /display denomination of EMBER\. It is not a second `assetCode`, and it must never\s*\n?\s*>?\s*become one/,
        'the Spark design no longer forbids a second asset code',
      )
      return (10 ** exponent).toLocaleString('en-GB')
    },
  },

  /** The numbered rows of the definition table, counted. */
  platformTests: {
    reads: 'docs/ecosystem/01-product-vision.md',
    witness: /^\| 1 \| One account signs into everything/m,
    derive: (text) => {
      const section = text.slice(text.indexOf('## 2. What "one platform"'), text.indexOf('## 3.'))
      return String((section.match(/^\| \d+ \| /gm) ?? []).length)
    },
  },

  /**
   * Product surfaces in the design system's registry.
   *
   * Counted inside the SURFACES array only. The first version of this counted `kind: 'product'`
   * across the whole file and returned seven, because a footer helper further down groups surfaces
   * with `{ kind: 'product', title: 'Products', … }` — a group descriptor, not a surface. It was
   * added to `micro-ui` while this check was being written, which is a fair demonstration that a
   * derivation over a file somebody else is editing has to say WHERE it is counting.
   *
   * The citation names no line for the same reason: the array runs to several hundred lines and
   * every entry added to it would move the range. What pins this value instead is the runtime
   * comparison against the imported `PRODUCTS.length`, in its own test below.
   */
  products: {
    reads: 'ui/packages/ui/src/surfaces.ts',
    derive: (text) => {
      const start = text.indexOf('export const SURFACES')
      const end = text.indexOf('export const PRODUCTS')
      if (start === -1 || end === -1 || end < start) {
        throw new Error('surfaces.ts no longer declares SURFACES before PRODUCTS')
      }
      return String((text.slice(start, end).match(/kind: 'product'/g) ?? []).length)
    },
  },

  /**
   * The artwork licence's version, from the file that separates it from the code's.
   *
   * The derivation also asserts the trademark reservation is still in that file. Without it the
   * version number survives a rewrite that drops the reservation — and the reservation is the
   * clause the terms page leans on hardest, because it is what makes the permissive halves safe.
   */
  assetLicenceVersion: {
    reads: 'brand/TRADEMARKS.md',
    witness: /CC BY [\d.]+ licence in/,
    derive: (text) => {
      const match = /CC BY (\d+\.\d+) licence/.exec(text)
      if (!match?.[1]) throw new Error('the trademark notice no longer names the artwork licence version')
      assert.match(
        text,
        /are trademarks of CloudsForge/,
        'the trademark notice no longer reserves the marks; the terms page says it does',
      )
      assert.match(
        text,
        /MIT licence in `LICENSE`/,
        'the trademark notice no longer names MIT as the code licence',
      )
      return match[1]
    },
  },

  accentSeparation: {
    reads: TOKENS,
    witness: /worst ADJACENT/,
    derive: (text) => {
      const match = /worst ADJACENT\s+dE\s+([\d.]+)/.exec(text)
      if (!match?.[1]) throw new Error('tokens.css no longer records a worst-adjacent measurement')
      return match[1]
    },
  },

  accentSeparationAllPairs: {
    reads: TOKENS,
    witness: /worst ALL-PAIRS/,
    derive: (text) => {
      const match = /worst ALL-PAIRS\s+dE\s+([\d.]+)/.exec(text)
      if (!match?.[1]) throw new Error('tokens.css no longer records a worst-all-pairs measurement')
      return match[1]
    },
  },

  /** This site's own 404, read out of the server config that produces it. */
  httpNotFound: {
    reads: 'nginx.conf',
    derive: (text) => {
      const match = /error_page\s+(\d+)\s+\/index\.html/.exec(text)
      if (!match?.[1]) throw new Error('nginx.conf no longer serves the shell through error_page')
      return match[1]
    },
  },
}

/**
 * The two numbers that cannot be recomputed — named individually, with the reason each is
 * irreducible. Not a category, not a pattern, not a comment saying "the colour ones".
 */
const EXEMPTIONS: Readonly<Record<string, Exemption>> = {
  accentSeparationBefore: {
    kind: 'recorded',
    reason:
      'A measurement of a palette that no longer exists. The six accents it describes were replaced, ' +
      'and the only surviving record of what they measured is the sentence cited in tokens.css. ' +
      'Re-running the validator would measure the CURRENT set and silently answer a different ' +
      'question, so this is checked as a quotation: the value must still appear on the line cited.',
  },
  httpOk: {
    kind: 'underivable',
    reason:
      'A fact about how single-page applications are USUALLY served, which is the comparison the ' +
      '404 copy is making. It is not a value anywhere in this estate — this site deliberately does ' +
      'not produce it for an unknown address, and nginx.conf therefore cannot contain it. What is ' +
      'checkable is the behaviour it contrasts with, and test/routes.test.ts asserts exactly that.',
  },
}

/* ─────────────────────────────────── the checks ─────────────────────────────────── */

describe('the verifier itself', () => {
  it('reports every class of breakage, and stays silent on a correct registry', () => {
    // Before any claim is checked, the checker is checked. `selfTest` builds registries that are
    // each wrong in one way and asserts the failure is reported — including the control case, a
    // correct registry, without which "reports everything" would pass every other assertion.
    assert.deepEqual(selfTest(REPO), [])
  })
})

describe('the estate is present', () => {
  it('has every sibling repository the citations reach into', () => {
    const missing = REQUIRED_SIBLINGS.filter(
      ({ dir, witness }) => !existsSync(`${ESTATE}${dir}/${witness}`),
    )
    assert.deepEqual(
      missing.map((m) => m.dir),
      [],
      'this check reads the estate and will not skip without it. Check out ' +
        missing.map((m) => `cloudsforge-online/${m.repo} into ../${m.dir}`).join(', ') +
        '. In CI this is done by .github/workflows/ci.yml.',
    )
  })
})

/**
 * Which sibling checkouts have uncommitted changes.
 *
 * ── This exists because of a failure that cost a red CI run to notice ─────────────────────────
 *
 * A citation names a path and a line, and a line number is only meaningful against a COMMIT. When
 * this check went red on four citations into `micro-contracts`, the natural reading was that the
 * repository had moved — so the line numbers were re-pinned to match what was on disk, and the
 * suite went green against a file that existed only in another agent's staged, uncommitted
 * migration. CI, which checks out `main`, reported the mirror image of the same four failures.
 *
 * A red claims check therefore has two causes that produce identical output and want opposite
 * responses: the citation is stale, or the sibling tree is mid-edit. Only the first is fixed by
 * editing `src/content/claims.ts`. So the failure message says which repositories are dirty,
 * because a diagnosis that has to be remembered is a diagnosis that gets skipped at 3am.
 *
 * Returns an empty list, silently, when git is unavailable or the directory is not a checkout —
 * this is a hint on a failure path and must never itself become a reason a run fails.
 */
function dirtySiblings(): string[] {
  return REQUIRED_SIBLINGS.filter(({ dir }) => {
    try {
      return (
        execFileSync('git', ['-C', `${ESTATE}${dir}`, 'status', '--porcelain'], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim().length > 0
      )
    } catch {
      return false
    }
  }).map((s) => s.dir)
}

describe('the numbers register agrees with the estate', () => {
  it('recomputes every claim from the file it cites', () => {
    const failures = checkRegistry({
      claims: CLAIMS,
      derivations: DERIVATIONS,
      exemptions: EXEMPTIONS,
      roots: [REPO, ESTATE],
    })
    const dirty = failures.length > 0 ? dirtySiblings() : []
    assert.deepEqual(
      failures.map((f) => `${f.claim} — ${f.detail}`),
      [],
      dirty.length === 0
        ? undefined
        : `\n\nBEFORE EDITING A LINE NUMBER: these sibling checkouts have UNCOMMITTED changes — ` +
            `${dirty.join(', ')}. A citation points at a commit, not at a working tree, so the ` +
            `lines you can see locally may not be the lines CI or a reader on GitHub will see. ` +
            `Re-pinning against a dirty tree is how this check was last made green and wrong.`,
    )
  })

  it('names the script it says a colour figure is reproducible with', () => {
    // The citation this replaces pointed at `ui scripts/validate_palette.js`, which has never
    // existed in that repository. tokens.css says so itself, immediately above the figures the
    // site had copied — so the retraction and the retracted numbers were both on screen, and the
    // site took the numbers. A named tool that is not there is a citation nobody can follow.
    for (const key of ['accentSeparation', 'accentSeparationAllPairs'] as const) {
      const named = /(ui\/scripts\/[\w.-]+)/.exec(CLAIMS[key].source)
      assert.ok(named?.[1], `${key} no longer names the tool its figure is reproducible with`)
      assert.ok(
        existsSync(`${ESTATE}${named[1]}`),
        `${key} cites ${named[1]}, which does not exist`,
      )
    }
  })

  it('keeps the registered product count equal to the registry at runtime', () => {
    // The derivation counts `kind: 'product'` in the design system's SOURCE. This compares against
    // the same registry as IMPORTED, so a discrepancy between what the file says and what the
    // package actually exports — a stale build of the linked dependency — fails here rather than
    // rendering a grid that disagrees with the sentence above it.
    assert.equal(CLAIMS.products.rendered, String(PRODUCTS.length))
  })
})

/* ───────────────────────── the copy, against the estate's decisions ───────────────────────── */

/** Every published string, flattened. Read as DATA, never as this repository's source text. */
function publishedCopy(): string[] {
  const out: string[] = []
  const walk = (value: unknown): void => {
    if (typeof value === 'string') out.push(value)
    else if (Array.isArray(value)) value.forEach(walk)
    else if (value !== null && typeof value === 'object') Object.values(value).forEach(walk)
  }
  for (const block of [HOME, PLATFORM, ABOUT, BUILD, NOT_FOUND, PRODUCTS_INDEX, PRODUCT_PAGES, LEGAL_PAGES]) {
    walk(block)
  }
  return out
}

describe('Shards, which are being removed from the estate', () => {
  const COPY = publishedCopy()

  it('finds the site, so the assertions below cannot pass over an empty list', () => {
    assert.ok(COPY.length >= 150, `collected ${COPY.length} strings`)
  })

  it('names no Shard anywhere a reader can see', () => {
    // ── This guard reads the copy as DATA and never as source text ────────────────────────────
    //
    // The distinction is the whole reliability of it. A grep over `src/content/*.ts` would match
    // the long note in claims.ts that EXPLAINS why Shards are gone, so the guard would be green
    // because of its own justification — and it would stay green if every sentence it protects
    // were deleted. That defect has shipped in this estate at least five times: an nginx header
    // quoting the directive it forbids, a harness asserting `page.route` against a header that
    // mentions it three times, a hostname rule failing on the file documenting the rule.
    //
    // `publishedCopy()` walks the exported objects, so it sees rendered sentences and no comments.
    const offences = COPY.filter((text) => /\bshards?\b/i.test(text))
    assert.deepEqual(
      offences,
      [],
      'Shards are being removed estate-wide (docs/ecosystem/23-tessera.md §8.1) — the money is ' +
        'EMBER, denominated in Sparks. A Shard balance is a balance the chain does not back.',
    )
  })

  it('says what replaced them, so the guard above is protecting something', () => {
    // The inverse assertion, and the one that makes deletion loud. Without it, the cleanest way to
    // pass the test above is to remove the sentence about the money altogether — leaving a site
    // that says nothing about what a balance is denominated in, and a green suite.
    const money = COPY.filter((text) => /\bSparks\b/.test(text) && /\bEMBER\b/.test(text))
    assert.ok(
      money.length > 0,
      'no published sentence relates Sparks to EMBER; the loop step that explains the money is gone',
    )
  })
})

describe('what this site claims about being live', () => {
  const COPY = publishedCopy()

  it('does not claim that nothing is running, because things are running', () => {
    // The estate now runs end to end behind a gateway. The build page said "none of it is running
    // anywhere" and "there is no gateway routing" for as long as it took somebody to check, which
    // is the same failure mode as the numbers — a true sentence left up after it stopped being one.
    for (const text of COPY) {
      assert.ok(
        !/not one of them is running|none of it is running|no gateway routing/i.test(text),
        `this is no longer true: ${text.slice(0, 120)}`,
      )
    }
  })

  it('still says, in the honesty block, that the public cannot reach any of it', () => {
    assert.match(BUILD.honesty.title, /nothing is serving the public/i)
    assert.ok(
      BUILD.honesty.body.some((p) => /no public address for any of it/i.test(p)),
      'the build page no longer states that there is no public address',
    )
    assert.ok(
      BUILD.honesty.body.some((p) => /nothing here to sign up for/i.test(p)),
      'the build page no longer states that there is nothing to sign up for',
    )
  })

  it('publishes no estate census, because none of it is checkable here', () => {
    // Repository counts, test-file counts and table counts are all true today and none is derivable
    // from anything CI checks out. A number with a citation nothing reads is the defect this whole
    // file exists to close, so the register must not acquire one by the back door.
    const source = readFileSync(`${REPO}src/content/claims.ts`, 'utf8')
    for (const forbidden of ['repositories', 'test files', 'database tables']) {
      assert.ok(
        !new RegExp(`rendered:.*\\n?.*${forbidden}`, 'i').test(source),
        `the register has acquired a census figure (${forbidden})`,
      )
    }
    assert.equal(Object.keys(CLAIMS).length, Object.keys(DERIVATIONS).length + Object.keys(EXEMPTIONS).length)
  })
})
