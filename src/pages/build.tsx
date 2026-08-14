/**
 * The build-status page.
 *
 * This is the page that decides what kind of marketing site this is. A crypto platform's front
 * door usually implies that everything on it is running; this one says, at the top, that none of
 * it is, and then goes through it surface by surface.
 *
 * The per-surface rows are NOT written here. They are `stage` and `stageNote` from
 * `src/content/products.ts`, the same two fields the product pages render, so this page and those
 * pages cannot say different things about the same surface. Two hand-maintained descriptions of
 * one state is how the estate ended up with a shop selling a world nothing provisioned.
 */
import { Link } from 'react-router-dom'
import { surface } from '@cloudsforge/ui'
import { BUILD } from '../content/pages.ts'
import { PRODUCT_PAGES } from '../content/products.ts'
import { STAGE_MEANING, STAGE_ORDER } from '../content/stages.ts'
import { IncompleteNote, PageHead, Prose, Ridge, Section, StageChip, SurfaceMark, accentProps } from '../components/parts.tsx'

export function BuildPage() {
  // Most-finished first, from the one declaration of the order. A second copy of it here is how
  // the legend and the table would eventually disagree about which end of the scale is which.
  const rank = (stage: (typeof STAGE_ORDER)[number]): number => STAGE_ORDER.indexOf(stage)
  const rows = [...PRODUCT_PAGES].sort((a, b) => rank(a.stage) - rank(b.stage))

  return (
    <>
      <PageHead eyebrow={BUILD.eyebrow} headline={BUILD.headline} standfirst={BUILD.standfirst} />

      {/*
        The honesty block is a call-out rather than a section, because it is the one thing on this
        page a reader must not be able to scroll past without seeing.
      */}
      <aside className="si-callout" aria-labelledby="not-deployed">
        <h2 className="si-callout__title" id="not-deployed">
          {BUILD.honesty.title}
        </h2>
        {BUILD.honesty.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </aside>

      <Ridge />

      <Section title="Surface by surface" id="surfaces">
        <p className="si-lede">{BUILD.perSurfaceNote}</p>
        {/*
          A description list, not a table. There are two facts per row and no columns to compare
          across, and a two-column table of prose is a table that scrolls sideways on a phone for
          no benefit.
        */}
        <dl className="si-status">
          {rows.map((page) => {
            const s = surface(page.key)
            return (
              <div className="si-status__row" key={page.slug} {...accentProps(page.key)}>
                <dt className="si-status__name">
                  <SurfaceMark surfaceKey={page.key} size={22} />
                  <Link to={`/products/${page.slug}`}>{s.name}</Link>
                  <StageChip stage={page.stage} />
                </dt>
                <dd className="si-status__note">
                  {page.stageNote}
                  {/* The page whose whole subject is "how far along is everything" is the last
                      place a second status should be missing from. */}
                  <IncompleteNote surfaceKey={page.key} />
                </dd>
              </div>
            )
          })}
        </dl>
      </Section>

      <Ridge />

      {/*
        The legend, and the derivation above it.

        Rendered as real chips rather than as a joined string of labels, so a reader meets the exact
        glyph and colour they will see on a row before they have to interpret one — and so the
        `open` chip, which appears nowhere else because nothing is open, is on screen at all. A
        scale whose top rung is invisible reads as if its top rung is wherever everybody is
        standing.

        The whole legend is derived from STAGE_ORDER, so it cannot list a stage that no longer
        exists, omit one that does, or fall out of order with the table above.
      */}
      <Section title={BUILD.derivation.title} id="derivation">
        <Prose body={BUILD.derivation.body} />
        <dl className="si-legend">
          {STAGE_ORDER.map((stage) => (
            <div className="si-legend__row" key={stage}>
              <dt>
                <StageChip stage={stage} />
              </dt>
              <dd>{STAGE_MEANING[stage]}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Ridge />

      {/*
        The wallets. Not rows in the table above, because a table row is a SURFACE — something the
        registry knows and the gateway routes — and a desktop application, a browser extension and a
        phone application are none of those.
      */}
      <Section title={BUILD.wallets.title} id="wallets">
        <Prose body={BUILD.wallets.body} />
        <p className="si-aside">{BUILD.wallets.recordedBy}</p>
      </Section>

      <Ridge />

      <Section title={BUILD.expensive.title} id="expensive">
        <Prose body={BUILD.expensive.body} />
      </Section>

      <Section title={BUILD.gate.title} id="gate">
        <Prose body={BUILD.gate.body} />
      </Section>
    </>
  )
}
