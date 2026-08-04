/**
 * How far along a surface is — the vocabulary, and the evidence each value is assigned from.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * THIS REPLACES A THREE-VALUE SCALE, AND THE ARGUMENT AGAINST GROWING IT IS WORTH ANSWERING.
 *
 * What was here read `'built' | 'in-build' | 'not-built'`, with this beside it:
 *
 *   "Three values, not five. A scale with more steps invites the halfway-house label that means
 *    nothing — the estate has already learned that 'in progress' and 'nearly done' are the same
 *    status reported twice."
 *
 * That argument is correct and it is not an argument against this file, because it is an argument
 * about a DIFFERENT AXIS. "In progress" and "nearly done" are both estimates of how much work is
 * left; neither can be checked, so a scale made of them gets longer without getting more truthful,
 * and the extra rungs are where the flattery goes.
 *
 * Every value below instead names an EVENT THAT EITHER HAPPENED OR DID NOT:
 *
 *   * are its containers in `deploy/compose/docker-compose.estate.yml`?
 *   * does `beacon/src/browser/smoke.ts` drive a real browser at it through the real gateway?
 *   * is there an address on the public internet?
 *
 * So the scale is still three values. What changed is that they are now three THRESHOLDS instead
 * of three degrees of doneness — which is the fix, because the old scale was short AND wrong: six
 * of seven surfaces sat on "Being built" while every one of them was deployed, healthy, and walked
 * by the smoke tier in a real browser.
 *
 * ── There is deliberately no "not built" and no "being built" ─────────────────────────────────
 *
 * A four-value draft of this file carried one, and it was cut when the thing it was reserved for
 * turned out not to need it. The self-custody wallets were the candidate — the owner's own reading
 * was that they are the one part still being built — and every one of the four repositories
 * behind them is CI-green, builds a real artefact, and carries a test suite that fails rather than
 * skips. They are not being built. They are built and not shipped, which is `tested`, and saying
 * "being built" would have been the same class of error as the one this file exists to fix, just
 * in the direction that happens to sound humble.
 *
 * A value nothing can be is a value somebody will eventually reach for because it is there. If
 * something genuinely unstarted is ever published on this site, the honest move is to add the
 * value back in the same commit as the thing — not to keep a slot warm for it.
 *
 * ── The failure this vocabulary is designed against ───────────────────────────────────────────
 *
 * A single word "Built" is the danger, not the shortage of words. **Nothing here serves the
 * public.** The services run composed against real databases, the chain is a testnet on one
 * machine, and no surface has a user who is not the owner. A chip reading "Built" on a crypto
 * platform's marketing site is read as "live, and I may sign up", and a reader who acts on that
 * reading has been misled by a word that was technically true.
 *
 * So no label is a bare past participle. Each is a phrase that says where the thing IS:
 * "Built, not shipped" → "Running in-house" → "Open to the public". A stranger reading only the
 * chip gets the right idea, which is the only test a status label has to pass.
 *
 * "Not shipped" rather than "not deployed" because the scale has to fit two shapes of thing. A
 * service is deployed; a desktop application, a browser extension and a phone application are
 * released. "Shipped" is the word that covers both and is false for both until somebody outside
 * the project can get hold of it.
 *
 * ── Colour is never the only channel, and neither is the glyph ────────────────────────────────
 *
 * The scale carries three independent channels: a fill ramp (◐ ◕ ●), a phrase, and a colour. The
 * glyphs are a monotone progression rather than three unrelated symbols, so their ORDER is legible
 * even to a reader who cannot resolve the difference between two of them; the phrase is the
 * channel that carries the meaning; and the colour is the one that carries none of it alone.
 * `STAGE_MEANING` below is rendered in full in the legend on the build page — the scale explains
 * itself on the page rather than in this comment.
 */

/**
 * The three states, in order.
 *
 * `'open'` has no member and that is the most important entry in the table. A scale whose top rung
 * is the one everybody is standing on tells a reader nothing about how far there is to go; leaving
 * "Open to the public" visible and empty is what makes "Running in-house" read as the honest
 * halfway house it is. `test/estate-stages.test.ts` asserts that nothing claims it, and will keep
 * asserting that until there is a public address to point at.
 */
export type Stage = 'tested' | 'running' | 'open'

/** Most finished first. The build page sorts by this, and the legend reads in this order. */
export const STAGE_ORDER: readonly Stage[] = ['open', 'running', 'tested']

/** The chip's words. Never a bare participle — see the header for why "Built" alone is a lie. */
export const STAGE_LABEL: Readonly<Record<Stage, string>> = {
  tested: 'Built, not shipped',
  running: 'Running in-house',
  open: 'Open to the public',
}

/**
 * A glyph per stage, so the three are separable without colour.
 *
 * A fill ramp rather than three unrelated marks: a reader who cannot tell ◐ from ◕ at a glance can
 * still tell that one is fuller than the other, which is the property that matters.
 */
export const STAGE_GLYPH: Readonly<Record<Stage, string>> = {
  tested: '◐',
  running: '◕',
  open: '●',
}

/**
 * What each stage actually asserts, in a sentence, rendered in the legend.
 *
 * These are the definitions `test/estate-stages.test.ts` implements. If a sentence here and the
 * derivation there disagree, the sentence is the one a reader believed, so the test is written to
 * fail rather than the sentence to be quietly widened.
 */
export const STAGE_MEANING: Readonly<Record<Stage, string>> = {
  tested:
    'The code exists and its own tests pass, and nothing runs it where a person could reach it. Passing your own tests is not the same as having been run alongside everything else.',
  running:
    'Deployed in the estate and reached by a real browser through the real gateway, intercepting nothing. It has no address on the public internet.',
  open: 'Anyone can use it. Nothing is here, and that is the honest state of this ecosystem today.',
}

/**
 * What has to be true, in the estate, for a surface to be called `running`.
 *
 * ── This is a claim, so it is derived rather than asserted ────────────────────────────────────
 *
 * Each entry names the compose services that make the surface work. `test/estate-stages.test.ts`
 * opens `deploy/compose/docker-compose.estate.yml` and requires every one of them to be a declared
 * service, and opens `beacon/src/browser/smoke.ts` and requires the surface key to be in
 * `SMOKE_SURFACES`. A surface missing either cannot be published as `running`, whatever this file
 * says about it.
 *
 * Both halves are load-bearing and neither is sufficient. A container declared in compose proves
 * something was meant to run; only the smoke tier — which drives real Chromium through the real
 * gateway and fails structurally if a request intercept ever appears in it — proves a person could
 * have opened it. The estate has already shipped surfaces that were deployed, healthy by their own
 * probe, and completely unstyled in a browser.
 *
 * The service names are NOT guessed from the surface key. `create` is served by `mint` and
 * `mint-web`, and `network` by `network-site` rather than by anything called network — a rule that
 * derived the name from the key would have been wrong on two of seven and right for the wrong
 * reason on the rest.
 */
/**
 * The self-custody wallet repositories, which are `tested` and must never become `running`.
 *
 * Declared so the floor under them is derived rather than asserted: `test/estate-stages.test.ts`
 * requires that none of these is a service in the estate's deployment file and that none is a
 * surface the smoke tier drives. They cannot be published as running while that holds, which is
 * the direction the guard needs to point — the risk with these is overstatement, exactly as it was
 * with the seven surfaces above.
 *
 * **`wallet` is not on this list and must never be added to it.** `wallet` is the CUSTODIAL wallet
 * service, it is a container in the estate, and it is a different thing that happens to share a
 * noun. The two make opposite promises about who holds the keys, so conflating them on a marketing
 * page would be the most expensive possible naming mistake.
 */
export const SELF_CUSTODY_REPOS: readonly string[] = [
  'hearth-wallet-core',
  'wallet-desktop',
  'wallet-extension',
  'wallet-mobile',
]

export const RUNS_ON: Readonly<Record<string, readonly string[]>> = {
  hub: ['hub-web', 'hub-api'],
  network: ['network-site', 'explorer-web', 'faucet', 'indexer'],
  create: ['mint-web', 'mint'],
  trade: ['trade-web', 'trade'],
  foresight: ['foresight-web', 'foresight'],
  market: ['market-web', 'market'],
  worlds: ['worlds-web', 'worlds'],
}
