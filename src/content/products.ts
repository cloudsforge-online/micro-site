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
 * (Hub's "One balance instead of three") can call `creditableChainCount()` from inside the literal
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
      'The account, the sign-in and the portfolio work end to end through a real browser, and the surface answers on the public internet. Nobody outside the project has used it yet.',
    sections: [
      {
        // The count a reader checks this against is the number of coins they can actually put in,
        // not the number the ledger can denominate a balance in — see `creditableChainCount`.
        title: `One balance instead of ${creditableChainCount()}`,
        body: [
          'Hub adds up what you hold across every chain you can deposit on and shows it as one figure, with each holding underneath it. Deposits still waiting on confirmations, withdrawals in flight and every past movement sit on a single timeline.',
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
      'The main network mines, a public node answers Ethereum JSON-RPC and a public block explorer runs beside it. The chain is new, and EMBER has no market and no listing — the price shown for it is one we set ourselves, not one anybody has paid.',
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
     * `kind === 'product'`, so this page puts no seventh card on the PRODUCT grid, `productCount()`
     * is still six, and none of the copy or art that was validated for six products moves. Hub is
     * the precedent and the mechanism was already built for a second one: `surfaceCount()` counts
     * PRODUCT_PAGES rather than `PRODUCTS.length + 1` precisely "so that a second non-product page
     * would be counted rather than assumed away". This is that second page.
     *
     * It does now have a TILE, in the second grid, which is `nonProductCards()` — see the note on
     * that function (micro-org#488). Not being a product was always the right call and "therefore
     * findable from nowhere" was the part nobody chose. Its card is the same card; what it is not
     * is one of the six.
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
      'The pool builds real Litecoin and Bitcoin templates against the estate’s own mainnet nodes and the console answers on the public internet. It records shares and settles none of them: there is no payout mechanism yet.',
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
      'The deployment service, the brand-generation engine and the application you use are all running and reachable. Every contract deployed so far went to a test network.',
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
    // The clause this used to end on — "live trading is switched off in the running service" — now
    // lives on the registry's `incomplete` marker, which renders directly under this note on both
    // pages that show it. What stays here is the half a stage note is for: the CONDITION. The
    // marker says what you cannot do today; this says what has to happen before you can.
    stageNote:
      'Backtesting, fills, fees and the performance accounting run behind an application anyone can reach; live trading turns on when a full cycle has completed on testnet.',
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
      'The service, the contract, the staking application and the console operators open questions from are all running and reachable. Every market so far has settled on an EMBER test network.',
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
      'Listings, bids, escrow, the order split and the risk indicators run behind an application anyone can reach. Nothing is listed on it yet, and an empty marketplace is what an empty marketplace looks like.',
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
      'The platform is running, including the private worlds that were once sold and never provisioned, and so are all three titles. Nobody outside the project has played a season through.',
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

  /**
   * Forge Exchange — the first page on this site written BEFORE the thing it describes.
   *
   * ── IT WAS A PLAN FOR TWO DAYS, AND NOBODY DECIDED TO STOP CALLING IT ONE ─────────────────────
   *
   * Every other page here was written after the surface it describes was running, and the rule the
   * site is built on — say where a thing IS — was applied to them retroactively, which is the easy
   * direction. This was the hard one: publishing a plan is how a marketing site normally starts
   * lying, because a plan on a product page reads as a product with a date on it.
   *
   * It was publishable under one condition, which is the condition that has now paid for itself.
   * The chip is DERIVED — `test/estate-stages.test.ts` recomputes it from three facts in three
   * other repositories, none of them typed here: is there a service in the estate's compose file,
   * does the smoke tier drive the surface with a real browser, does a public hostname answer. On
   * 2026-08-16 micro-deploy declared `exchange-web`, added the gateway router and deleted the
   * surface from `EXPECTED_UNROUTED`; micro-beacon added it to the smoke tier; the suite recomputed
   * `running` and failed the build until this page agreed with it.
   *
   * So the words below changed because the estate changed, and the page never carried a date —
   * which is the one claim about the future nothing in this repository could have checked.
   *
   * ── AND THEN, THE SAME DAY, IT OPENED ────────────────────────────────────────────────────────
   *
   * The DNS record and the tunnel ingress rule are owner-only actions in the Cloudflare dashboard,
   * which is why `PUBLIC_SURFACES` in `./stages.ts` could describe the event but not perform it.
   * They were taken on 2026-08-16 and the name answers 200 on a public certificate, so `exchange`
   * joined that list on the fetch and the chip recomputed to `open`. The page went plan → running
   * → open in three days without a stage ever being chosen by hand, which is the only thing that
   * made publishing it early defensible in the first place.
   *
   * The prose below was rewritten twice on those measurements, and both rewrites deleted a claim
   * rather than adding one. That is the direction to keep: what changed here is the estate.
   *
   * ── IT IS A `service` IN THE REGISTRY, AND THIS PAGE DOES NOT MAKE IT A PRODUCT ───────────────
   *
   * `productCards()` filters on `kind === 'product'`, so this adds no seventh card to the PRODUCT
   * grid and `productCount()` is still six — the pool page's precedent, for the pool page's reason
   * and one more, recorded on the registry row: a seventh product means a seventh ACCENT chosen by
   * the documented dE procedure, and that is design work belonging to a phase that has an audience
   * to design for. The exchange now has an audience, so the question is finally askable — and it is
   * still a question rather than an edit, because a seventh accent that fails the dE separation
   * against its neighbours is worse than a sixth card and a link.
   *
   * ── AND THEN THERE WAS NO LINK, WHICH IS THE PART THAT WAS NEVER ARGUED (micro-org#488) ──────
   *
   * The sentence above ends "worse than a sixth card and a link", and the link did not exist. This
   * surface was open at its own address, in the product switcher, in the footer of eighteen
   * surfaces, and had this finished page — and the main site's grid, the one place a visitor goes
   * to find out what CloudsForge has, offered no tile to it. The owner found it by being told the
   * slug, which is the same failure the registry row above records for the switcher: "the URL works
   * if you know it" is the definition of the problem.
   *
   * So there is a second grid, `nonProductCards()`, and this row is the reason it was built. The
   * accent it wears there is the one already searched for and validated on the row above — rose
   * `#d05870`, gated on legibility as type on BOTH grounds, which is what makes putting it on a
   * card next to two others safe without any new design work. Still `kind: 'service'`, still not
   * one of the six, still no seventh accent invented.
   *
   * The one visible consequence has now flipped: this page HAS its outbound button. Both conditions
   * `src/pages/products.tsx` applies are met — `servesUi`, which went true when the bundle started
   * answering inside the estate, and `open`, which went true when the record was created. Neither
   * was typed to make the button appear; the button appeared because both were measured, which is
   * the arrangement that kept a dead link off this page for the two days in between.
   */
  {
    key: 'exchange',
    slug: 'exchange',
    eyebrow: 'Swap',
    // Title budget: `${linkLabel} — ${headline} — CloudsForge` must clear ninety characters, and
    // `test/meta.test.ts` measures it. This pair is written to that budget rather than trimmed to
    // it afterwards.
    headline: 'Swap EMBER against a pool that lives on the chain',
    standfirst: [
      'Forge Exchange is a decentralised exchange written as contracts on Hearth, the chain this platform mines. Each pair is a pool holding two coins and the price is the ratio between them, so you trade against the pool from your own wallet — no account to open, no order book, and nothing of yours held by anybody while it happens.',
      'It is deployed on both networks, seeded, traded, and open at its own address — one address for both networks, with the switch in the bar rather than a second hostname to remember. It has one page that is not about pools at all: a Forge Receipt is a claim on a coin held off this chain, which makes it the only thing here that is somebody’s promise rather than a contract holding both sides, and that page exists to help you check it.',
    ],
    blurb:
      'A decentralised exchange for Hearth: pools you trade against from your own wallet, and a receipt page that shows you how to check the backing yourself.',
    stage: 'open',
    stageNote:
      'Open at its own address, on both networks, driven through the real gateway by a browser that intercepts nothing. This chip is derived from the estate rather than written here: it read plan, then running, then open as the router, the smoke tier and finally the public record arrived, and nobody chose a stage.',
    sections: [
      {
        title: 'A pool on the chain, rather than a venue in the middle',
        body: [
          'A swap here is not matched against somebody else’s order. Each pair is a contract holding both coins, and the price is the ratio between what is in it — you trade against the pool, the pool rebalances, and the whole exchange is a transaction anybody can read back out of the chain afterwards.',
          'That is the difference from Forge Trade, which is open and is not this. Forge Trade runs a strategy for you against a price feed, on coins the platform is holding for you. Forge Exchange holds nothing for anybody: the contract owns the pool, the code that moves it is public, and there is no account on it to open, freeze or lose.',
          'It runs on Hearth because Hearth is already here — the platform mines it, an explorer already reads it, and a wallet already signs for it. An exchange needs a chain underneath it, and building on somebody else’s would mean paying their fees to trade our own coin.',
        ],
      },
      {
        // ── WRITTEN WHEN THE WRITE HALF SHIPPED, AND SCOPED TO WHAT THE SURFACE ACTUALLY DOES ──
        //
        // Until this release the surface could only swap: the pools were real, the deposit was a
        // transaction somebody had to build themselves, and this page said "you trade against the
        // pool" because that was the whole of it. Deposit, withdraw and create-a-market are now
        // pages, so the sentence that used to describe the exchange describes a quarter of it.
        //
        // The second paragraph is the one that matters and it is deliberately not sales copy.
        // Impermanent loss and the empty-pool ratio are the two ways a depositor loses money
        // without anybody doing anything wrong, and a product page that omits them is leaving the
        // explanation to the transaction. The surface itself carries the same two warnings at the
        // moment of signing; this is the version a reader meets before they have a wallet open.
        title: 'The pools are open, and depositing into one is a different decision from trading',
        body: [
          'Anybody holding a key can do all of it from the surface now, with no account and nobody to ask: swap against a pool, deposit into one and take the position back out again, or create a market for two tokens that do not have one yet. The factory on Hearth checks no caller and charges nothing for it, so the page does not pretend to be a gate it is not — what it does instead is show you the address the new pair will have before you sign, derived in your own browser.',
          'Depositing is where that openness costs something, and the honest version belongs here rather than in a tooltip. A share of a pool is a claim on whatever the pool holds when you withdraw, not on the two amounts you put in: trading changes the mix, so a pool whose price has moved hands back more of the side that fell. Into an empty pool it is sharper still, because the ratio you deposit becomes the price — and if that is not what the two coins are worth elsewhere, the first person to trade takes the difference out of your deposit.',
          'And a market existing here says nothing about what is in it. Anyone can create one for any token, including one that borrows a name, so the surface shows the contract address a pair was derived from and leaves the judgement with the person signing. That is the same bargain as the rest of this product: nothing of yours is held by anybody, and nothing of yours is vetted by anybody either.',
        ],
      },
      {
        title: 'It is running, and the numbers are the chain’s rather than ours',
        body: [
          'The pool is a port of the constant-product exchange most of this industry already runs, written out in full in the chain’s own repository, and a suite there drives it through Hearth’s virtual machine end to end: deploy, create a pair, add the first liquidity, swap one way and back through the native-coin path, exercise a signed approval, withdraw. Running somebody else’s audited, industrial contract code — compiled by people who had never heard of this interpreter — is a harder test of the virtual machine than any specification vector, which is why the exchange was written long before there was anywhere to put it.',
          'The test network went first, and the trade that mattered there was not ours. A key generated inside the browser wallet, funded from somewhere the chain’s miner is not, swapped in, added liquidity, swapped back and withdrew the position. Both swaps filled at exactly the quoted price, and that wallet earned its share of the trading fee while its liquidity was in.',
          // No figures, deliberately. `test/content.test.ts` refuses an unregistered number and any
          // rate at all in copy, and the depth, the fee and the price impact are all rates — the
          // exact class of number that drifted three times before that rule existed. They are
          // published where they can be checked instead: the plan document carries the table, and
          // the chain carries the transactions it was read from.
          'The main network followed: five contracts behind a two-of-three wallet, and one pool holding mined EMBER against the entire supply of a token this platform’s own token maker produced. Then it was traded — a buy the size of a Forge Create purchase, a sell back, and a withdrawal. Both legs filled at exactly the price the pool had quoted, the round trip cost the trading fee and nothing else, and the mid price came back to within a rounding error of where it opened. Every figure was read back off the chain afterwards, and the estate’s own books carry the entry saying where the coin went.',
        ],
      },
      {
        title: 'The liquidity comes out of mining, not out of a sale',
        body: [
          'The first side of the first pool is EMBER the project’s own miners earned, put in by the project rather than raised from anybody. That is what is in there now.',
          'After that it is meant to feed itself: each chain the platform mines pays a share of what it earns into the pool that trades that coin, so depth grows out of work the estate is already doing. Nothing about this asks a reader for money, and nothing about it issues a token to fund itself — EMBER is mined, and that has not changed.',
        ],
      },
      {
        // ── THIS SECTION IS THE ANSWER TO A PARAGRAPH THAT USED TO SIT UNDER "STILL MISSING" ──
        //
        // Written there before the thing existed, and quoted here because the wording is now a
        // specification this section has to meet rather than a promise it can paraphrase: "a
        // receipt is only ever as good as whoever wrote it — so the backing has to be something a
        // reader can check on the chain without asking us, and every page that offers it has to
        // say plainly whose promise it is."
        //
        // Both halves are why the paragraphs below lead with the promise and end with the command
        // a reader runs on their own node, and why the symbol is quoted as `fLTC` rather than
        // described. The `w` in the industry's usual `wLTC` has come to mean "wrapped, therefore
        // trustless", and this is exactly not that — the letter is the smallest place that
        // distinction can be made, and the page it appears on makes it at length.
        title: 'A receipt is a promise, and this one is built to be checked',
        body: [
          'Everything else on the exchange is a contract holding both sides of what it owes. A Litecoin cannot be put inside a contract on Hearth, so a token here that stands for one is different in kind: it is a claim on coins this project holds at addresses on Litecoin, and holding it means trusting us. That is why it is called a receipt and why its symbol starts with an f rather than the w the industry uses for wrapped coins, which has come to mean trustless and would be the wrong word.',
          'What the contract buys is that dishonesty would have to be an on-chain lie with a timestamp on it. It cannot issue more than the reserve last attested to; the attestation records the height on Litecoin it was read at; an attestation that goes stale stops issuance by itself rather than waiting for anyone to notice; a shortfall is recordable and announced; and there is no pause, no freeze and no upgrade switch, so the terms you can read are the terms.',
          'The page for it does not ask you to take any of that on faith. It prints what has been issued beside what has been attested, the height that reading was taken at, how old it is and when it stops authorising more — and then it prints the addresses the contract itself publishes, with the command that counts them on your own Litecoin node. The addresses come from the contract rather than from the page, so what you scan is not a list we chose to show you.',
          'On the test network there is a receipt for Litecoin and a second one marked as a drill — an instrument deployed only to walk the redemption path end to end, labelled as such wherever it appears, because a test asset that reads as a real one is the most expensive mistake this page could make. On the main network there is no receipt at all: the reserve addresses were scanned, the total came back empty, and issuing against nothing is the one thing the design forbids. That page reports the scan, the height and the command rather than an empty screen, because a deliberate absence rendered as an outage is a bug we have already had once.',
        ],
      },
      {
        title: 'What is still missing, and it is not small',
        body: [
          'There is no receipt on the main network yet, which means there is still nothing on it to trade against but EMBER and the tokens Forge Create makes. The receipt contract, the attestation path and the redemption path are all deployed and exercised on the test network; what has not happened is a reserve being funded and attested on the main one, and until it is, the page there says so in the words above rather than showing a coin that does not exist.',
          'There is no receipt for Bitcoin or Dogecoin, and there is no plan to make one until the Litecoin path has been run in anger by somebody who is not us. A second receipt is cheap to deploy and expensive to be wrong about, and the interesting failures are all in the operating discipline — the attesting, the scanning, the paying out — rather than in the contract.',
          'And the two-of-three wallet is a threshold in the contract rather than in the world: two of its three keys are files on the same machine, so whoever has that machine has quorum. What that quorum can reach is bounded — it sets the protocol fee switch and cannot touch the reserves or the liquidity — but the honest version is written down here rather than left to the word "multisig", and fixing it means deciding who signs, on what devices.',
        ],
      },
    ],
    // Its own key, and now a button. `products.tsx` renders the outbound link only for a surface
    // that is BOTH serving a UI and `open`; this one is both, as of 2026-08-16. The link resolves
    // to the surface root rather than to any page under it — including the receipt page the
    // section above is about — because the registry holds hostnames and not paths, and a path
    // typed here would be a second place for a route to rot. The exchange's own navigation is
    // what carries a reader the last step, and its route table is checked in that repository.
    linkTo: 'exchange',
    linkLabel: 'Forge Exchange',
    // The generic card, as the pool page takes. There is no `public/og/exchange.png`, and pointing
    // at a file that does not exist would publish a broken preview — a per-surface card is design
    // work for the phase that gives this page an audience to share it with.
    ogImage: '/og-1200x630.png',
  },

  {
    /**
     * ── THE ARCHIVE, AND WHY IT IS A SURFACE INSTEAD OF A `/blog` ROUTE ON THIS SITE ──────────
     *
     * The cheap shape for this was a route here. This repository already has the shell, the
     * chrome, the meta tier and a prerender, so `/blog` would have cost an afternoon and no new
     * container. It is a separate surface instead, and the reason is that the two have opposite
     * rules and both sets are right for what they cover.
     *
     * `test/content.test.ts` holds every sentence on this site to a register that forbids an
     * unregistered digit, any rate at all, any currency and any hostname. That is correct for
     * marketing copy — it is the rule that caught three drifted figures — and it makes an article
     * about the ways people lose crypto literally unwritable: the piece needs to count the ways,
     * name the wallets and quote what a mistake costs. So the writing lives in `journal-web`,
     * under its own suite with its own rules, one of which is stricter than anything here: a
     * number in a sentence that names THIS estate has to be a registered claim, and another
     * refuses any sentence that tells a reader what to do with their money.
     *
     * ── IT IS A `surface` IN THE REGISTRY, AND THIS PAGE DOES NOT MAKE IT A PRODUCT ───────────
     *
     * `productCards()` filters on `kind === 'product'`, so this adds no card to the PRODUCT grid
     * and `productCount()` is unchanged. Hub's precedent, then the pool's, then the exchange's, and
     * this is the fourth page under `/products` that is deliberately not one — `surfaceCount()`
     * counts `PRODUCT_PAGES` rather than assuming the registry's product list, which is what makes
     * a fourth possible without a number moving anywhere a reader can see.
     *
     * It has a tile in the second grid (`nonProductCards()`, micro-org#488), on its own bronze
     * `#ae7b3d` rather than a shared hue. This is the surface the whole footer rebuild was about:
     * an archive written to be found is worth precisely as much as the number of ways there are to
     * find it, and until that issue it was reachable from the switcher and from nothing on this
     * site at all.
     *
     * ── THE STAGE IS `open`, AND IT WAS `running` FOR EXACTLY ONE RELEASE
     *
     * Both halves of `running` were met the moment the page shipped: `journal-web` is a declared
     * service in the estate's compose file, and `beacon/src/browser/smoke.ts` drives a real browser
     * at it through the real gateway. `PUBLIC_SURFACES` in `./stages.ts` still refused the key,
     * deliberately. The mainnet tunnel already routed the name — that file is generated from the
     * registry, one row per surface, whether or not anything answers — so the static half of `open`
     * would have passed and meant nothing. What refused it is `test/public-endpoints.test.ts`,
     * which fetches every key on that list and requires 200 on a certificate the public already
     * trusts.
     *
     * 2026.8.71 deployed the archive and the address answered, so the key joined on the fetch and
     * the chip recomputed — the same order `exchange` went through the day before. Neither stage
     * on this entry was ever chosen; both were measured, one release apart.
     *
     * ── WHAT THIS PAGE MAY SAY, AND WHAT ONLY THE ARCHIVE MAY SAY ─────────────────────────────
     *
     * No count of articles, and no title quoted as a headline. The archive grows by somebody
     * writing, without this repository being touched, so a count typed here rots at whatever rate
     * the writing happens — the pool page's rule, for the pool page's reason. This page carries
     * the proposition: who it is for, what it refuses to do, and how it is published. The index
     * carries the pieces, and it is one link away.
     */
    key: 'journal',
    slug: 'journal',
    eyebrow: 'Read',
    // `${linkLabel} — ${headline} — CloudsForge`, inside the ninety characters `test/meta.test.ts`
    // allows. The headline is the archive's own opening line, shortened to its first clause: the
    // page and the thing it points at should introduce themselves with the same words.
    headline: 'Crypto, written down plainly',
    standfirst: [
      'Forge Journal is where this project writes things down for people who are not engineers: what crypto actually is once the jargon is taken out of it, the ways people lose it and the habits that prevent each one, what owning something that moves all night does to your attention, why we run a chain of our own, and a plain tour of the platform for anybody who arrived without a map.',
      'It is published writing rather than a feed. Nothing is behind a sign-in, nothing asks for your email address, no piece stops halfway to sell you something, and no sentence in it tells you what to do with your money — an article a reader needs an account to finish is not published writing, and a guide that ends in a recommendation was an advertisement all along.',
    ],
    blurb:
      'Plain-language writing about crypto, the chain and this ecosystem: no sign-in, no newsletter wall, no price predictions, and nothing you have to already know.',
    stage: 'open',
    stageNote:
      'Open at its own address, on a certificate your browser already trusts, with every article, topic page and feed reachable without an account. The chip is recomputed from the estate on every build rather than typed here, and it read one stage lower until the address was fetched and answered.',
    sections: [
      {
        title: 'Written for somebody who has never owned any',
        body: [
          'The opening piece explains what crypto is without using the words the industry explains it with. No whitepaper vocabulary, no assumption the reader already holds some, and no promise that any of it will make anybody rich. That register is the whole archive, not one introductory concession before the real writing starts.',
          'The rest are the pieces people actually need. How money is lost here, one way at a time, each with the habit that prevents it. What a number that moves all night does to your sleep and your attention, and the unglamorous routines that take it back. Why a project this size built its own chain, including the argument against having done it. And a tour of what is on this platform, written for somebody who has not been here before.',
          'Nothing in it quotes a price, predicts one, or suggests what you should buy. That is not a house style anybody has to remember: the archive’s own suite refuses a sentence that tells a reader what to do with their money, and refuses any number about this estate that is not a registered, sourced claim.',
        ],
      },
      {
        title: 'Every page is a file, written before anybody asks for it',
        body: [
          'There is no content system behind the archive and no database under it. Every page — each article, each topic, the index and the search page — is written out as finished HTML when the site is built, and the file on disk is what both a reader and a search engine receive. Nothing is assembled in your browser after the fact, so the words are there in the first response rather than one round trip later.',
          'That is the difference between a page a crawler can read and a page it has to be trusted to run. Each one carries its own canonical address, its own link-preview card and machine-readable structured data saying what it is, who published it and when. The whole archive is also a feed, so it can be read in a reader with nothing installed and no account anywhere.',
          'Every picture is drawn for its piece and carries a written description for anybody who cannot see it, which is checked rather than encouraged. The build fails if an article names an image that is not on disk — the failure this estate has already shipped once, on a surface that rendered as a page of headlines over grey rectangles while every other check stayed green.',
        ],
      },
      {
        title: 'Topics rather than a firehose, and a way to find things',
        body: [
          'Pieces are filed under a small number of topics — starting out, staying safe, living with it, the chain, and the ecosystem — and each topic is a real page with its own address, so a link to the safety writing is a link somebody can send. There is a search across the archive as well, and it runs over the same text that was written into the pages rather than over a separate index that can disagree with them.',
          'There is no posting schedule and this page will not invent one. Writing appears when there is something worth saying, each piece carries the date it was published and the date it was last changed, and a piece that is edited says so rather than quietly becoming a different article.',
        ],
      },
      {
        title: 'What it does not do, and one of those is on purpose',
        body: [
          'You cannot reply to anything. That is deliberate rather than unfinished: a comment box under an article about how people lose crypto is an invitation to whoever is best at sounding helpful, and moderating one properly is a product rather than a feature. Discussion is worth building; it is worth building as its own thing, with the people and the tools that job actually needs.',
          'There is one writer and the pieces are signed by the project rather than by a person, which is honest about how they are made and is not a permanent arrangement. There is no translation into any other language yet, and the archive is written in a plain English that would survive one — which is the cheap half of that work, done early.',
        ],
      },
    ],
    // Its own key. `src/pages/products.tsx` renders the outbound button only for a surface that is
    // BOTH serving a UI and `open`, and this one is not open yet — so there is no button on this
    // page today, and there will be one the day the address is proven rather than the day somebody
    // types a link. That is the same arrangement that kept a dead link off the exchange page.
    linkTo: 'journal',
    linkLabel: 'Forge Journal',
    // The generic card, as the pool and exchange pages take. There is no `public/og/journal.png`,
    // and naming a file that does not exist would publish a broken preview.
    ogImage: '/og-1200x630.png',
  },

  {
    /**
     * ── THE SQUARE, AND WHY IT IS THE PAGE THE ARCHIVE'S LAST SECTION ASKED FOR ───────────────
     *
     * The Journal entry above ends by refusing comments, in these words: "a comment box under an
     * article about how people lose crypto is an invitation to whoever is best at sounding
     * helpful, and moderating one properly is a product rather than a feature. Discussion is worth
     * building; it is worth building as its own thing, with the people and the tools that job
     * actually needs." This is that thing, built as its own thing, one release later.
     *
     * ── IT IS A `service` IN THE REGISTRY, SO THIS ADDS NO PRODUCT CARD ───────────────────────
     *
     * The fifth page under `/products` that is deliberately not a product, after Hub, the pool,
     * the exchange and the archive. `productCards()` filters on `kind === 'product'` and
     * `productCount()` reads the registry, so both are untouched; the tile lands on the second
     * grid through `nonProductCards()`, wearing the orchid `#bf69a9` the registry row already
     * carries. That accent was searched for and validated as a PAIR with the archive's bronze —
     * see the row in `ui/packages/ui/src/surfaces.ts` for why one-at-a-time colour search cannot
     * see the failure that matters — so putting a fourth tile on that grid needed no new design
     * work and no seventh product hue.
     *
     * Its neighbour on the grid is the archive, and the two are adjacent in reading order rather
     * than by accident: bronze then orchid is the only ordering of the four that keeps the two
     * warmest hues apart, which `test/content.test.ts` checks rather than trusts.
     *
     * ── THE HEADING OVER THAT GRID CHANGED TO LET THIS TILE ON IT, AND THAT IS THE POINT ──────
     *
     * `ALSO_HERE.title` read "none of them needs an account", and its own comment predicted this
     * commit: "a fourth page that DOES need an account breaks the suite rather than quietly making
     * this heading false." Agora is that page, half of it — the square, a person's posts, a topic
     * and a linked thread are all readable by a stranger, and saying something back is not. So the
     * heading became a claim that is exactly true of all four rather than nearly true of three,
     * and the test moved with it. Widening the heading to fit the tile would have been the
     * failure; narrowing it to what can still be proved is the fix.
     *
     * ── `running`, AND THE ORDER MATTERS MORE HERE THAN THE STAGE DOES ────────────────────────
     *
     * Both halves of `running` were met on the day this shipped: `agora`, `agora-web` and the
     * one-shot migrator are declared in the estate's compose file, and `beacon/src/browser/smoke.ts`
     * drives a real browser at the square through the real gateway. `PUBLIC_SURFACES` in
     * `./stages.ts` deliberately did NOT carry the key. The mainnet tunnel already routed the
     * name — that file is generated one row per registry surface, whether or not anything answers
     * — so the static half of `open` would have passed and meant nothing, exactly as it would have
     * for the exchange and for the archive. What refused it is `test/public-endpoints.test.ts`,
     * which fetches every key on that list and requires 200 on a certificate the public already
     * trusts.
     *
     * ── AND THEN IT MOVED, WHICH TOOK ONE DAY RATHER THAN THE RELEASE EXPECTED ────────────────
     *
     * `agora.cloudsforge.online` answers 200 on a public certificate and `/v1/timeline/latest`
     * returns an empty timeline rather than an error, read on 2026-08-18 — so the key is on
     * `PUBLIC_SURFACES`, the fetch passes, and the chip recomputes to `open`. The chip moved
     * because the estate moved; nobody chose a stage. The paragraph above is left standing rather
     * than rewritten, because the interesting thing about this page is the ORDER — address first,
     * key second — and a comment that describes only the end state cannot teach it.
     *
     * ── WHAT THIS PAGE MAY NOT SAY ───────────────────────────────────────────────────────────
     *
     * No count of anything — not people, not posts, not rooms. All three move without this
     * repository being touched, which is the pool page's rule for the pool page's reason, and here
     * there is a second: a number that is small today is a number that reads as failure for as
     * long as it takes somebody to edit this file. The honest version is the last section, which
     * says nobody is here yet in words rather than in a figure.
     */
    key: 'agora',
    slug: 'agora',
    eyebrow: 'Talk',
    // Title budget: `${linkLabel} — ${headline} — CloudsForge` must clear ninety characters, which
    // `test/meta.test.ts` measures. Written to it rather than trimmed to it.
    headline: 'Somewhere to talk about all of it',
    standfirst: [
      'Forge Agora is this ecosystem’s public square. Posts and replies, rooms run by the people in them, private messages, and a timeline of everything said in the open — on the CloudsForge account you already have, with no second sign-up, no password of its own and no profile to fill in before anything works.',
      'You can read all of it without an account: the square itself, somebody’s posts, a topic, a thread a friend sent you. Signing in is what lets you say something back, and it is the same sign-in as the rest of the platform.',
    ],
    blurb:
      'The ecosystem’s public square: posts, replies, rooms and private messages, on the account you already have — and readable without one.',
    stage: 'open',
    stageNote:
      'Deployed in the estate, walked end to end by a real browser through the real gateway, and answering on the public internet on a certificate every browser already trusts. What it is not is busy: the square opens with nothing in it, and the last section on this page says so rather than dressing it up.',
    sections: [
      {
        title: 'A name of your own, on the account you already have',
        body: [
          'There is no registration here. A voice is made the first time you do something — post, reply, follow, save — out of the account you signed in with, and until then there is nothing to fill in. You pick a handle, which is what people see and what a link to you is made of, and that is the whole of setting up.',
          'Your voice is per network. The square you read on the test network and the square you read on the main one are different places with different people in them, and the switch in the bar changes which one you are looking at without moving you off the page you were reading. That last part is not a detail: being thrown out of a conversation to look at something else is how the rest of the estate used to handle a network switch, and a half-written reply is a worse thing to lose than a scroll position.',
          'Deleting your CloudsForge account erases your voice, your posts and your private messages here. That happens because the account service says so and this one is listening, rather than because you asked twice in two places.',
        ],
      },
      {
        title: 'Rooms with stewards rather than owners',
        body: [
          'A room can be open to anyone, ask to be joined, or be closed. Whoever makes one is a steward rather than an owner, stewardship can be shared and handed on, and the last steward is refused permission to walk out of a room that still has people in it — they are told to hand it over or to close it properly instead.',
          'That is a deliberate correction of the shape everybody else ships. A room whose only privileged account has left is a room nobody can moderate, and every network that modelled this as ownership has a support queue full of them.',
        ],
      },
      {
        title: 'What happens when people disagree is the product',
        body: [
          'The guidelines are short, they are on the surface itself, and beside them are two lists: every reason you can report something for, and every action a moderator can take. Both are published because publishing them is what makes one sentence checkable — there is no shadow-ban here — and a test across two repositories fails the build if the service ever grows an action the page does not name.',
          'A report is never shown to the person it is about. Something you are not allowed to see answers as though it does not exist, rather than telling you it exists and is not yours, so guessing at addresses teaches nobody anything. And the people you have blocked stay gone on the public timeline as well as on your own, which is the difference between blocking somebody and hiding them from yourself.',
          'When the moderation service cannot be reached, a post goes up and is marked as having gone up unchecked, and the queue can be filtered on exactly that. The alternative is one upstream’s bad afternoon becoming a square nobody can speak in — and the alternative to marking it is a silence that reads as approval.',
        ],
      },
      {
        title: 'Private messages, and the things left out on purpose',
        body: [
          'A private message is private in the way that can be checked rather than promised: no route returns one to anybody but the two people in it, no log line carries the text, and the event the rest of the platform is told about is a count and two identifiers with nothing in it to read.',
          'There is no infinite scroll. Every timeline is a page with an end and a cursor to the next one, which is a worse experience for a scraper and a better one for a person who wanted to stop. Nothing here is ranked by what will keep you: the square is what was said, newest first.',
          'And the limits on how much one account can post, message or follow in an hour are enforced in the same write that stores the thing, rather than counted first and stored afterwards. That is the difference between a limit and a suggestion, and the gap between the two is precisely what a script is written to fit through.',
        ],
      },
      {
        title: 'What is missing, and the first one is the honest one',
        body: [
          'Nobody is here yet. The square opens empty, and it says so rather than pretending to be quiet — the first post on a new square is the hardest one to write and the one everybody else replies to. This is the part no amount of engineering fixes, and this page is not going to dress it up as an early-access opportunity.',
          'You cannot post a picture. Everything here is text and links, because there is no route that takes a file and no moderation for what would arrive through one; adding the upload before the moderation is how a square becomes somewhere nobody wants to be. There is no application to install either — it is a web page, which works on a phone, and that is not the same thing as an app.',
          'Moderation is one person with a queue, which is honest rather than reassuring: the tools are built, the vocabulary is published, and the rota is one operator. And nothing here is translated into any other language yet, though it is written in a plain English that would survive being.',
        ],
      },
    ],
    // Its own key. `src/pages/products.tsx` renders the outbound button only for a surface that is
    // BOTH serving a UI and `open`, so this page carried no button on the day it shipped and grew
    // one when the address answered — the link appeared because the estate changed, not because
    // somebody typed a URL. The same arrangement kept a dead link off the exchange page for two
    // days, and off the archive page for one.
    linkTo: 'agora',
    linkLabel: 'Forge Agora',
    // The generic card, as the pool, exchange and journal pages take. There is no
    // `public/og/agora.png`, and naming a file that does not exist would publish a broken preview.
    ogImage: '/og-1200x630.png',
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
 * Chains a deposit can actually arrive on, spelled. Three today.
 *
 * ── Why this exists, dated ────────────────────────────────────────────────────────────────────
 *
 * It was `chainCount`, and it counted `ON_CHAIN_ASSETS` through `claims.chains`. On 2026-08-09
 * `micro-contracts` added ETC and DOGE to that array and this function dutifully spelled "eight"
 * into two sentences: "Eight coins, not just ours" on the home page and "One balance instead of
 * eight" on Hub's. Both were true of the estate's MODEL of the world and false of its door — a
 * deposit could arrive in three of the eight. The owner caught it on 2026-08-11 (micro-org#421).
 *
 * So the register's `chains` and `chainNames` are gone and this reads `creditableChains`, which is
 * recomputed from `CREDITABLE_ASSETS` — a declaration micro-contracts now carries for exactly this
 * question, asserted there to be a strict subset of the modelled list. **Every sentence on this
 * site that spells a number of chains is addressed to a reader about their own money, and there
 * was never a second kind.** If one is ever written — a build page counting what the ledger can
 * supervise — it registers its own claim rather than borrowing this one.
 *
 * The original argument for deriving the word at all stands unchanged, and it is why the wrong
 * figure survived a whole release: a word is a number, the digit scan cannot see one, and the
 * claims check reads the register and not the sentence. So the count is spelled from the register
 * rather than typed beside it, and the next chain changes both halves of both sentences with
 * nothing for anybody to remember.
 *
 * `spell` throws past twelve rather than falling back to a digit, which is the right failure: a
 * thirteenth chain should stop a build here and not put an unregistered numeral into copy.
 */
export function creditableChainCount(): string {
  return spell(Number(claim('creditableChains')))
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

/**
 * Every page under /products that is neither Hub nor a registry product.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS (micro-org#488)
 *
 * `productCards()` above is the only thing either grid on this site rendered, and it filters on
 * `kind === 'product'`. That filter was correct about the registry and wrong about the reader.
 * Four pages accumulated under `/products` that it excludes — Hub, the pool, the exchange and the
 * archive — and each one was added with a note in the entry above saying, in so many words, "this
 * adds no card to the index grid", as though the absence were the point rather than the cost.
 *
 * Hub's absence IS the point and stays: `01-product-vision.md` §3 forbids the account appearing in
 * a product grid as a peer, and it gets its own feature block above the grid on both pages.
 *
 * The other three were never argued for. What was argued for, at length and correctly, is that
 * they are not PRODUCTS — a seventh product means a seventh accent through the dE procedure, and
 * `productCount()` moving would restate itself in copy across the site. None of that is an
 * argument for a deployed, publicly addressed surface with a finished page on this very site
 * being findable from no tile on it. Forge Exchange was the one the owner hit: open at its own
 * address since 2026-08-16, in the product switcher, in the footer of eighteen surfaces, with a
 * `/products/exchange` page carrying its own validated accent — and nothing on the main site's
 * grid to click. The only route to it was the switcher, or knowing the slug.
 *
 * So the grid is now TWO grids of the same card, and the split is the registry's own `kind`
 * rather than a judgement anybody has to keep making. Nothing that was validated for six products
 * moves: `PRODUCTS` is untouched, `productCount()` is still six, no accent was invented, and the
 * copy that spells six still spells six because it is still describing the first grid.
 *
 * ── THE ORDER IS NOT ARBITRARY, AND IT IS THE ONE THING TO PRESERVE ───────────────────────────
 *
 * `PRODUCT_PAGES` order, filtered, is pool → exchange → archive: gold, rose, bronze. Two facts
 * make that the order rather than a default.
 *
 * `pool` and `create` carry the SAME registry accent (`#b28e1e`, deliberately shared — see the
 * exchange row in `ui/packages/ui/src/surfaces.ts`). Two tiles of one hue touching is exactly what
 * the switcher's "gives every entry a distinct accent" guard forbids, and no guard watches this
 * grid. Splitting the two grids puts `create` in the first and `pool` in the second, so they never
 * touch. Within the second, `journal`'s bronze `#ae7b3d` is the nearest hue to that gold, and the
 * rose sits between them — on a three-column desktop row and on a stacked phone alike.
 *
 * A fourth non-product page therefore is not a free append: check what it touches first.
 */
export function nonProductPages(): readonly ProductPage[] {
  return PRODUCT_PAGES.filter((p) => p.key !== 'hub' && surface(p.key).kind !== 'product')
}

/** The non-product pages, joined to their registry rows, for the second grid. Three today. */
export function nonProductCards(): ReadonlyArray<{ surface: ReturnType<typeof surface>; page: ProductPage }> {
  return nonProductPages().map((page) => ({ surface: surface(page.key), page }))
}

/** How many of those there are, spelled. Three today. */
export function nonProductCount(): string {
  return spell(nonProductPages().length)
}

/** Hub's page, which every layout needs by name because it is never one of the cards. */
export function hubPage(): ProductPage {
  const page = PRODUCT_PAGES.find((p) => p.key === 'hub')
  if (!page) throw new Error('the hub page is missing')
  return page
}
