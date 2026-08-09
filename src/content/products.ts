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
import { PRODUCTS, surface, type SurfaceKey } from '@cloudsforge/ui'
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
      'Open to the public. The main network mines, a public node answers Ethereum JSON-RPC and a public block explorer runs beside it. The chain is new, and EMBER has no market, no listing and no price.',
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
    standfirst: [
      `Markets on future events, settled by the contract that holds the money. You can stake in any of the ${claim('chains')} chains the platform supports — ${claim('chainNames')} — or in an ERC-20 token, and every stake joins one EMBER pool.`,
      'If a market is voided you are refunded in the asset you staked, in the amount you staked. Not its value at some later rate.',
    ],
    blurb:
      'Bet on what happens next with Bitcoin, Ethereum, Litecoin, Solana, XRP, EMBER or an ERC-20 token. The contract holds the money and pays the winners — not us.',
    stage: 'open',
    stageNote:
      'Open to the public. The service, the contract, the staking application and the console operators open questions from are all running and reachable. Every market so far has settled on an EMBER test network.',
    sections: [
      {
        title: 'Bet with what you already own',
        body: [
          `Most prediction markets make you buy their own token before you can have an opinion. This one does not: bring ${claim('chainNames')}, or any ERC-20 token the platform has enabled, and stake it directly.`,
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
