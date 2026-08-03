/**
 * The legal pages.
 *
 * Two things are rendered here that a legal page usually hides. The notice at the top says the
 * document is incomplete, and every undrafted section is drawn as a visible hole with a note
 * saying what belongs in it.
 *
 * The hole is a dashed panel — the same shape Forge Hub uses for a capability the estate does not
 * serve yet, and the same reasoning: dashed reads as "unfinished" at a glance, where a solid panel
 * with a short paragraph in it reads as "finished, and brief". That difference matters more here
 * than anywhere, because the alternative reading of a short legal section is that the company has
 * limited its liability in one sentence.
 */
import { useLocation } from 'react-router-dom'
import { hasOutstanding, legalPage, type LegalSection } from '../content/legal.ts'
import { PageHead, Ridge } from '../components/parts.tsx'
import { NotFoundPage } from './not-found.tsx'

export function LegalPageView() {
  /*
   * The slug comes from the PATH, not from `useParams`.
   *
   * This read `const { slug } = useParams()`, and the routes it is mounted on are
   * `<Route path="terms">` and `<Route path="privacy">` — neither declares a `:slug` parameter, so
   * `useParams()` answered `{}`, `slug` was always `undefined`, and BOTH legal pages rendered the
   * not-found screen. Under a 200, because nginx enumerates /terms and /privacy correctly and
   * serves them the shell: the exact dishonesty this repository's configuration exists to prevent,
   * produced by the application inside it instead.
   *
   * Nothing could see it. `routes.test.ts` reads app.tsx, lib/routes.ts and nginx.conf, and all
   * three were right. `legal.test.ts` tests the content module, which was right. CI probes /terms
   * for a 200 and got one. It took rendering the page in a browser and reading what came out.
   *
   * `useLocation` rather than a prop, because the two routes share one component deliberately —
   * so the notice, the undrafted marker and the section ordering cannot end up different on the
   * two pages — and a prop would be a second place to state which page this is.
   */
  const slug = useLocation().pathname.replace(/^\/+|\/+$/g, '')
  const page = legalPage(slug)
  if (!page) return <NotFoundPage />

  const outstanding = page.sections.filter((s) => s.status === 'counsel').length

  return (
    <>
      <PageHead eyebrow="Legal" headline={page.title} standfirst={page.standfirst} />

      {hasOutstanding(page) && (
        // `role="note"` rather than `alert`: this is a standing property of the document, not an
        // event. An alert role would interrupt a screen reader on every navigation to it.
        <aside className="si-notice" role="note" aria-labelledby="legal-notice">
          <h2 className="si-notice__title" id="legal-notice">
            Incomplete
          </h2>
          <p>{page.notice}</p>
          <p className="si-notice__count">
            {outstanding} of {page.sections.length} sections are undrafted and are marked below.
          </p>
        </aside>
      )}

      <Ridge />

      <div className="si-legal">
        {page.sections.map((section) => (
          <LegalBlock key={section.title} section={section} />
        ))}
      </div>
    </>
  )
}

function LegalBlock({ section }: { section: LegalSection }) {
  const undrafted = section.status === 'counsel'
  return (
    <section className={`si-legal__section${undrafted ? ' si-legal__section--hole' : ''}`}>
      <h2 className="si-legal__title">
        {section.title}
        {undrafted && <span className="si-legal__flag">Needs counsel</span>}
      </h2>
      {undrafted ? (
        <p className="si-legal__outstanding">
          <span className="si-legal__label">To be drafted: </span>
          {section.outstanding}
        </p>
      ) : (
        section.body.map((p) => (
          <p className="si-legal__text" key={p}>
            {p}
          </p>
        ))
      )}
    </section>
  )
}
