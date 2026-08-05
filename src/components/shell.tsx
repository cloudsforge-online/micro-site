/**
 * The site shell: the company bar, the site's own navigation, the page, and the footer.
 *
 * The bar is `CloudsForgeBar` from `@cloudsforge/ui` and is never reimplemented — it is the thing
 * that makes moving between surfaces feel like one application rather than several. On this
 * surface it does something slightly different from everywhere else: `current="site"` marks NO
 * switcher entry as current, which is correct, because a reader on the marketing site is not
 * inside any product. The bar's logo already links here, which is also why the site is not itself
 * a switcher entry.
 *
 * Everything this app adds goes below the bar.
 */
import { useEffect } from 'react'
import {
  CloudsForgeBar,
  CookieBanner,
  MainRegion,
  PRODUCTS as REGISTRY_PRODUCTS,
  SkipLink,
  surface,
} from '@cloudsforge/ui'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { hosts, PRODUCT } from '../lib/hosts.ts'
import { NAV, ROUTES } from '../lib/routes.ts'
import { applyMeta, metaFor } from '../lib/meta.ts'
import { useSession } from '../lib/auth.tsx'
import { BUILD } from '../content/pages.ts'
import { Ridge } from './parts.tsx'

export function AppShell() {
  const { account, signIn, signOut } = useSession()

  return (
    <>
      {/*
        The skip link is the first focusable thing in the document, and it is now the SHARED one.
        This surface had the estate's only skip link; sixteen others had none, so a keyboard reader
        reached the content of Forge Hub or the operator console by tabbing past the logo, the
        product switcher and the account menu on every navigation. Moving it into @cloudsforge/ui
        is the whole point of this phase — and `MainRegion` below is the half that is easy to get
        wrong, because a <main> without `tabIndex={-1}` scrolls without moving focus.
      */}
      <SkipLink />

      <CloudsForgeBar current={PRODUCT} account={account} onSignIn={() => signIn()} onSignOut={signOut} />

      <SiteNav />
      <DocumentMeta />

      <MainRegion className="si-main">
        <Outlet />
      </MainRegion>

      <SiteFooter />

      {/*
        Last in the document, and therefore last in the tab order. That is deliberate: the banner
        is a dialog and is explicitly NOT modal, so a reader who came here to read something can
        read it and answer afterwards. A consent banner that traps focus is the coercion the
        regulation is about. It renders nothing at all until it knows the reader has not already
        answered, and nothing on an origin where analytics would not report anyway.
      */}
      <CookieBanner />
    </>
  )
}

/**
 * The site's own navigation, docked directly under the shared bar.
 *
 * `top: var(--cf-bar-h)` is the bar's own height token rather than a number copied out of it. A
 * hard-coded 46px leaves a seam the day the bar changes height, on every surface at once and on
 * none of the ones anybody rechecked.
 *
 * The entries are derived from `lib/routes.ts`. A second list here would be a second opinion about
 * which addresses exist, and `nginx.conf` already makes that two.
 */
function SiteNav() {
  return (
    <nav className="si-nav" aria-label="Site">
      <div className="si-nav__inner">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            // `end` only on the index: without it, `/` matches every path and Home stays
            // highlighted on every page of the site.
            end={item.to === '/'}
            className={({ isActive }) => `si-nav__link${isActive ? ' is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

/**
 * Keep `document.title`, the description, the Open Graph tags and the canonical link in step with
 * the address.
 *
 * A component in the shell rather than a hook called by each page, because the failure mode of the
 * second shape is the page that forgets to call it — and the page that forgets is the one added
 * last, which is the one nobody has bookmarked yet and therefore the one nobody notices is titled
 * with the previous page's title.
 *
 * The construction of the tags is a pure function in `lib/meta.ts` with its own test. This is only
 * the part that touches the DOM.
 */
function DocumentMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    applyMeta(metaFor(pathname), window.location.origin)
  }, [pathname])
  return null
}

/**
 * The footer.
 *
 * Three columns and a closing line. The product column is generated from the registry, so a sixth
 * product appears here without anybody editing this file — which is the whole reason the registry
 * exists, and the marketing site was one of the eight places that used to keep its own copy.
 *
 * The outbound links resolve through `cloudsforgeHosts()` at runtime, so this footer points at
 * localhost ports under `pnpm dev` and at the real subdomains in production, from one bundle.
 */
function SiteFooter() {
  const h = hosts()
  const pages = ROUTES.filter((r) => r.label !== null && r.path !== '')
  const legal = ROUTES.filter((r) => r.label === null)

  return (
    <footer className="si-footer">
      <Ridge className="si-ridge--footer" />
      <div className="si-footer__inner">
        <div className="si-footer__cols">
          <nav className="si-footer__col" aria-label="Products">
            <h2 className="si-footer__title">Products</h2>
            <ul className="si-footer__list">
              {REGISTRY_PRODUCTS.map((s) => (
                <li key={s.key}>
                  <Link to={`/products/${s.key}`}>{s.name}</Link>
                </li>
              ))}
              {/* Hub last and separately: it is the container rather than one of the products. */}
              <li>
                <Link to="/products/hub">{surface('hub').name}</Link>
              </li>
            </ul>
          </nav>

          <nav className="si-footer__col" aria-label="This site">
            <h2 className="si-footer__title">This site</h2>
            <ul className="si-footer__list">
              {pages.map((r) => (
                <li key={r.path}>
                  <Link to={`/${r.path}`}>{r.label}</Link>
                </li>
              ))}
              {/*
                A legal route has no nav label — that is what keeps it out of the header — so the
                link text is the clause of its summary before the dash. "Terms of service", not the
                whole sentence: a footer link is a name, and the rest of the summary is the
                description the metadata already uses.
              */}
              {legal.map((r) => (
                <li key={r.path}>
                  <Link to={`/${r.path}`}>{r.summary.split(' — ')[0]}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="si-footer__col" aria-label="Elsewhere">
            <h2 className="si-footer__title">Elsewhere</h2>
            <ul className="si-footer__list">
              {/* Every href here is a registry lookup, never a typed URL. */}
              <li>
                <a href={h.hub}>{surface('hub').name}</a>
              </li>
              {/*
                `signin`, NOT `account`. The `account` row is a RESERVED hostname that nothing
                serves and that has no DNS record — `account.cloudsforge.online` does not resolve,
                measured 2026-08-05 — so this footer entry was a dead link on the estate's public
                front page. Its own registry row says so: "do not resolve this one for a redirect
                until something answers it" (`ui/packages/ui/src/surfaces.ts`, the `account` row).
                The address a person is actually sent to is the `signin` row, which rides on Hub as
                `hub.<apex>/account` and therefore resolves and is served.

                Found while fixing the same defect class in `worlds-web`, whose API_SURFACE pointed
                at the equally unresolvable `worlds-api.<apex>`.
              */}
              <li>
                <a href={h.signin}>{surface('signin').name}</a>
              </li>
              <li>
                <a href={h.developers}>{surface('developers').name}</a>
              </li>
              <li>
                <a href={h.status}>{surface('status').name}</a>
              </li>
              <li>
                <a href={h.explorer}>{surface('explorer').name}</a>
              </li>
            </ul>
          </nav>
        </div>

        {/*
          The closing line is the build page's own honesty section rather than a second copy of it.
          When that sentence stops being true it stops being true here at the same instant.
        */}
        <p className="si-footer__note">
          <strong>{BUILD.honesty.title}.</strong> {BUILD.honesty.body[0]}{' '}
          <Link to="/build">Where each part stands</Link>
        </p>
      </div>
    </footer>
  )
}
