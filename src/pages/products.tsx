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
import { PRODUCTS_INDEX } from '../content/pages.ts'
import { IncompleteNote, PageHead, Prose, Ridge, Section, StageChip, SurfaceMark, accentProps } from '../components/parts.tsx'
import { NotFoundPage } from './not-found.tsx'

/* ─────────────────────────── the index ────────────────────────────── */

export function ProductsIndexPage() {
  const cards = productCards()
  const hub = hubPage()
  const hubSurface = surface('hub')

  return (
    <>
      {/*
        Every string on this page comes from `PRODUCTS_INDEX`. They were literals here until both
        counts in them went stale at once — "Six surfaces" against seven pages, "Five products"
        against six — which is why they now live where the copy walk can read them and are computed
        from the registry rather than typed. See the header of `src/content/products.ts`.
      */}
      <PageHead
        eyebrow={PRODUCTS_INDEX.eyebrow}
        headline={PRODUCTS_INDEX.headline}
        standfirst={PRODUCTS_INDEX.standfirst}
      />

      <Ridge />

      {/*
        Hub goes first and outside the grid. It is a `surface` rather than a `product` in the
        registry, and putting it in the same list as the products would say it is one of them.
      */}
      <Section title={PRODUCTS_INDEX.controlCentreTitle} id="control-centre">
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
        title={PRODUCTS_INDEX.productsTitle}
        lede={PRODUCTS_INDEX.productsLede}
        id="the-products"
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
                <IncompleteNote surfaceKey={s.key} />
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

      <Section title={PRODUCTS_INDEX.notHere.title} id="not-here">
        <Prose body={PRODUCTS_INDEX.notHere.body} />
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
            {/* Above the outbound link on purpose. A reader meets the caveat before the button. */}
            <IncompleteNote surfaceKey={page.key} />
            {/*
              ── THE BUTTON IS RENDERED ONLY FOR A SURFACE THAT SERVES ONE ───────────────────────

              `servesUi` is the registry's measurement of whether anything answers on that
              hostname, and it is false for Forge Exchange: no repository, no container, and a
              hostname whose DNS record the estate deliberately never created (micro-deploy's
              `EXPECTED_UNROUTED` records why a router would be the wrong fix). A button reading
              "Open Forge Exchange" would be a dead link on a page whose entire subject is that
              the thing does not exist yet — the exact failure this site was written against.

              This is a `&&` rather than a second page component because the day it ships, the
              registry row flips one boolean and the button appears. Nothing here is edited.

              The outbound link is otherwise resolved from the registry at runtime and rendered
              even where nothing is deployed: the address is where the surface WILL be, it is
              correct in local development today, and removing it would mean adding it back later
              in six places.

              Outlined rather than filled. A filled button here would put a label on a fill in the
              PRODUCT's accent, and the ink token that keeps such a label legible is tightest on
              Forge Network — measured at 4.3:1, under the 4.5 a label this size needs. An outline
              draws the accent as type instead, which `--si-accent` already guarantees on both
              grounds. It is also simply less colour on a page already wearing that colour.
            */}
            {surface(page.linkTo).servesUi && (
              <a className="si-btn si-btn--outline" href={url}>
                Open {s.name}
              </a>
            )}
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
