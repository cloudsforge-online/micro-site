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
import { CloudsForgeBar, CookieBanner, PRODUCTS as REGISTRY_PRODUCTS, surface } from '@cloudsforge/ui'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { hosts, isTestnet, liveUrl, PRODUCT } from '../lib/hosts.ts'
import { NAV, ROUTES } from '../lib/routes.ts'
import { applyMeta, metaFor } from '../lib/meta.ts'
import { useSession } from '../lib/auth.tsx'
import { BUILD, TESTNET_NOTICE } from '../content/pages.ts'
import { Ridge } from './parts.tsx'

export function AppShell() {
  const { account, signIn, signOut } = useSession()

  return (
    <>
      {/*
        The skip link is the first focusable thing in the document. It is visually hidden until it
        takes focus, at which point it must become VISIBLE — a skip link that stays hidden when
        focused is worse than none, because a keyboard reader activates it and cannot tell whether
        anything happened.
      */}
      <a className="si-skip" href="#main">
        Skip to content
      </a>

      <CloudsForgeBar current={PRODUCT} account={account} onSignIn={() => signIn()} onSignOut={signOut} />

      <EnvironmentNotice />
      <SiteNav />
      <DocumentMeta />

      <main className="si-main" id="main">
        <Outlet />
      </main>

      <SiteFooter />

      {/*
        The consent banner is LAST in the document, which is last in the tab order, and it is not
        modal. A reader who came here to read something can read it and answer later; trapping
        focus until they answer is the coercion the regulation exists about.

        It renders nothing at all unless there is a measurement ID in the shell AND this reader has
        never answered — so it does not flash at a returning reader, and it never appears in local
        development, where there is nothing to consent to.

        `privacyHref` is the in-app route rather than the component's cross-surface default: on
        every other surface the privacy notice lives on another host, but on this one it is a page
        of this application and an absolute URL would leave the app to come back to it.
      */}
      <CookieBanner privacyHref="/privacy" />
    </>
  )
}

/**
 * The strip that says which estate this is, on every page, above everything this site owns.
 *
 * ── It renders nothing on the live estate, and that is the whole design ───────────────────────
 *
 * There is exactly one environment a reader must be told about, because there is exactly one where
 * the page would otherwise be misread: the test network, whose coins are not the real ones. The
 * live estate needs no banner saying it is live — chrome that appears everywhere and says nothing
 * is chrome people stop seeing, and the day it matters they will not see this one either.
 *
 * Testnet is the only label handled for the same reason. `staging`, `preview` and `dev` are legal
 * environment labels in the design system's registry and none of them is served to the public;
 * rendering this sentence over one of them would be a claim about a rehearsal that nobody is being
 * shown. If one of them ever faces a reader it gets its own words rather than these.
 *
 * ── ABOVE the navigation, not inside it and not below it ──────────────────────────────────────
 *
 * The nav is `position: sticky` under the shared bar and the notice is not: this is a fact about
 * the whole visit, said once, at the top, where it is read before anything it qualifies. A sticky
 * banner would be a permanent bite out of a phone screen for a sentence that changes nothing after
 * it has been read.
 *
 * `role="note"` rather than `alert` — the same choice, for the same reason, as the incompleteness
 * notice on the legal pages. Being on the test network is a standing property of the page a reader
 * has opened, not an event that has just happened, and an alert would interrupt a screen reader on
 * every single navigation. It carries no heading, because the first heading in this document must
 * remain the page's own `h1`.
 */
function EnvironmentNotice() {
  if (!isTestnet()) return null
  return (
    <aside className="si-envnotice" role="note">
      <p className="si-envnotice__inner">
        <strong>{TESTNET_NOTICE.title}.</strong> {TESTNET_NOTICE.body}{' '}
        {/*
          A registry lookup, never a typed hostname — the rule this site holds every other outbound
          link to, and the one most easily broken here, because "the live site" is the one address
          on the estate that a person writing this sentence can spell from memory. `liveUrl` takes
          the environment label off THIS surface's own resolved address, so a reader on the testnet
          apex is offered the live apex and a reader anywhere else is offered nothing at all.
        */}
        <a className="si-envnotice__link" href={liveUrl(PRODUCT)}>
          {TESTNET_NOTICE.linkLabel}
        </a>
      </p>
    </aside>
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
