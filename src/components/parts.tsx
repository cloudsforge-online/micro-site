/**
 * The site's own vocabulary: the pieces every page is built out of.
 *
 * Nothing here reimplements anything in `@cloudsforge/ui`. The bar, the switcher, the marks, the
 * logo and the tokens all come from the design system; what a marketing site needs on top of them
 * is editorial furniture — a section head, a horizon rule, a stage chip — and that is all this is.
 *
 * ── The two class prefixes, and the rule between them ─────────────────────────────────────────
 *
 * `cf-` belongs to the design system and nothing here may collide with it or override it.
 * `si-` is this site's layer, in `src/styles.css`, and every colour, space and font in it is a
 * token. A literal hex in that stylesheet is a colour that does not follow the substrate.
 *
 * There is no third prefix. Forge Hub kept the template's `wt-` because it carried the template's
 * four-state components forward byte for byte; this site does not — it fetches nothing, so it has
 * no loading, empty, failed or forbidden state to draw — and `src/components/states.tsx` was
 * deleted on instantiation rather than left in place unused.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Mark, hasMark, surface, type SurfaceKey } from '@cloudsforge/ui'
import { STAGE_GLYPH, STAGE_LABEL, type Stage } from '../content/stages.ts'

/**
 * The ash ridge.
 *
 * Every brand mark in the system is drawn over a ground line — the ridge is the one element common
 * to all seven, including the company's own. Repeating it as the site's section divider is what
 * makes a page of prose feel like it belongs to the same family as a 24-pixel switcher glyph,
 * without a single image request.
 *
 * It is drawn rather than bordered because a straight 1px rule would read as a generic separator.
 * `preserveAspectRatio="none"` lets one path stretch to any column width; the geometry is coarse
 * enough that the distortion is invisible and fine enough that it is not a zigzag.
 */
export function Ridge({ className }: { className?: string }) {
  return (
    <svg
      className={`si-ridge${className ? ` ${className}` : ''}`}
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 20 L180 20 L280 11 L360 17 L470 6 L580 16 L700 9 L820 18 L930 12 L1040 19 L1200 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/**
 * A surface's accent, scoped to one subtree.
 *
 * The page wears the company ember, because the marketing site is company chrome. A product card
 * on that page has to wear ITS product's colour — five cards, five accents, one page.
 *
 * ── Why this is an attribute and not an inline style ─────────────────────────────────────────
 *
 * The first version of this returned `{ '--cf-accent': surface(key).accent }` as an inline style.
 * That works for the accent and is wrong for everything derived from it: `--cf-accent-hover` and,
 * more seriously, `--cf-accent-ink` — the token that exists so a label on an accent FILL stays
 * legible — would keep the values belonging to the page's ember. A filled button inside a Forge
 * Network card would then have drawn ember-ink on Network red, measured at 4.2:1, under the floor.
 *
 * `data-cf-product` is the mechanism the design system already provides for exactly this, and its
 * blocks in tokens.css set all four properties together. So this returns the attribute, the four
 * values arrive as a set, and this file names no colour at all.
 *
 * `test/contrast.test.ts` asserts that every key this site scopes has a block in tokens.css. That
 * is not hypothetical: the operator console spent an unknown length of time setting
 * `data-cf-product="admin"` against a selector that did not exist, falling through to the ember
 * default in silence, and tokens.css now declares every key explicitly because of it.
 */
export function accentProps(key: SurfaceKey): { 'data-cf-product': SurfaceKey } {
  return { 'data-cf-product': key }
}

/** Every surface key this site scopes an accent to. Read by the test that checks tokens.css. */
export const SCOPED_SURFACES: readonly SurfaceKey[] = [
  'site',
  'hub',
  'foresight',
  'network',
  'trade',
  'create',
  'market',
  'worlds',
  // The pool page and the home page's pool capability both scope this key. It was ALREADY being
  // scoped by the capability before it was declared anywhere: `micro-ui`'s tokens.css had no
  // `[data-cf-product='pool']` block, so all four accent tokens fell through to the company ember
  // in silence — the failure the note above is about, caught here because this list is what
  // `test/contrast.test.ts` checks against the stylesheet. The block now exists, shared with
  // `create`, which is the hue the registry already gives `pool`.
  'pool',
  // Scoped by the "rest of it" strip at the foot of every product page, which draws one chip per
  // page in that page's accent — so a page that exists gets scoped whether or not anything serves
  // it. `exchange` joined `create`'s gold block in tokens.css on the same day this line was added,
  // for the reason the note above records: scoping a key that is not declared falls through to the
  // company ember in silence, and silence is the failure this list exists to make loud.
  'exchange',
  // Scoped by the same "rest of it" strip, and by this page's own chrome. `journal` carries its
  // own accent in the registry rather than sharing one — `[data-cf-product='journal']` is a block
  // of its own in tokens.css — so the check below is doing real work here: a key added to this
  // list before the stylesheet had a block for it would fall through to the company ember in
  // silence, which is exactly what `admin` did for an unknown length of time.
  'journal',
]

/**
 * How far along something is.
 *
 * Three channels, always: a glyph, a word and a colour. A reader who cannot separate the amber
 * from the green still has the shape and the label, which is the rule the whole design system is
 * built on — `docs/ecosystem/assets/chart-palette.md` §8, restated in `tokens.css`: "every status
 * mark ships icon + label + colour".
 *
 * These are not decorative. This site's central editorial claim is that it tells you the state of
 * what it is describing, and this component is where that claim is cashed.
 */
export function StageChip({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span className={`si-stage si-stage--${stage}${className ? ` ${className}` : ''}`}>
      <span className="si-stage__glyph" aria-hidden="true">
        {STAGE_GLYPH[stage]}
      </span>
      {STAGE_LABEL[stage]}
    </span>
  )
}

/**
 * The second status a surface can carry: you can open it, and there is nothing in it for you.
 *
 * ── WHY A SURFACE CAN WEAR THIS AND `● OPEN TO THE PUBLIC` AT THE SAME TIME ────────────────────
 *
 * They answer different questions and both answers are true. The stage above says how far into the
 * estate something has got — deployed, walked by a real browser, answering on the public internet
 * — and Forge Trade has done all three. This says whether the thing the product is named after is
 * switched on, and there it has not. Collapsing them into a fifth stage was the first draft and it
 * was wrong: `content/stages.ts` argues at length that its scale only stays honest while every
 * rung names an event in the estate, and "there is nothing to do here" is not one of those.
 *
 * So the card carries both, and they read as one thought: open, and empty. The sentence is the
 * component's whole payload — a tag alone would be a label with no fact under it, which is the
 * "Coming soon" failure this replaces.
 *
 * Renders nothing at all for a surface with no marker, so every card can call it unconditionally.
 * The alternative is six call sites each remembering to check, and the one that forgets is the one
 * that ships a card promising something that is switched off.
 */
export function IncompleteNote({
  surfaceKey,
  className,
}: {
  surfaceKey: SurfaceKey
  className?: string
}) {
  const note = surface(surfaceKey).incomplete
  if (note === undefined) return null
  return (
    <p className={`si-incomplete${className ? ` ${className}` : ''}`}>
      {/* Not aria-hidden. "Incomplete" is the summary; a reader skimming with a screen reader
          should get it in the same breath as the sentence, not as a decoration they never hear. */}
      <span className="si-incomplete__tag">Incomplete</span>
      {note}
    </p>
  )
}

/**
 * A page's opening block: eyebrow, headline, standfirst.
 *
 * One component rather than a copied heading on six pages, because the thing that goes wrong with
 * a copied heading is that five of them get updated.
 */
export function PageHead({
  eyebrow,
  headline,
  standfirst,
  aside,
}: {
  eyebrow: string
  headline: string
  standfirst: readonly string[]
  /** Anything that belongs beside the standfirst — a stage chip, a link out. */
  aside?: ReactNode
}) {
  return (
    <header className="si-pagehead">
      <p className="si-eyebrow">{eyebrow}</p>
      {/* The one h1 on the page. Every section below it is an h2. */}
      <h1 className="si-display">{headline}</h1>
      <div className="si-pagehead__body">
        <div className="si-prose si-prose--lead">
          {standfirst.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        {aside && <div className="si-pagehead__aside">{aside}</div>}
      </div>
    </header>
  )
}

/** A titled section of a page. `id` is set from the title so headings are linkable. */
export function Section({
  title,
  lede,
  children,
  id,
}: {
  title: string
  lede?: string
  children?: ReactNode
  id?: string
}) {
  const slug = id ?? slugify(title)
  return (
    <section className="si-section" aria-labelledby={slug}>
      <h2 className="si-h2" id={slug}>
        {title}
      </h2>
      {lede && <p className="si-lede">{lede}</p>}
      {children}
    </section>
  )
}

/** Paragraphs, in the reading measure. */
export function Prose({ body }: { body: readonly string[] }) {
  return (
    <div className="si-prose">
      {body.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  )
}

/**
 * A surface's mark at reading size, in that surface's own accent.
 *
 * `hasMark` is checked rather than assumed: `Mark` returns null for a surface it has no drawing
 * for, and a silently absent mark leaves a hole in a card layout that nobody notices until it is
 * on the front page. The fallback is the surface's glyph, which every registry entry has.
 */
export function SurfaceMark({ surfaceKey, size = 28 }: { surfaceKey: SurfaceKey; size?: number }) {
  const s = surface(surfaceKey)
  if (hasMark(surfaceKey)) {
    return <Mark surface={surfaceKey} size={size} accent={s.accent} className="si-mark" />
  }
  return (
    <span className="si-mark si-mark--glyph" role="img" aria-label={s.name}>
      {s.glyph}
    </span>
  )
}

/** One tile in a `si-cards` grid: everything the card draws, and nothing about where it came from. */
export interface SurfaceCard {
  readonly key: SurfaceKey
  /** The `/products/` segment this tile links to. */
  readonly slug: string
  /** The verb-or-role line above the name. */
  readonly eyebrow: string
  /** One line under the name. The two grids read it from different places; see `SurfaceCards`. */
  readonly blurb: string
  readonly stage: Stage
}

/**
 * A grid of surface tiles.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * ONE COMPONENT, BECAUSE THERE WERE TWO COPIES AND THEN THERE WERE FOUR (micro-org#488)
 *
 * This markup was written twice — `src/pages/home.tsx` and `src/pages/products.tsx` — and the two
 * copies had already diverged in a way nobody chose: the home grid printed the registry's `blurb`
 * and the index grid printed the page's `headline`. That divergence is real and is KEPT, because
 * the two pages are asking different questions (the home page introduces a surface to somebody who
 * has not heard of it; the index page distinguishes it from the eight beside it). It is kept as a
 * PARAMETER instead of as a second file, which is the difference between a decision and a drift.
 *
 * Adding the second grid would have made two copies four. The card is the site's densest piece of
 * markup — accent scoping, a mark with a glyph fallback, a stage chip, an incompleteness note that
 * must be called unconditionally — and every one of those is a thing three of four copies would
 * eventually have.
 *
 * ── THE EYEBROW IS THE PAGE'S, NOT THE REGISTRY'S, AND THAT IS THE ENABLING CHANGE ────────────
 *
 * The two grids printed `surface.verb`, which is `null` for every surface that is not one of the
 * six products — so a pool, exchange or archive tile drawn from the registry would have had an
 * empty line where every other tile has a word. `ProductPage.eyebrow` is the same string for all
 * six products ("Mine", "Make", "Trade", "Bet", "Sell", "Play" — checked, character for
 * character) and exists for the other four as well, so reading the eyebrow from the page rather
 * than the registry changes nothing that was on screen and is what lets one card shape serve every
 * page under `/products`.
 *
 * ── `IncompleteNote` IS CALLED UNCONDITIONALLY, WHICH IS THE POINT OF IT ──────────────────────
 *
 * It renders nothing for a surface with no marker. Calling it here rather than at each call site
 * is why a second grid cannot ship a tile that looks finished because this grid forgot to ask —
 * which was the stated reason for the unconditional call in the copy this replaces.
 */
export function SurfaceCards({ cards }: { cards: readonly SurfaceCard[] }) {
  return (
    <ul className="si-cards">
      {cards.map((card) => (
        <li className="si-card" key={card.key} {...accentProps(card.key)}>
          <Link className="si-card__link" to={`/products/${card.slug}`}>
            <div className="si-card__head">
              <SurfaceMark surfaceKey={card.key} size={30} />
              <div>
                <p className="si-card__verb">{card.eyebrow}</p>
                <h3 className="si-card__name">{surface(card.key).name}</h3>
              </div>
            </div>
            <p className="si-card__blurb">{card.blurb}</p>
            <IncompleteNote surfaceKey={card.key} />
            <span className="si-card__foot">
              <StageChip stage={card.stage} />
              <span className="si-card__more" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Lower-case, hyphenated, ASCII. Used for heading ids, so it must be stable and URL-safe. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
