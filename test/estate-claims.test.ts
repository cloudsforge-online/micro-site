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
  // What Foresight will take a stake in, which is NOT the list of chains the estate models — see
  // the two `stakeAsset*` derivations below and micro-org#291. Listed here so that a missing
  // checkout is reported by name in one place, rather than as "cites a path in none of the roots"
  // from the registry check, which reads as a broken citation and invites somebody to edit the
  // citation.
  { dir: 'foresight', repo: 'micro-foresight', witness: 'src/stakeassets.ts' },
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

/**
 * The `ON_CHAIN_ASSETS` array literal, as codes.
 *
 * Shared by the two claims derived from it — the count and the prose list — so that they cannot
 * parse the same array differently and disagree about what is in it, which is the failure the
 * prose claim exists to prevent one level up.
 */
function onChainAssets(chainSpec: string): readonly string[] {
  const list = /ON_CHAIN_ASSETS:[^=]*=\s*Object\.freeze\(\[([^\]]*)\]/.exec(chainSpec)
  if (!list?.[1]) throw new Error('ON_CHAIN_ASSETS is no longer a frozen array literal')
  const codes = [...list[1].matchAll(/'([A-Z]+)'/g)].map((m) => m[1] as string)
  if (codes.length === 0) throw new Error('ON_CHAIN_ASSETS parsed to nothing')
  return codes
}

function field(block: string, name: string): number {
  const match = new RegExp(`${name}:\\s*(\\d+)`).exec(block)
  if (!match?.[1]) throw new Error(`no ${name} in the EMBER chain spec`)
  return Number(match[1])
}

/**
 * The DEFAULT of an `integer(source, 'NAME', default, min, max)` declaration, by variable name.
 *
 * Throws rather than returning a fallback when the name is absent: an environment variable that has
 * been renamed must fail this build, not quietly leave the old number on the privacy notice. That
 * is the whole failure mode these two claims exist to prevent.
 */
function envDefault(text: string, name: string): string {
  const match = new RegExp(`integer\\([^,]+,\\s*'${name}',\\s*(\\d[\\d_]*)`).exec(text)
  if (!match?.[1]) throw new Error(`no integer() default for ${name}`)
  return match[1].replace(/_/g, '')
}

/** Superscript digits, for `10⁻⁶` as the tessera design writes it. */
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹'

const CHAIN_SPEC = 'contracts/packages/chain/src/index.ts'
const STAKE_REGISTRY = 'foresight/src/stakeassets.ts'

/**
 * The display names of the assets Foresight ships prepared to take a stake in.
 *
 * ── WHY THIS IS PARSED RATHER THAN IMPORTED ───────────────────────────────────────────────────
 *
 * `foresight/src/stakeassets.ts` exports `stakeableAssetNames()`, which would be the obvious thing
 * to call. It cannot be called from here: the module imports `@cloudsforge/contracts-chain` to read
 * each asset's decimals, and this repository does not depend on that package and must not start —
 * a marketing bundle acquiring a chain package to print four words is a worse trade than a parser.
 * So the file is read as text, exactly as every other derivation in this file reads its source.
 *
 * ── WHAT IT REFUSES TO GUESS ──────────────────────────────────────────────────────────────────
 *
 * Two shapes appear in the array and both are handled explicitly: `stakeable(CODE, NAME)`, which is
 * a helper that hard-codes `enabled: true`, and a full object literal, which is the shape a
 * DISABLED row must take because the schema's own constraints require a disabled row to carry a
 * written reason. The helper is checked rather than believed — if it stops declaring `enabled:
 * true` this throws instead of quietly counting a disabled asset as offerable.
 *
 * And the count of entries it PARSED is compared to the count of entries the array DECLARES, so a
 * third shape — a second helper, a spread, a conditional — fails loudly here rather than being
 * skipped into a smaller, wrong, plausible-looking list. That silent-narrowing failure is the one
 * worth spending a check on: a promise that shrinks is not investigated by anybody.
 */
function stakeableAssets(text: string): readonly string[] {
  const start = text.indexOf('export const STAKE_ASSET_REGISTRY')
  if (start === -1) throw new Error('foresight no longer declares STAKE_ASSET_REGISTRY')
  const end = text.indexOf('\n])', start)
  if (end === -1) throw new Error('STAKE_ASSET_REGISTRY is no longer a frozen array literal')
  const body = text.slice(start, end)

  const helper = /function stakeable\([\s\S]*?\n}/.exec(text)
  if (helper === null || !/enabled: true/.test(helper[0]) || !/blockedReason: null/.test(helper[0])) {
    throw new Error('the `stakeable` helper no longer declares an enabled row with no reason')
  }

  const names: string[] = []
  let parsed = 0
  for (const entry of body.matchAll(/stakeable\('[A-Z]+',\s*'([^']+)'\)/g)) {
    parsed += 1
    names.push(entry[1] as string)
  }
  for (const entry of body.matchAll(/Object\.freeze\(\{([\s\S]*?)\n {2}\}\)/g)) {
    parsed += 1
    const row = entry[1] as string
    const enabled = /enabled:\s*(true|false)/.exec(row)
    const displayName = /displayName:\s*'([^']+)'/.exec(row)
    if (enabled === null || displayName?.[1] === undefined) {
      throw new Error('a stake asset row declares no enabled flag or no display name')
    }
    if (enabled[1] === 'true') names.push(displayName[1])
  }

  // Every top-level element of the array begins on its own line at one indent; an object literal's
  // own fields sit a further indent in, and its closing `}),` starts with a brace. So this counts
  // entries without knowing what SHAPE they are, which is the whole reason it can disagree with
  // the two loops above. A comment is not an entry and a closing bracket is not an entry; anything
  // else at that indent is, deliberately including a spread — `...SOMETHING,` is the shape that
  // would otherwise slip past both loops and silently shrink the promise.
  const declared = body
    .split('\n')
    .slice(1)
    .filter((line) => /^ {2}(?![)\]}]|\/\/|\/\*|\*)\S/.test(line)).length
  if (declared !== parsed) {
    throw new Error(`STAKE_ASSET_REGISTRY declares ${declared} rows and ${parsed} were understood`)
  }
  if (parsed === 0) throw new Error('STAKE_ASSET_REGISTRY parsed to nothing')
  if (names.length === 0) throw new Error('no stake asset is enabled, so the sentence promises none')
  return names
}

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
   * The two retention periods on the privacy notice, recomputed from the services that enforce them.
   *
   * Both are read out of an `integer(source, 'NAME', default, min, max)` call, and the DEFAULT is
   * the third argument. Parsed by name rather than by position in the file, because these files
   * declare a dozen of these calls and a positional read would silently follow the next one added.
   *
   * The bounds are deliberately not published. `LANTERN_RUM_RETENTION_DAYS` may legally be set to
   * anything from 1 to 400, so the default is what an unconfigured deployment keeps and not a
   * promise about every deployment — which is precisely why the notice says the number is read from
   * the configuration rather than claiming it is a policy.
   */
  rumRetentionDays: {
    reads: 'lantern/src/env.ts',
    witness: /LANTERN_RUM_RETENTION_DAYS/,
    derive: (text) => envDefault(text, 'LANTERN_RUM_RETENTION_DAYS'),
  },

  analyticsRetentionDays: {
    reads: 'analytics/src/env.ts',
    witness: /ANALYTICS_EVENT_RETENTION_DAYS/,
    derive: (text) => envDefault(text, 'ANALYTICS_EVENT_RETENTION_DAYS'),
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
    derive: (text) => String(onChainAssets(text).length),
  },

  /**
   * What Foresight will accept, which is a different register from the one above (micro-org#291).
   *
   * The Foresight page derived both its count and its list from `ON_CHAIN_ASSETS` and therefore
   * promised a stake in eight chains where four are accepted — and it was getting WORSE on its
   * own, because every chain added upstream enlarged the promise with this suite green. The two
   * questions look identical and are not: "which chains does the estate model" against "which
   * assets will this service take at the door". ETC, DOGE, SOL and XRP answer the first and are
   * not rows in `stake_assets` at all, so they answer the second with `404 unknown_asset`.
   *
   * The count is derived from the ENABLED rows, and the derivation asserts that `STAKEABLE_ASSETS`
   * upstream is defined as exactly that filter — so this cannot go on counting `enabled` rows
   * after Foresight has redefined what it offers. Without that assertion the parse here would be a
   * second opinion about the registry rather than a reading of it.
   */
  stakeAssets: {
    reads: STAKE_REGISTRY,
    witness: /export const STAKE_ASSET_REGISTRY/,
    derive: (text) => {
      assert.match(
        text,
        /STAKEABLE_ASSETS[\s\S]{0,200}?STAKE_ASSET_REGISTRY\.filter\(\(asset\) => asset\.enabled\)/,
        'foresight no longer defines its stakeable set as the enabled rows of the registry',
      )
      return String(stakeableAssets(text).length)
    },
  },

  /**
   * The same rows as prose, from each row's own `displayName`.
   *
   * A plain comma list and no article, for the reason `chainNames` retreated to one: whether a
   * proper noun takes "the" is an English fact that is not in the data. The names are the
   * registry's own, which are the words the migrations seeded and the words a user is served when
   * an asset is refused — not a second mapping in this file, which would be the typed list one
   * level down.
   */
  stakeAssetNames: {
    reads: STAKE_REGISTRY,
    witness: /export const STAKE_ASSET_REGISTRY/,
    derive: (text) => stakeableAssets(text).join(', '),
  },

  /**
   * The three figures the site publishes so a developer can point a wallet at Hearth.
   *
   * `emberBlock` ends at the first `}),`, which is the end of the frozen `chainId` literal — so
   * both ids are inside the slice and `field` reads them by name. Recomputed rather than typed
   * because a chain id printed on a marketing page is an instruction: a reader who adds the
   * network with the wrong one gets `binding_mismatch` from a signer and no way to tell why.
   */
  emberChainId: {
    reads: CHAIN_SPEC,
    witness: /chainId:\s*Object\.freeze/,
    derive: (text) => String(field(emberBlock(text), 'mainnet')),
  },

  emberTestnetChainId: {
    reads: CHAIN_SPEC,
    witness: /chainId:\s*Object\.freeze/,
    derive: (text) => String(field(emberBlock(text), 'testnet')),
  },

  emberDecimals: {
    reads: CHAIN_SPEC,
    witness: /decimals:\s*\d+/,
    derive: (text) => String(field(emberBlock(text), 'decimals')),
  },

  /**
   * The same array, rendered as the English list the page prints.
   *
   * The count beside it was already derived and corrected itself to 6 the day Litecoin was listed;
   * the names were typed, so the sentence would have read "6 chains — EMBER, Bitcoin, Ethereum,
   * Solana and the XRP Ledger" and contradicted itself in its own clause. A number that maintains
   * itself next to prose that does not is worse than two stale halves, because the moving half is
   * evidence that somebody is looking.
   *
   * Each name is the chain's OWN `name` field from the CHAINS table rather than a second mapping
   * here — a lookup table in this file would be the same typed copy one level down. EMBER is the
   * single exception and it is spelled out below rather than special-cased silently: `CHAINS.EMBER`
   * is named "Hearth", which is the network, while the thing a reader holds a balance of is EMBER.
   */
  chainNames: {
    reads: CHAIN_SPEC,
    witness: /ON_CHAIN_ASSETS/,
    derive: (text) => {
      const names = onChainAssets(text).map((asset) => {
        // The asset a reader holds, not the network it settles on. The only asset where those two
        // words differ, and the reason is on `CHAINS.EMBER` upstream.
        if (asset === 'EMBER') return 'EMBER'
        const entry = new RegExp(
          `${asset}: Object\\.freeze\\(\\{[\\s\\S]*?asset: '${asset}'[\\s\\S]*?\\}\\),\\n`,
        ).exec(text)
        const name = entry?.[0] === undefined ? undefined : /name: '([^']+)'/.exec(entry[0])?.[1]
        if (!name) throw new Error(`no name for ${asset} in the upstream CHAINS table`)
        return name
      })
      // A PLAIN COMMA LIST, with no "and" and no article, and that is a deliberate retreat.
      // The first version of this built "…, Solana and the XRP Ledger" — and the article is the
      // problem: upstream's own name for that chain is "XRP Ledger", so "the" was being supplied
      // here. That is a typed English fact sitting in a derivation, which is the same class of
      // thing this claim exists to remove, one level further down. Whether a proper noun takes an
      // article is not in the data and must not be guessed from it.
      //
      // So the derivation emits exactly the names upstream gives, joined by commas, and the copy
      // sets the list off with dashes — where an enumeration reads correctly without a conjunction.
      return names.join(', ')
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
   * The witness names the declaration the derivation counts inside, which is the same thing the
   * comment above says in prose. What pins the value itself is the runtime comparison against the
   * imported `PRODUCTS.length`, in its own test below.
   */
  products: {
    reads: 'ui/packages/ui/src/surfaces.ts',
    witness: /export const SURFACES/,
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

  /** This site's own 404, read out of the server config that produces it. */
  httpNotFound: {
    reads: 'nginx.conf',
    witness: /error_page\s+\d+\s+\/index\.html/,
    derive: (text) => {
      const match = /error_page\s+(\d+)\s+\/index\.html/.exec(text)
      if (!match?.[1]) throw new Error('nginx.conf no longer serves the shell through error_page')
      return match[1]
    },
  },
}

/**
 * The numbers that cannot be recomputed — named individually, with the reason each is
 * irreducible. Not a category, not a pattern, not a blanket exemption.
 */
const EXEMPTIONS: Readonly<Record<string, Exemption>> = {
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

  it('never lets the good news be published without the limits that qualify it', () => {
    // This asserted, until 2026-08-05, that the site still said the public could not reach any of
    // it. The estate went public and that became a false sentence the test was requiring, so the
    // guard was inverted rather than deleted.
    //
    // It is inverted into the shape that actually protects a reader. The risk on a crypto site is
    // never that "open to the public" goes unsaid — it is that it is said ALONE, and a reader
    // fills in maturity, safety and value that nobody claimed. So the page may say it is open only
    // while it also says what that does not mean, and each clause below is separately checked so
    // that dropping any one of them fails.
    // 2026-08-10: the backup clause moved from "no backup that has ever been restored" to "no
    // scheduled backup that has ever run", and the pin moved with it rather than being dropped.
    // The old sentence had become false in the reader's FAVOUR — micro-org#214 rehearsed a restore
    // on the live host into throwaway databases and recovered key material on a separate machine —
    // while the same issue's triage found the nightly run queued and unclaimed and the destination
    // directory empty. So the limit that is real is the schedule, not the restore, and that is
    // what a reader now has to be told before the good news.
    // 2026-08-10, later the same day: the price clause split in two. The operator set an
    // administered EMBER price of $0.0001 through `PUT /admin/prices/:asset` and the estate shows
    // it, so "no price" became false while "no market" and "no listing" stayed true. A reader who
    // sees a figure on one page and "no price" on another concludes the site is careless; the clause
    // that protects them is the one saying whose price it is. Pin moved, never dropped.
    const honesty = BUILD.honesty.body.join(' ')
    assert.ok(
      /no market and no listing/i.test(honesty),
      'the honesty block no longer says EMBER has no market or listing',
    )
    assert.ok(
      /price you see for it is one we set ourselves/i.test(honesty),
      'the honesty block no longer says the EMBER price is administered rather than traded',
    )
    assert.ok(
      /no redundancy, no failover/i.test(honesty) &&
        /no scheduled backup that has ever run/i.test(honesty),
      'the honesty block no longer states the single-machine risk',
    )
    assert.ok(
      /nobody outside the project has used/i.test(honesty),
      'the honesty block no longer states that nobody outside the project has used it',
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
