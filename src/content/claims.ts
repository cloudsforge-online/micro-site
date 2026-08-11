/**
 * Every number this site is allowed to print, and where each one comes from.
 *
 * ── Why a marketing site needs a register of numbers ──────────────────────────────────────────
 *
 * This is the public face of a platform that custodies other people's money. A fabricated figure
 * here — a user count, an uptime percentage, a fee that is not the fee — is not a placeholder that
 * somebody tidies up before launch. It is a false statement about a financial service, published
 * under the company's own name, and it stays true-looking long after the person who typed it has
 * forgotten they guessed.
 *
 * The site it replaces had no mechanism against that at all. It carried a hand-written
 * `EMBER_CONFIRMATIONS = 60` and a comment explaining, at length, that the constant existed
 * because the previous copy had gone on claiming EMBER credited at the chain tip for as long as it
 * took somebody to notice (`stack/repos/platform/apps/site/src/lib/site.ts`). One constant was
 * pinned. Everything else on the page was prose.
 *
 * So the rule here is stronger and it is enforced rather than intended:
 *
 *   **A digit may not appear in this site's copy unless it appears below.**
 *
 * `test/content.test.ts` walks every string in `src/content`, extracts every run of digits, and
 * fails on any token that is not the `rendered` form of an entry in this file. Adding a number to
 * a sentence therefore means adding it here, and adding it here means writing down where it came
 * from — which is the step that makes somebody check.
 *
 * ── What a source is, and what now reads it ───────────────────────────────────────────────────
 *
 * `source` is a path into this estate, and the NAME of the thing at that path — a constant, a
 * heading, a sentence. **Never a line number.** A line number names a position in a file another
 * repository owns and is free to edit, so it is a promise this repository has no way to keep;
 * see the section below, which is the record of it being broken four separate times.
 *
 * **It used to be documentation rather than an assertion, and that is exactly how it rotted.**
 * The previous revision of this header said so in as many words — "the repositories it names are
 * not checked out when this suite runs in CI, so no test can open them" — and by the time anybody
 * looked, FOUR of the eleven citations pointed at the wrong line and one pointed at a file that
 * has never existed in the repository it names. Nothing was lying except the line numbers, and
 * nothing anywhere could have noticed.
 *
 * So the citations are now checked out and read. `test/estate-claims.test.ts` resolves every
 * `source` below against the sibling repositories, and for all but one of the entries it
 * RECOMPUTES the value from that file rather than reading it back. `.github/workflows/ci.yml`
 * checks out every repository a citation names — `micro-contracts`, `micro-docs`, `micro-brand`
 * and `micro-foresight` — alongside `micro-ui`, so the check runs in CI with teeth rather than
 * failing for want of its inputs. The entries that cannot be recomputed are exempt
 * **by name**, with the reason recorded beside them — never by category, because a blanket
 * exemption is how this drifted the first time.
 *
 * ── THE LINE NUMBERS ARE GONE, AND FOUR RED RUNS ARE WHY ──────────────────────────────────────
 *
 * Four of the citations below named a line in `contracts/packages/chain/src/index.ts`, and that
 * one file broke this repository's build four separate times without a single value on this site
 * ever being wrong.
 *
 * The first time, the four lines were "corrected" against the sibling on this machine — which was
 * carrying another agent's staged, uncommitted migration, so the suite went green against a file
 * nobody else could see and CI reported the mirror image of the same four failures. The second
 * time they were re-pinned to that repository's HEAD, and went stale thirty minutes later because
 * the migration landed for real. The third time they were pinned to `micro-contracts@218300b`. The
 * fourth, to `@326de9d`, after one commit inserting an explorer field moved them by 64 to 75 lines.
 *
 * At no point in any of that did a number on this site disagree with the estate. What was wrong
 * was the position, every time, and the position is a fact about a file THIS REPOSITORY DOES NOT
 * OWN AND DOES NOT WATCH — nothing runs this suite when `micro-contracts` is edited, so it always
 * surfaced during somebody else's release.
 *
 * So a `source` names a file and the SYMBOL or SENTENCE in it, and `test/claims/verify.ts` now
 * REJECTS a source carrying a line number outright, so the habit cannot come back quietly. What
 * replaces the line is stronger, not weaker: every derivation must declare a `witness` — the shape
 * it expects to find in the cited file — and a recorded measurement must appear inside the text
 * its witness matches. Both are searches. A search cannot drift when a file grows, and it still
 * fails when the thing it names is deleted, which is the failure worth catching.
 *
 * One thing the old scheme taught is kept: a citation is read against a COMMIT, not a working
 * tree, and `test/estate-claims.test.ts` still names any dirty sibling checkout in its failure
 * message — because "this citation is stale" and "that repository is mid-edit" look identical and
 * want opposite responses.
 *
 * ── What is deliberately NOT here ─────────────────────────────────────────────────────────────
 *
 * **No prices.** Not one. `docs/ecosystem/15-monetisation-model.md` records indicative prices for
 * fourteen revenue lines, and three of them were checked against the services that now implement
 * them. All three disagreed, and re-checking them for this revision found the disagreements intact
 * and one of the citations stale:
 *
 *   - the model lists three token-deployment tiers at 1,500 / 4,000 / 9,000 Shards
 *     (`15-monetisation-model.md`, §3.2); `mint/src/env.ts` has ONE price,
 *     `MINT_DEPLOY_PRICE_SHARDS`, defaulting to 2,500. **This file previously cited a LINE in
 *     `mint/src/env.ts`, and it was not the line that declares it.**
 *   - the model lists a 200 bps conversion spread (`15-monetisation-model.md`, §3.7);
 *     `pricing/src/env.ts` defaults `PRICING_CONVERSION_SPREAD_BPS` to 100;
 *   - the model lists a 15% trading performance fee as a constant (§3.6); in `trade/src/fees.ts`
 *     the rate is per-bot (`bot.feeBps`), not a published platform number.
 *
 * A price that is wrong on the marketing site is quoted back at support by the customer who read
 * it, and they are right to. None of the fourteen is stable enough to publish, so the site says
 * what is FREE — which is a policy of the platform rather than a number in a config file, and is
 * stated as such in `docs/ecosystem/01-product-vision.md` §6 and `15-monetisation-model.md` §1 —
 * and says plainly that prices are not published yet.
 *
 * **No Shards, anywhere, ever again.** Shards are being removed estate-wide
 * (`docs/ecosystem/23-tessera.md` §8.1), and the removal is UNDERWAY RATHER THAN DONE — the chain
 * package's own header now says why: `SHARD` is "deprecated in place" because the live ledger still
 * holds Shard accounts, so the asset code cannot simply be deleted out from under them. This site
 * is downstream of that and says nothing about the migration being finished; it simply never names
 * the unit. A Shard was a US cent wearing a chain's clothes, and the rule underneath the removal is
 * the owner's: **no balance may exist that the chain does not back.** A Shard balance sat outside
 * that guarantee by construction. The money
 * is EMBER; the unit a reader sees is the Spark, which is a display denomination of EMBER and
 * never a second asset code, because the ledger balances per asset code and a second code would
 * let the two halves of one currency drift apart. `test/estate-claims.test.ts` fails if the word
 * returns to this site's copy — asserted against the copy as DATA, so deleting the sentence that
 * explains the rule cannot switch the guard off.
 *
 * **No estate census.** Not the repository count, not the test-file count, not the table count.
 * They are all true today and none of them is derivable from anything this site's CI checks out,
 * so publishing one would recreate the exact defect above: a number with a citation nothing reads.
 * A figure earns a place here by being recomputable at check time, and those are not.
 *
 * **No traffic, no users, no uptime.** Nothing serves the public
 * (`docs/ecosystem/18-build-status.md` §1), so every one of those figures would be zero or
 * invented, and there is no third option.
 */

/** One published number, with its provenance. */
export interface Claim {
  /** Exactly how the number appears in copy. This is what the content scan matches against. */
  readonly rendered: string
  /** What it means, for a reader of this file rather than of the site. */
  readonly meaning: string
  /** Where the value comes from: a path in this estate, and the NAME of the thing at it. */
  readonly source: string
}

/**
 * The register.
 *
 * Keys are referenced from `src/content/*` through {@link claim}, never by writing the digits into
 * a sentence — a template literal is what makes the value and the register impossible to separate.
 */
export const CLAIMS = {
  sparksPerEmber: {
    rendered: '1,000,000',
    meaning:
      'Sparks in one EMBER. A Spark is a millionth of an EMBER — a DISPLAY DENOMINATION and never a second asset code, so that one balance is never two numbers that can drift. It replaces the Shard, which was a US cent with no chain behind it.',
    source:
      'docs/ecosystem/23-tessera.md — "A Spark is 10⁻⁶ EMBER — one micro-EMBER, exactly 10¹² wei", and the sentence §8.1 calls the most important in the section: "Sparks is a display denomination of EMBER. It is not a second assetCode, and it must never become one."',
  },
  emberConfirmations: {
    rendered: '60',
    meaning: 'Blocks an EMBER deposit waits before it is spendable.',
    source: 'contracts/packages/chain/src/index.ts — CHAINS.EMBER.confirmations',
  },
  emberConfirmationMinutes: {
    rendered: '15',
    meaning:
      'The same depth said as a wait, and the block time it is computed from — 60 blocks at 15 seconds is 15 minutes, which is the one coincidence in this register and is why the derivation recomputes it rather than reading it back. "60 blocks" tells a reader nothing.',
    source:
      'contracts/packages/chain/src/index.ts — "~15 minutes at a 15-second block time", the depth Hearth publishes to exchanges in its docs/exchange-integration.md §4',
  },
  emberReorgAlarmDepth: {
    rendered: '5',
    meaning:
      'A reorg this deep halts crediting for the chain and pages an operator. Deliberately below the credit depth: a shallower reorg cannot have produced a wrong credit.',
    source: 'contracts/packages/chain/src/index.ts — CHAINS.EMBER.reorgAlarmDepth',
  },
  /**
   * The two retention periods the privacy notice publishes.
   *
   * These are the first claims on this site read out of a SERVICE's configuration rather than out
   * of a contract package or a document, and they are here for a reason worth recording: a privacy
   * notice is the one page where a number nobody enforces is not merely wrong but a
   * misrepresentation. Both are cited to the line that defines the default in the service that runs
   * the deletion job, so the page cannot state a period the code does not keep.
   *
   * Only the two a reader is actually affected by are published. The estate has several more —
   * error events, issue groupings, rollups, inbox rows — and publishing all of them would put six
   * numbers on a page to be checked in order to say one thing.
   */
  rumRetentionDays: {
    rendered: '30',
    meaning:
      'Days a browser error or performance report is kept in Lantern before a scheduled job deletes it. The default of LANTERN_RUM_RETENTION_DAYS.',
    source: 'lantern/src/env.ts — LANTERN_RUM_RETENTION_DAYS',
  },
  analyticsRetentionDays: {
    rendered: '400',
    meaning:
      'Days a pseudonymised product-analytics event is kept. The default of ANALYTICS_EVENT_RETENTION_DAYS. Chosen to exceed a year so a year-on-year comparison is possible at all.',
    source: 'analytics/src/env.ts — ANALYTICS_EVENT_RETENTION_DAYS',
  },
  /**
   * ── `chains` AND `chainNames` WERE HERE, AND THEY ARE NOT COMING BACK (micro-org#421) ─────────
   *
   * They rendered '8' and "EMBER, Bitcoin, Ethereum, Ethereum Classic, Litecoin, Dogecoin, Solana,
   * XRP Ledger", both correctly derived from `ON_CHAIN_ASSETS` upstream, and every sentence on this
   * site that used them was a promise to a reader about their own money:
   *
   *     Eight coins, not just ours / Your wallet holds …          (home)
   *     8 chains behind one balance — …                           (home, the one-account promise)
   *     One balance instead of eight                              (Hub)
   *
   * A deposit could arrive in three of the eight. `ON_CHAIN_ASSETS` answers "which chains does the
   * estate model", which is a real question with a real answer, and no sentence addressed to a
   * customer was ever asking it. Both entries are therefore DELETED rather than re-pointed: the
   * orphan check one file over exists because "the next person to need a number reaches for the
   * nearest plausible-looking entry", and a registered count of modelled chains is the most
   * plausible-looking wrong entry this register could hold. `creditableChains` and
   * `creditableChainNames` below are what a promise may cite.
   *
   * If a future page genuinely needs to say how many chains the estate MODELS — a build page, an
   * engineering note — register it then, with a name that cannot be mistaken for the door, and
   * write the sentence at the same time so it is never an orphan.
   */

  /**
   * ── WHICH OF THOSE CHAINS A DEPOSIT CAN ACTUALLY ARRIVE ON (micro-org#421) ────────────────────
   *
   * The two deleted above answered "which chains does the estate model". The home page asked them
   * "which coins can I put in", because for a while those were the same question, and published:
   *
   *     Eight coins, not just ours
   *     Your wallet holds EMBER, Bitcoin, Ethereum, Ethereum Classic, Litecoin, Dogecoin, Solana,
   *     XRP Ledger.
   *
   * Both halves correctly derived. Five of the eight untrue. Measured on the mainnet estate
   * 2026-08-11:
   *
   *     indexer followers configured   EMBER, BTC, LTC — and nothing else
   *     custody keys ever issued       bitcoin 4, ember 258, litecoin 6
   *     dogecoind                      39.6% through initial block download (2026-08-10)
   *     ETH, ETC, SOL, XRP             no follower running, no address ever issued
   *
   * **This is `stakeAssets` again, one register key over, and the third time a promise has been
   * derived from `ON_CHAIN_ASSETS` and been wrong.** The pattern is now unmistakable and so is the
   * fix: the door gets its own declaration upstream rather than a second reading of the model.
   * `CREDITABLE_ASSETS` in micro-contracts is that declaration, asserted there to be a strict
   * subset of `ON_CHAIN_ASSETS` in both directions, and both values here are recomputed from it in
   * `estate-claims.test.ts`.
   *
   * ── WHAT THEY DO NOT CLAIM ───────────────────────────────────────────────────────────────────
   *
   * Not a live reading of one deployment: this is what the estate SHIPS able to credit, which is
   * the strongest statement a repository can make and the one a reader of a marketing page needs.
   * And not a ceiling — Dogecoin's code is written and waits on a node, so copy that names the
   * three should name it as coming rather than let the reader infer that three is the end of it.
   */
  creditableChains: {
    rendered: '3',
    meaning:
      'On-chain assets a deposit can actually arrive in — the ones this estate runs a follower for and will credit. Deliberately NOT the custodied-chain count above, which is what the ledger can supervise and the oracle can price. No codes are restated here; `chains` restated its codes and they went stale within the week.',
    source: 'contracts/packages/chain/src/index.ts — CREDITABLE_ASSETS',
  },

  /**
   * The same three, spelled the way a sentence spells them.
   *
   * Through the same name lookup `chainNames` uses, against the same upstream `CHAINS` table, so
   * the depositable list and the modelled one cannot spell one chain two ways. A plain comma list
   * with no article, for the reason recorded on `chainNames`.
   */
  creditableChainNames: {
    rendered: 'EMBER, Bitcoin, Litecoin',
    meaning:
      'The assets a deposit can arrive in, written as prose in CREDITABLE_ASSETS order, using each chain\'s own `name` from the CHAINS table — "Hearth" being the exception, since the asset a reader holds is EMBER and the network it settles on is Hearth. Derived from the same array as the count beside it, so the sentence and the number in it cannot disagree.',
    source: 'contracts/packages/chain/src/index.ts — CREDITABLE_ASSETS',
  },

  /**
   * ── WHAT FORESIGHT WILL TAKE A STAKE IN, WHICH IS NOT THE SAME LIST AS THE ONE ABOVE ─────────
   *
   * These two exist because the two above were used for both questions, and the questions came
   * apart. The Foresight page read "You can stake in any of the 8 chains the platform supports —
   * EMBER, Bitcoin, Ethereum, Ethereum Classic, Litecoin, Dogecoin, Solana, XRP Ledger", and both
   * halves were correctly DERIVED — from `ON_CHAIN_ASSETS`, which answers "which chains does the
   * estate model" and not "which assets will Foresight accept". Those were nearly the same set
   * when the sentence was written.
   *
   * Measured on the live estate 2026-08-09, against Foresight's own `stake_assets` table:
   *
   *     enabled   EMBER, BTC, ETH, LTC
   *     disabled  a Tether-on-Ethereum token row, which is served with its refusal in prose
   *     absent    ETC, DOGE, SOL, XRP
   *
   * ETC, DOGE, SOL and XRP are not disabled rows carrying a reason. They are not rows at all, so a
   * bettor arriving with one is answered `404 unknown_asset` by a page that had just invited them
   * by name. **Being nameable by the estate and being accepted at the door are different facts,
   * and only the second belongs in a promise.** The derivation is what made it degrade rather than
   * merely be wrong: every chain `contracts` adds enlarges a promise Foresight has not made, with
   * a green suite each time — DOGE and ETC were added the week this was found, and the sentence
   * grew from six chains to eight on its own.
   *
   * So they are re-pointed rather than hand-typed. `micro-foresight` was given a declaration for
   * exactly this — `STAKE_ASSET_REGISTRY`, checked byte-for-byte in both directions against the
   * table its own migrations produce on an empty database (`foresight/src/migrations.test.ts`) —
   * and both values here are recomputed from the ENABLED rows of it. Neither the count nor the
   * names are typed anywhere on this site, which is the whole point: an operator enabling a fifth
   * asset changes both halves of both sentences and nobody has to remember.
   *
   * ── WHAT THEY DO NOT CLAIM ───────────────────────────────────────────────────────────────────
   *
   * `enabled` is an operator switch, and `foresight/src/stakeassets.ts` says so: a row can be
   * flipped in a live database without touching that repository. So this publishes what Foresight
   * SHIPS prepared to take, which is the strongest statement a file can make and is the one a
   * reader of a marketing page needs. It is not a live reading of one deployment.
   */
  stakeAssets: {
    rendered: '4',
    meaning:
      'Assets Foresight will accept a stake in: the enabled rows of its stake-asset registry. Deliberately NOT the custodied-chain count above — an asset the estate can name is not an asset the stake door will take, and the two are off by four. No codes are restated here; `chains` restated its codes and they went stale within the week.',
    source: 'foresight/src/stakeassets.ts — STAKE_ASSET_REGISTRY, the rows declared enabled',
  },

  /**
   * The same rows, spelled the way a sentence spells them.
   *
   * Registered and derived for the reason `chainNames` was: a derived count beside a typed list is
   * worse than two stale halves, because the moving half is evidence that somebody is looking. The
   * rendered form carries no digits, so the content scan has nothing to say about it — it earns
   * its place by being recomputed in `estate-claims.test.ts` and by having to appear verbatim in
   * published copy.
   *
   * The names are the registry's own `displayName` values, which are the migrations' own words and
   * are what a user is served at the stake door. A plain comma list, for the same reason as above:
   * whether a name takes an article is an English fact that is not in the data, so the copy sets
   * the list off with dashes rather than the derivation guessing.
   */
  stakeAssetNames: {
    rendered: 'EMBER, Bitcoin, Ethereum, Litecoin',
    meaning:
      'The assets Foresight will take a stake in, written as prose in the registry\'s own order, using each row\'s own display name. Derived from the same rows as the count beside it, so the sentence and the number in it cannot disagree.',
    source: 'foresight/src/stakeassets.ts — STAKE_ASSET_REGISTRY, the rows declared enabled',
  },
  /**
   * The three figures a developer needs before they can point a wallet or a deployment tool at
   * Hearth. They are published because "it is EVM-compatible" is unverifiable and a chain id is
   * not: a reader can add the network, send a transaction and find out.
   *
   * All three are read out of `CHAINS.EMBER`, which is the same declaration the custody and
   * settlement services sign against, so the site cannot advertise a network the estate does not
   * use.
   */
  emberChainId: {
    rendered: '7411',
    meaning: 'Hearth main network chain id, for EIP-155 replay protection and for adding the network to a wallet.',
    source: 'contracts/packages/chain/src/index.ts — CHAINS.EMBER.chainId.mainnet',
  },
  emberTestnetChainId: {
    rendered: '7412',
    meaning:
      'Hearth test network chain id. Separate from the main network by requirement rather than convention: one id shared between them would make every test transaction replayable on the main network.',
    source: 'contracts/packages/chain/src/index.ts — CHAINS.EMBER.chainId.testnet',
  },
  emberDecimals: {
    rendered: '18',
    meaning:
      'Decimal places in one EMBER. Eighteen because every piece of Ethereum tooling assumes eighteen for a native asset, and a chain that picks a different number displays wrong in wallets it never tested against.',
    source: 'contracts/packages/chain/src/index.ts — CHAINS.EMBER.decimals',
  },
  products: {
    rendered: '6',
    meaning:
      'Products in the surface registry. Never written as a digit in copy — it is counted from PRODUCTS at runtime and SPELLED AS A WORD, so a sixth product is a registry entry rather than a copy-editing pass. The entry exists so the count has a source, and so the test that compares it to the registry has something to compare.',
    source: '@cloudsforge/ui — PRODUCTS, derived from SURFACES in ui/packages/ui/src/surfaces.ts',
  },
  platformTests: {
    rendered: '11',
    meaning:
      'The statements that define "one platform". Not a score and not a boast: the count of rows in the table this site reproduces.',
    source: 'docs/ecosystem/01-product-vision.md — the numbered rows of the table in §2',
  },
  httpNotFound: {
    rendered: '404',
    meaning:
      'The status an unknown address on this site answers with. Published in copy because the site makes a point of it, and it is only worth making if the number is the real one.',
    source: 'nginx.conf — `error_page 404 /index.html`, asserted by test/routes.test.ts',
  },
  httpOk: {
    rendered: '200',
    meaning:
      'The status a single-page application usually answers an unknown address with, and the one this site refuses to.',
    source: 'nginx.conf — the enumerated `location` blocks, asserted by test/routes.test.ts',
  },
  /**
   * The artwork licence's version.
   *
   * Registered rather than typed because "CC BY" without a version is not a licence — the versions
   * differ on attribution and on what a downstream licensee may do — and a reader who has to guess
   * which one applies has been told nothing. It is cited to the file that draws the boundary
   * between the two grants rather than to either licence text, because the boundary is the part
   * that is easy to get wrong and the part the terms page is actually about.
   */
  assetLicenceVersion: {
    rendered: '4.0',
    meaning:
      'The version of the Creative Commons Attribution licence the estate\'s generated artwork is published under, as distinct from the MIT licence on the code. MIT speaks of "the Software" throughout, and an image is not software.',
    source:
      'brand/TRADEMARKS.md — "not covered by the MIT licence in `LICENSE` or by the CC BY 4.0 licence in `LICENSE-ASSETS`", the sentence that separates the two grants and reserves the marks from both',
  },
} as const satisfies Record<string, Claim>

export type ClaimKey = keyof typeof CLAIMS

/**
 * The rendered form of a claim, for interpolation into copy.
 *
 * Copy writes `${claim('emberConfirmations')} blocks`, never `60 blocks`. The indirection is the
 * whole mechanism: a number that reaches the page without passing through here fails the content
 * scan, and a number that passes through here has a source beside it.
 */
export function claim(key: ClaimKey): string {
  return CLAIMS[key].rendered
}

/**
 * Every distinct digit-run this site may print.
 *
 * Consumed by `test/content.test.ts`, which is the only caller. It is derived rather than listed
 * so that the allowlist cannot fall behind the register.
 */
export function allowedNumbers(): ReadonlySet<string> {
  return new Set(Object.values(CLAIMS).map((c) => c.rendered))
}
