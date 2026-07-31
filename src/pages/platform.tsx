/**
 * The platform page: what "one platform" is defined to mean, and what is free forever.
 *
 * The eleven statements are the strongest piece of content this site has, and they are the piece
 * most companies would not publish, because most of them are not true yet. They are here in full
 * for the reason the page itself gives: a definition you only publish once you pass it is not a
 * definition.
 *
 * There are deliberately no per-statement verdicts. The source table carries a "Today" column, its
 * verdicts describe an estate that has since changed under several of them, and a stale verdict is
 * worse than none because a reader cannot tell which ones went stale. Per-surface state lives on
 * the build page, where it is maintained.
 */
import { Link } from 'react-router-dom'
import { PLATFORM } from '../content/pages.ts'
import { PageHead, Prose, Ridge, Section } from '../components/parts.tsx'

export function PlatformPage() {
  return (
    <>
      <PageHead eyebrow={PLATFORM.eyebrow} headline={PLATFORM.headline} standfirst={PLATFORM.standfirst} />

      <Ridge />

      <Section title="The definition" id="definition">
        {/*
          An ordered list, numbered by the browser rather than by hand, so the count in the note
          below and the number of rows cannot disagree. `si-statements` styles the marker as a
          monospace ordinal; the semantics are a plain <ol>, which is what a screen reader wants.
        */}
        <ol className="si-statements">
          {PLATFORM.tests.map((statement) => (
            <li key={statement}>{statement}</li>
          ))}
        </ol>
        <p className="si-aside">{PLATFORM.testsNote}</p>
      </Section>

      <Ridge />

      <Section title={PLATFORM.free.title} id="free">
        {/* The rule, pulled out as the one sentence on the page a reader should leave with. */}
        <blockquote className="si-rule">
          <p>{PLATFORM.free.rule}</p>
        </blockquote>
        <Prose body={PLATFORM.free.body} />
        <ul className="si-list si-list--check">
          {PLATFORM.free.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={PLATFORM.prices.title} id="prices">
        <Prose body={PLATFORM.prices.body} />
      </Section>

      <Section title={PLATFORM.spine.title} id="spine">
        <Prose body={PLATFORM.spine.body} />
        <p className="si-aside">
          What is a product, and what each of them is for, is on the{' '}
          <Link to="/products">products page</Link>.
        </p>
      </Section>
    </>
  )
}
