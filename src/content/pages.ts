/**
 * The copy for every page that is not a product page.
 *
 * Data, not components — the reasons are in the header of `./products.ts`. Everything here is
 * readable by `test/content.test.ts`, which is what keeps the numbers register honest and what
 * stops a hostname being typed into a sentence.
 *
 * Sources are named inline where a passage is a restatement of something the estate decided
 * elsewhere. They are for the person editing this file; none of them is rendered.
 *
 * ── The voice ─────────────────────────────────────────────────────────────────────────────────
 *
 * Say what the thing does, in the words a person would use to describe it to a friend. A sentence
 * that could sit on any crypto company's home page has told the reader nothing, and a sentence a
 * reader has to decode has cost them more than it gave. Concrete nouns, ordinary verbs, and the
 * capability named before the philosophy behind it.
 */
import { claim } from './claims.ts'
import { nextProductOrdinal, productCount, sentenceCase, surfaceCount } from './products.ts'
import type { SurfaceKey } from '@cloudsforge/ui'

/* ─────────────────────────────── home ─────────────────────────────── */

export const HOME = {
  /**
   * The positioning line. Everything else on the site is a footnote to it.
   *
   * It names the currency, because the currency is the one thing here that is nobody else's:
   * `test/content.test.ts` asserts EMBER appears in it, so a rewrite that drifts back to a category
   * noun — "one crypto world", which is what this replaced — fails rather than ships.
   */
  spine: 'EMBER, and everything built on it.',
  /**
   * The search-result and link-preview description.
   *
   * Separate from `standfirst` on purpose. A standfirst is written to be read under a headline that
   * is already on screen; a description is read with no headline and inside a length budget, and
   * reusing one as the other produces something truncated mid-clause. `test/meta.test.ts` holds
   * every blurb on this site to that budget.
   */
  blurb:
    'Mine EMBER in a browser tab on the computer you already own. Hold it in one wallet, launch tokens on a full Ethereum-compatible chain, backtest strategies, trade, sell what you make, and play.',
  /** The verbs, in the order the story is told. Source: docs/ecosystem/01-product-vision.md §1. */
  verbLine: 'Mine it, hold it, make it, trade it, sell it, play in it.',
  standfirst:
    'Most consumer crypto platforms are an exchange with features attached. This one starts with a currency you can produce yourself — open a tab, press start, and your computer begins mining EMBER — and then gives you places worth spending it, all on one account and one wallet.',
  /**
   * What EMBER does, in the four steps of its life. Source: the diagram in
   * docs/ecosystem/01-product-vision.md §1, flattened into four steps because the branch in the
   * middle of it is the ecosystem grid and does not need drawing twice.
   *
   * The heading is about the currency rather than about the diagram. "The loop is the product" was
   * removed on the owner's instruction: it argued that the parts are joined up, which only matters
   * to a reader already convinced there is something here.
   */
  ember: {
    // The steps carry no ordinal of their own. The rail numbers them from their position, so a
    // step inserted in the middle renumbers the rest — the failure mode of typed ordinals is two
    // number threes, and it is the sort of thing that survives review because nothing is wrong
    // with either line on its own.
    title: 'It starts with the currency',
    lede: 'EMBER is not a token attached to an ecosystem after the fact. The ecosystem is what makes EMBER worth mining, and each of the four steps below has to actually work for that to be true.',
    steps: [
      {
        verb: 'Mine',
        accentKey: 'network' as SurfaceKey,
        title: 'Produce it yourself, in a browser tab',
        body: 'EMBER is mined by proof of work on ordinary processors. Open the mining page, press start, and the computer you are reading this on is the whole setup. No graphics card, no separate download, nothing to buy first.',
      },
      {
        verb: 'Hold',
        accentKey: 'hub' as SurfaceKey,
        title: 'Keep it in an account that is yours',
        body: `Send EMBER to your account and it is credited once the network has buried it under ${claim('emberConfirmations')} blocks — about ${claim('emberConfirmationMinutes')} minutes. Every other chain waits the depth it warrants. One ledger, one portfolio, one balance.`,
      },
      {
        verb: 'Spend',
        accentKey: 'site' as SurfaceKey,
        title: 'Use it across the whole ecosystem',
        body: `The money is EMBER. Small amounts are shown in Sparks — ${claim('sparksPerEmber')} Sparks to one EMBER — which is a shorter way of writing the same balance, not a second currency with its own rate.`,
      },
      {
        verb: 'Leave',
        accentKey: 'network' as SurfaceKey,
        title: 'Take it out whenever you want',
        body: 'Withdraw to any address you control, or export your private key and stop asking us for anything. Leaving with everything you own is a feature we build, not a favour we grant.',
      },
    ],
  },
  /**
   * The product grid's heading and its two asides.
   *
   * These sentences were JSX literals in `src/pages/home.tsx` until the count in them went stale —
   * see the header of `./products.ts` for what happened and why a word counts as a number. They are
   * here, and derived, so that the copy walk in `test/content.test.ts` can read them.
   */
  products: {
    title: 'Where the EMBER goes',
    lede: `${sentenceCase(productCount())} places to spend it, all on the same account. Each one does something different — none of them is a tab inside another.`,
    hubAside: `Hub is not a ${nextProductOrdinal()} destination. It is the account, wallet and history the other ${productCount()} run on.`,
  },
  /** The one-account promise, in terms a reader can check. */
  spans: {
    title: 'One account for all of it',
    lede: 'Sign in once and you are signed in everywhere. One wallet, one balance, one history — nothing about you or what you own is locked inside a single product.',
    points: [
      {
        title: 'Sign in once',
        body: 'One sign-in works across every part of the ecosystem. There is no separate account for the exchange, the games or the marketplace, because there is only one account.',
      },
      {
        title: 'One wallet',
        // The names are a claim for the same reason the count is: they were typed here, so the
        // count re-derived itself to 6 while the list beside it still read five chains. See the
        // note on `chainNames` in claims.ts.
        body: `${claim('chains')} chains behind one balance — ${claim('chainNames')} — with the same send and receive screens wherever in the ecosystem you opened them from.`,
      },
      {
        title: 'One history',
        body: 'Every sign-in, payment, deposit, trade, token and game event on a single timeline, kept for as long as your account exists. Not one activity feed per product for you to piece together.',
      },
    ],
  },
  /**
   * The three capabilities a reader is most likely not to expect, named on the front page.
   *
   * All three are built and running, and all three were invisible here: browser mining had been
   * removed from this site in a commit, the chain's Ethereum compatibility was one vague clause,
   * and the coins you can stake and trade were named nowhere at all. A capability nobody is told
   * about is, from the reader's side, a capability that does not exist.
   */
  capabilities: {
    title: 'Three things people do not expect',
    lede: 'These are built and running today. They are on the front page because a reader who never scrolls past it would otherwise never learn that any of them is here.',
    items: [
      {
        title: 'Mining that runs in a browser tab',
        accentKey: 'network' as SurfaceKey,
        linkTo: 'network',
        linkLabel: 'How mining works',
        body: 'No installer, no graphics card, no pool account. Open the page, press start, and the tab begins hashing. Your mining key is generated in the browser and never leaves it, and mining pauses on battery unless you say otherwise.',
      },
      {
        title: 'A chain Ethereum tools already work with',
        accentKey: 'network' as SurfaceKey,
        linkTo: 'network',
        linkLabel: 'Connect a wallet or a toolchain',
        body: `Hearth runs the Ethereum virtual machine. MetaMask, ethers, viem, Hardhat and Foundry connect to it unchanged — chain ${claim('emberChainId')} for the main network, ${claim('emberTestnetChainId')} for the test network. Contracts that compile for Ethereum deploy here as they are.`,
      },
      {
        title: 'Six coins, not just ours',
        accentKey: 'foresight' as SurfaceKey,
        linkTo: 'foresight',
        linkLabel: 'What you can stake and trade',
        body: `Your wallet holds ${claim('chainNames')}. Strategies are backtested against real Bitcoin, Ethereum, Solana and XRP price history, and predictions can be staked in whichever of those coins you already hold rather than one the platform prefers.`,
      },
    ],
  },
  closing: {
    title: 'Built in the open, with the state of it written down',
    body: 'Most of this is built and running, and it went public this week with no track record behind it. Rather than pick whichever half of that flatters, there is a page saying exactly where every part stands and how each of those states is checked.',
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
  headline: `${sentenceCase(surfaceCount())} places to go, one account`,
  standfirst: [
    `${sentenceCase(productCount())} destinations you choose between, plus the account they all run on. Each one shows what state it is really in, taken from the running estate rather than typed in here.`,
  ],
  controlCentreTitle: 'The account everything runs on',
  productsTitle: `The ${productCount()} destinations`,
  productsLede:
    'Listed in the order the product switcher uses, which is arranged so no two neighbouring colours can be mistaken for each other.',
  /**
   * ── This block said the opposite, and had said it for weeks ─────────────────────────────────
   *
   * It read: "A developer platform — projects, keys, webhooks, a software development kit and a
   * sandbox — is intended and is not built." At the time that was checked, `devplatform` and
   * `devportal-web` were both declared in `deploy/compose/docker-compose.estate.yml`, both running
   * healthy, and the developer surface was one of the sixteen `beacon smoke` drives in a real
   * browser through the real gateway.
   *
   * It is kept as a section rather than deleted because the shape of the mistake is the lesson. The
   * paragraph was written to be safe — announcing nothing is the conservative move — and the estate
   * then built the thing and nobody came back. **A cautious false statement is still a false
   * statement**, and nobody ever investigates a claim that something does not exist.
   */
  notHere: {
    title: 'What has no page here, and why',
    body: [
      'The developer platform — projects, API keys, webhooks, a software development kit and a sandbox — is built and running on its own surface. It has no page in this section because this section is about where a person spends EMBER, and a developer either already knows they want an API or does not. The documentation is more use to them than a page like this one.',
      'This paragraph replaces one that said the developer platform did not exist. It said so for weeks after it did, which is the same failure the rest of this site is arranged against: understating is not the safe option, it is a different wrong answer, and nobody ever checks a sentence that promises less.',
    ],
  },
} as const

/* ───────────────────────────── platform ───────────────────────────── */

export const PLATFORM = {
  eyebrow: 'The platform',
  headline: 'What "one platform" has to mean',
  blurb:
    'One account, one wallet, one portfolio, one history. The statements that separate a platform from a set of apps sharing a logo, published in full — including the ones not yet true.',
  standfirst: [
    'Sharing a logo does not make several products one platform. What makes them one platform is a specific list of statements about the account underneath them, and each statement is either true today or it is work on the schedule.',
    'The whole list is below, including the parts not finished. A definition you only publish once you pass it is not a definition, it is an advertisement.',
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
    'One wallet — the same send, receive and key screens whichever product you came from.',
    'One portfolio — a single number that is the truth about what you hold.',
    'One activity history — every sign-in, payment, asset, game and vote on one timeline.',
    'One economy — the same units spend and earn identically in every product.',
    'Anything you create in one product works in the others.',
    'One set of notifications, with one page of preferences.',
    'One support view — an agent can answer any question from one place.',
    'One financial record of truth, reconciled against the chain.',
    'Anyone outside can build on all of it.',
  ],
  testsNote: `${claim('platformTests')} statements. A phase of work that moves none of them from false to true does not ship.`,
  /** Source: docs/ecosystem/15-monetisation-model.md §1. */
  free: {
    title: 'The basics are free, permanently',
    rule:
      'We charge for work done on your behalf, and for access to markets and capacity we run. We never charge you to hold your money, to move it, or to leave.',
    body: [
      'This is a line about kinds of charge rather than amounts, and it is drawn once. What a custodial platform actually sells is the belief that your money is where it says it is, and charging someone to reach their own money trades that belief for a small recurring fee. It is a bad trade in one direction only.',
      'There is a second, simpler reason. One portfolio means a single number that is the truth about what you hold, and that stops being true the moment part of the balance sits behind a paywall. A portfolio you have to pay to see in full is a report, not a portfolio.',
    ],
    items: [
      'The account, your profile, and signing into every product with it',
      'Wallets, on any supported chain, in any number',
      'Deposits, including watching the chain and crediting them',
      'Transfers between CloudsForge accounts',
      'Withdrawals, less only what the network itself charges to carry them',
      'Exporting your private key and recovery phrase',
      'The portfolio, your balances and their valuation',
      'Your full activity history, with no time limit',
      'Notifications, on every channel',
      'Backtesting, every strategy in the catalogue, and paper trading',
      'Everything on the test network',
      'The block explorer, the node software, mining, and the faucet',
    ],
  },
  /** Source: docs/ecosystem/15-monetisation-model.md §3, and the check recorded in ./claims.ts. */
  prices: {
    title: 'Prices are not published here yet',
    body: [
      'There is a commercial model, it is written down, and it is specific. It is not on this page.',
      'Three of its figures were checked against the services that actually charge them, and all three had drifted: a three-tier price that is now a single price, a spread whose default had halved, and a fee that turns out to be set per trading bot rather than platform-wide. A price that is wrong on a marketing page is a price a customer quotes back at support, and they are right to.',
      'So this page publishes what is free, which is a decision rather than a configuration value, and will publish a price when the code that charges it and the page that quotes it can be shown to agree.',
    ],
  },
  spine: {
    title: 'What we will never sell you separately',
    body: [
      'Identity, the ledger, custody, the chain indexer, policy, activity, notifications, billing, the gateway and the monitoring are shared foundations. Their entire value is that they are everywhere, the same, for everyone.',
      'Selling them individually is how a company ends up with nine things nobody wants. There will never be a "CloudsForge ID" or a "CloudsForge Wallet" product with its own price.',
    ],
  },
} as const

/* ────────────────────────────── about ─────────────────────────────── */

/**
 * The headline is about the ECOSYSTEM rather than about a company. Every sentence under it is about
 * what gets made, who owns what, and which trade-offs are settled in advance — none of which a
 * company's size predicts. "Owns its whole stack" was also dropped: owning a stack is a
 * procurement position and plenty of companies have one. What is unusual here is that the currency
 * at the bottom and the places to spend it at the top are the same project.
 */
export const ABOUT = {
  eyebrow: 'The ecosystem',
  headline: 'An ecosystem, from the currency up',
  blurb:
    'CloudsForge makes the currency, the rails that move it, the tools that create with it and the worlds that spend it. The principles behind the decisions, and what it refuses to become.',
  standfirst: [
    'CloudsForge builds four things: the currency, the rails that move it, the tools people create with, and the worlds where it gets spent. Owning all four is the only reason we can promise a holder things that a company owning one of them cannot.',
    'That is what makes it an ecosystem rather than a stack. EMBER is worth mining because there is somewhere to spend it, and there is somewhere to spend it because EMBER pays for building it.',
    'A coin anyone can mine on an ordinary computer, funding real places to spend it, is not a story anyone else is telling. Nearly all of the work is engineering, and none of the engineering is marketing.',
  ],
  /** Source: docs/ecosystem/01-product-vision.md §5. Tie-breakers, not slogans. */
  principles: {
    title: 'How arguments get settled',
    lede: 'When two designs are both defensible, the one that satisfies more of these wins. They exist to be applied under deadline pressure, which is the only time a principle is worth anything.',
    items: [
      {
        title: 'The ledger owns value; the chain owns ownership',
        body: 'When the two disagree, the system stops and tells a human. It never guesses, and it never quietly picks the more convenient answer.',
      },
      {
        title: 'You can always leave with everything you own',
        body: 'Getting the keys to a wallet you own is a feature we build, not a favour we grant. How we make that safe is our problem; whether you are allowed to is not a question.',
      },
      {
        title: 'Never sell what cannot be delivered',
        body: 'Everything on sale has working code behind it or it comes off sale — out of the API as well as off the screen, because the screen is not the only place money is taken.',
      },
      {
        title: 'Limits ship with the power they limit',
        body: 'A new capability and the controls on it land in the same release. A limit added afterwards is a limit that was missing for however long afterwards took.',
      },
      {
        title: 'Honest copy',
        body: 'Backtests say modelled, not promised, and they charge realistic fees and slippage, because a strategy that only works for free does not work. Plain writing is an asset here and it is defended on purpose.',
      },
      {
        title: 'No pay-to-win',
        body: 'You can buy appearance, convenience and access. You cannot buy power. Scarcity is the game, and a game whose scarcity can be bought out of has no story left in it.',
      },
      {
        title: 'One system, many colours',
        body: 'A new product gets its own colour, not its own design language. The colours are checked against colour-blindness simulations before they ship, and colour is never the only thing distinguishing two states — there is always a label, an icon or a position saying the same thing.',
      },
      {
        title: 'Being able to undo it beats being clever',
        body: 'Every phase ships behind a switch with a written way back. Being able to reverse a decision is worth more than being confident in it.',
      },
    ],
  },
  /** Source: docs/ecosystem/01-product-vision.md §6. */
  rejects: {
    title: 'What this is not, and will not become',
    lede: 'What a project refuses to do tells you more than what it hopes to do, because anyone can hope.',
    items: [
      {
        title: 'An exchange',
        body: 'Order books, holding other people\'s trading pairs and market making are a different company with a different licence. Strategies here settle against a price feed, on coins you already hold. That is the boundary.',
      },
      {
        title: 'A seller of its own plumbing',
        body: 'The account and the wallet are not sold, packaged or tiered. They are what makes everything else one platform.',
      },
      {
        title: 'A rewrite for its own sake',
        body: 'The chain and the custody model work and are being carried across unchanged. Saying that out loud beats discovering it halfway through a migration.',
      },
      {
        title: 'A new product before the current ones work',
        body: 'There is one exception, and it was argued rather than assumed: a marketplace, because making something has no point if there is nowhere to sell it.',
      },
    ],
  },
} as const

/* ──────────────────────────── build status ────────────────────────── */

export const BUILD = {
  eyebrow: 'Build status',
  headline: 'Where each part actually is',
  blurb:
    'An honest account of where this ecosystem stands: what is open to the public, what runs in-house, what is still being written, and how new all of it is. Every state here is read from the running estate.',
  standfirst: [
    'This ecosystem is built as a set of independent services. They run together, and they now answer on the public internet — from one machine, with no failover and no backup anyone has ever restored.',
    'Both halves of that sentence are on this page. Leaving the second one off is how a launch turns into something people trust with money; leaving the first one off is how this page spent weeks calling things unbuilt while they were running.',
  ],
  /**
   * Source: docs/ecosystem/18-build-status.md §1.
   *
   * ── This block has been rewritten twice because the estate outgrew it ───────────────────────
   *
   * It was once headed "Nothing is deployed", then "Nothing is serving the public". Both were true
   * when written and both went false, in the same direction, while the heading stayed. Softening a
   * claim in place — keeping the heading and letting the sentences rot — is exactly how the estate
   * this replaces ended up saying EMBER credited at the chain tip long after it stopped doing so.
   *
   * The temptation now is the opposite one: letting a true sentence about being reachable be read
   * as a claim about safety, maturity or value. A reader arriving at a crypto platform will supply
   * that themselves unless it is denied explicitly, so it is denied explicitly.
   *
   * NOTHING here is stated as a number. The container count, the smoke-suite score and the chain
   * height are all true right now and all three move hourly; a marketing page is the worst possible
   * place to pin one. See the "No estate census" note in ./claims.ts.
   */
  honesty: {
    title: 'Open to the public, and days old',
    body: [
      'Everything described on this site is built, runs together against real databases and a real EMBER network, and now answers on the public internet under a proper certificate. An automated suite drives a real browser through the real gateway the way a person would, faking nothing.',
      'What that does not mean: the main network is a few hundred blocks old, and EMBER has no market, no listing and no price. Nobody outside the project has used any of this yet. There are no user numbers on this page for the same reason there is no uptime figure — both would be either zero or invented.',
      'It all runs on one machine behind a tunnel. There is no redundancy, no failover, and no backup that has ever been restored. Being reachable is the weakest thing a platform can claim about itself, and today it is the only thing this one has earned.',
    ],
  },
  expensive: {
    title: 'The hard part is behind us',
    body: [
      'Everything touching money, keys, chain state or identity is built and has been attacked deliberately: the ledger, custody, settlement, the chain indexer, the wallet, pricing, billing, identity and policy. The accounting rule is proved by going around the service and writing raw SQL, so an unbalanced entry cannot be committed even by something with a direct database connection. The duplicate-payment race is proved by running two workers against one chain at once.',
      'What is left is mostly not code. It is the distance between software that runs correctly on one machine and a service strangers are entitled to depend on: real infrastructure, the operational habits around it, and the compliance work no company holding other people\'s money opens its doors without.',
    ],
  },
  /**
   * The per-surface state is NOT restated here. It is read from `stage` and `stageNote` on each
   * product page, so the build page and the product page cannot say different things.
   */
  perSurfaceNote:
    'Each surface below shows the same state as its own page, because both are read from one declaration — and that declaration is checked against the running estate rather than trusted.',
  /**
   * How a stage is arrived at. Rendered above the legend. `test/estate-stages.test.ts` implements
   * exactly what is described here.
   */
  derivation: {
    title: 'Where these states come from',
    body: [
      'None of the states below is typed in by hand. Each is recalculated by a test that opens the deployment file the estate actually runs from and requires every container a surface needs to be declared in it, then opens the browser suite\'s list and requires that a real browser is driven at that surface through the real gateway with nothing faked. A surface failing either check cannot be shown as running, whatever this site would prefer to say.',
      'Both halves are needed and neither is enough on its own. A container in a deployment file proves something was meant to run. Only a browser proves a person could have opened it — this project has shipped surfaces that were deployed, green on their own health check, and completely unstyled on screen.',
      'The one state no test here can establish is the last one on the scale. "Open to the public" is now true, and what proves it is an address anyone can type in rather than anything this repository can measure about itself.',
    ],
  },
  /**
   * The self-custody wallets — the one part of this ecosystem not at `running`.
   *
   * They are a separate block rather than rows in the table above for a structural reason: the
   * table is per SURFACE, a surface is a thing the registry in `@cloudsforge/ui` knows about and the
   * gateway routes, and a desktop application, a browser extension and a phone application are none
   * of those.
   *
   * The floor under them IS derived: `test/estate-stages.test.ts` asserts that none of the four
   * repositories is a service in the estate's deployment file or a surface the smoke tier drives,
   * so none can ever be published as running. What a test in THIS repository cannot establish is
   * the positive half — that each builds and its suite passes — so `recordedBy` names who read it
   * and that it is a reading. It is RENDERED.
   */
  wallets: {
    title: 'Built but not released: the self-custody wallets',
    body: [
      'Everything above is running. The wallets are the exception, and not for the usual reason — they are finished and their tests pass, and there is nowhere to download them yet. They are self-custody: a desktop app, a browser extension and a phone app that hold their own keys and talk to the chain directly, with no CloudsForge account and nothing of yours on our side.',
      'That is deliberately the opposite of Forge Hub, which is why they are separate products rather than another screen inside it. A custodial account and a self-custody wallet make incompatible promises about who can lose your money, and a product quietly doing both leaves you unable to tell which promise covers you.',
      'The signing code underneath all three is tested against the chain\'s own node, address by address and signature by signature — which is the check that actually matters for a key, because two independent implementations either agree or one of them is silently wrong. What is missing is not code. It is a release: signed installers, listings in two browser stores and two phone stores, and the update channel that has to exist before any of that is safe to publish.',
    ],
    /** Rendered. A recorder who exists only in a comment is no recorder. */
    recordedBy:
      'Recorded rather than calculated. The four repositories were read and their latest pipeline results quoted from the runs themselves, by the agent that rewrote this site on the day of the commit carrying this sentence. Every other state on this page is recalculated from the estate on each test run; this one cannot be, because the evidence lives in another repository\'s pipeline and this site has no business claiming a green tick it did not watch.',
  },
  gate: {
    title: 'What "ready" will mean',
    body: [
      'Ready is defined by how the whole thing behaves in a real environment, not by a repository being finished. The tool that measures it exists and runs: it drives a real browser through the real gateway, intercepts no request and substitutes no answer, so a surface that looks perfect against a fake network still fails. That tool was built before the work it grades, which is the opposite of the order that would have made this page look finished soonest.',
      'What it cannot measure is anything about scale, security review or how the system behaves under load from strangers. It is evidence that the software works together, and deliberately not evidence of more than that.',
    ],
  },
} as const

/* ─────────────────────────────── 404 ──────────────────────────────── */

export const NOT_FOUND = {
  /** The status this page is served under. Rendered as the eyebrow, so it comes from the register. */
  status: claim('httpNotFound'),
  headline: 'There is no page at this address',
  blurb: `There is no page at this address. This response carries a real ${claim('httpNotFound')} status, so whatever linked here can be found and fixed.`,
  body: [
    'The link may be out of date, or the page may never have existed. The navigation below goes everywhere this site has.',
    `This response carries a real ${claim('httpNotFound')} status rather than the ${claim('httpOk')} that single-page sites usually answer with, so whatever sent you here can be found and fixed. A site that reports success for every address in existence can never have its broken links noticed by anything that checks.`,
  ],
} as const
