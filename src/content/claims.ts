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
 * `source` is a path into this estate, with a line number where the value is a constant.
 *
 * **It used to be documentation rather than an assertion, and that is exactly how it rotted.**
 * The previous revision of this header said so in as many words — "the repositories it names are
 * not checked out when this suite runs in CI, so no test can open them" — and by the time anybody
 * looked, FOUR of the eleven citations pointed at the wrong line and one pointed at a file that
 * has never existed in the repository it names. Nothing was lying except the line numbers, and
 * nothing anywhere could have noticed.
 *
 * So the citations are now checked out and read. `test/estate-claims.test.ts` resolves every
 * `source` below against the sibling repositories, and for all but two of the entries it
 * RECOMPUTES the value from that file rather than reading it back. `.github/workflows/ci.yml`
 * checks out `micro-contracts` and `micro-docs` alongside `micro-ui` so the check runs in CI with
 * teeth rather than skipping. The two entries that cannot be recomputed are exempt **by name**,
 * with the reason recorded beside them — never by category, because a blanket exemption is how
 * this drifted the first time.
 *
 * ── What is deliberately NOT here ─────────────────────────────────────────────────────────────
 *
 * **No prices.** Not one. `docs/ecosystem/15-monetisation-model.md` records indicative prices for
 * fourteen revenue lines, and three of them were checked against the services that now implement
 * them. All three disagreed, and re-checking them for this revision found the disagreements intact
 * and one of the citations stale:
 *
 *   - the model lists three token-deployment tiers at 1,500 / 4,000 / 9,000 Shards
 *     (`15-monetisation-model.md:103-105`, §3.2); `mint/src/env.ts:300` has ONE price,
 *     `MINT_DEPLOY_PRICE_SHARDS`, defaulting to 2,500. **This file previously cited
 *     `mint/src/env.ts:243`, which is not that line.**
 *   - the model lists a 200 bps conversion spread (`15-monetisation-model.md:85`, §3.7);
 *     `pricing/src/env.ts:148` defaults `PRICING_CONVERSION_SPREAD_BPS` to 100;
 *   - the model lists a 15% trading performance fee as a constant (§3.6); in `trade/src/fees.ts`
 *     the rate is per-bot (`bot.feeBps:430`), not a published platform number.
 *
 * A price that is wrong on the marketing site is quoted back at support by the customer who read
 * it, and they are right to. None of the fourteen is stable enough to publish, so the site says
 * what is FREE — which is a policy of the platform rather than a number in a config file, and is
 * stated as such in `docs/ecosystem/01-product-vision.md` §6 and `15-monetisation-model.md` §1 —
 * and says plainly that prices are not published yet.
 *
 * **No Shards, anywhere, ever again.** Shards are being removed estate-wide
 * (`docs/ecosystem/23-tessera.md` §8.1). A Shard was a US cent wearing a chain's clothes — its own
 * `ChainSpec` in `contracts/packages/chain/src/index.ts:112-113` says `family: 'evm', // never
 * used on chain` — and the rule underneath the removal is the owner's: **no balance may exist that
 * the chain does not back.** A Shard balance sat outside that guarantee by construction. The money
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
  /** Where the value comes from: a path in this estate, with a line where there is one. */
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
      'docs/ecosystem/23-tessera.md:747 — "A Spark is 10⁻⁶ EMBER — one micro-EMBER, exactly 10¹² wei", and the sentence §8.1 calls the most important in the section, at :750: "Sparks is a display denomination of EMBER. It is not a second assetCode, and it must never become one."',
  },
  emberConfirmations: {
    rendered: '60',
    meaning: 'Blocks an EMBER deposit waits before it is spendable.',
    source: 'contracts/packages/chain/src/index.ts:55 — CHAINS.EMBER.confirmations',
  },
  emberConfirmationMinutes: {
    rendered: '15',
    meaning:
      'The same depth said as a wait, and the block time it is computed from — 60 blocks at 15 seconds is 15 minutes, which is the one coincidence in this register and is why the derivation recomputes it rather than reading it back. "60 blocks" tells a reader nothing.',
    source:
      'contracts/packages/chain/src/index.ts:45 — "~15 minutes at a 15-second block time", the depth Hearth publishes to exchanges in its docs/exchange-integration.md §4',
  },
  emberReorgAlarmDepth: {
    rendered: '5',
    meaning:
      'A reorg this deep halts crediting for the chain and pages an operator. Deliberately below the credit depth: a shallower reorg cannot have produced a wrong credit.',
    source: 'contracts/packages/chain/src/index.ts:56 — CHAINS.EMBER.reorgAlarmDepth',
  },
  chains: {
    rendered: '5',
    meaning: 'On-chain assets the platform custodies: EMBER, BTC, ETH, SOL and XRP.',
    source: 'contracts/packages/chain/src/index.ts:123-129 — ON_CHAIN_ASSETS',
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
    source: 'docs/ecosystem/01-product-vision.md:49-59 — the numbered rows of the table in §2',
  },
  accentSeparationBefore: {
    rendered: '4.1',
    meaning:
      'Worst all-pairs separation of the accent set this one replaced, as ΔE under normal vision. Below about 10 two colours are not reliably distinguishable, so the switcher was telling six products apart by a channel that told two apart.',
    source:
      'ui/packages/ui/src/tokens.css:454 — "Per-product accents": "the worst all-pairs distance was #ff5a1e to #e8622c at dE 4.1 under normal vision and dE 1.3 under protanopia"',
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
  accentSeparation: {
    rendered: '36.1',
    meaning:
      'Worst ADJACENT separation across the six product accents under normal vision, as ΔE. Adjacent is the honest gate because the product switcher is a vertical list, so only neighbours ever touch.',
    source:
      'ui/packages/ui/src/tokens.css:472 — "worst ADJACENT dE 36.1 (#2a9e93|#b28e1e, normal vision)", reproducible with ui/scripts/validate_palette.mjs',
  },
  accentSeparationAllPairs: {
    rendered: '5.6',
    meaning:
      'Worst ALL-PAIRS separation of the same six accents, as ΔE under deuteranopia — the figure that is WORSE than the set it replaced, and is published beside the flattering one for that reason. Network\'s red and Create\'s gold are near-identical to a deuteranopic reader; they are never adjacent in the switcher, and colour is never the only channel.',
    source:
      'ui/packages/ui/src/tokens.css:473 — "worst ALL-PAIRS dE 5.6 (#d6412f|#b28e1e, deuteranopia)", reproducible with ui/scripts/validate_palette.mjs',
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
