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
import { productCount, sentenceCase } from './products.ts'
import type { SurfaceKey } from '@cloudsforge/ui'

/* ────────────────────────────── chrome ────────────────────────────── */

/**
 * The strip a reader of the TEST NETWORK sees above the navigation, on every page.
 *
 * ── The defect it closes ──────────────────────────────────────────────────────────────────────
 *
 * Two estates serve this bundle and, until this existed, they served it identically: measured
 * 2026-08-07 and recorded in docs/ecosystem/32-roadmap-ui-and-content.md §2, the live apex and the
 * testnet apex both answered 200 with the same asset. So the footer's "Open to the public" was
 * being read by people looking at a rehearsal. `./stages.ts` had already written the argument, in
 * the note on why no testnet name may join `PUBLIC_SURFACES`: a reader sent to a testnet address
 * is shown throwaway money and a chain that gets reset, "and nothing on the card that says so".
 *
 * ── What it may and may not say ───────────────────────────────────────────────────────────────
 *
 * It states the two facts a reader cannot check for themselves and would otherwise assume the
 * opposite of — the coins are not the real ones, and the chain is reset without notice — and it
 * offers the way out. It does NOT say the test network is broken, or unreachable, or temporary:
 * none of those is true, and this site has already had to retract one caveat that denied a
 * capability the same page rendered a control for.
 *
 * `linkLabel` names the destination rather than the mechanism ("Go to the live site", not "switch
 * network"). The destination itself is `liveUrl()` in `src/lib/hosts.ts` and is composed from the
 * registry, because the rule at the head of this file — what `test/content.test.ts` is for is
 * partly "what stops a hostname being typed into a sentence" — and the CI grep behind it both
 * forbid a hostname appearing anywhere under `src`.
 */
export const TESTNET_NOTICE = {
  title: 'This is the test network',
  body: 'Everything here is a rehearsal — the coins are not the real ones and the chain is reset without notice.',
  linkLabel: 'Go to the live site',
} as const

/* ─────────────────────────────── home ─────────────────────────────── */

export const HOME = {
  /**
   * The positioning line. Everything else on the site is a footnote to it.
   *
   * It names the currency, because the currency is the one thing here that is nobody else's:
   * `test/content.test.ts` asserts EMBER appears in it, so a rewrite that drifts back to a category
   * noun — "one crypto world", which is what this replaced — fails rather than ships.
   *
   * It also has to say what the reader DOES. This read "EMBER, and everything built on it", which
   * names the currency and then gestures at the rest with a pronoun; the owner's verdict was that
   * it "doesn't say anything to anyone", and they were right — a stranger cannot tell from it
   * whether EMBER is something you buy, something you win or something you make. The verb is now
   * in the headline, and the second line says what the mined coin is then for.
   */
  spine: 'Mine EMBER on the computer you already own.',
  /**
   * The search-result and link-preview description.
   *
   * Separate from `standfirst` on purpose. A standfirst is written to be read under a headline that
   * is already on screen; a description is read with no headline and inside a length budget, and
   * reusing one as the other produces something truncated mid-clause. `test/meta.test.ts` holds
   * every blurb on this site to that budget.
   */
  blurb:
    'Mine EMBER in a browser tab on the computer you already own. Hold it in one wallet, bet with it, trade with it, launch tokens, sell what you make, and play.',
  /** The verbs, in the order the story is told. Source: docs/ecosystem/01-product-vision.md §1. */
  verbLine: 'Then bet with it, trade with it, build with it and play with it — without leaving your account.',
  /**
   * The standfirst opens on the reader, not on the competition.
   *
   * It began "Most consumer crypto platforms are an exchange with features attached", which spends
   * the most valuable sentence on the page describing somebody else's product to a reader who has
   * not yet been told what this one is. Nobody arrives here holding an opinion about consumer
   * crypto platforms. The instruction was to drop the comparison and say the three things a person
   * can do — mine, trade, play — and that they happen in one place, which is what this now does.
   *
   * The verbs are the reader's words rather than ours. "Back what you think will happen" is what a
   * prediction market does and it is not what anybody calls it; the owner's instruction was to say
   * BET, and to lead the list with it, so the verb line and this sentence both do.
   */
  standfirst:
    'Press start on the mining page and this computer begins earning EMBER — no card to buy, nothing to install. What you mine lands in one wallet, and that wallet is what you bet with, trade crypto with, launch a token with, buy and sell with, and play games with — the same account and the same wallet throughout.',
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
    /**
     * The lede says what the four steps ARE. It used to argue about them instead: "EMBER is not a
     * token attached to an ecosystem after the fact. The ecosystem is what makes EMBER worth
     * mining, and each of the four steps below has to actually work for that to be true." The
     * owner's verdict was "I don't understand what it speaks about", and the sentence is in fact
     * addressed to somebody comparing token launch models, not to somebody deciding whether to
     * open the mining page. It is replaced with the four verbs and nothing else.
     */
    title: 'What happens to the EMBER you mine',
    lede: 'Four steps, and you can check every one of them: you make it, you keep it, you spend it, and you can take it away.',
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
        /**
         * ── This step contradicted the one above it ────────────────────────────────────────────
         *
         * It opened "Send EMBER to your account and it is credited once the network has buried it
         * under 60 blocks". Step one has just told the reader they PRODUCE EMBER in a browser tab;
         * step two then described the only other way of getting some, as though the first had not
         * happened, and left a reader wondering whether the coin they just mined is stuck for ten
         * minutes. Mining is the path this page is selling, so mining is what this step now
         * answers first, and the deposit wait is given as what it is — the case where the coin
         * came from somewhere else and could still be undone.
         */
        title: 'Keep it in a wallet that is yours',
        body: `What you mine is in your balance as soon as the block it paid you is part of the chain. EMBER sent in from outside is different: it waits until the network has buried it under ${claim('emberConfirmations')} blocks — about ${claim('emberConfirmationMinutes')} minutes — because until then somebody else's chain can still take it back. Either way it is one wallet and one balance.`,
      },
      {
        verb: 'Spend',
        accentKey: 'site' as SurfaceKey,
        title: 'Spend it on anything here',
        body: `The same balance pays for a bet, a trade, a token launch, a listing and an item in a game. Small amounts are written in Sparks — ${claim('sparksPerEmber')} Sparks to one EMBER — which is the same money written shorter, not a second currency with its own rate.`,
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
    /**
     * "None of them is a tab inside another" was an answer to a question nobody asked. It is a
     * denial of an architecture the reader was never told to suspect, and the owner's response was
     * simply "what does that mean?". The useful fact in its place is the one thing a reader
     * genuinely wonders when shown six products: do I have to sign up six times.
     */
    title: 'Where to spend it',
    lede: `${sentenceCase(productCount())} places, and signing in to one signs you in to all of them.`,
    hubAside: 'Your balance, your wallet, and a record of everything you have done, on one screen.',
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
    /**
     * The lede said why the SECTION exists: "They are on the front page because a reader who never
     * scrolls past it would otherwise never learn that any of them is here." That is an editorial
     * note about page layout, addressed to whoever maintains this file. A reader does not care
     * where a block sits or why, and being told the reasoning is faintly insulting — it explains
     * the shelf instead of the thing on it. What they need is that all three are real now.
     */
    title: 'Three things worth knowing',
    lede: 'All three of these are running today, and all three are easy to miss.',
    items: [
      {
        title: 'Mining that runs in a browser tab',
        accentKey: 'network' as SurfaceKey,
        linkTo: 'network',
        linkLabel: 'How mining works',
        /**
         * A SECOND link, and the only thing on this list that can end the journey.
         *
         * This is the item a reader who has been convinced clicks, and until now the only thing it
         * could offer them was another page about mining: `/products/network`, then the aside part
         * way down it, then the outbound link. Three clicks and two page loads between the promise
         * and the product, for the one action in this estate that needs no account at all
         * (docs/ecosystem/32-roadmap-ui-and-content.md §6.1, step 3).
         *
         * Both links stay, because they answer different questions. "How mining works" is for the
         * reader still deciding; this one is for the reader who has decided.
         *
         * The destination is NOT here. It is `minePage()` in `src/lib/hosts.ts` — the same
         * function the hero's primary button calls, so the two cannot drift and neither of them
         * spells a hostname, which nothing under `src` may do.
         */
        startLabel: 'Start mining',
        body: 'No installer, no graphics card, no pool account. Open the page, press start, and the tab begins hashing. Your mining key is generated in the browser and never leaves it, and mining pauses on battery unless you say otherwise.',
      },
      {
        /**
         * ── This was factually wrong, and the owner caught it ─────────────────────────────────
         *
         * It said "Hearth runs the Ethereum virtual machine". Hearth does not run Ethereum's EVM;
         * it is a Node implementation of one, written here. The distinction matters both ways
         * round: it overstates the borrowed guarantee — a reader could take it to mean audited
         * upstream code is executing their contract, which it is not — and it understates what
         * was actually built, which is a compatible virtual machine from scratch. The compatible
         * part is the reader's benefit, so it stays; the claim to be running somebody else's code
         * goes.
         */
        title: 'A chain your Ethereum tools already work with',
        accentKey: 'network' as SurfaceKey,
        linkTo: 'network',
        linkLabel: 'Connect a wallet or a toolchain',
        body: `Hearth is our own chain, and its virtual machine is an Ethereum-compatible one we wrote in Node rather than Ethereum's own. In practice that means MetaMask, ethers, viem, Hardhat and Foundry connect to it with no changes — chain ${claim('emberChainId')} for the main network, ${claim('emberTestnetChainId')} for the test network — and a contract written for Ethereum deploys here as it is.`,
      },
      {
        title: 'Six coins, not just ours',
        accentKey: 'foresight' as SurfaceKey,
        linkTo: 'foresight',
        linkLabel: 'What you can bet and trade with',
        body: `Your wallet holds ${claim('chainNames')}. Strategies are backtested against real Bitcoin, Ethereum, Solana and XRP price history, and you can place a bet with whichever of those coins you already hold rather than one the platform prefers.`,
      },
    ],
  },
  closing: {
    title: 'New, and honest about it',
    // "It went public this week" was here, and a sentence carrying a week goes wrong on its own
    // after seven days without anybody editing it. The claim underneath it — new, and no track
    // record — is the one that is worth making and stays true for as long as it is true.
    //
    // The rest of the paragraph then explained our editorial policy: "Rather than pick whichever
    // half of that flatters us…". The reader has to hold two abstractions to parse that and gets
    // nothing for it. What they need is the two plain facts and where to go for the detail.
    body: 'Almost everything described here is built and running. None of it has been running for long, and nothing has a track record yet. The build page goes through it part by part: what works, what does not, and how we check.',
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
  /**
   * ── The headline and the standfirst disagreed on the screen ─────────────────────────────────
   *
   * "Seven places to go, one account" sat directly above "Six destinations you choose between,
   * plus the account they all run on". Both counts are correct — seven surfaces, of which six are
   * products and one is Hub — but a reader meeting them a line apart just sees a page that cannot
   * count, and has to work out the reconciliation themselves to find out it was never wrong.
   *
   * Both numbers stay derived from the registry rather than typed. The fix is to say the whole
   * arithmetic in the headline, so the standfirst never has to correct it.
   */
  eyebrow: 'The ecosystem',
  headline: `${sentenceCase(productCount())} places to spend EMBER, and the account behind them`,
  standfirst: [
    'Each one does a different job, and one sign-in gets you into all of them. Every one of them says how far along it is, and that is read from the running system rather than typed in here.',
  ],
  controlCentreTitle: 'The account everything runs on',
  productsTitle: `The ${productCount()} places`,
  /**
   * This lede read: "Listed in the order the product switcher uses, which is arranged so no two
   * neighbouring colours can be mistaken for each other." That is a note about the design system,
   * on a page whose reader is deciding what to try first. The colour rule is real and worth having
   * — it is enforced in `ui/packages/ui/src/surfaces.ts` and tested — but a customer does not need
   * to be told the ordering algorithm behind a list of six things.
   */
  productsLede: 'Any of them will work with the account you already have.',
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
  /**
   * The last sentence used to be "The documentation is more use to them than a page like this
   * one." The owner's note: "this is not a documentation, is a page in a site." They are right —
   * this is a marketing site, and a marketing page that shrugs a reader off towards docs has
   * declined to do its own job. It also read as an apology for an omission. The developer platform
   * is not missing from this list; it belongs to a different question, and saying which question
   * is the whole content of the section.
   */
  notHere: {
    title: 'One thing that is not on this list',
    body: [
      'The developer platform — projects, API keys, webhooks, a software development kit and a sandbox — is built and running, on its own site. It is not listed here because this page answers "where can I spend EMBER", and the developer platform answers a different one: how to build something of your own on top of all this. There is a link to it at the bottom of every page.',
    ],
  },
} as const

/* ───────────────────────────── platform ───────────────────────────── */

export const PLATFORM = {
  /**
   * ── This page opened with an argument instead of an offer ───────────────────────────────────
   *
   * The headline was "What one platform actually means" and the first sentence was "Sharing a logo
   * does not make several products one platform." That is a position in a debate about the word
   * "platform", and the owner's verdict was that a reader "doesn't want an explanation of what an
   * ecosystem might be, wants to know what we have and we offer". The debate is also one we are
   * having with ourselves — the reader has not accused us of anything.
   *
   * What survives is the substance: the list of eleven, unfinished parts marked. That was always
   * the good part of this page, and it is now what the page opens by offering rather than what it
   * offers after winning an argument first.
   */
  eyebrow: 'The platform',
  headline: 'One account, one wallet, one history',
  blurb:
    'Everything on CloudsForge runs on a single account: one wallet, one balance, one record of what you have done — with the parts still being built marked as such.',
  standfirst: [
    'Everything on CloudsForge runs on one account. That means one wallet holding one balance, one record of everything you have ever done here, and whatever you make in one product working in the others.',
    `Below is the full list of what that has to mean — all ${claim('platformTests')} of them, with the ones we have not finished yet marked. We publish the unfinished ones because a list you only show once you pass it tells the reader nothing about the ones you failed.`,
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
  testsNote: `${claim('platformTests')} statements. No release ships unless it moves at least one of them from false to true.`,
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
      'A price on a marketing page is a price you will quote back at support, and you will be right to. So this page publishes what is free — which is a decision rather than a number that can move — and will publish a price when the code that charges it and the page that quotes it can be shown to agree.',
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
  /**
   * The headline was "An ecosystem, from the currency up" under the eyebrow "The ecosystem", which
   * is what the ECOSYSTEM page is called. The owner clicked About and reported landing on the
   * ecosystem page. They had not — the scroll bug in `components/shell.tsx` was putting them
   * part-way down other pages too — but on this one the top of the page genuinely reads as the
   * wrong page, and two pages that announce themselves with the same noun are one page as far as
   * anybody navigating is concerned. This page's actual subject is the reasoning, so it says so.
   */
  eyebrow: 'About us',
  headline: 'Why we built it this way',
  blurb:
    'CloudsForge makes the currency, the rails that move it, the tools that create with it and the worlds that spend it. Why it is built that way.',
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
    'Where every part of CloudsForge stands today: what is open to the public, what runs in-house, what is still being written, and how new all of it is.',
  standfirst: [
    'This ecosystem is built as a set of independent services. They run together, and they now answer on the public internet — from one machine, with no failover and no backup anyone has ever restored.',
    'Both halves of it are on this page. What is running is worth knowing before you spend an evening on it; what it is running on is worth knowing before you trust it with money.',
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
