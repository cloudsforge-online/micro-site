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
import { useEffect, useState } from 'react'
import { CloudsForgeBar, CloudsForgeFooter, CookieBanner, miningOnHub } from '@cloudsforge/ui'
import type { AccountState } from '@cloudsforge/ui'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { hosts, isTestnet, liveUrl, PRODUCT } from '../lib/hosts.ts'
import { NAV, ROUTES } from '../lib/routes.ts'
import { applyMeta, metaFor } from '../lib/meta.ts'
import { useSession } from '../lib/auth.tsx'
import { BUILD, TESTNET_NOTICE } from '../content/pages.ts'
import { Ridge } from './parts.tsx'
import { setViewedNetwork, viewedNetwork, type ViewedNetwork } from '../lib/viewed.ts'

export function AppShell() {
  // The viewed network: in-tab memory, defaulting to the hostname's own (micro-org#459).
  // `setViewedNetwork` runs first in the handler below so the remounted tree reads the new value
  // on its very first render.
  const [viewed, setViewed] = useState<ViewedNetwork>(viewedNetwork())
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

      {/*
        `mining` beside the account, as on every other surface that mounts this bar.

        The company site was one of the two left out, and it is the one that matters most: it is
        where a reader arrives first, and the control being absent here is what makes the miner
        feel like something buried on a page rather than something the account carries with it.

        `miningOnHub()` — the miner is a WebSocket and two Web Workers on ONE origin, and this
        bundle is not served from it, so this renders an anchor to the surface that can start it.
      */}
      {/*
        In-app network context (micro-org#459, the combined view). The reader's choice lives in
        `lib/viewed.ts` — module memory, never storage — and the `key` on the Outlet below is the
        refetch mechanism: switching remounts the page tree, and `apiBase()` reads `viewedHosts()`,
        so the same page re-reads itself from the other estate WITHOUT going anywhere. The band and
        the switcher both follow the selection, so testnet data under a mainnet address bar is
        never unmarked. The bar also stamps `?net=` onto its product links, which is what carries
        the choice across a product switch — every surface is its own origin, so nothing else can.
      */}
      <CloudsForgeBar
        current={PRODUCT}
        account={account}
        onSignIn={() => signIn()}
        onSignOut={signOut}
        mining={miningOnHub(hosts().hub)}
        networkSwitch={{
          selected: viewed,
          onSelect: (n) => {
            setViewedNetwork(n)
            setViewed(n)
          },
        }}
      />

      <EnvironmentNotice />
      <SiteNav />
      <DocumentMeta />

      <main className="si-main" id="main">
        <Outlet key={viewed} />
      </main>

      {/*
        `account` is passed so the shared footer can decide whether to show the operator consoles.
        Omitting it is the SAFE default — it hides every `adminOnly` surface — but it is also
        wrong for an operator reading the marketing site, who would find Admin and Lantern in the
        footer of every other surface and not this one.
      */}
      <SiteFooter account={account} />

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
 * The footer: `CloudsForgeFooter` from `@cloudsforge/ui`, plus this site's own pages.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * WHAT WAS HERE BEFORE, AND WHY REPLACING IT WAS THE FIX RATHER THAN A TIDY-UP (micro-org#489)
 *
 * A hand-written four-column footer — Products, This site, Elsewhere, and a closing line. Every
 * link in it resolved correctly and nothing in it was broken, which is exactly why it survived so
 * long: this file was one of only two bundles in the estate that did not mount the shared
 * component (`micro-network-site` is the other, and renders no footer at all).
 *
 * The defect that follows from that is not cosmetic. `CloudsForgeFooter` builds its columns by
 * partitioning the surface registry on `kind`, so a **Platform** column exists on all eighteen
 * surfaces that mount it and lists every `kind: 'surface'` row — including Forge Journal. This
 * footer had no such column. It had an "Elsewhere" list, typed by hand, of six surfaces somebody
 * chose in 2026-08; the Journal shipped afterwards, registered itself, appeared in the Platform
 * column of eighteen surfaces, and was reachable from **no link at all** on the estate's own front
 * door. A publication nobody can navigate to is a publication that does not exist, and it is the
 * SEO surface, so the whole point of building it was being wasted.
 *
 * The lesson is the one the registry exists for and this file was the last place still ignoring:
 * **a hand-written list of surfaces is a list that stops being true silently.** Not with a broken
 * link — with a missing one, which nothing goes red for and nobody reports because there is
 * nothing on the page to report.
 *
 * So the fix is not "add a Journal link here". It is to stop having a second footer.
 *
 * ── WHAT THE SHARED COMPONENT DOES NOT KNOW, AND HOW THAT IS KEPT ─────────────────────────────
 *
 * Three of the old columns were restatements of things the registry already holds, and they are
 * simply gone: "Products" is the registry's Products column, "Elsewhere" is Platform and More, and
 * the legal links are the shared Legal column. One column was NOT a restatement. `/platform`,
 * `/build` and `/about` are pages of THIS application; they exist on no other surface, and the
 * only other place they are offered is `SiteNav` above — which is sticky under the bar and
 * therefore scrolled past by a reader who has arrived at a footer.
 *
 * `CloudsForgeFooter`'s `columns` prop is for exactly that, and it can only ADD: there is no prop
 * that removes a registry column, so this cannot drift back into a bespoke footer. See the note on
 * `CloudsForgeFooterProps.columns`.
 *
 * ── THE ADDRESSES ARE ABSOLUTE, INCLUDING THIS SITE'S OWN ─────────────────────────────────────
 *
 * `<a href>` against `hosts().site`, not `<Link to>`. The shared footer is a plain-anchor
 * component by construction — that is what lets one component be laid out by nineteen different
 * shells, only one of which has a router — and its own link-reachability probe resolves every
 * `href` as a URL. The cost is that a footer link inside this site is a document load rather than
 * a client-side transition, which on a marketing site's navigation of last resort is not a cost
 * worth an API for.
 *
 * ── THE CLOSING SENTENCE SURVIVES, IN THE SLOT BUILT FOR IT ───────────────────────────────────
 *
 * `note` exists because three surfaces had a footer containing nothing but such a sentence and
 * centralising the chrome must not delete them. This site's is the honesty disclosure, and the
 * pairing below is unchanged: the title, then `body[1]`, which is the DENIAL and not the
 * reassurance.
 *
 * `BUILD.honesty` is a two-part disclosure and the halves are not interchangeable. `body[0]`
 * elaborates the flattering claim — everything is built, it runs against real databases and a real
 * EMBER network, an automated suite drives a real browser and fakes nothing. `body[1]` is what
 * that does NOT mean: the main network is nearly empty with every transaction and every block on
 * it our own, EMBER has no market and no listing and the price shown for it is one we set
 * ourselves, nobody outside the project has used any of this, and there are no user numbers here
 * for the same reason there is no uptime figure.
 *
 * The footer carried the title and then `body[0]` — the good news, twice, under a heading about
 * honesty — while the denial appeared on `/build` alone. That is the shape this whole site is
 * arranged against, and it was worst exactly where it mattered most: the home page invites a
 * reader to mine EMBER and never said what the coin is worth. The estate's rule
 * (docs/ecosystem/18-build-status.md:38, restated for both networks at :118-122, and rule 4 of
 * docs/ecosystem/32-roadmap-ui-and-content.md §1) is that the page inviting someone to mine EMBER
 * must also say what EMBER is not. `body[0]` is not lost: it is the first paragraph of the callout
 * on `/build`, one click away.
 *
 * The paraphrase above is maintained by hand and has drifted twice, which is the argument against
 * comments like it making itself. It is kept because the halves of this disclosure are easy to
 * swap by accident; it is NOT the rendered text, which is read from `BUILD.honesty`.
 */
function SiteFooter({ account }: { account: AccountState | undefined }) {
  const h = hosts()

  /*
   * This site's own pages, derived from the route table rather than listed. A route added to
   * `lib/routes.ts` with a nav label appears here on the same edit, which is the property the
   * hand-written column above did not have and the reason the Journal went missing.
   *
   * The legal routes (`label: null`) are deliberately NOT included: the shared footer's Legal
   * column already carries all three, resolved against `cloudsforgeHosts().site`, which on this
   * surface is this origin. Listing them twice would put six links to three pages in one footer.
   */
  const own = ROUTES.filter((r) => r.label !== null && r.path !== '').map((r) => ({
    href: `${h.site}/${r.path}`,
    label: r.label as string,
  }))

  return (
    <>
      <Ridge className="si-ridge--footer" />
      <CloudsForgeFooter
        current={PRODUCT}
        account={account}
        columns={[{ title: 'This site', links: own }]}
        note={
          <>
            <strong>{BUILD.honesty.title}.</strong> {BUILD.honesty.body[1]}{' '}
            <Link to="/build">Where each part stands</Link>
          </>
        }
      />
    </>
  )
}
