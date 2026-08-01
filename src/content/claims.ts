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
 * ── What a source is ──────────────────────────────────────────────────────────────────────────
 *
 * `source` is a path into this estate, with a line number where the value is a constant. It is
 * documentation, not an assertion: the repositories it names are not checked out when this suite
 * runs in CI, so no test can open them. What IS asserted is that the field is present and
 * well-formed, that nothing in the register is unused, and — for the three values that are also
 * carried by `@cloudsforge/ui`, which this app does depend on — that the number below equals the
 * one the design system holds. Where a machine check is possible it is made; where it is not, the
 * citation is the audit trail.
 *
 * ── What is deliberately NOT here ─────────────────────────────────────────────────────────────
 *
 * **No prices.** Not one. `docs/ecosystem/15-monetisation-model.md` records indicative prices for
 * fourteen revenue lines, and three of them were checked against the services that now implement
 * them before this file was written. All three disagreed:
 *
 *   - the model lists three token-deployment tiers at 1,500 / 4,000 / 9,000 Shards (§3.2);
 *     `mint/src/env.ts:243` has ONE price, `MINT_DEPLOY_PRICE_SHARDS`, defaulting to 2,500;
 *   - the model lists a 200 bps conversion spread (§3.7); `pricing/src/env.ts:148` defaults
 *     `PRICING_CONVERSION_SPREAD_BPS` to 100;
 *   - the model lists a 15% trading performance fee as a constant (§3.6); in `trade/src/fees.ts`
 *     the rate is per-bot (`bot.feeBps`), not a published platform number.
 *
 * A price that is wrong on the marketing site is quoted back at support by the customer who read
 * it, and they are right to. None of the fourteen is stable enough to publish, so the site says
 * what is FREE — which is a policy of the platform rather than a number in a config file, and is
 * stated as such in `docs/ecosystem/01-product-vision.md` §6 and `15-monetisation-model.md` §1 —
 * and says plainly that prices are not published yet.
 *
 * **No traffic, no users, no uptime.** Nothing is deployed
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
  shardsPerUsd: {
    rendered: '100',
    meaning: 'Shards per US dollar. The peg is fixed, not a quoted rate.',
    source: 'contracts/packages/chain/src/index.ts:146 — export const SHARDS_PER_USD = 100n',
  },
  emberConfirmations: {
    rendered: '60',
    meaning: 'Blocks an EMBER deposit waits before it is spendable.',
    source: 'contracts/packages/chain/src/index.ts:56 — CHAINS.EMBER.confirmations',
  },
  emberConfirmationMinutes: {
    rendered: '15',
    meaning:
      'The same depth said as a wait. 60 blocks at a 15-second block time. "60 blocks" tells a reader nothing.',
    source:
      'contracts/packages/chain/src/index.ts:44 — "~15 minutes at a 15-second block time", the depth Hearth publishes to exchanges in its docs/exchange-integration.md §4',
  },
  emberReorgAlarmDepth: {
    rendered: '5',
    meaning:
      'A reorg this deep halts crediting for the chain and pages an operator. Deliberately below the credit depth: a shallower reorg cannot have produced a wrong credit.',
    source: 'contracts/packages/chain/src/index.ts:57 — CHAINS.EMBER.reorgAlarmDepth',
  },
  chains: {
    rendered: '5',
    meaning: 'On-chain assets the platform custodies: EMBER, BTC, ETH, SOL and XRP.',
    source: 'contracts/packages/chain/src/index.ts:120-126 — ON_CHAIN_ASSETS',
  },
  products: {
    rendered: '6',
    meaning:
      'Products in the surface registry. Never written as a digit in copy — it is counted from PRODUCTS at runtime and spelled as a word, so a sixth product is a registry entry rather than a copy-editing pass. The entry exists so the count has a source, and so the test that compares it to the registry has something to compare.',
    source: '@cloudsforge/ui — PRODUCTS, derived from SURFACES in ui/packages/ui/src/surfaces.ts',
  },
  platformTests: {
    rendered: '11',
    meaning:
      'The statements that define "one platform". Not a score and not a boast: the count of rows in the table this site reproduces.',
    source: 'docs/ecosystem/01-product-vision.md §2',
  },
  accentSeparationBefore: {
    rendered: '4.1',
    meaning:
      'Worst all-pairs separation of the accent set this one replaced, as ΔE under normal vision. Below about 10 two colours are not reliably distinguishable, so the switcher was telling six products apart by a channel that told two apart.',
    source:
      'ui/packages/ui/src/tokens.css — "Per-product accents": "#ff5a1e to #e8622c at dE 4.1 under normal vision and dE 1.3 under protanopia"',
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
    rendered: '17',
    meaning:
      'Worst adjacent colour separation across the five product accents under normal vision, as ΔE. The set it replaced measured 4.1, at which point two products were not reliably distinguishable.',
    source:
      'ui/packages/ui/src/tokens.css — "Per-product accents", reproducible with ui scripts/validate_palette.js',
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
