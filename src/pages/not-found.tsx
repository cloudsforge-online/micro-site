/**
 * The unknown-address page.
 *
 * It is rendered under an HTTP 404, not a 200. `nginx.conf` enumerates this site's real routes and
 * lets everything else fall through to `error_page 404 /index.html`, which serves this bundle while
 * KEEPING the status.
 *
 * That matters here more than on any product surface. This is the site search engines crawl, that
 * link checkers walk, and that people paste into chat. The application this one replaces answers
 * 200 for every address in existence, so its "page not found" screen is a document crawlers are
 * entitled to index, uptime checks call healthy, and link checkers pass — and a deploy that drops a
 * page looks exactly like a deploy that did not.
 *
 * The page is useful as well as honest: an address that does not exist is usually a reader looking
 * for something that does, so the routes are listed rather than offering a single button home.
 */
import { Link } from 'react-router-dom'
import { NOT_FOUND } from '../content/pages.ts'
import { ROUTES } from '../lib/routes.ts'
import { productCards } from '../content/products.ts'
import { Ridge, SurfaceMark, accentProps } from '../components/parts.tsx'

export function NotFoundPage() {
  const pages = ROUTES.filter((r) => r.label !== null)
  const cards = productCards()

  return (
    <div className="si-notfound">
      <p className="si-eyebrow">{NOT_FOUND.status}</p>
      <h1 className="si-display">{NOT_FOUND.headline}</h1>
      <div className="si-prose si-prose--lead">
        {NOT_FOUND.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <Ridge />

      <h2 className="si-h2">Everything that is here</h2>
      <ul className="si-list si-list--links">
        {pages.map((route) => (
          <li key={route.path}>
            <Link to={route.path === '' ? '/' : `/${route.path}`}>{route.label}</Link>
            <span className="si-list__note">{route.summary}</span>
          </li>
        ))}
      </ul>

      <ul className="si-chips">
        {cards.map(({ surface: s, page }) => (
          <li key={s.key} {...accentProps(s.key)}>
            <Link className="si-chip" to={`/products/${page.slug}`}>
              <SurfaceMark surfaceKey={s.key} size={18} />
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
