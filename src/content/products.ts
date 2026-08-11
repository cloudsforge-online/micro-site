/**
 * The product pages, as data.
 *
 * The name, the accent, the verb, the one-line blurb and the URL of every surface come from
 * `@cloudsforge/ui`'s registry and are never restated here — only the prose is local. So a seventh
 * product is a registry entry plus one block below, and this site cannot disagree with the product
 * switcher about what CloudsForge offers.
 *
 * Every page carries a `stage` and a `stageNote`, and both are rendered on the card and at the top
 * of the page. `./stages.ts` defines the three states as yes/no questions about the running estate,
 * and `test/estate-stages.test.ts` recomputes every value below from the deployment file and the
 * browser smoke tier. A stage a reader can check is the only kind worth publishing.
 *
 * Everything here is plain data with no JSX in it, so `test/content.test.ts` can read every sentence
 * this site publishes without rendering anything. Copy that lives inside a component is copy no test
 * can see.
 */
/**
 * `NOT_PAID_CLAUSE` is imported rather than retyped. It is the sentence `MiningControl` renders in
 * the bar on every surface in the estate, and the pool page below is the one page here that offers
 * mining — so the two have to be the same statement, not two statements a reader has to reconcile.
 * Importing it also means this page stops saying it on the day it stops being true.
 */
import { NOT_PAID_CLAUSE, PRODUCTS, surface, type SurfaceKey } from '@cloudsforge/ui'
import { claim } from './claims.ts'
import type { Stage } from './stages.ts'

export interface Section {
  readonly title: string
  /** Paragraphs. Each is one idea; none is a bullet list wearing a full stop. */
  readonly body: readonly string[]
  /** An optional list under the paragraphs, for things that genuinely are a list. */
  readonly points?: readonly string[]
}

export interface ProductPage {
  /** The registry key. `test/content.test.ts` fails if it is not a surface the registry knows. */
  readonly key: SurfaceKey
  /** The URL segment under `/products/`. Always equal to the key; declared so the test can say so. */
  readonly slug: string
  /** The verb-or-role line above the headline. */
  readonly eyebrow: string
  readonly headline: string
  /** One paragraph, under the headline, that has to survive being read on its own. */
  readonly standfirst: readonly string[]
  /**
   * The search-result and link-preview description.
   *
   * Deliberately not the standfirst. A standfirst is read under a headline that is already on
   * screen; a description is read with no headline and inside a length budget, and reusing one as
   * the other produces something truncated mid-clause. `test/meta.test.ts` holds every blurb on
   * this site to that budget.
   */
  readonly blurb: string
  readonly stage: Stage
  /** The specific truth about this surface's state. Never a synonym for the stage label. */
  readonly stageNote: string
  readonly sections: readonly Section[]
  /**
   * Which surface's host the page's outbound link resolves to. Usually the page's own key; for a
   * surface with no application of its own it is the one that fronts it.
   */
  readonly linkTo: SurfaceKey
  readonly linkLabel: string
  /** Card image for this page's Open Graph tag. Served from `public/og/`. */
  readonly ogImage: string
}

/**
 * Counts, spelled.
 *
 * A word is a number. "Five products on one account" was typed into JSX in three files and went on
 * being rendered after a sixth product was added, because the digit scan only reads `src/content`
 * and only matches digits. So the counts are computed here, the sentences that carry them live in
 * `./pages.ts` where the copy walk can see them, and adding a product changes nothing anybody has
 * to remember.
 *
 * THE TABLES SIT ABOVE THE COPY, and the functions that read them below it, which is deliberate
 * rather than untidy. A `const` is in its temporal dead zone until the line that declares it runs,
 * while a function declaration is hoisted — so a section title spelled at module initialisation
 * (Hub's "One balance instead of eight") can call `chainCount()` from inside the array literal
 * below, but only if these two tables are already initialised when that literal is evaluated.
 * Declared after it, the module throws `Cannot access 'CARDINALS' before initialization` on import
 * and every suite in this repository fails at once.
 */
const CARDINALS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six',
  'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
] as const

const ORDINALS = [
  'zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth',
  'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth',
] as const

/**
 * The pages, in the order the story is told. One per product, plus Hub.
 *
 * This is NOT the registry's order, which is tuned so that no two neighbouring switcher accents can
 * be confused with each other. `test/content.test.ts` asserts that the set of product pages and the
 * set of registry products are the same set, which is the property that matters — a product with no
 * page, or a page with no product, both fail.
 */
export const PRODUCT_PAGES: readonly ProductPage[] = [
  {
    key: 'hub',
    slug: 'hub',
    eyebrow: 'Your account',
    headline: 'Everything you own, on one screen',
    standfirst: [
      'Forge Hub is your CloudsForge account: balances across every chain, deposits and withdrawals, the full history of what has happened to your money, and the keys and sessions that protect it.',
      'It is not one of the products you choose between. It is the account the products run on, which is why it is not in the switcher — you are already inside it.',
    ],
    blurb:
      'Forge Hub is your CloudsForge account: balances on every supported chain, deposits, withdrawals, history and security, on one screen and under one sign-in.',
    stage: 'open',
    stageNote:
      'Open to the public. The account, the sign-in and the portfolio work end to end through a real browser, and the surface answers on the public internet. Nobody outside the project has used it yet.',
    sections: [
      {
        title: `One balance instead of ${chainCount()}`,
        body: [
          'Hub adds up what you hold across every chain the platform supports and shows it as one figure, with each holding underneath it. Deposits still waiting on confirmations, withdrawals in flight and every past movement sit on a single timeline.',
          'You do not visit a different screen per product to find out what you own. There is one account, so there is one answer.',
        ],
      },
      {
        title: 'A missing price is shown as missing',
        body: [
          'If a valuation cannot be fetched, Hub does not print a total. A portfolio worth nothing and a portfolio that cannot be priced right now are not the same thing, and only one of them should alarm you.',
          'Each unpriced holding shows its amount and the reason its value is absent, and every quote carries the time it was taken. Your balance is exactly as true as it ever was.',
        ],
      },
      {
        title: 'One thing failing costs one panel',
        body: [
          'If pricing is unreachable your balances still load. If the activity feed is down your wallets still render. Each panel carries its own status, so a single unhealthy dependency costs that panel rather than the page.',
          'A panel that cannot load says so. It never draws an empty list, because "you have no wallets" is a worse answer than "this did not load".',
        ],
      },
      {
        title: 'Getting your money out is free',
        body: [
          'Deposits, transfers between CloudsForge accounts, withdrawals to your own address and exporting your private key or recovery phrase are all free, and always will be. The platform charges for work it does for you, never for reaching your own money.',
        ],
      },
    ],
    linkTo: 'hub',
    linkLabel: 'Open Forge Hub',
    ogImage: '/og/hub.png',
  },

  {
    key: 'network',
    slug: 'network',
    eyebrow: 'Mine',
    headline: 'Mine EMBER in a browser tab, or on any spare processor',
    standfirst: [
      'EMBER is proof-of-work money. Homefire, the algorithm behind it, is memory-hard and runs well on ordinary processors, so there is no rig to buy and no pool to join.',
      'You can start straight away, in this browser, on the machine you are reading this on. The block reward is paid to an address only you hold the key to.',
    ],
    blurb:
      'Mine EMBER in your browser or on any spare processor — no rig, no pool, no install. Hearth, the chain underneath it, is a full Ethereum virtual machine.',
    stage: 'open',
    stageNote:
      'Open to the public. The main network mines, a public node answers Ethereum JSON-RPC and a public block explorer runs beside it. The chain is new, and EMBER has no market and no listing — the price shown for it is one we set ourselves, not one anybody has paid.',
    sections: [
      {
        title: 'Mining starts in a browser tab',
        body: [
          'Open the mining page, create an address, and press start. Your browser runs the same proof-of-work the node runs, and when it finds a block the reward goes to that address. There is nothing to install and no account to create.',
          'The key is generated in the tab, stays in the tab, and is never sent to us. That also means we cannot recover it: save it before you start, or the address and everything paid to it are gone when you close the page.',
          'It is polite by default. On a laptop running on battery the miner holds at zero rather than draining it, tells you that is why the rate is zero, and gives you a switch to override it.',
        ],
      },
      {
        title: 'Ordinary processors, on purpose',
        body: [
          'Proof of work was meant to be one processor, one vote. What it became was a hardware industry, which is a strange foundation for money that is supposed to be open to anyone.',
          'Homefire is memory-hard, so purpose-built silicon buys far less advantage than it does elsewhere. A winning proof must also be signed by the key it pays, so work you do cannot be quietly redirected to somebody else.',
        ],
      },
      {
        title: 'A real Ethereum machine, not a lookalike',
        body: [
          `Hearth is a full EVM chain with an account model and Ethereum JSON-RPC. Add it to MetaMask, point ethers, viem, Hardhat or Foundry at it, and deploy — nothing needs a translation layer, and no library needs patching.`,
          `The main network is chain ${claim('emberChainId')} and the test network is chain ${claim('emberTestnetChainId')}; the two are deliberately separate so a test transaction can never be replayed for real money. EMBER carries ${claim('emberDecimals')} decimals, like every native asset Ethereum tooling expects, and fees follow EIP-1559.`,
          'Contract calls, logs, event filters, receipts, gas estimation and the transaction pool are all served, so the tools you already know work without being told they are talking to something unusual.',
        ],
      },
      {
        title: 'Deposits wait, and the wait is published',
        body: [
          `An EMBER deposit shows as pending the moment the network sees it and becomes spendable ${claim('emberConfirmations')} blocks later, which is about ${claim('emberConfirmationMinutes')} minutes. That is the same depth the chain publishes to exchanges.`,
          `Nothing is credited before that depth. A reorganisation ${claim('emberReorgAlarmDepth')} blocks deep or more stops crediting for the chain entirely and wakes an operator.`,
        ],
      },
      {
        title: 'Free coins for building against',
        body: [
          'The test network has a faucet. It hands out worthless EMBER so you can deploy a contract, break it, and deploy it again without mining first or spending anything.',
        ],
      },
    ],
    linkTo: 'network',
    linkLabel: 'Start mining',
    ogImage: '/og/network.png',
  },

  {
    /**
     * ── THE POOL, AND WHY THIS PAGE EXISTS AT ALL ─────────────────────────────────────────────
     *
     * `/products/pool` was already a published address before it was a page. The home page's
     * "And Litecoin, in the same tab" capability carries `linkTo: 'pool'`, and `src/pages/home.tsx`
     * renders that as `/products/<slug>` — so the visible call to action "See the pool" pointed at
     * `/products/pool`, which `nginx.conf` enumerates no location for. Measured 2026-08-10: a hard
     * 404, on the one link the front page offers a reader who has just been told the pool exists.
     * This entry is the destination that link always claimed to have.
     *
     * ── IT IS A PAGE UNDER /products, AND IT IS STILL NOT A PRODUCT ───────────────────────────
     *
     * `key: 'pool'` is a `service` in the registry and stays one. `productCards()` filters on
     * `kind === 'product'`, so this page puts no seventh card on the index grid, `productCount()`
     * is still six, and none of the copy or art that was validated for six products moves. Hub is
     * the precedent and the mechanism was already built for a second one: `surfaceCount()` counts
     * PRODUCT_PAGES rather than `PRODUCTS.length + 1` precisely "so that a second non-product page
     * would be counted rather than assumed away". This is that second page.
     *
     * ── WHAT THIS PAGE MAY SAY, AND WHAT ONLY THE CONSOLE MAY SAY ─────────────────────────────
     *
     * Everything measurable about this pool changes without anybody editing this repository: which
     * chains it serves, whether a template is fresh, what the stratum endpoint is, whether merged
     * mining is committing. `micro-pool-web` reads all of that from `GET /v1/pool` on every load
     * and is therefore the only surface that can state it truthfully. So this page carries the
     * PROPOSITION — what the pool is, the two ways in, what a share is worth, what is switched off
     * — and defers every number to the console, which is also why there is not a single digit in
     * the copy below.
     *
     * That split is not merely taste here; this repository enforces it. `test/content.test.ts`
     * refuses an unregistered digit, refuses any percentage, and refuses a `:NNNN` port anywhere
     * in published copy. A page that tried to print the fee, the stratum port or the chain height
     * could not pass its own suite — which is the correct answer, because all three belong to the
     * service and not to a marketing page.
     *
     * ── EVERY CLAIM BELOW, AND HOW IT WAS CHECKED ─────────────────────────────────────────────
     *
     * Read from `GET /v1/pool` on mainnet, 2026-08-11 — TWO chains now, where the 2026-08-10
     * reading of this same route had one:
     *
     *   chains          `ltc`, Litecoin, scrypt, `ready: true`, and `btc`, Bitcoin, sha256d,
     *                   `ready: true` — both building templates against the estate's own nodes
     *   payoutsImplemented  false
     *   merged          null on both — nothing configured, so no Dogecoin commitment is built
     *   stratumEndpoint null on both — NO PUBLIC STRATUM ENDPOINT IS PUBLISHED
     *   websocketEndpoint  LTC: a `wss://` address on the console's own host. BTC: **null**
     *   browserMining   LTC: `{available, reason: null}`. BTC: `{available: false, reason: …}`
     *
     * So Bitcoin is now named, and it is named with its own asymmetry rather than beside Litecoin
     * as though the two were offered alike. Bitcoin was excluded on 2026-08-10 because a synced
     * node is not a served chain and `POOL_CHAINS` did not list it; bitcoind reached the tip that
     * day, `POOL_CHAINS` names both from 2026-08-11, and the pool now hands out real Bitcoin work.
     *
     * What it does NOT do is hand it to a browser, and that is a decision rather than a gap
     * (micro-org#360). `micro-pool` refuses BTC to the browser transport by name and says why on
     * the wire, because the Bitcoin network runs on purpose-built SHA-256 silicon and a tab
     * against it returns shares that can never become a block. Copy that said "mine Bitcoin in a
     * browser tab" would be selling a tab an outcome it cannot reach — so the sections below name
     * the second chain and name the hardware in the same breath, every time.
     *
     * Dogecoin is named as built-and-off, because AuxPoW merge-mining is merged in `micro-pool`
     * and `POOL_LTC_AUX_CHAINS` is unset while our Dogecoin node is still in initial block
     * download. Naming it without the denial would describe an income that does not exist.
     *
     * The `stratumEndpoint: null` is the one that shapes the whole "bring your own miner" section.
     * It is not an oversight waiting on a config value: `deploy/cloudflared/config.mainnet.public.
     * yml` argues it out at length — stratum is newline-delimited JSON-RPC over a raw TCP socket,
     * a Cloudflare Tunnel forwards HTTP, and Traefik has no router for a stream with no requests
     * in it. `pool.<apex>` serves the console and can never serve the connection. So the section
     * says the path is real, says where the address comes from, and does not invent one. An
     * earlier draft of `micro-pool-web` composed `stratum+tcp://pool.<apex>:<port>` by hand and
     * published something no miner on earth could dial; its `src/lib/hosts.ts` is the record of
     * why that is never done again.
     */
    key: 'pool',
    slug: 'pool',
    eyebrow: 'Mine together',
    // The title this page publishes is `${linkLabel} — ${headline} — CloudsForge`, and
    // `test/meta.test.ts` holds that to ninety characters. Both halves below are written to that
    // budget rather than trimmed by it later; "or on your own rig" is the shortest phrasing that
    // still names the second way in, which is the half a reader with hardware is scanning for.
    headline: 'Mine Litecoin in a browser tab, or Bitcoin with a rig',
    standfirst: [
      'CloudsForge runs its own mining pool. It builds the block templates itself from the estate’s own Litecoin and Bitcoin nodes, hands out work, checks every share that comes back and submits the blocks — there is no third-party pool in the middle and no account to open on one.',
      'There are two ways in and they take the same work. A browser tab can hash for Litecoin with nothing installed, and any miner that speaks Stratum — the protocol the firmware on deployed hardware already talks — can be pointed at either chain. Bitcoin is offered to hardware only, and the pool says so itself rather than leaving a tab to find out.',
    ],
    blurb:
      'Mine on CloudsForge’s own pool: hash for Litecoin in a browser tab with nothing installed, or point mining hardware you own at Litecoin or Bitcoin.',
    stage: 'open',
    stageNote:
      'Open to the public. The pool builds real Litecoin and Bitcoin templates against the estate’s own mainnet nodes and the console answers on the public internet. It records shares and settles none of them: there is no payout mechanism yet.',
    sections: [
      {
        title: 'Two ways in, and they earn the same shares',
        body: [
          'The first is a browser tab. The mining control in the bar at the top of every CloudsForge page opens a session against the pool over a WebSocket, and the hashing happens in the tab you are already looking at. Nothing is installed, no driver is needed and no graphics card is involved.',
          'The second is the miner you already run. The pool speaks Stratum over a plain socket, which is what cgminer, bfgminer and the firmware on an ASIC or a GPU rig already speak, so pointing one at it is a change of address rather than a change of software. Nothing about the protocol is unusual and nothing needs patching.',
          'Both paths are judged identically. A share found in a tab and a share found by a rig are the same record, weighted the same way, against the same window. What differs is which chains each path is offered, and the pool answers that itself — the console asks it on every load.',
        ],
      },
      {
        title: 'Two chains, and only one of them belongs in a tab',
        body: [
          'The pool serves Litecoin, where the work is scrypt, and Bitcoin, where it is the algorithm the whole ASIC industry was built around. Both are built against the estate’s own fully synced nodes. Which chains are being served is a live fact about a running service, so it is deliberately not restated as a number anywhere on this page — the console reads it from the pool itself on every load rather than from copy somebody typed.',
          'Bitcoin is offered to mining hardware and refused to browsers, on purpose. The Bitcoin network is secured by an enormous quantity of purpose-built silicon that does nothing else, and a browser tab hashing against it would return shares that can never become a block — a real session, honestly recorded, mining something unreachable. So the pool declines the chain to the browser transport and states the reason in its own response, and every surface that offers mining prints that reason rather than quietly leaving Bitcoin off a list.',
          'A synced node is not the same thing as a served chain, and a served chain is not the same thing as one you should mine in a tab. Anything else you might want to know before pointing hardware somewhere — what it is building on right now, how fresh the work is, what it has actually found — is on the console for the same reason.',
        ],
      },
      {
        title: 'Dogecoin is built, and it is switched off',
        body: [
          'Dogecoin can be merge-mined from Litecoin work: one scrypt solution can win a block on both chains at once, and it costs a miner no extra hashing, no second connection and no second worker. That is built and merged here, not planned.',
          'It is switched off, and it stays off until our own Dogecoin node has caught up with the chain. A node still downloading history would hand out work for a chain nobody else is building on, so the shares would be real and the Dogecoin half of them worth nothing. The pool reports whether it is committing to a merged chain as a field rather than as a claim, because this is a feature that fails by silently doing nothing.',
        ],
      },
      {
        /**
         * The literal `NOT_PAID_CLAUSE` from the design system, not a paraphrase of it. The same
         * sentence is rendered by `MiningControl` in the bar on every surface in the estate, so a
         * reader who meets it here and meets it there meets one statement rather than two that
         * have to be reconciled. Importing it also means it stops being said here on the day it
         * stops being true, instead of surviving as the last stale copy.
         */
        title: 'Nothing is paid out yet',
        body: [
          `The pool records what you did and settles none of it. ${NOT_PAID_CLAUSE}`,
          'So there is no balance on the console, no estimated earnings and no next payout — not zeroed and not greyed out, because a zero reads as “not yet, but soon” and the truth is “not at all, and there is no mechanism”. What the pool does have is your share history, share by share, which you can check against your own machine.',
          'If you mine here today, mine here because you want to see it work. It is not an income and this page will not describe it as one.',
        ],
      },
      {
        title: 'Bringing your own miner is a question about your network',
        body: [
          'The console is on the public internet; the thing a miner dials is not. Stratum is a raw socket with no requests in it, and the tunnel that publishes every CloudsForge address forwards web traffic — it cannot carry that stream, and no amount of configuration on this side changes what a tunnel is.',
          'So a rig reaches the pool across the local network, on the address an operator has chosen to expose, or it does not reach it yet. The console publishes that address the moment there is one to publish and says plainly when there is not, rather than composing something that looks copy-pasteable and connects to nothing.',
          'What does not change is the rest of it: the username a miner authenticates with is your payout address and a worker name you pick, split on the first dot, and the password is ignored. The console carries the exact line to paste, beside whichever endpoint is really being served.',
        ],
      },
    ],
    linkTo: 'pool',
    linkLabel: 'Open the pool',
    /**
     * The company card, deliberately, rather than a mark invented for this page.
     *
     * Every other page here uses its surface's own brand art, and `micro-brand` has no
     * `assets/pool/` set — which is why the registry row carries `markId: null`. The honest
     * answer to "there is no mark" is the company card that every non-product address on this
     * site already uses (`DEFAULT_IMAGE` in `src/lib/meta.ts`), not a lookalike drawn here to
     * fill the slot. A mark is a brand decision made in the brand repository.
     */
    ogImage: '/og-1200x630.png',
  },

  {
    key: 'create',
    slug: 'create',
    eyebrow: 'Make',
    headline: 'Launch a token you own outright',
    standfirst: [
      'Forge Create deploys a real ERC-20 contract to a real chain, from bytecode that was written, compiled and committed in advance rather than assembled when you ask for it.',
      'Your wallet is named as owner in the constructor, from the first block. The platform pays the gas and keeps no authority over what it deployed.',
    ],
    blurb:
      'Deploy a real ERC-20 token from pre-compiled bytecode. Your wallet owns it from the first block; the platform pays the gas and holds no authority over it.',
    stage: 'open',
    stageNote:
      'Open to the public. The deployment service, the brand-generation engine and the application you use are all running and reachable. Every contract deployed so far went to a test network.',
    sections: [
      {
        title: 'A real contract on a real chain',
        body: [
          'The token is a standard ERC-20 on Hearth, which is a full Ethereum virtual machine. It shows up in any wallet, any explorer and any library that has ever handled an ERC-20, because that is exactly what it is.',
          'The bytecode is compiled from source that is committed and reviewed, not generated per request. That is the difference between a contract you can read before you order it and one you find out about afterwards.',
        ],
      },
      {
        title: 'You are the owner, not the tenant',
        body: [
          'The address named as owner is yours. The platform cannot mint, pause or transfer ownership of your token, because it never held the authority to. That is a property of the deployed bytecode rather than a policy that could be revised later.',
        ],
      },
      {
        title: 'The deploy does not hang on your browser',
        body: [
          'Deploying takes as long as the chain takes to include the transaction, which is not something an HTTP request should be asked to survive. Forge Create accepts the order, gives you somewhere to watch it, and records the broadcast and its outcome as they happen.',
          'A deploy that succeeds after you have closed the tab is still a deploy that succeeded, and there is a record of it either way.',
        ],
      },
      {
        title: 'A name, a mark and a palette to go with it',
        body: [
          'The same product generates the brand: a name, a logo mark, a colour set and the asset sizes you need for a listing or a social profile, produced as a kit rather than as one image you then have to crop eight times.',
        ],
      },
      {
        title: 'What is deliberately not sold here',
        body: [
          'There is no liquidity-lock helper and no metadata-verification badge. Both were once advertised here, neither was ever built, and rather than leave the promise standing we took it down.',
          'The rule they were removed under applies to the API as well as the interface: nothing is on sale unless something delivers it.',
        ],
      },
    ],
    linkTo: 'create',
    linkLabel: 'Open Forge Create',
    ogImage: '/og/create.png',
  },

  {
    key: 'trade',
    slug: 'trade',
    eyebrow: 'Trade',
    headline: 'Trade crypto natively, with no exchange in the middle',
    standfirst: [
      'Trade Bitcoin, Ethereum, Solana and XRP with the coins you already hold. It settles on chain against a price feed, so there is no order book, no exchange account to open, and nobody else is holding what you trade with while it happens.',
      'Any strategy can be run against real market history first — with fees and slippage charged — then as a paper bot on live prices, and only then with money behind it.',
    ],
    blurb:
      'Trade crypto natively: strategies settle on chain against a price feed, with no order book and no exchange account. Test on real history before you fund one.',
    stage: 'open',
    stageNote:
      'Open to the public. Backtesting, fills, fees and the performance accounting run behind an application anyone can reach. Live trading is switched off in the running service and stays off until a full cycle has completed on testnet.',
    sections: [
      {
        title: 'Nothing here is an exchange account',
        body: [
          'You are not depositing into an order book and you are not trusting a venue to hold a trading pair for you. A bot settles against a price oracle, on coins the platform already holds, and the record of what it did is on the chain rather than in somebody\'s internal ledger.',
          'That is what "natively" means here, and it is also the limit of it: it is trading, not an exchange, and the section at the bottom of this page says where that boundary is and why it does not move.',
        ],
      },
      {
        title: 'The backtest charges you',
        body: [
          'A backtest that ignores fees and assumes you got the price you asked for is a machine for producing strategies that work in a spreadsheet. This one models the fill and takes the fee, which makes the results worse and makes them mean something.',
          'Every result is labelled for what it is: modelled, not promised. A past equity curve describes a market that has already happened.',
        ],
      },
      {
        title: 'Three steps, in order',
        body: [
          'Backtest against history. Then run the same strategy as a paper bot against live prices, where it can be wrong for free. Only then fund it.',
          'Backtesting, the full strategy catalogue and paper trading are free and unlimited. You are never charged to find out that an idea does not work.',
        ],
      },
      {
        title: 'You are billed on new gains only',
        body: [
          'Where a funded bot is charged, it is charged on gains above its own previous best, never on recovery from a loss. A bot that falls and climbs back to where it was has produced nothing, and billing it for the climb is billing twice for one gain.',
          'Every assessment shows the equity, the high-water mark, the gain and the rate applied, so the number you are charged is one you can check.',
        ],
      },
      {
        title: 'This is not an exchange',
        body: [
          'There is no order book, no market making, and no custody of anybody else\'s trading pairs. A bot settles against a price oracle on coins the platform already holds.',
          'That is a permanent boundary rather than a stage on a roadmap. The other side of it is a different company with a different regulator.',
        ],
      },
    ],
    linkTo: 'trade',
    linkLabel: 'Open Forge Trade',
    ogImage: '/og/trade.png',
  },

  {
    key: 'foresight',
    slug: 'foresight',
    eyebrow: 'Bet',
    headline: 'Bet on what happens next, in coins you already hold',
    // ── THE THREE SENTENCES BELOW NAME `stakeAssets`, NEVER `chains` (micro-org#291) ───────────
    //
    // They used to read "any of the 8 chains the platform supports" and name all eight, because
    // both halves derived from `ON_CHAIN_ASSETS` — the register of chains the estate MODELS. What
    // this page is promising is what Foresight will ACCEPT, which is the enabled rows of its stake
    // registry. Measured 2026-08-09 the two are off by four: ETC, DOGE, SOL and XRP are not
    // disabled rows in `stake_assets`, they are not rows at all, so a bettor arriving with one is
    // answered 404 by a page that had just named them. The blurb below said "Solana, XRP" outright.
    //
    // The count and the names now come from `foresight/src/stakeassets.ts`, and neither is typed
    // here — a fifth enabled asset rewrites all three sentences with nothing for anybody to
    // remember, which is the property the wrong derivation had and was the only good thing about it.
    standfirst: [
      `Markets on future events, settled by the contract that holds the money. You can stake in any of the ${claim('stakeAssets')} assets Foresight accepts — ${claim('stakeAssetNames')} — or in an ERC-20 token the platform has enabled, and every stake joins one EMBER pool.`,
      'If a market is voided you are refunded in the asset you staked, in the amount you staked. Not its value at some later rate.',
    ],
    // The blurb is this page's meta description, so it is written against a 160-character ceiling
    // (test/meta.test.ts) with a derived list inside it. A fifth enabled asset lengthens it and may
    // push it over — which is the right failure and a loud one, and much better than the list being
    // typed short to fit.
    blurb: `Bet on what happens next with ${claim('stakeAssetNames')} or an enabled ERC-20 token. The contract holds the money and pays the winners — not us.`,
    stage: 'open',
    stageNote:
      'Open to the public. The service, the contract, the staking application and the console operators open questions from are all running and reachable. Every market so far has settled on an EMBER test network.',
    sections: [
      {
        title: 'Bet with what you already own',
        body: [
          `Most prediction markets make you buy their own token before you can have an opinion. This one does not: bring ${claim('stakeAssetNames')}, or any ERC-20 token the platform has enabled, and stake it directly.`,
          'Whatever you bring is converted at the rate recorded when you stake and joins a single pool denominated in EMBER, so everyone in a market is in the same pool no matter what they arrived with.',
          'A token is identified by its chain, its network and its contract address, so two deployments of the same brand are two different assets and are never confused for each other.',
        ],
      },
      {
        title: 'The contract holds the money, not us',
        body: [
          'Your stake goes from your wallet to the market contract and never passes through our service. What we keep is a mirror of the chain, used for browsing and notifications.',
          'If that mirror is wrong, or gone, the stakes are still in the contract and every winner can still claim directly from it. There is no house balance to pay you out of, and no way for us to be the reason a settled market does not pay.',
        ],
      },
      {
        title: 'The odds are the pool',
        body: [
          'This is parimutuel. Your return depends on how big the pool is when the market closes, not on a price quoted at the moment you staked, and the interface says so rather than showing a figure that looks like a guarantee.',
          'A stake you are about to place is added to the pool it would be paid from before the projection is drawn. Leaving it out makes the number roughly a third too flattering.',
        ],
      },
      {
        title: 'A model proposes, a person opens',
        body: [
          'Candidate questions are drafted by searching the web and asking a model, and every draft carries the query, the sources and the model that produced it. None of that can open a market on its own — an operator reads the sources and approves, edits or discards it.',
          'The resolution source is named when the market opens, not chosen when it resolves. If that source no longer exists at resolution the market is void and refunds in full, with no fee, rather than being settled on somebody\'s judgement of what probably happened.',
        ],
      },
    ],
    linkTo: 'foresight',
    linkLabel: 'Open Forge Foresight',
    ogImage: '/og/foresight.png',
  },

  {
    key: 'market',
    slug: 'market',
    eyebrow: 'Sell',
    headline: 'Buy and sell anything, on chain',
    standfirst: [
      'Listings, offers, escrow and settlement for tokens, game items and assets created on the platform or brought to it.',
      'Forge Market exists because making something has no point without somewhere to sell it. The seller sets a royalty, the platform takes a fee, and the arithmetic is enforced by the database rather than by the code that writes it.',
    ],
    blurb:
      'Listings, offers, escrow and settlement for what people make. The database itself makes the platform fee, the creator royalty and the seller\'s proceeds add up.',
    stage: 'open',
    stageNote:
      'Open to the public. Listings, bids, escrow, the order split and the risk indicators run behind an application anyone can reach. Nothing is listed on it yet, and an empty marketplace is what an empty marketplace looks like.',
    sections: [
      {
        title: 'The split has to add up',
        body: [
          'Every sale divides into a platform fee, whatever royalty the creator set, and the seller\'s proceeds. Those three are constrained to add up to the sale price by the database itself, so an order whose parts do not reconcile cannot be recorded — not even by something that has bypassed the service entirely.',
          'The royalty is the creator\'s revenue. The platform takes no share of it.',
        ],
      },
      {
        title: 'Terms cannot change mid-sale',
        body: [
          'The royalty split is copied onto a listing when the listing is created, not looked up when the sale completes. Editing a collection\'s default afterwards changes future listings and changes nothing about a sale already underway.',
          'A term that can be revised after a buyer has agreed to it is not a term.',
        ],
      },
      {
        title: 'Risk indicators are calculated, never bought',
        body: [
          'What a listing tells you about a token — whether a mint authority still exists, whether ownership has been renounced, how concentrated the supply is, how old it is — is derived from chain data. The seller cannot edit it and nobody can pay to have it changed.',
          'There is no badge that reads as an endorsement. Any check the platform sells is a statement about identity and disclosure, and it says exactly that in the words beside it.',
        ],
      },
    ],
    linkTo: 'market',
    linkLabel: 'Open Forge Market',
    ogImage: '/og/market.png',
  },

  {
    key: 'worlds',
    slug: 'worlds',
    eyebrow: 'Play',
    headline: 'Play in your browser, and really own what you win',
    standfirst: [
      'Three titles on one shared platform: a sky-island strategy game, a monster-collecting role-playing game, and a persistent world you build in a browser tab and get paid in EMBER for.',
      'Resources genuinely run out and seasons genuinely stop. When one stops the world is not deleted — it is sealed into a history you can walk back through, and a new one opens where everybody starts poor again.',
    ],
    blurb:
      'Three games on one account: sky-island strategy, monster collecting, and a browser world you build and earn EMBER in. Nothing purchasable is powerful.',
    stage: 'open',
    stageNote:
      'Open to the public. The platform is running, including the private worlds that were once sold and never provisioned, and so are all three titles. Nobody outside the project has played a season through.',
    sections: [
      {
        title: 'Three games, one account and one wallet',
        body: [
          'Aetherholm is a sky-island strategy game at the scale of a browser empire builder: seasons, archipelagos, cities, build queues and a directed wind that decides who can reach whom.',
          'Emberkin is a monster-collecting role-playing game built around a bond system between you and the creature you raise.',
          'Tessera is a world you build in a browser tab — claim ground, make objects from a prompt, open a place people visit, and get paid in EMBER when they buy what you made.',
          'One sign-in covers all three, and what you earn lands in the same wallet as everything else on the platform.',
        ],
      },
      {
        title: 'Scarcity is the game',
        body: [
          'A world holds a fixed amount of fuel, medicine and seed. That is not a difficulty setting, it is the whole subject. What is burned today is gone from the map, and the last of something is a thing people negotiate over rather than a thing they farm.',
        ],
      },
      {
        title: 'Nothing you can buy is powerful',
        body: [
          'What is purchasable is cosmetic, convenience, or access to reserved capacity. No resources, no extra turns, no combat advantage, no edge over another player of any kind.',
          'The rule is enforced in the database rather than in a policy document: an item of the powerful kind cannot be represented. A world whose scarcity can be bought out of has no story left in it, and the story is the product.',
        ],
      },
      {
        title: 'A private world is actually built',
        body: [
          'Renting a world for a group of friends was on sale in the previous version of this platform. It took the money, wrote the entitlement, and created nothing. Now it creates the world: its own simulation, its own stock, its own seed.',
        ],
      },
    ],
    linkTo: 'worlds',
    linkLabel: 'Open Forge Worlds',
    ogImage: '/og/worlds.png',
  },
]

/** Page lookup by slug. An unknown slug is a 404, never a redirect to the index. */
export function productPage(slug: string): ProductPage | undefined {
  return PRODUCT_PAGES.find((p) => p.slug === slug)
}

/**
 * A count as an English word.
 *
 * Throws rather than falling back to digits past the table. A silent fallback would put an
 * unregistered digit into copy, which the content scan would then fail on with a confusing message
 * — and the honest fix at that point is to extend the table.
 */
export function spell(n: number): string {
  const word = CARDINALS[n]
  if (word === undefined) throw new RangeError(`no cardinal for ${n}; extend CARDINALS`)
  return word
}

/** The same, as an ordinal — "a seventh product". */
export function spellOrdinal(n: number): string {
  const word = ORDINALS[n]
  if (word === undefined) throw new RangeError(`no ordinal for ${n}; extend ORDINALS`)
  return word
}

/** Capitalised, for the start of a sentence. */
export function sentenceCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/** Products in the registry, spelled. Six today. */
export function productCount(): string {
  return spell(PRODUCTS.length)
}

/**
 * Custodied chains, spelled. Eight today.
 *
 * ── Why this exists, dated ────────────────────────────────────────────────────────────────────
 *
 * On 2026-08-09 `micro-contracts` added ETC and DOGE to `ON_CHAIN_ASSETS`. `claims.ts` recomputes
 * the count and the names from that array, so `test/estate-claims.test.ts` went red and both were
 * corrected in one place. Two sentences did not move, because they spell the count as a WORD:
 * "Six coins, not just ours" on the home page and "One balance instead of six" on Hub's page. A
 * word is a number, the digit scan cannot see one, and the claims check reads the count and not
 * the sentence — so those two were the only places on the site where the old figure survived.
 *
 * That is the same failure `productCount` was written for, one register key over. So the word is
 * derived from the register entry rather than typed beside it, and the next asset changes both
 * halves of both sentences with nothing for anybody to remember.
 *
 * `spell` throws past twelve rather than falling back to a digit, which is the right failure: a
 * thirteenth chain should stop a build here and not put an unregistered numeral into copy.
 */
export function chainCount(): string {
  return spell(Number(claim('chains')))
}

/**
 * Pages under /products, spelled. Seven today: the products plus Hub.
 *
 * Counted from PRODUCT_PAGES rather than from `PRODUCTS.length + 1`, so that a second non-product
 * page would be counted rather than assumed away.
 */
export function surfaceCount(): string {
  return spell(PRODUCT_PAGES.length)
}

/** What Hub would be numbered if it were a product, which it is not. "Seventh" today. */
export function nextProductOrdinal(): string {
  return spellOrdinal(PRODUCTS.length + 1)
}

/**
 * The products, in the registry's own order, joined to their pages.
 *
 * Used by the products index and the home grid. Hub is deliberately absent: it is a `surface`
 * rather than a `product` in the registry, and an account is not something a person chooses between.
 */
export function productCards(): ReadonlyArray<{ surface: ReturnType<typeof surface>; page: ProductPage }> {
  return PRODUCTS.map((s) => {
    const page = PRODUCT_PAGES.find((p) => p.key === s.key)
    // Unreachable while the content test passes; throwing rather than filtering means a missing
    // page is a loud failure in dev instead of a product that silently stops being on the site.
    if (!page) throw new Error(`no product page for registry surface: ${s.key}`)
    return { surface: s, page }
  })
}

/** Hub's page, which every layout needs by name because it is never one of the cards. */
export function hubPage(): ProductPage {
  const page = PRODUCT_PAGES.find((p) => p.key === 'hub')
  if (!page) throw new Error('the hub page is missing')
  return page
}
