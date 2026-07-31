/**
 * The company page: the tie-breakers, and the refusals.
 *
 * Both lists come from the vision document rather than from a copywriter. They are the criteria
 * the engineering is actually decided by, which is the only reason they are worth publishing —
 * a principle that does not decide anything is a slogan, and a reader can tell.
 */
import { Link } from 'react-router-dom'
import { ABOUT } from '../content/pages.ts'
import { PageHead, Ridge, Section } from '../components/parts.tsx'

export function AboutPage() {
  return (
    <>
      <PageHead eyebrow={ABOUT.eyebrow} headline={ABOUT.headline} standfirst={ABOUT.standfirst} />

      <Ridge />

      <Section title={ABOUT.principles.title} lede={ABOUT.principles.lede} id="principles">
        <ol className="si-numbered">
          {ABOUT.principles.items.map((item) => (
            <li key={item.title}>
              <h3 className="si-numbered__title">{item.title}</h3>
              <p className="si-numbered__body">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Ridge />

      <Section title={ABOUT.rejects.title} lede={ABOUT.rejects.lede} id="rejects">
        <ul className="si-points">
          {ABOUT.rejects.items.map((item) => (
            <li key={item.title}>
              <h3 className="si-points__title">{item.title}</h3>
              <p className="si-points__body">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Where the rest of it is written down" id="elsewhere">
        <div className="si-prose">
          <p>
            The definition of what makes these products one platform is on the{' '}
            <Link to="/platform">platform page</Link>, in full, including the parts that are not
            true yet. What is actually built is on the <Link to="/build">build status page</Link>.
          </p>
          <p>
            Neither of those pages exists to be reassuring. They exist because the alternative —
            deciding later, once the news is better — is the decision that produced an estate
            selling things nothing delivered.
          </p>
        </div>
      </Section>
    </>
  )
}
