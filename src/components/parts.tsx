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

/** Lower-case, hyphenated, ASCII. Used for heading ids, so it must be stable and URL-safe. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
