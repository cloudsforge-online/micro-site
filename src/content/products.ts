/**
 * The product pages, as data.
 *
 * The name, the accent, the verb, the one-line blurb and the URL of every surface come from
 * `@cloudsforge/ui`'s registry and are never restated here — only the prose is local. The registry
 * exists because the same list was once maintained by hand in eight places and had already drifted
 * (see the header of `ui/packages/ui/src/surfaces.ts`); the marketing site was one of the eight.
 * So a sixth product is a registry entry plus one block below, and the site cannot disagree with
 * the switcher about what CloudsForge sells.
 *
 * ── The stage field is the point of this file ─────────────────────────────────────────────────
 *
 * Every page carries a `stage` and a `stageNote`, and both are rendered, prominently, on the card
 * and at the top of the page. That is unusual for a marketing site and it is deliberate:
 *
 *   `docs/ecosystem/18-build-status.md` §1 — "The measure that is not flattering at all: nothing
 *   is deployed. Every repository listed below exists as code that passes its own tests. Not one
 *   of them is running anywhere."
 *
 * A site that described these six as though a reader could go and use them today would be lying,
 * and it would be lying in the one voice this company has decided is an asset —
 * `docs/ecosystem/01-product-vision.md` §5.5, "Honest copy… This voice is an asset. Protect it."
 *
 * The alternative was to ship a page per product with the stage left off until launch. That is how
 * the estate ended up selling a private world that provisioned nothing: the copy went out ahead of
 * the code and nothing anywhere held the two together.
 *
 * ── Content, not components ───────────────────────────────────────────────────────────────────
 *
 * Everything below is plain data with no JSX in it, so `test/content.test.ts` can read every
 * sentence this site publishes without rendering anything. That test is what enforces the numbers
 * register in `./claims.ts` and the ban on hard-coded hostnames. Copy that lives inside a
 * component is copy no test can see.
 */
import { PRODUCTS, surface, type SurfaceKey } from '@cloudsforge/ui'
import { claim } from './claims.ts'

/**
 * How far along a surface is.
 *
 * Three values, not five. A scale with more steps invites the halfway-house label that means
 * nothing — the estate has already learned that "in progress" and "nearly done" are the same
 * status reported twice.
 */
export type Stage = 'built' | 'in-build' | 'not-built'

/** The label and the shape that go with a stage. Colour is never the only channel. */
export const STAGE_LABEL: Readonly<Record<Stage, string>> = {
  built: 'Built',
  'in-build': 'Being built',
  'not-built': 'Not built yet',
}

/** A glyph per stage, so the three are separable without colour. */
export const STAGE_GLYPH: Readonly<Record<Stage, string>> = {
  built: '●',
  'in-build': '◐',
  'not-built': '○',
}

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
 * The six pages, in the order the story is told.
 *
 * This is NOT the registry's order. The registry's first five are ordered to maximise the colour
 * separation of neighbouring switcher entries and its header says so in capitals; reordering it
 * for narrative reasons would throw that guarantee away. So the site keeps its own order for
 * reading, and derives everything else from the registry. `test/content.test.ts` asserts that the
 * set of product pages and the set of registry products are the same set, which is the property
 * that actually matters — a product with no page, or a page with no product, both fail.
 */
export const PRODUCT_PAGES: readonly ProductPage[] = [
  {
    key: 'hub',
    slug: 'hub',
    eyebrow: 'The control centre',
    headline: 'Everything you own, on one screen',
    standfirst: [
      'Forge Hub is where a CloudsForge account actually lives: the portfolio, the wallets, the deposits and withdrawals, the activity history, the sessions and the keys. It is not a product you choose between. It is the container the products sit inside, which is why it is not in the switcher — you are already in it.',
    ],
    blurb:
      'Forge Hub is where a CloudsForge account lives: portfolio, wallets, deposits, withdrawals, activity and security on one screen. Not a product you choose — the container the others sit inside.',
    stage: 'built',
    stageNote:
      'Built and tested, against a service that is also built and tested. Neither is deployed, so there is nothing to sign into yet.',
    sections: [
      {
        title: 'One screen instead of six',
        body: [
          'Before Hub there were three separate ideas of what a wallet was, one per application, and no screen anywhere that added up what an account held. A balance meant something slightly different depending on which product you had opened, and the only way to see all of it was to visit all of it.',
          'Hub replaces that with one composition: balances across every chain, valuation, the deposits still waiting on confirmations, the withdrawals in flight, and a single timeline of everything that has happened to the account.',
        ],
      },
      {
        title: 'A missing number stays missing',
        body: [
          'When valuation is unavailable, Hub does not print a total. Zero is the correct sum of an empty set and the wrong thing to show a person whose holdings are intact — a portfolio worth nothing and a portfolio that cannot be priced right now are not the same sentence, and only one of them is frightening.',
          'So the total is suppressed, each unpriced holding shows its amount with the reason its value is missing, and every quote carries the time it was observed. The amount is exactly as true as it ever was; only the valuation is absent, and the screen says which.',
        ],
      },
      {
        title: 'One failure costs one tile',
        body: [
          'The service behind Hub answers with holes rather than with an error. If pricing is unreachable the balances still arrive; if the activity feed is down the wallets still render. Each panel carries its own status and its own freshness, so a single unhealthy dependency costs one panel rather than the page.',
          'The rule underneath it: a panel reported unavailable never draws an empty list as though it were an answer. An empty array with no status beside it reads as "you have no wallets", and that is a worse lie than an error message.',
        ],
      },
    ],
    linkTo: 'hub',
    linkLabel: 'Forge Hub',
    ogImage: '/og/hub.png',
  },

  {
    key: 'network',
    slug: 'network',
    eyebrow: 'Mine',
    headline: 'Money you can produce on the machine you already own',
    standfirst: [
      'EMBER is mined by proof of work on ordinary processors. Homefire, the algorithm behind it, is memory-hard and CPU-friendly, so a warehouse of hardware earns little more per dollar than a laptop does. There is no rig to buy and no pool to join.',
    ],
    blurb:
      'EMBER is proof-of-work money mined on ordinary processors. Memory-hard, ASIC-resistant, and an account-model chain that speaks Ethereum. No rig to buy and no pool to join.',
    stage: 'in-build',
    stageNote:
      'The chain itself runs, on testnet, and is the one part of the estate being carried across unchanged. Its explorer, its faucet and its public site are being rebuilt.',
    sections: [
      {
        title: 'Proof of work, without the industry',
        body: [
          'Proof of work was meant to be one processor, one vote. What it became was a business with a hardware supply chain attached, which is a strange foundation for money that is supposed to be open to anyone.',
          'Homefire is the attempt to hold the original shape: memory-hard, so specialised silicon buys far less advantage than it does elsewhere, and bound so that a winning proof must be signed by the key its reward pays — work handed to you cannot be quietly redirected to somebody else. What that does and does not buy is written down in the chain\'s own mining documentation rather than summarised into a promise here.',
        ],
      },
      {
        title: 'It speaks Ethereum',
        body: [
          'Hearth is an account-model chain with an Ethereum JSON-RPC, so the tools, the libraries and the wallets a developer already has work against it without a translation layer. That is also why an EMBER balance carries eighteen decimal places rather than a bespoke unit nobody has a formatter for.',
        ],
      },
      {
        title: 'A deposit waits, and the wait is published',
        body: [
          `An EMBER deposit is visible as pending the moment the network sees it and spendable only ${claim('emberConfirmations')} blocks later — about ${claim('emberConfirmationMinutes')} minutes. That is the same depth the chain publishes to exchanges, and it is deep because a young chain mined on ordinary processors has no finality gadget and depth is the defence that is actually available.`,
          `Below that depth nothing is credited. A reorganisation ${claim('emberReorgAlarmDepth')} blocks deep or more stops crediting for the chain outright and pages an operator, because a reorg shallower than the credit depth cannot have produced a wrong credit, and one at or past it means the assumption the depth encodes has failed.`,
        ],
      },
    ],
    linkTo: 'network',
    linkLabel: 'Forge Network',
    ogImage: '/og/network.png',
  },

  {
    key: 'create',
    slug: 'create',
    eyebrow: 'Make',
    headline: 'Launch a token, and own it outright',
    standfirst: [
      'Forge Create deploys a real contract to a real chain, from a template that has been written, compiled and committed rather than assembled at request time. Your wallet is the owner from the first block. The platform\'s key pays the gas and holds nothing.',
    ],
    blurb:
      'Deploy a real token contract from committed, compiled bytecode. Your wallet is the owner from the first block; the platform pays the gas and holds no authority over it.',
    stage: 'in-build',
    stageNote:
      'The deployment service and the brand-generation service are both built and tested. The application a creator would use is not yet rebuilt.',
    sections: [
      {
        title: 'The deploy leaves the request',
        body: [
          'Deploying a contract takes as long as a chain takes to include it, which is not a length of time an HTTP request should be asked to survive. The old implementation held the connection open for up to three minutes and then reported whatever had happened by the time it gave up.',
          'The rebuilt one accepts the order, answers immediately with somewhere to watch, and records the broadcast and its outcome as they happen. A deploy that succeeds after your browser has been closed is still a deploy that succeeded, and there is a record of it either way.',
        ],
      },
      {
        title: 'You are the owner, not the tenant',
        body: [
          'The address named as owner in the constructor is yours. The platform cannot mint, pause, or transfer ownership of a token it deployed for you, because it never held the authority to — that is a property of the bytecode rather than a policy that could be revised later.',
        ],
      },
      {
        title: 'What is not sold here',
        body: [
          'An earlier version of this product listed a liquidity-lock helper and a metadata-verification service that existed in no code path anywhere. Both were removed from the catalogue rather than quietly left to be built, and the principle that removed them is written into the vision: do not sell what cannot be delivered — including through the API, not only the interface.',
        ],
      },
    ],
    linkTo: 'create',
    linkLabel: 'Forge Create',
    ogImage: '/og/create.png',
  },

  {
    key: 'trade',
    slug: 'trade',
    eyebrow: 'Trade',
    headline: 'Test the idea before you fund it',
    standfirst: [
      'A catalogue of strategies, backtested against real market history with fees and slippage charged — because a strategy that only works for free does not work. What survives can be promoted to a paper bot, and only then to one holding real money.',
    ],
    blurb:
      'Backtest a strategy against real market history with fees and slippage charged, promote what survives to paper, and only then to money. Modelled, never promised. Not an exchange.',
    stage: 'in-build',
    stageNote:
      'The engine — backtesting, fills, fees and the performance accounting — is written and tested. Live trading is deliberately off, and stays off until a complete cycle has run on testnet.',
    sections: [
      {
        title: 'The backtest charges you',
        body: [
          'A backtest that ignores fees and assumes a fill at the price you asked for is a generator of strategies that work in a spreadsheet. This one models the fill and takes the fee, which makes its results worse and makes them mean something.',
          'The results are labelled as what they are: modelled, not a promise. A past curve is a description of a market that has already happened.',
        ],
      },
      {
        title: 'A high-water mark, so the same gain is billed once',
        body: [
          'Where a live bot is charged, it is charged on gains above its own previous best, never on recovery from a drawdown. A bot that falls and climbs back to where it was has produced nothing, and billing it for the climb is billing twice for one gain.',
          'The fee is not published on this page, because it is per-bot in the code that computes it rather than a single platform number. Every assessment shows the equity, the mark, the gain and the rate that was applied — the number a reader needs is the one attached to their own bot.',
        ],
      },
      {
        title: 'This is not an exchange',
        body: [
          'There is no order book, no market making, and no custody of anyone else\'s trading pairs. A bot settles against a price oracle on coins the platform already holds. That boundary is a deliberate refusal rather than a stage on a roadmap: the other side of it is a different company with a different regulatory posture.',
        ],
      },
    ],
    linkTo: 'trade',
    linkLabel: 'Forge Trade',
    ogImage: '/og/trade.png',
  },

  {
    key: 'market',
    slug: 'market',
    eyebrow: 'Sell',
    headline: 'Somewhere for the things people make to go',
    standfirst: [
      'Listings, offers, escrow and settlement, for assets created on the platform and brought to it. Forge Market exists because "make" has no destination without "sell" — it is the missing verb rather than a new product for its own sake.',
    ],
    blurb:
      'Listings, offers, escrow and settlement for what people make. The fee, the royalty and the seller\'s proceeds are constrained to add up by the database, not by the code that writes them.',
    stage: 'in-build',
    stageNote:
      'The service — listings, bids, escrow, the order split and the risk indicators — is written and tested. Nothing is listed, because nothing is deployed.',
    sections: [
      {
        title: 'The split is checked by the database',
        body: [
          'Every sale divides into a platform fee, whatever royalty the creator set, and the seller\'s proceeds. Those three are constrained to add up to the sale price by the database itself, not by the code that writes them — an order whose parts do not reconcile cannot be recorded, including by something that has bypassed the service entirely.',
          'The royalty is revenue for the creator. The platform takes no share of it.',
        ],
      },
      {
        title: 'The terms of a sale in flight never move',
        body: [
          'A royalty split is copied onto a listing when the listing is created, rather than looked up when the sale completes. Editing a collection\'s default afterwards changes what future listings will say and changes nothing about a sale already underway. A term that can be revised after a buyer has agreed to it is not a term.',
        ],
      },
      {
        title: 'Risk indicators are computed, never granted',
        body: [
          'What a listing shows about a token — whether a mint authority still exists, whether ownership has been renounced, how concentrated the supply is, how old it is — is derived from chain data. It is not editable by the seller and it is not editable by anyone the seller has paid.',
          'A badge that reads as an endorsement is how a marketplace becomes complicit in its worst listing. Any check the platform sells is a statement about identity and disclosure, and it says so in the words next to it, or it is not offered.',
        ],
      },
    ],
    linkTo: 'market',
    linkLabel: 'Forge Market',
    ogImage: '/og/market.png',
  },

  {
    key: 'worlds',
    slug: 'worlds',
    eyebrow: 'Play',
    headline: 'Worlds that end, and are kept',
    standfirst: [
      'A shared map, resources that genuinely run out, and a season that stops. When it stops the world is not deleted — it is sealed into a history you can walk back through, and a new one opens where everybody is poor again.',
    ],
    blurb:
      'A shared map, resources that genuinely run out, and a season that ends and is kept rather than deleted. Nothing purchasable is powerful — scarcity is the game.',
    stage: 'in-build',
    stageNote:
      'The world platform is built, including the private worlds that used to be sold and never provisioned. The first title itself is the one substantial application still to be carried across.',
    sections: [
      {
        title: 'Scarcity is the game',
        body: [
          'A world holds a fixed amount of fuel, medicine and seed. That is not a difficulty setting; it is the entire subject. What is burned today is gone from the map, and the last of something is a thing people negotiate over rather than a thing they farm.',
        ],
      },
      {
        title: 'Nothing purchasable is powerful',
        body: [
          'What can be bought is cosmetic, convenience, or access to reserved capacity. No resources, no extra turns, no combat advantage, and no edge over another player of any kind. The rule holds in the database rather than in a policy document: items are marked in a way that makes the powerful kind unrepresentable.',
          'This is not restraint for its own sake. A world whose scarcity can be bought out of is a world with no story in it, and the story is the product.',
        ],
      },
      {
        title: 'A private world is now actually raised',
        body: [
          'Renting a world for a group of friends was on sale in the previous estate, took the money, wrote the entitlement, and provisioned nothing — a feature that was inert from the day it was listed. The rebuilt platform creates the world: its own simulation, its own stock, its own seed.',
          'It is named here rather than quietly fixed because the pattern matters more than the instance. Something was sold that no code path delivered, and nothing in the system was capable of noticing.',
        ],
      },
    ],
    linkTo: 'worlds',
    linkLabel: 'Forge Worlds',
    ogImage: '/og/worlds.png',
  },
]

/** Page lookup by slug. An unknown slug is a 404, never a redirect to the index. */
export function productPage(slug: string): ProductPage | undefined {
  return PRODUCT_PAGES.find((p) => p.slug === slug)
}

/**
 * The five products, in the registry's own order, joined to their pages.
 *
 * Used by the products index and the home grid. Hub is deliberately absent: it is a `surface`
 * rather than a `product` in the registry, and `01-product-vision.md` §3 is explicit that the
 * container must never appear in a product grid as a peer — "an account is not something a person
 * chooses, it is something they are given".
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
