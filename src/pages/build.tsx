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
import { PRODUCT_PAGES, STAGE_LABEL, type Stage } from '../content/products.ts'
import { PageHead, Prose, Ridge, Section, StageChip, SurfaceMark, accentProps } from '../components/parts.tsx'

/** Order the table by how far along a surface is, most-finished first. */
const STAGE_ORDER: Readonly<Record<Stage, number>> = { built: 0, 'in-build': 1, 'not-built': 2 }

export function BuildPage() {
  const rows = [...PRODUCT_PAGES].sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage])

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
                <dd className="si-status__note">{page.stageNote}</dd>
              </div>
            )
          })}
        </dl>
        <p className="si-aside">
          {/* Spelled out from the same declaration, so the legend cannot list a stage that no longer
              exists or omit one that does. */}
          {(Object.keys(STAGE_ORDER) as Stage[]).map((stage) => STAGE_LABEL[stage]).join(' · ')} — three
          states, not five. A scale with more steps invites the halfway-house label that means
          nothing.
        </p>
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
