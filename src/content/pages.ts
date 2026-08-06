/**
 * The copy for every page that is not a product page.
 *
 * Data, not components — the reasons are in the header of `./products.ts`. Everything here is
 * readable by `test/content.test.ts`, which is what keeps the numbers register honest and what
 * stops a hostname being typed into a sentence.
 *
 * Sources are named inline where a passage is a restatement of something the estate decided
 * elsewhere. They are for the person editing this file; none of them is rendered.
 */
import { claim } from './claims.ts'
import { nextProductOrdinal, productCount, sentenceCase, surfaceCount } from './products.ts'
import type { SurfaceKey } from '@cloudsforge/ui'

/* ─────────────────────────────── home ─────────────────────────────── */

export const HOME = {
  /**
   * The positioning line. Everything else on the site is a footnote to it.
   *
   * ── This replaced "One crypto world." ───────────────────────────────────────────────────────
   *
   * Three things were wrong with that line and only the third is fatal. It said "crypto", which is
   * the category and not the thing; it said "world", which this estate has already given a
   * specific meaning to — a Forge Worlds season is a world, and the front door borrowing the word
   * for something else costs the word; and it named nothing. A stranger who read it learned that
   * we are in crypto, which they could tell from the address.
   *
   * The estate has exactly one thing at the centre of it that nobody else has: a proof-of-work
   * currency anybody can produce on a laptop, which is also the funding rail for everything built
   * around it. So the line names the currency and then says there is more than the currency. That
   * is the whole positioning, and it is checkable — `test/content.test.ts` asserts the spine names
   * EMBER, so a future rewrite that drifts back to a category noun fails rather than ships.
   */
  spine: 'EMBER, and everything built on it.',
  /**
   * The search-result and link-preview description.
   *
   * Separate from `standfirst` on purpose. A standfirst is written to be read under a headline
   * that is already on screen; a description is read with no headline and inside a length budget,
   * and reusing one as the other produces something truncated mid-clause. `test/meta.test.ts`
   * holds every blurb on this site to that budget.
   */
  blurb:
    'Mine EMBER in your browser, then spend it across seven products on one account and one wallet. Stake in six currencies, launch a token, trade, sell, and play.',
  /**
   * The verbs, in the order the story is told. NOT the registry's order, which is tuned for the
   * colour separation of neighbouring switcher entries and says so in capitals.
   * Source: docs/ecosystem/01-product-vision.md §1.
   */
  verbLine: 'Mine it, hold it, make it, trade it, sell it, play in it.',
  standfirst:
    'Open the mining page and press start: your browser earns EMBER on the computer you are reading this on, paid to a key that never leaves your machine. Then spend it across seven products that share one account, one wallet and one ledger — take a position on a future event using Bitcoin or five other currencies, launch a token, backtest a strategy, sell what you make, play a world that keeps what you built. The chain underneath runs a real Ethereum machine, so the wallets and tools you already have work here on day one.',
  /**
   * What EMBER does, in the four steps of its life. Source: the diagram in
   * docs/ecosystem/01-product-vision.md §1, flattened into four steps because the branch in the
   * middle of it is the ecosystem grid and does not need drawing twice.
   *
   * ── This block was headed "The loop is the product" ─────────────────────────────────────────
   *
   * It was removed on the owner's instruction, and the instruction was right for a reason worth
   * writing down rather than just obeying. "The loop is the product" is a sentence about the
   * ARCHITECTURE, addressed to somebody who has already been convinced there is something here —
   * it argues that the parts are joined up, which is a second-order virtue. A reader on the front
   * page has not yet been told what the first-order thing is.
   *
   * It also quietly demoted EMBER to one arrow of four. EMBER is not a step in a circuit; it is
   * the thing the circuit exists to move, the only part of this estate that could not be
   * assembled out of someone else's components, and the reason a person would care about any of
   * the rest. So the four steps survive — they were good, and each is still something that has to
   * actually work — under a heading about the currency instead of about the diagram.
   */
  ember: {
    // The steps carry no ordinal of their own. The rail numbers them from their position, so a
    // step inserted in the middle renumbers the rest — the failure mode of typed ordinals is two
    // number threes, and it is the sort of thing that survives review because nothing is wrong
    // with either line on its own.
    title: 'It starts with the currency',
    lede: 'You can produce EMBER yourself rather than buy it, and there are places to spend it that do not exist to trade it. Each step below is something that has to genuinely work for that to be true.',
    steps: [
      {
        verb: 'Mine',
        accentKey: 'network' as SurfaceKey,
        title: 'Produce the currency yourself',
        body: 'EMBER is proof-of-work money mined on ordinary processors. The machine you are reading this on is the whole setup — there is nothing to buy first.',
      },
      {
        verb: 'Hold',
        accentKey: 'hub' as SurfaceKey,
        title: 'Deposit it into an account that is yours',
        body: `Deposits are detected on chain and credited at a published depth — ${claim('emberConfirmations')} blocks for EMBER, and the depth every other chain warrants for its own reasons. One ledger, double-entry, one portfolio.`,
      },
      {
        verb: 'Spend',
        accentKey: 'site' as SurfaceKey,
        title: 'Use it everywhere in the ecosystem',
        body: `The money is EMBER itself. What you see is the Spark — ${claim('sparksPerEmber')} Sparks to one EMBER — which is a shorter way of writing the same balance and never a second currency with its own rate. One asset, one ledger, and no balance anywhere that the chain does not back.`,
      },
      {
        verb: 'Leave',
        accentKey: 'network' as SurfaceKey,
        title: 'Take it back out whenever you want',
        body: 'Withdraw on chain, to your own address, or export the key and stop asking. A user being able to leave with their assets is a product requirement here, not a concession.',
      },
    ],
  },
  /**
   * The product grid's heading and its two asides.
   *
   * These three sentences were JSX literals in `src/pages/home.tsx` until the count in them went
   * stale — see the header of `./products.ts` for what happened and why a word counts as a number.
   * They are here, and derived, so that the copy walk in `test/content.test.ts` can read them and
   * so that neither can be wrong again.
   */
  products: {
    title: 'Where the EMBER goes',
    lede: `${sentenceCase(productCount())} places to spend it, on one account. Each is somewhere to do something, not a feature of the last one.`,
    hubAside: `It is not a ${nextProductOrdinal()} destination. It is the thing the other ${productCount()} are standing on.`,
  },
  /** The one-account promise, in the terms a reader can check. */
  spans: {
    title: 'One account spans all of it',
    lede: 'A single sign-in, a single wallet and a single history. Nothing about who you are or what you own is trapped inside one product.',
    points: [
      {
        title: 'Sign in once',
        body: 'One identity issues the tokens every surface verifies against one key set. There is no per-destination account, because there is only one account.',
      },
      {
        title: 'One wallet',
        // The names are a claim for the same reason the count is: they were typed here, so the
        // count re-derived itself to 6 while the list beside it still read five chains. See the
        // note on `chainNames` in claims.ts.
        body: `${claim('chains')} chains behind one balance — ${claim('chainNames')} — with the same receive and send screens whichever part of the ecosystem you arrived from.`,
      },
      {
        title: 'One history',
        body: 'Every account, money, asset and game event on one timeline, kept for as long as the account exists. Not one feed per destination, joined by hand.',
      },
    ],
  },
  closing: {
    title: 'Built in the open, with the state of it written down',
    body: 'Most of this ecosystem is built and running, and none of it is open to the public. Rather than pick whichever half of that sentence flatters, there is a page that says exactly where each part stands and how each of those states is checked.',
  },
} as const

/* ────────────────────────── products index ────────────────────────── */

/**
 * The products index page's own copy.
 *
 * Same reason as `HOME.products`: these were JSX literals reading "Six surfaces, one account" and
 * "The five products" while the registry held six products and seven pages. Both were wrong, in
 * opposite directions, on the same screen.
 */
export const PRODUCTS_INDEX = {
  eyebrow: 'The ecosystem',
  headline: `${sentenceCase(surfaceCount())} surfaces, one account`,
  standfirst: [
    `${sentenceCase(productCount())} destinations a person chooses between, and the control centre they all sit on. Each carries the state it is actually in, derived from the estate rather than typed in here.`,
  ],
  controlCentreTitle: 'The control centre',
  productsTitle: `The ${productCount()} destinations`,
  productsLede:
    'In the order the switcher lists them, which is chosen so that no two neighbouring accents can be confused with each other.',
  /**
   * ── This block said the opposite, and had said it for weeks ─────────────────────────────────
   *
   * It read: "A developer platform — projects, keys, webhooks, a software development kit and a
   * sandbox — is intended and is not built." At the time that was checked, `devplatform` and
   * `devportal-web` were both declared in `deploy/compose/docker-compose.estate.yml`, both
   * running healthy, and the developer surface was one of the sixteen `beacon smoke` drives in a
   * real browser through the real gateway.
   *
   * It is kept as a section rather than deleted because the shape of the mistake is the lesson.
   * The paragraph was written to be safe — announcing nothing is the conservative move — and the
   * estate then built the thing and nobody came back. **A cautious false statement is still a
   * false statement**, and this one had the additional property that no reader would ever go and
   * check it, because nobody investigates a claim that something does not exist.
   */
  notHere: {
    title: 'What has no page here, and why',
    body: [
      'The developer platform — projects, keys, webhooks, a software development kit and a sandbox — is built and running alongside everything else, on its own surface. It has no page in this section because this section is about where a person spends EMBER, and a developer platform is something a reader either already knows they want or does not; a marketing page would be the least useful thing to give them.',
      'This paragraph replaces one saying that the developer platform did not exist. It said so for weeks after it did, which is the mirror image of the failure the rest of this site is arranged against: a claim that understates is not a safe claim, it is a different wrong one, and nobody ever audits a sentence that promises less.',
    ],
  },
} as const

/* ───────────────────────────── platform ───────────────────────────── */

export const PLATFORM = {
  eyebrow: 'The platform',
  headline: 'What "one platform" has to mean',
  blurb:
    'One account, one wallet, one portfolio, one history — the statements that define a platform rather than a set of apps sharing a logo, published in full including the ones not yet true.',
  standfirst: [
    'The test is not whether the products share a logo. It is whether a specific set of statements about the account underneath them is true — and each one of them is either true or it is work.',
    'They are reproduced here in full, including the ones that are not done. A definition you only publish once you pass it is not a definition, it is a press release.',
  ],
  /**
   * Verbatim from docs/ecosystem/01-product-vision.md §2, minus the "Today" column.
   *
   * The column is left off DELIBERATELY. Its verdicts describe the estate as it stood when that
   * document was written, several of them have since changed, and a verdict that is stale is worse
   * than no verdict — a reader has no way to tell which. What is stable is the definition itself,
   * and the per-surface state lives on the build page where it is maintained.
   */
  tests: [
    'One account signs into everything, once.',
    'One identity — the same profile, handle and reputation everywhere.',
    'One wallet experience — the same receive, send and key screens whichever product you came from.',
    'One portfolio — a single number that is the truth about what you hold.',
    'One activity history — every account, money, asset, game and governance event on one timeline.',
    'One internal economy — the same units spend and earn identically in every product.',
    'Assets you create in one product are usable in the others.',
    'One set of notifications, with one preference page.',
    'One operator view — a support agent can answer any question from one place.',
    'One financial source of truth that reconciles against the chain.',
    'A third party can build on all of it.',
  ],
  testsNote: `${claim('platformTests')} statements. A phase of work that moves none of them from false to true does not ship.`,
  /** Source: docs/ecosystem/15-monetisation-model.md §1. */
  free: {
    title: 'The spine is free forever',
    rule:
      'The platform charges for work it does on your behalf, and for access to markets and capacity it operates. It never charges for custody, for movement, or for exit.',
    body: [
      'This is a boundary of kind rather than of size, and it is drawn once. A custodial platform\'s only real product is the belief that your money is where it says it is, and every charge levied on getting to your own money trades that belief for revenue at a terrible rate — the fee is small and recurring, and the loss is large and permanent.',
      'There is a second reason, which is arithmetic. One portfolio means a single number that is the truth about what you hold, and that is false the moment some balances sit behind a paywall. A metered portfolio is not a portfolio, it is a report.',
    ],
    items: [
      'The account, the profile, and signing into every product with it',
      'Wallets, on any supported chain, in any number',
      'Deposits, including detecting them and crediting them',
      'Transfers between CloudsForge accounts',
      'Withdrawal, less only what the network itself charges to carry it',
      'Private-key and recovery-phrase export',
      'The portfolio, the balances and their valuation',
      'The activity history, with no retention limit',
      'Notifications, on every channel',
      'Backtesting, the whole strategy catalogue, and paper trading',
      'Everything on testnet',
      'The block explorer, the node software, mining, and the faucet',
    ],
  },
  /** Source: docs/ecosystem/15-monetisation-model.md §3, and the check recorded in ./claims.ts. */
  prices: {
    title: 'Prices are not published here yet',
    body: [
      'There is a commercial model, it is written down, and it is specific about what each price costs in trust as well as in money. It is not on this page.',
      'The reason is that three of its figures were checked against the services that now implement them before this site was built, and all three had drifted — a tier structure that has since become a single price, a spread whose default halved, and a fee that turns out to be per-bot rather than a platform rate. A price that is wrong on a marketing site is a price a customer quotes back at support, and they are right to.',
      'So this site publishes what is free, which is a decision rather than a configuration value, and publishes a price when the code that charges it and the page that quotes it can be shown to agree.',
    ],
  },
  spine: {
    title: 'What is never a product',
    body: [
      'Identity, the ledger, custody, the indexer, policy, activity, notifications, billing, the gateway and the observability tools are spine. They are what make several products one platform, and their whole value is in being everywhere.',
      'Selling them is how a company ends up with nine things nobody wants. "CloudsForge ID" and "CloudsForge Wallet" are not products and will not become products.',
    ],
  },
} as const

/* ────────────────────────────── about ─────────────────────────────── */

/**
 * ── The headline here was "A small company that owns its whole stack" ─────────────────────────
 *
 * It was replaced on the owner's instruction, and both halves of it were wrong in a way worth
 * recording, because the replacement is not simply a bigger boast.
 *
 * "Small company" was the wrong SUBJECT. Nothing on this page is about a company — every sentence
 * under it is about what gets made, who owns what, and which trade-offs are settled in advance.
 * Leading with a size gave a reader a fact that predicts none of that, and it is the one fact on
 * the page that changes without anything else changing.
 *
 * "Owns its whole stack" was the wrong CLAIM. Owning a stack is a procurement position; plenty of
 * companies own theirs and it tells you nothing. What is actually unusual here is that the
 * currency at the bottom and the places to spend it at the top are the same project, so a promise
 * made about one is enforceable in the other — and that is a property of an ECOSYSTEM rather than
 * of a stack. A stack is what you stand on. An ecosystem is a set of things that need each other.
 *
 * The eyebrow moved with it, from "The company" to "The ecosystem", because an eyebrow that says
 * "company" over a headline that says ecosystem just restores the demotion one line higher up.
 */
export const ABOUT = {
  eyebrow: 'The ecosystem',
  headline: 'An ecosystem, from the currency up',
  blurb:
    'CloudsForge makes the currency, the rails that move it, the tools that create with it and the worlds that spend it. The principles it decides by, and what it refuses to become.',
  standfirst: [
    'CloudsForge makes the currency, the rails that move it, the tools that create things with it, and the worlds that spend it. Owning all four is the only reason it can make promises to a holder that anyone owning one of them cannot.',
    'That is what makes this an ecosystem rather than a stack. A stack is what a company stands on and it is nobody else\'s business; here the layers need each other in public — EMBER is worth mining because there is somewhere to spend it, and there is somewhere to spend it because EMBER funds the building of it.',
    'A processor-mineable coin that is the actual funding rail for real destinations is a story nobody else is telling. Most of the work is engineering, and none of the engineering is marketing.',
  ],
  /** Source: docs/ecosystem/01-product-vision.md §5. Tie-breakers, not slogans. */
  principles: {
    title: 'The tie-breakers',
    lede: 'When two designs are both defensible, the one that satisfies more of these wins. They exist to be applied under pressure, which is the only time a principle is worth anything.',
    items: [
      {
        title: 'The ledger owns value; the chain owns ownership',
        body: 'Where the two disagree the system stops and tells an operator. It never guesses, and it never picks the more convenient of the two answers.',
      },
      {
        title: 'A user can always leave with their assets',
        body: 'Key access for a wallet you own is a product requirement, not a favour. The safeguards around it are ours to design; the right is not ours to withhold.',
      },
      {
        title: 'Do not sell what cannot be delivered',
        body: 'Every item on sale has a code path that delivers it or it is withdrawn — from the API as well as from the interface, because the interface is not where the money is taken.',
      },
      {
        title: 'Nothing that widens authority ships before the thing that bounds it',
        body: 'The control and the capability land in the same change. A limit added afterwards is a limit that was absent for however long afterwards took.',
      },
      {
        title: 'Honest copy',
        body: 'Modelled, not a promise. Fees and slippage charged, because a strategy that only works for free does not work. This voice is an asset and it is protected deliberately.',
      },
      {
        title: 'No pay-to-win',
        body: 'Purchasable means cosmetic, convenience or access. Never power. Scarcity is the game, and a game whose scarcity can be bought out of has no story left in it.',
      },
      {
        title: 'One system, many accents',
        body: `A new product gets a colour, not a new visual language. The product accents were re-derived to be separable under colour-vision-deficiency simulation, and both halves of that measurement are published because only one of them flatters: neighbouring accents in the switcher now separate at ΔE ${claim('accentSeparation')} where the set they replaced managed ΔE ${claim('accentSeparationBefore')}, but the worst pair anywhere in the set — two colours the switcher never puts side by side — separates at only ΔE ${claim('accentSeparationAllPairs')} for a deuteranopic reader. That is a recorded trade, not a result, which is why colour is never the only channel.`,
      },
      {
        title: 'Reversibility beats cleverness',
        body: 'Every phase ships behind a flag with a stated rollback. Being able to undo it is worth more than being right about it.',
      },
    ],
  },
  /** Source: docs/ecosystem/01-product-vision.md §6. */
  rejects: {
    title: 'What this is not, and will not become',
    lede: 'Refusals are more informative than ambitions, because anyone can have an ambition.',
    items: [
      {
        title: 'An exchange',
        body: 'Order books, custody of other people\'s trading pairs, and market making are a different company with a different regulatory posture. Strategies settle against a price oracle on coins already held, and that is the boundary.',
      },
      {
        title: 'A vendor of its own plumbing',
        body: 'The account and the wallet are not sold, packaged, or tiered. They are the thing that makes the rest one platform.',
      },
      {
        title: 'A rewrite for its own sake',
        body: 'The chain and the custody model are correct for what they are and are being carried across unchanged. Saying so out loud beats discovering it halfway through a migration.',
      },
      {
        title: 'A new product before the existing ones work',
        body: 'There is one exception and it is argued rather than assumed: a marketplace, because "make" has no destination without "sell".',
      },
    ],
  },
} as const

/* ──────────────────────────── build status ────────────────────────── */

export const BUILD = {
  eyebrow: 'Build status',
  headline: 'Where each part actually is',
  blurb:
    'An honest account of where this ecosystem stands: what is open to the public, what runs in-house, what is still being written, and how new all of it is. Every state on this page is derived from the estate.',
  standfirst: [
    'This ecosystem has been rebuilt as a set of independent services and applications. They are built, they run together, and as of today they answer on the public internet — from one machine, with no failover and no backup anyone has ever restored.',
    'Both halves of that sentence are on this page because leaving the second one off is how a launch becomes a thing people trust with money, and leaving the FIRST one off is how this page spent weeks describing things as unbuilt while they were running.',
  ],
  /**
   * Source: docs/ecosystem/18-build-status.md §1.
   *
   * ── This block was rewritten because the estate outgrew it, which is the failure it warns about ─
   *
   * It used to be headed "Nothing is deployed" and to say, in order: that not one service was
   * running in an environment a person could reach, that "there is no gateway routing", that no
   * release had been exercised and no data had been migrated. Every one of those clauses is now
   * false. The estate runs as a local compose deployment behind a gateway with a real certificate
   * authority, against real databases and a real EMBER testnet, and a browser-driven smoke tier
   * drives that gateway intercepting nothing.
   *
   * The honest claim did not get smaller, it MOVED: from "nothing runs" to "nothing serves the
   * public". Softening it in place — leaving the heading and letting the sentences go stale — is
   * precisely how the estate this replaces ended up claiming EMBER credited at the chain tip long
   * after it stopped doing so. So the heading changed with the fact.
   *
   * ── AND IT MOVED AGAIN, ON 2026-08-05, FOR THE SAME REASON ─────────────────────────────────
   *
   * "Nothing is serving the public" is now false too. The estate went public: the surfaces answer
   * on the public internet under a publicly trusted certificate. The heading moved with the fact a
   * second time, and what replaces it is deliberately not a celebration — the honest claim is once
   * again the SMALL one, and it is now small in the other direction. Reachable is not established,
   * and this section's whole job is to keep those apart.
   *
   * The temptation this block now has to resist is the opposite of the old one. It is no longer
   * "leave a modest sentence up too long"; it is "let a true sentence about reachability be read as
   * a claim about safety, maturity or value". A reader who arrives at a crypto platform and sees
   * "open to the public" will supply the rest themselves unless it is denied explicitly, so it is
   * denied explicitly.
   *
   * NOTHING here is stated as a number. The container count, the smoke-suite score and the chain
   * height are all true right now and all three move hourly; a marketing page is the worst possible
   * place to pin one. See the "No estate census" note in ./claims.ts.
   */
  honesty: {
    title: 'Open to the public, and one day old',
    body: [
      'Every service and application described on this site is built, they run together against real databases and a real EMBER network, and as of today they answer on the public internet under a publicly trusted certificate. A browser-driven smoke suite walks the gateway the way a person would, faking nothing.',
      'What that does not mean: the main network is a few hundred blocks old and EMBER has no market, no listing and no price. Nobody outside the project has used any of this yet. There are no user numbers on this page for the same reason there is no uptime figure — both would be either zero or invented, and there is no third option.',
      'All of it sits on one machine behind a tunnel. There is no redundancy, no failover, and no backup that has ever been restored. Being able to reach something is the weakest claim a platform can make about itself, and today it is the only one this ecosystem has earned.',
    ],
  },
  expensive: {
    title: 'The expensive half is behind us',
    body: [
      'Everything that touches money, keys, chain state or identity is built and adversarially tested: the ledger, custody, settlement, the indexer, the wallet, pricing, billing, identity and policy. The double-entry constraint is proven by bypassing the service with raw SQL, so an unbalanced journal cannot be committed even by something holding a database connection. The lost-payment race is proven by running two workers against one chain.',
      'What remains is not mostly code. It is the distance between a system that runs correctly on one machine and a system that strangers are entitled to depend on: an environment on the public internet, the operational practice around it, and the compliance work no custodial service opens its doors without.',
    ],
  },
  /**
   * The per-surface state is NOT restated here. It is read from `stage` and `stageNote` on each
   * product page, so the build page and the product page cannot say different things — which is
   * exactly the failure this whole site is arranged to make impossible.
   */
  perSurfaceNote:
    'Each surface below carries the same state as its own page, because both are read from one declaration — and that declaration is checked against the estate rather than trusted.',
  /**
   * How a stage is arrived at. Rendered above the legend.
   *
   * This paragraph is the difference between a status page and a mood board, so it says the
   * mechanism rather than promising rigour. `test/estate-stages.test.ts` implements exactly what
   * is described here.
   */
  derivation: {
    title: 'Where these states come from',
    body: [
      'None of the states below is typed in by hand and left. Each is recomputed by a test that opens the estate\'s own deployment file and requires every container a surface depends on to be declared in it, then opens the smoke tier\'s surface list and requires that a real browser is driven at that surface through the real gateway with nothing intercepted. A surface that fails either check cannot be published as running, whatever this site would prefer to say.',
      'Both halves are needed and neither is enough. A container in a deployment file proves something was meant to run. Only a browser proves a person could have opened it — this estate has shipped surfaces that were deployed, green on their own health probe, and completely unstyled on screen.',
      'What no test here can establish is the last state on the scale, because there is nothing to point it at. "Open to the public" is measured by there being an address on the public internet, and there is not one.',
    ],
  },
  /**
   * The self-custody wallets — the one part of this ecosystem not at `running`.
   *
   * They are a separate block rather than rows in the table above for a structural reason: the
   * table is per SURFACE, a surface is a thing the registry in `@cloudsforge/ui` knows about and
   * the gateway routes, and a desktop application, a browser extension and a phone application are
   * none of those. Adding them to the surface table would mean either inventing registry entries
   * for things that have no host, or loosening what a row means until it means nothing.
   *
   * ── The stage is RECORDED, not derived, and the difference is stated on the page ─────────────
   *
   * The floor under them IS derived: `test/estate-stages.test.ts` asserts that none of the four
   * repositories is a service in the estate's deployment file or a surface the smoke tier drives,
   * so none of them can ever be published as running. What a test run in THIS repository cannot
   * establish is the positive half — that each one builds and its suite passes — because that is a
   * pipeline in another repository, and a marketing site asserting a green tick it has not seen is
   * the defect this estate keeps finding in its own gates.
   *
   * So `recordedBy` names who read it, what they read, and that it is a reading. It is RENDERED. A
   * recorded claim whose recorder exists only in a comment is a recorded claim the reader has been
   * given no way to weigh.
   */
  wallets: {
    title: 'Built and not shipped: the self-custody wallets',
    body: [
      'Everything above runs in the estate. The wallets are the exception, and not for the usual reason — they are built and their suites pass, and there is nowhere to get them. They are self-custody: a desktop application, a browser extension and a phone application that hold their own keys and speak to the chain directly, with no CloudsForge account and nothing of yours on our side of the wire.',
      'That is deliberately the opposite posture to Forge Hub, and it is why they are separate things rather than another screen inside it. A custodial account and a self-custody wallet make incompatible promises about who can lose your money, and anything that quietly does both leaves a reader unable to tell which promise covers them.',
      'The signing core underneath all three is differentially tested against the chain\'s own node, which is the check that actually matters for a key: two independent implementations must agree on every address and every signature, or one of them is silently wrong and nothing else would notice. What is missing is not code. It is a release — signed installers, a listing in two browser stores and two phone stores, and the update channel that has to exist before any of that is safe to publish.',
    ],
    /** Rendered. See the note above on why a recorder who exists only in a comment is no recorder. */
    recordedBy:
      'Recorded rather than derived. The four repositories were read, and their pipelines\' latest conclusions were quoted from the runs themselves, by the agent that rewrote this site on the day of the commit carrying this sentence. Every other state on this page is recomputed from the estate on each run; this one cannot be, because the evidence lives in another repository\'s pipeline and this site has no business asserting a green tick it did not watch.',
  },
  gate: {
    title: 'What "ready" will mean',
    body: [
      'Readiness is defined by behaviour in an environment rather than by a repository being finished. The tool that measures it exists and runs: it drives a real browser through the real gateway, intercepts no request and substitutes no answer, so a surface that renders perfectly against a fake network still fails it. That tool was built ahead of the remaining work, which is the opposite of the order that would have made this page look finished soonest.',
      'What it cannot measure is anything about a public deployment, because there is not one. It is evidence that the software works together, and it is deliberately not evidence of anything more than that.',
    ],
  },
} as const

/* ─────────────────────────────── 404 ──────────────────────────────── */

export const NOT_FOUND = {
  /** The status this page is served under. Rendered as the eyebrow, so it comes from the register. */
  status: claim('httpNotFound'),
  headline: 'There is no page at this address',
  blurb:
    `There is no page at this address. This response carries a real ${claim('httpNotFound')} status, so whatever linked here can be found and fixed.`,
  body: [
    'The link may be out of date, or the page may never have existed.',
    `This response carries a real ${claim('httpNotFound')} status rather than the ${claim('httpOk')} a single-page application usually answers with, so whatever sent you here can be found and fixed. The site this one replaces returns success for every address in existence, which is why its own broken links have never been visible to anything that checks them.`,
  ],
} as const
