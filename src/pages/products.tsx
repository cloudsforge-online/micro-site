/**
 * The products index, and one page per product.
 *
 * Both are generated from `src/content/products.ts`, which is generated in turn from the surface
 * registry. Adding a product is a registry entry plus a content block; it is not a new file, a new
 * route, a new nginx line or a new footer entry, because none of those name a product.
 */
import { Link, useParams } from 'react-router-dom'
import { surface } from '@cloudsforge/ui'
import { hosts } from '../lib/hosts.ts'
import { PRODUCT_PAGES, hubPage, productCards, productPage } from '../content/products.ts'
import { PageHead, Prose, Ridge, Section, StageChip, SurfaceMark, accentProps } from '../components/parts.tsx'
import { NotFoundPage } from './not-found.tsx'

/* ─────────────────────────── the index ────────────────────────────── */

export function ProductsIndexPage() {
  const cards = productCards()
  const hub = hubPage()
  const hubSurface = surface('hub')

  return (
    <>
      <PageHead
        eyebrow="Products"
        headline="Six surfaces, one account"
        standfirst={[
          'Five products a person chooses between, and the control centre they all sit on. Each carries the state it is actually in, which is not the same on any two of them.',
        ]}
      />

      <Ridge />

      {/*
        Hub goes first and outside the grid. It is a `surface` rather than a `product` in the
        registry, and putting it in the same list as the five would say it is one of them.
      */}
      <Section title="The control centre" id="control-centre">
        <article className="si-feature" {...accentProps('hub')}>
          <div className="si-feature__head">
            <SurfaceMark surfaceKey="hub" size={34} />
            <div>
              <h3 className="si-feature__name">
                <Link to={`/products/${hub.slug}`}>{hubSurface.name}</Link>
              </h3>
              <p className="si-feature__blurb">{hubSurface.blurb}</p>
            </div>
            <StageChip stage={hub.stage} className="si-feature__stage" />
          </div>
          <p className="si-feature__note">{hub.stageNote}</p>
        </article>
      </Section>

      <Section
        title="The five products"
        lede="In the order the switcher lists them, which is chosen so that no two neighbouring accents can be confused with each other."
        id="the-five"
      >
        <ul className="si-cards">
          {cards.map(({ surface: s, page }) => (
            <li className="si-card" key={s.key} {...accentProps(s.key)}>
              <Link className="si-card__link" to={`/products/${page.slug}`}>
                <div className="si-card__head">
                  <SurfaceMark surfaceKey={s.key} size={30} />
                  <div>
                    <p className="si-card__verb">{s.verb}</p>
                    <h3 className="si-card__name">{s.name}</h3>
                  </div>
                </div>
                <p className="si-card__blurb">{page.headline}</p>
                <span className="si-card__foot">
                  <StageChip stage={page.stage} />
                  <span className="si-card__more" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="What is not here yet" id="not-here">
        <div className="si-prose">
          <p>
            A developer platform — projects, keys, webhooks, a software development kit and a
            sandbox — is intended and is not built. It has no page on this site, because a page
            about it would be a page about an intention, and an intention with a marketing page
            attached is how the estate ended up selling things that no code path delivered.
          </p>
          <p>
            It will get one when there is something behind it. Until then this paragraph is the
            whole announcement.
          </p>
        </div>
      </Section>
    </>
  )
}

/* ──────────────────────── one product's page ──────────────────────── */

export function ProductDetailPage() {
  const { slug } = useParams()
  const page = slug === undefined ? undefined : productPage(slug)

  // An unknown product renders the not-found page, inside the same 404 the server already sent.
  // Redirecting to the index instead would turn a broken link into a silent success — which is the
  // exact failure the enumerated routes in nginx.conf exist to prevent, one layer up.
  if (!page) return <NotFoundPage />

  const s = surface(page.key)
  const url = hosts()[page.linkTo]
  const others = PRODUCT_PAGES.filter((p) => p.slug !== page.slug)

  return (
    <div {...accentProps(page.key)}>
      <PageHead
        eyebrow={`${s.name} · ${page.eyebrow}`}
        headline={page.headline}
        standfirst={page.standfirst}
        aside={
          <div className="si-productaside">
            <SurfaceMark surfaceKey={page.key} size={44} />
            <StageChip stage={page.stage} />
            <p className="si-productaside__note">{page.stageNote}</p>
            {/*
              The outbound link is resolved from the registry at runtime. It is rendered even though
              nothing is deployed: the address is where the surface WILL be, it is correct in local
              development today, and removing it would mean adding it back later in six places.

              Outlined rather than filled. A filled button here would put a label on a fill in the
              PRODUCT's accent, and the ink token that keeps such a label legible is tightest on
              Forge Network — measured at 4.3:1, under the 4.5 a label this size needs. An outline
              draws the accent as type instead, which `--si-accent` already guarantees on both
              grounds. It is also simply less colour on a page already wearing that colour.
            */}
            <a className="si-btn si-btn--outline" href={url}>
              Open {s.name}
            </a>
          </div>
        }
      />

      <Ridge />

      {page.sections.map((section) => (
        <Section title={section.title} key={section.title}>
          <Prose body={section.body} />
          {section.points && (
            <ul className="si-list">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
        </Section>
      ))}

      <Ridge />

      <Section title="The rest of it" id="the-rest">
        <ul className="si-chips">
          {others.map((other) => (
            <li key={other.slug} {...accentProps(other.key)}>
              <Link className="si-chip" to={`/products/${other.slug}`}>
                <SurfaceMark surfaceKey={other.key} size={18} />
                {surface(other.key).name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
