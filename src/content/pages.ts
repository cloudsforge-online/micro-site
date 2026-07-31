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
import type { SurfaceKey } from '@cloudsforge/ui'

/* ─────────────────────────────── home ─────────────────────────────── */

export const HOME = {
  /** The positioning line. Everything else on the site is a footnote to it. */
  spine: 'One crypto world.',
  /**
   * The search-result and link-preview description.
   *
   * Separate from `standfirst` on purpose. A standfirst is written to be read under a headline
   * that is already on screen; a description is read with no headline and inside a length budget,
   * and reusing one as the other produces something truncated mid-clause. `test/meta.test.ts`
   * holds every blurb on this site to that budget.
   */
  blurb:
    'One account, one wallet and one ledger under several crypto products. Mine it, hold it, make it, trade it, sell it, play in it.',
  /**
   * The verbs, in the order the story is told. NOT the registry's order, which is tuned for the
   * colour separation of neighbouring switcher entries and says so in capitals.
   * Source: docs/ecosystem/01-product-vision.md §1.
   */
  verbLine: 'Mine it, hold it, make it, trade it, sell it, play in it.',
  standfirst:
    'Almost every consumer crypto platform is an exchange with features bolted on. This is the inverse: a set of things worth doing, funded by a currency you can produce yourself on a laptop, with one account, one wallet and one ledger underneath all of them.',
  /**
   * The loop, which is the actual product. Source: the diagram in
   * docs/ecosystem/01-product-vision.md §1, flattened into four steps because the branch in the
   * middle of it is the product grid and does not need drawing twice.
   */
  loop: {
    // The steps carry no ordinal of their own. The rail numbers them from their position, so a
    // step inserted in the middle renumbers the rest — the failure mode of typed ordinals is two
    // number threes, and it is the sort of thing that survives review because nothing is wrong
    // with either line on its own.
    title: 'The loop is the product',
    lede: 'Not a portfolio of apps that share a logo. One circuit, and every arrow in it is something the platform has to actually do.',
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
        title: 'Use it across every product',
        body: `Shards are the platform's internal unit and the peg is fixed: ${claim('shardsPerUsd')} Shards to the dollar, in both directions, rather than a rate that moves while you are reading it.`,
      },
      {
        verb: 'Leave',
        accentKey: 'network' as SurfaceKey,
        title: 'Take it back out whenever you want',
        body: 'Withdraw on chain, to your own address, or export the key and stop asking. A user being able to leave with their assets is a product requirement here, not a concession.',
      },
    ],
  },
  /** The one-account promise, in the terms a reader can check. */
  spans: {
    title: 'One account spans all of it',
    lede: 'A single sign-in, a single wallet and a single history. Nothing about who you are or what you own is trapped inside one product.',
    points: [
      {
        title: 'Sign in once',
        body: 'One identity issues the tokens every product verifies against one key set. There is no per-product account, because there is only one account.',
      },
      {
        title: 'One wallet',
        body: `${claim('chains')} chains behind one balance — EMBER, Bitcoin, Ethereum, Solana and the XRP Ledger — with the same receive and send screens whichever product you arrived from.`,
      },
      {
        title: 'One history',
        body: 'Every account, money, asset and game event on one timeline, kept for as long as the account exists. Not one feed per product, joined by hand.',
      },
    ],
  },
  closing: {
    title: 'Built in the open, with the state of it written down',
    body: 'This platform is being rebuilt from the ground up and none of it is deployed yet. Rather than take that sentence off the site until it stops being true, there is a page that says exactly where each part stands.',
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

export const ABOUT = {
  eyebrow: 'The company',
  headline: 'A small company that owns its whole stack',
  blurb:
    'CloudsForge makes the currency, the rails that move it, the tools that create with it and the worlds that spend it. The principles it decides by, and what it refuses to become.',
  standfirst: [
    'CloudsForge makes the currency, the rails that move it, the tools that create things with it, and the worlds that spend it. Owning all four is the only reason it can make promises a company owning one of them cannot.',
    'A processor-mineable coin that is the actual funding rail for real products is a story nobody else is telling. Most of the work is engineering, and none of the engineering is marketing.',
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
        body: `A new product gets a colour, not a new visual language. The five product accents were re-derived to be separable under colour-vision-deficiency simulation — the set they replaced measured ΔE ${claim('accentSeparationBefore')}, at which point two of them were the same colour to a great many readers, and the current set measures ΔE ${claim('accentSeparation')}.`,
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
  headline: 'What is built, and what is not',
  blurb:
    'An honest account of where this platform stands: which parts are built and tested, which are still being written, and the fact that none of it is deployed yet.',
  standfirst: [
    'This platform is being rebuilt as a set of independent services and applications. That work is well past its halfway point and none of it is running anywhere.',
    'Both halves of that sentence are on this page because leaving the second one off is how a launch date becomes a thing people plan around.',
  ],
  /** Source: docs/ecosystem/18-build-status.md §1 and §3.3. */
  honesty: {
    title: 'Nothing is deployed',
    body: [
      'Every service and application described on this site exists as code that passes its own tests. Not one of them is running in an environment a person could reach. There is no gateway routing, no release has been exercised, and no data has been migrated.',
      'It follows that there is nothing here to sign up for, and nothing on this site asks you to. There are no user numbers on this page for the same reason there is no uptime figure: both would be either zero or invented, and there is no third option.',
    ],
  },
  expensive: {
    title: 'The expensive half is behind us',
    body: [
      'Everything that touches money, keys, chain state or identity is built and adversarially tested: the ledger, custody, settlement, the indexer, the wallet, pricing, billing, identity and policy. The double-entry constraint is proven by bypassing the service with raw SQL, so an unbalanced journal cannot be committed even by something holding a database connection. The lost-payment race is proven by running two workers against one chain.',
      'What remains is dominated by the applications people would actually look at, and by the operational services that decide when any of it is allowed to be called ready.',
    ],
  },
  /**
   * The per-surface state is NOT restated here. It is read from `stage` and `stageNote` on each
   * product page, so the build page and the product page cannot say different things — which is
   * exactly the failure this whole site is arranged to make impossible.
   */
  perSurfaceNote:
    'Each surface below carries the same state as its own page, because both are read from one declaration.',
  gate: {
    title: 'What "ready" will mean',
    body: [
      'Readiness is defined by behaviour in an environment rather than by a repository being finished, and the tool that measures it does not exist yet. Until it does, no part of this can be shown to have shipped on evidence rather than on assertion.',
      'That tool is therefore being built ahead of the remaining applications, which is the opposite of the order that would make this site look finished soonest.',
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
