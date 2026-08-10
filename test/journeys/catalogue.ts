/**
 * Group P of docs/ecosystem/22-browser-journeys.md — the marketing site — plus the estate-wide
 * scenarios every surface owes (the 404, the SSO callback, the accessibility sweep).
 *
 * ── Why this surface, of all of them, is asserted in a browser ────────────────────────────────
 *
 * This is the site search engines crawl, that link checkers walk, and that people paste into chat.
 * Its own `nginx.conf` says so, and it enumerates every route by hand for that reason. It is also
 * the surface whose content is the argument: the build page's value is entirely in the fact that
 * "nothing is deployed" is ABOVE the surface-by-surface table rather than below it, and the legal
 * pages' value is entirely in the undrafted sections being visible holes rather than absences.
 * None of that is a property of a pure function. All of it is a property of a rendered page.
 *
 * ── What none of these scenarios may do ───────────────────────────────────────────────────────
 *
 * Assert a business rule. See the header of `test/journeys/scenario.ts`. Everything here is
 * `presentation` or `navigation` over content this repository owns, plus one `client-request`.
 */
import assert from 'node:assert/strict'
import { HUB_MINE_PATH, NOT_PAID_CLAUSE, PRODUCTS, SWITCHER_SURFACES } from '@cloudsforge/ui'
import { assertMounted, renderOnlyWithStubbedNetwork, type Stubs } from './browser.ts'
import { assertAxeClean, assertKnownStillBroken, textOrder, type KnownViolation } from './axe.ts'
import type { Scenario } from './scenario.ts'
import { PRODUCT_PAGES, productCount } from '../../src/content/products.ts'
import { LEGAL_PAGES } from '../../src/content/legal.ts'
import { ABOUT, BUILD, HOME, PLATFORM } from '../../src/content/pages.ts'

/**
 * Nothing. Deliberately, and it is worth saying why the list is here and empty.
 *
 * This block used to describe a live defect in the present tense: "the estate has one
 * design-system contrast defect: `--cf-fg-mute` is `#63757a`, which measures 3.54:1 … `web-
 * template` and any surface using `@cloudsforge/ui/charts` carries it and records it as a known
 * violation owned by micro-ui." That has not been true since micro-ui `2f990be` raised the cool
 * ramp's `--cf-khaki` to `#7d9399` (5.29:1) and `--cf-bone-dim` to `#abbcbd` alongside it. No
 * surface in the estate records that entry any more, and prose calling a fixed defect live, above
 * an empty array, is how somebody later decides the array is the part that is wrong.
 *
 * What is still true, and is the reason the empty list is worth more than no list: this surface
 * renders no chart tile and its own `si-` styles clear the threshold, so the sweep below runs with
 * no exclusion at all — and that was established by starting WITH the exclusion in place and
 * watching `assertKnownStillBroken` reject it. It is the same mechanism that reddened two other
 * repositories the day micro-ui raised the token, which is what an exclusion list is for.
 *
 * An entry now costs a `selector` naming the element as well as the `rule`. Keying by rule alone
 * was a blanket: one entry excused every violation of that rule id on the surface, and a sibling
 * frontend carried a 4.44:1 link behind an entry written for something else for months. See
 * axe.ts.
 */
const UI_CONTRAST: readonly KnownViolation[] = []

/** identity's `/auth/me`, in the shape identity actually sends: the profile nested under `user`. */
const me = (roles: readonly string[]) => ({
  user: { id: 'u_1', handle: 'testuser', roles },
  session: {},
  organisations: [],
})

const SIGNED_IN = { 'cf.accessToken': 'test-access', 'cf.refreshToken': 'test-refresh' }

/** A stand-in for a sign-in page, so a redirect to one completes instead of hanging (§8.1). */
const SIGNIN_STANDIN = {
  status: 200,
  contentType: 'text/html',
  body: '<!doctype html><title>stand-in</title><body>sign-in stand-in</body>',
}

const ANONYMOUS: Stubs = [['/account/login', SIGNIN_STANDIN]]
const AS = (roles: readonly string[]): Stubs => [['GET /auth/me', { json: me(roles) }], ...ANONYMOUS]

/** Every address this site owns, from the declaration the router and nginx are both checked against. */
const OWNED = [
  '/',
  '/products',
  ...PRODUCT_PAGES.map((p) => `/products/${p.slug}`),
  '/platform',
  '/build',
  '/about',
  '/terms',
  '/privacy',
]

export const CATALOGUE: readonly Scenario[] = [
  /* ---- doc 22 §5.1 ---------------------------------------------------- */
  {
    id: 'BJ-SITE-404',
    title: 'every owned address survives a hard refresh and every other one answers 404',
    tier: 2,
    asserts: 'navigation',
    gate: true,
    expectStatus: 404,
    ownedBy: 'site/test/routes.test.ts#never falls back to index.html with a 200 for an unknown path',
    async run(surface) {
      assert.equal(surface.nginx.honest404, true, 'nginx.conf has no error_page 404 /index.html')

      for (const path of OWNED) {
        const { status } = await surface.fetchStatus(path)
        assert.equal(status, 200, `${path} answered ${status}; an owned route must survive a refresh`)
        // A trailing slash is an address people link to, and 404ing it would be pedantry rather
        // than honesty. src/lib/meta.ts normalises the two spellings onto one canonical.
        if (path !== '/') {
          const slashed = await surface.fetchStatus(`${path}/`)
          assert.equal(slashed.status, 200, `${path}/ answered ${slashed.status}`)
        }
      }

      // The addresses most likely to arrive on an old link. Forge Pay was a destination in the
      // previous estate and is now a page inside Forge Hub, so /products/pay is exactly what a
      // bookmark carries — and it answered 200 for as long as nginx matched a prefix there.
      for (const path of [
        '/products/pay',
        '/products/crucible',
        '/products/forgemint',
        '/products/trade/fees',
        '/pricing',
        '/nope/not/a/route',
        '/platform/extra',
      ]) {
        const { status } = await surface.fetchStatus(path)
        assert.equal(status, 404, `${path} answered ${status}; it must 404`)
      }

      // The 404 still serves the app shell, so the reader gets a real page and the status line
      // tells the truth. A "page not found" screen delivered as a success is a document crawlers
      // are entitled to index.
      const session = await renderOnlyWithStubbedNetwork(surface.origin, { path: '/products/pay', stubs: ANONYMOUS })
      try {
        assert.equal(session.status, 404)
        await assertMounted(session, { showing: ['There is no page at this address'] })
      } finally {
        await session.close()
      }
    },
  },

  /* ---- doc 22 BJ-SITE-01 ---------------------------------------------- */
  {
    id: 'BJ-SITE-01',
    title: 'the home page is four blocks in the order a stranger needs them, ending in the state it is in',
    tier: 1,
    asserts: 'presentation',
    gate: true,
    async run(surface) {
      const session = await renderOnlyWithStubbedNetwork(surface.origin, { stubs: ANONYMOUS })
      try {
        const text = await assertMounted(session, {
          showing: [HOME.spine, HOME.ember.title, HOME.spans.title],
        })
        // The ORDER is the assertion, and it is read out of the rendered text rather than the
        // source, because document order is what a screen reader and a keyboard user get.
        assert.equal(await textOrder(session.page, HOME.spine, HOME.ember.title), 'before')
        assert.equal(await textOrder(session.page, HOME.ember.title, HOME.spans.title), 'before')

        // "What is built" is on the home page rather than buried. A reader who finds out on page
        // four that none of this is running has been misled by pages one to three.
        const build = session.page.locator('a[href="/build"]')
        assert.ok((await build.count()) > 0, 'the home page does not link to the build status')
        assert.ok(
          text.includes('built') || text.includes('Built'),
          'the home page never mentions what is built',
        )
      } finally {
        await session.close()
      }
    },
  },

  /* ---- doc 22 BJ-SITE-02 ---------------------------------------------- */
  {
    id: 'BJ-SITE-02',
    title: 'the build page states the limits of being public at the top, then goes surface by surface',
    tier: 1,
    asserts: 'presentation',
    gate: true,
    async run(surface) {
      const session = await renderOnlyWithStubbedNetwork(surface.origin, { path: '/build', stubs: ANONYMOUS })
      try {
        await assertMounted(session, { showing: [BUILD.honesty.title, 'Surface by surface'] })

        /*
         * A LITERAL, NOT THE IMPORTED CONSTANT — and the distinction is the point.
         *
         * Everything else in this scenario compares the rendered page against `BUILD`, the module
         * the page renders FROM. That catches a page that stops rendering the block, truncates it
         * or reorders it, and it cannot catch the copy being softened: rewriting `pages.ts`
         * rewrites both sides of the comparison and stays green. This surface's whole argument is
         * that it says so ON THE FRONT DOOR, so that one sentence is written out here. Changing it
         * takes a deliberate edit in two files, which is exactly the amount of friction a claim
         * like this deserves.
         *
         * ── The literal CHANGED, and the friction did its job ─────────────────────────────────
         *
         * It read "Nothing is deployed" until the estate came up: forty-odd containers behind a
         * gateway with its own certificate authority, a real EMBER testnet, and a smoke tier that
         * drives the gateway intercepting nothing. At that point the sentence was false, and this
         * assertion was the thing that refused to let the page be edited quietly — the copy change
         * went red here and had to be argued for rather than merged.
         *
         * The claim was not softened, it MOVED: from "nothing is deployed" to "nothing is serving
         * the public", which is the harder of the two to keep true and the one a reader actually
         * needs. `test/estate-claims.test.ts` fails if the old wording returns.
         *
         * ── AND IT MOVED A THIRD TIME, ON 2026-08-05, WHEN THE ESTATE WENT PUBLIC ─────────────
         *
         * "Nothing is serving the public" became false, and this assertion went red and had to be
         * argued for rather than merged — which is the mechanism working, for the second time.
         *
         * What is anchored here changed shape with it. There is no longer one sentence carrying
         * the whole disclosure, because the honest position is no longer one sentence: the estate
         * IS reachable, and the thing a reader must not be allowed to miss is the set of limits
         * around that. So the literals below are the limits, not the good news. A page that says
         * it is open and drops any one of them fails here.
         *
         * That is deliberately harder to satisfy than the old single anchor, because this is the
         * first version of this page that has anything to gain from overstating.
         */
        // Scoped to the callout, not to the page. The first version of this searched the whole
        // body and passed after the callout's title was softened, because the phrase also appears
        // in two product stage notes further down — a literal anchor in the wrong scope is just a
        // self-referential assertion with extra steps. Proven by softening the title and watching
        // this go red.
        //
        // The heading literal moved once more when "one day old" stopped being literally true.
        // What is anchored is the SHAPE — it still says open, and it still says how new — and the
        // four limits below are what actually carry the disclosure.
        const callout = await session.page.locator('.si-callout').first().innerText()
        assert.ok(
          callout.includes('Open to the public, and days old'),
          `the honesty block no longer carries its heading. It says: ${callout.slice(0, 200)}`,
        )
        // The limits, in the rendered body rather than the heading — a heading that survives while
        // the paragraph under it turns into reassurance is the shape this whole page is arranged
        // against. Each is checked separately so that losing one cannot be hidden by the others.
        for (const [what, pattern] of [
          // Split 2026-08-10 when EMBER acquired an administered price of $0.0001: "no market" and
          // "no listing" are still true, "no price" is not, and the clause that now carries the
          // disclosure is the one naming who set the figure a reader can see elsewhere on the site.
          ['EMBER has no market or listing', /no market and no listing/i],
          ['the EMBER price is one we set', /price you see for it is one we set ourselves/i],
          ['nobody outside the project has used it', /nobody outside the project has used/i],
          ['there is no redundancy or failover', /no redundancy, no failover/i],
          // Reworded 2026-08-10 with the copy it checks: a restore HAS been rehearsed on the live
          // host (micro-org#214), while the nightly backup run is queued and claimed by nothing.
          ['the scheduled backup has never run', /no scheduled backup that has ever run/i],
        ] as const) {
          assert.ok(
            pattern.test(callout),
            `the honesty block no longer says, on the front door, that ${what}. It says: ${callout.slice(0, 200)}`,
          )
        }
        // ABOVE the table, not below it. A crypto front door that implies everything on it is
        // running is the failure this page exists to avoid, and a caveat under the status list is
        // one a reader reaches after they have already formed the impression.
        assert.equal(
          await textOrder(session.page, BUILD.honesty.title, 'Surface by surface'),
          'before',
          'the honesty block is below the per-surface table',
        )
        // Every surface in the declaration has a row, and each row carries its own state. A page
        // that lists six of seven is one where the missing one is the one somebody wanted.
        const text = await session.page.evaluate(() => document.body.innerText)
        for (const page of PRODUCT_PAGES) {
          assert.ok(text.includes(page.stageNote), `no row for ${page.slug} on the build page`)
        }
      } finally {
        await session.close()
      }
    },
  },

  /* ---- doc 22 BJ-SITE-03 ---------------------------------------------- */
  {
    id: 'BJ-SITE-03',
    title: 'the products index and every product page are generated from the surface registry',
    tier: 1,
    asserts: 'presentation',
    gate: true,
    async run(surface) {
      const index = await renderOnlyWithStubbedNetwork(surface.origin, { path: '/products', stubs: ANONYMOUS })
      try {
        await assertMounted(index)
        // The count is the assertion: a hand-maintained card is the failure. It is compared to
        // PRODUCTS from the registry — the single declaration — not to a number written here.
        const cards = await index.page.locator('.si-card').count()
        assert.equal(
          cards,
          PRODUCTS.length,
          `${cards} product cards for ${PRODUCTS.length} registered products`,
        )
        const text = await index.page.evaluate(() => document.body.innerText)
        for (const product of PRODUCTS) {
          assert.ok(text.includes(product.name), `${product.name} has no card`)
        }
      } finally {
        await index.close()
      }

      // …and every card's destination renders. A grid of cards linking to a 404 is worse than no
      // grid, and this is the surface where a broken outbound link is most expensive.
      for (const page of PRODUCT_PAGES) {
        const session = await renderOnlyWithStubbedNetwork(surface.origin, { path: `/products/${page.slug}`, stubs: ANONYMOUS })
        try {
          await assertMounted(session, { showing: [page.stageNote] })
        } finally {
          await session.close()
        }
      }
    },
  },

  /**
   * THE POOL PAGE, AND THE CALL TO ACTION THAT POINTED AT NOTHING.
   *
   * `/products/pool` was a published address before it was a page. The home page's "And Litecoin,
   * in the same tab" capability carries `linkTo: 'pool'`, and `src/pages/home.tsx` renders every
   * capability's link as `/products/<linkTo>` — so the visible call to action "See the pool" led
   * to an address `nginx.conf` enumerated no location for. Measured 2026-08-10: a hard 404, on the
   * one link the front page offers a reader who has just been told the pool exists.
   *
   * BJ-SITE-404 now walks that address because `OWNED` is built from `PRODUCT_PAGES`, and
   * BJ-SITE-03 mounts it because it walks the same list. Neither can tell whether the page still
   * SAYS the things it was written to say, and both would stay green against a page that had been
   * quietly reduced to a headline.
   *
   * ── What is asserted here, and what deliberately is not ───────────────────────────────────────
   *
   * Everything below is copy this repository owns and can therefore be wrong about on its own.
   * Nothing below is a measurement. Which chains are served, what the endpoint is, what the
   * template height is and what a worker has done are live facts about a running service;
   * `micro-pool-web` reads all of them from `GET /v1/pool` on every load and this file may no more
   * assert them than `src/` may print them.
   *
   * The one about Bitcoin is the reason this scenario has teeth. The estate's Bitcoin node was
   * fully synced on 2026-08-10 (961,903 of 961,903) and `POOL_CHAINS` does not list it, so the
   * pool serves no Bitcoin at all — and "our Bitcoin node is synced" is exactly the fact that
   * talks somebody into adding the word to a marketing page. A synced node is not a served chain.
   */
  {
    id: 'BJ-SITE-POOL',
    title: 'the pool page offers both ways in, promises no payout, and links out to the console',
    tier: 1,
    // `presentation`, not `navigation`: this asserts what the page OFFERS and never follows the
    // outbound link. The console is another repository's surface and its status is that
    // repository's to keep.
    asserts: 'presentation',
    gate: true,
    async run(surface) {
      const page = PRODUCT_PAGES.find((p) => p.slug === 'pool')
      assert.ok(page, 'there is no pool page in PRODUCT_PAGES')

      const session = await renderOnlyWithStubbedNetwork(surface.origin, {
        path: '/products/pool',
        stubs: ANONYMOUS,
      })
      try {
        await assertMounted(session, { showing: [page.headline, page.stageNote] })

        // `#main` rather than the body, so the bar and the footer are outside the reading. The
        // footer links to the console by name and would satisfy half of this on its own.
        const text = await session.page.locator('#main').innerText()

        /*
         * BOTH WAYS IN, ON ONE PAGE. This is the whole of what was asked for: a reader with no
         * hardware and a reader with a rig must both find their route here. A page that keeps only
         * the browser half is the easier page to write and is the failure — the second audience is
         * the one that already owns the hashrate.
         */
        assert.ok(/browser tab/i.test(text), 'the pool page no longer offers the browser route')
        assert.ok(
          /\bStratum\b/.test(text),
          'the pool page no longer offers the route for a miner somebody already runs',
        )

        // Verbatim, and from the design system rather than retyped. Six surfaces publish this
        // sentence and the failure mode of a retyped one is that five of them get updated.
        assert.ok(
          text.includes(NOT_PAID_CLAUSE),
          'the pool page mentions mining without carrying the not-paid clause',
        )

        // Litecoin is what the pool answers for, so it is the only coin the page may offer.
        assert.ok(text.includes('Litecoin'), 'the pool page no longer names the chain it serves')
        assert.ok(
          !/\bBitcoin\b/.test(text),
          'the pool page names Bitcoin. The node is synced; POOL_CHAINS does not serve it',
        )

        /*
         * Dogecoin is named AND switched off, in that order and in the same breath. Naming it
         * without the second half is the defect — merge-mining is built and merged in `micro-pool`
         * and `POOL_LTC_AUX_CHAINS` is unset, so the live pool answers `merged: null`. Dropping
         * the denial to keep the feature sounding available is the single most likely edit anybody
         * makes to this page, and it is the one thing on it that is a lie.
         */
        assert.ok(text.includes('Dogecoin'), 'the pool page no longer mentions merge-mining at all')
        assert.ok(
          /switched off/i.test(text),
          'the pool page names Dogecoin without saying merge-mining is switched off',
        )
        assert.equal(
          await textOrder(session.page, 'Dogecoin', 'switched off'),
          'before',
          'the page reaches "switched off" before it names Dogecoin',
        )

        /*
         * …and it hands the reader on to the console, which is where every measurement lives. The
         * href is read for the two properties that together prove it is a registry lookup rather
         * than a hostname somebody typed: it is absolute, and it is on an origin this site is not
         * served from. The hostname itself is never named here, for the same reason `src` may not
         * name one.
         */
        const out = session.page.locator('.si-productaside a[href]').first()
        const href = (await out.getAttribute('href')) ?? ''
        assert.ok(/^https?:\/\//.test(href), `the pool page's outbound link is not resolved: ${href}`)
        assert.notEqual(
          new URL(href).origin,
          surface.origin,
          'the pool page sends the reader back to this site instead of to the console',
        )
      } finally {
        await session.close()
      }

      // THE ORIGINAL DEFECT, ASSERTED AT ITS SOURCE. The front page's call to action has to lead
      // to the page above and not to a 404, and the link is generated from `linkTo` — so this goes
      // red the moment the pool page's slug and the capability's key drift apart again.
      const home = await renderOnlyWithStubbedNetwork(surface.origin, { stubs: ANONYMOUS })
      try {
        await assertMounted(home)
        const cta = home.page.locator(`.si-points__more a[href="/products/${page.slug}"]`)
        assert.ok(
          (await cta.count()) > 0,
          'the front page no longer offers a way through to the pool page',
        )
      } finally {
        await home.close()
      }
    },
  },

  /* ---- doc 22 BJ-SITE-04 ---------------------------------------------- */
  {
    id: 'BJ-SITE-04',
    title: 'the platform page publishes all eleven "one platform" statements, including the untrue ones',
    tier: 1,
    asserts: 'presentation',
    async run(surface) {
      const session = await renderOnlyWithStubbedNetwork(surface.origin, { path: '/platform', stubs: ANONYMOUS })
      try {
        await assertMounted(session)
        const items = await session.page.locator('.si-statements li').allInnerTexts()
        assert.equal(items.length, PLATFORM.tests.length, 'the statement list is short')
        assert.equal(items.length, 11, 'doc 22 names eleven statements')
        // Verbatim, and in full. A definition you only publish once you pass it is not a
        // definition, so an abridged or reworded list here is the whole failure.
        for (const statement of PLATFORM.tests) {
          assert.ok(
            items.some((rendered) => rendered.trim() === statement.trim()),
            `this statement is not on the page verbatim: ${statement.slice(0, 70)}…`,
          )
        }
        // Two of the eleven, written out rather than imported. The loop above compares the page to
        // the module it renders from, so it proves the list is COMPLETE and cannot prove it still
        // says what it said: rewriting `pages.ts` moves both sides together. The first statement
        // is the definition's opening claim and the last is the one most likely to be quietly
        // dropped, because it is the one about third parties and it is not true yet.
        assert.ok(
          items.some((i) => i.trim() === 'One account signs into everything, once.'),
          'the first "one platform" statement has been reworded',
        )
        assert.ok(
          items.some((i) => i.trim() === 'Anyone outside can build on all of it.'),
          'the statement about third parties is gone — it is the one that is not true yet',
        )
      } finally {
        await session.close()
      }
    },
  },

  /* ---- doc 22 BJ-SITE-05 ---------------------------------------------- */
  {
    id: 'BJ-SITE-05',
    title: 'the about page renders the tie-breakers and the refusals from the vision document',
    tier: 1,
    asserts: 'presentation',
    noServerRule:
      'The "refusals" here are the company’s published list of what it will not become — page ' +
      'content this repository owns, in src/content/pages.ts. No request is made and no service ' +
      'refuses anything.',
    async run(surface) {
      const session = await renderOnlyWithStubbedNetwork(surface.origin, { path: '/about', stubs: ANONYMOUS })
      try {
        await assertMounted(session, { showing: [ABOUT.principles.title, ABOUT.rejects.title] })
        const text = await session.page.evaluate(() => document.body.innerText)
        // Both lists in full. A principle that does not decide anything is a slogan, and a reader
        // can tell — which means an abridged list reads as marketing rather than as criteria.
        for (const item of ABOUT.principles.items) {
          assert.ok(text.includes(item.title), `tie-breaker missing: ${item.title}`)
        }
        for (const item of ABOUT.rejects.items) {
          assert.ok(text.includes(item.title), `refusal missing: ${item.title}`)
        }
        assert.equal(
          await textOrder(session.page, ABOUT.principles.title, ABOUT.rejects.title),
          'before',
        )
      } finally {
        await session.close()
      }
    },
  },

  /* ---- doc 22 BJ-SITE-06 ---------------------------------------------- */
  {
    id: 'BJ-SITE-06',
    title: 'terms and privacy carry the incompleteness notice at the top and draw every undrafted section as a hole',
    tier: 1,
    asserts: 'presentation',
    gate: true,
    async run(surface) {
      for (const page of LEGAL_PAGES) {
        const session = await renderOnlyWithStubbedNetwork(surface.origin, { path: `/${page.slug}`, stubs: ANONYMOUS })
        try {
          await assertMounted(session, { showing: [page.notice] })
          // The notice is a landmark with an accessible name, not just a paragraph: `role="note"`
          // rather than `alert`, because incompleteness is a standing property of the document and
          // not an event, and an alert would interrupt a screen reader on every navigation to it.
          const notice = session.page.locator('[role="note"]')
          assert.equal(await notice.count(), 1, `${page.slug}: no incompleteness notice`)
          // `textContent`, not `innerText`: the heading is uppercased by CSS, so innerText would
          // assert the styling as well as the words, and a screen reader is given neither.
          assert.match(
            (await notice.first().textContent()) ?? '',
            /Incomplete/,
            `${page.slug}: the notice does not say the document is incomplete`,
          )

          // At the TOP. A reader who discovers on the way out that the document is a draft has
          // read the first half as though it were binding.
          assert.equal(
            await textOrder(session.page, page.notice, page.sections[0]?.title ?? ''),
            'before',
            `${page.slug}: the notice is below the first section`,
          )

          // Every undrafted section is a VISIBLE HOLE with what belongs in it, not an absence.
          // An omitted section reads as a document that is finished and brief, and the
          // alternative reading of a short legal section is that liability was limited in one
          // sentence.
          const undrafted = page.sections.filter((s) => s.status === 'counsel')
          assert.ok(undrafted.length > 0, `${page.slug} has no undrafted sections to check`)
          const holes = await session.page.locator('.si-legal__section--hole').count()
          assert.equal(holes, undrafted.length, `${page.slug}: ${holes} holes for ${undrafted.length} undrafted sections`)

          const text = await session.page.evaluate(() => document.body.innerText)
          for (const section of undrafted) {
            assert.ok(text.includes(section.title), `${page.slug}: ${section.title} is not on the page`)
            assert.ok(
              text.includes(section.outstanding ?? ''),
              `${page.slug}: ${section.title} does not say what belongs in it`,
            )
          }
          assert.ok(
            text.includes(`${undrafted.length} of ${page.sections.length} sections are undrafted`),
            `${page.slug} does not count its own holes`,
          )
        } finally {
          await session.close()
        }
      }
    },
  },

  /* ---- doc 22 BJ-SITE-07 and BJ-SITE-08 -------------------------------- */
  {
    id: 'BJ-SITE-07',
    title: 'the switcher offers the six products to a signed-out reader and all nine to an operator',
    tier: 2,
    asserts: 'presentation',
    // NOT a security assertion, and doc 22 says so in as many words: hiding is not the boundary.
    // Every operator surface verifies the role on the request itself. What is asserted is the
    // MENU — that an operator can find the operator tools, and that a player's switcher is not
    // cluttered with three entries they cannot open.
    async run(surface) {
      const openSwitcher = async (roles: readonly string[]): Promise<string[]> => {
        const session = await renderOnlyWithStubbedNetwork(surface.origin, {
          storage: roles.length > 0 ? SIGNED_IN : {},
          stubs: AS(roles),
        })
        try {
          await assertMounted(session)
          await session.page.locator('button[aria-haspopup="menu"]').first().click()
          await session.page.waitForSelector('[role="menu"] a[role="menuitem"]')
          const names = await session.page
            .locator('[role="menu"] a[role="menuitem"] .cf-menu__name')
            .allInnerTexts()
          return names
        } finally {
          await session.close()
        }
      }

      const players = SWITCHER_SURFACES.filter((s) => !s.adminOnly)
      const operators = SWITCHER_SURFACES.filter((s) => s.adminOnly)
      assert.equal(operators.length, 3, 'the registry no longer has three adminOnly switcher entries')

      const anonymous = await openSwitcher([])
      assert.deepEqual(
        anonymous.map((n) => n.trim()),
        players.map((s) => s.name),
        'a signed-out reader is not offered exactly the products',
      )

      const operator = await openSwitcher(['user', 'admin'])
      assert.deepEqual(
        operator.map((n) => n.trim()),
        SWITCHER_SURFACES.map((s) => s.name),
        'a signed-in operator is not offered all nine',
      )
    },
  },
  {
    id: 'BJ-SITE-08',
    title: 'every switcher entry carries a glyph as well as an accent, because colour is never the only channel',
    tier: 1,
    asserts: 'presentation',
    async run(surface) {
      const session = await renderOnlyWithStubbedNetwork(surface.origin, { storage: SIGNED_IN, stubs: AS(['user', 'admin']) })
      try {
        await assertMounted(session)
        await session.page.locator('button[aria-haspopup="menu"]').first().click()
        await session.page.waitForSelector('[role="menu"] a[role="menuitem"]')
        const entries = await session.page.$$eval('[role="menu"] a[role="menuitem"]', (nodes) =>
          nodes.map((node) => {
            const icon = node.querySelector('.cf-menu__icon')
            return {
              name: node.querySelector('.cf-menu__name')?.textContent?.trim() ?? '',
              // A glyph or an inline mark. Either is a second channel; a coloured square is not.
              hasGlyph: Boolean(
                icon && ((icon.textContent ?? '').trim().length > 0 || icon.querySelector('svg')),
              ),
              accent: icon ? getComputedStyle(icon as Element).color : '',
            }
          }),
        )
        assert.equal(entries.length, SWITCHER_SURFACES.length)
        for (const entry of entries) {
          assert.ok(entry.hasGlyph, `${entry.name} is distinguished by colour alone`)
          assert.ok(entry.accent.length > 0, `${entry.name} has no accent at all`)
        }
        // …and the accents are distinct, or the colour channel is decoration rather than a channel.
        const accents = new Set(entries.map((e) => e.accent))
        assert.ok(accents.size > 1, 'every switcher entry renders in the same colour')
      } finally {
        await session.close()
      }
    },
  },

  /* ---- doc 32 §2.1, the footer row ------------------------------------- */
  {
    id: 'BJ-SITE-09',
    title: 'the footer says EMBER has no price, on every address this site serves',
    tier: 1,
    asserts: 'presentation',
    gate: true,
    async run(surface) {
      /*
       * THE DENIAL IS IN THE CHROME, WHICH IS THE ONLY PLACE IT IS WORTH ANYTHING.
       *
       * `BUILD.honesty` is a two-part disclosure. The footer rendered the reassuring half —
       * everything is built, it runs against real databases, an automated suite fakes nothing —
       * and the denial appeared on `/build` alone. The home page therefore invited a reader to
       * mine EMBER, said "Open to the public" underneath it, and never once said the coin has no
       * price. docs/ecosystem/32-roadmap-ui-and-content.md §2.1 is the record of that; rule 4 of
       * its §1 and docs/ecosystem/18-build-status.md:38 are the estate rule it breaks.
       *
       * EVERY address, not the home page. A caveat that is one navigation away from the invitation
       * is a caveat the invited reader never meets, and this site has eleven addresses.
       *
       * LITERALS, and scoped to the footer. Comparing the rendered page against `BUILD` — the
       * module the footer renders from — proves only that it is still wired to it: rewriting
       * pages.ts moves both sides and stays green. These two sentences are the product decision,
       * so they are written out here, and they are read from `.si-footer__note` rather than from
       * the body, because the same words appear in the callout on `/build` and a page-wide search
       * would have passed with the footer put back the way it was.
       */
      for (const path of OWNED) {
        const session = await renderOnlyWithStubbedNetwork(surface.origin, { path, stubs: ANONYMOUS })
        try {
          await assertMounted(session)
          const note = await session.page.locator('.si-footer__note').first().innerText()
          // The literal changed on 2026-08-10 and the reason is the whole point of this journey.
          // EMBER now HAS a price — $0.0001, set by the operator through the administered-price
          // route and shown wherever this estate shows a value — so a footer still saying "no
          // price" would be the same defect this journey exists to catch, only inverted: the
          // reader would meet a figure elsewhere and a denial here. What has to reach every
          // address is now that the figure is ours rather than a market's.
          assert.ok(
            note.includes('no market and no listing'),
            `${path}: the footer no longer says EMBER has no market or listing. It says: ${note.slice(0, 200)}`,
          )
          assert.ok(
            note.includes('one we set ourselves rather than one anybody has paid'),
            `${path}: the footer no longer says the EMBER price is ours rather than traded. It says: ${note.slice(0, 200)}`,
          )
          assert.ok(
            note.includes('Nobody outside the project has used any of this yet'),
            `${path}: the footer no longer says nobody outside the project has used it. It says: ${note.slice(0, 200)}`,
          )
          // The claim is still made, and it is still made first. A denial with nothing to deny
          // reads as an apology, and the heading is the half a reader is owed the limits on.
          assert.ok(
            note.includes(BUILD.honesty.title),
            `${path}: the footer dropped the claim its denial qualifies`,
          )
        } finally {
          await session.close()
        }
      }
    },
  },

  /* ---- doc 32 §2.1, the hero row --------------------------------------- */
  {
    id: 'BJ-SITE-10',
    title: 'the loudest thing on the front page is the one journey a stranger can finish',
    tier: 1,
    // `presentation`, not `navigation`: this asserts what the page OFFERS, and it never follows the
    // link. The miner is another repository's surface and its status is that repository's to keep.
    asserts: 'presentation',
    gate: true,
    async run(surface) {
      /*
       * THE STANDFIRST IS AN INSTRUCTION AND THE PAGE HAD NO BUTTON FOR IT.
       *
       * "Press start on the mining page" was written above two buttons that went to `/products`
       * and `/build`: the shortest route from the promise to the product was three clicks and two
       * page loads (docs/ecosystem/32-roadmap-ui-and-content.md §2.1). Mining is also the only
       * complete journey this estate can offer a stranger today, because it is the only one that
       * needs no account, and registration cannot be completed (§6.3, traced on the host).
       *
       * The assertion is about EMPHASIS, not presence, so it is the FIRST action that is checked
       * and the product list is checked to have survived as something quieter. Putting the old
       * button back would leave both links on the page and would go red here.
       *
       * The href is read for two properties that together prove it is a registry lookup: it is
       * absolute, so it is not an in-app route somebody typed as `/mine`, and it is on an origin
       * this site is not served from, so it crossed to another surface the way `hosts()` resolves
       * every other outbound link. The hostname itself is never named — this file may no more
       * type one than `src` may.
       */
      const session = await renderOnlyWithStubbedNetwork(surface.origin, { stubs: ANONYMOUS })
      try {
        await assertMounted(session)

        const primary = session.page.locator('.si-hero__actions > *').first()
        assert.equal((await primary.innerText()).trim(), 'Start mining')
        const href = (await primary.getAttribute('href')) ?? ''
        assert.ok(href.endsWith('/mine'), `the hero's first action does not end at the miner: ${href}`)
        assert.ok(/^https?:\/\//.test(href), `the hero's first action is not a resolved address: ${href}`)
        assert.notEqual(
          new URL(href).origin,
          surface.origin,
          'the hero sends the reader to this site rather than to the network surface',
        )

        // The secondary action is kept and stays second: "what already works" is the answer to the
        // objection the primary action raises, and it is worth nothing after the reader has left.
        const secondary = session.page.locator('.si-hero__actions > *').nth(1)
        assert.equal((await secondary.innerText()).trim(), 'See what already works')
        assert.equal(await secondary.getAttribute('href'), '/build')

        // The product list is demoted, not deleted, and the count still comes from the registry.
        const more = session.page.locator('.si-hero__more a')
        assert.equal(await more.getAttribute('href'), '/products')
        // The count is SPELLED and derived — `productCount()` reads the registry — so the sentence
        // stays admissible under rule 1 of §1 and this assertion moves with a seventh product.
        assert.equal((await more.innerText()).trim(), `See the ${productCount()} products`)
        assert.equal(
          await textOrder(session.page, 'Start mining', `See the ${productCount()} products`),
          'before',
        )

        // …and the capability that describes mining offers the same destination, because the item
        // that convinces a reader could otherwise only offer them another page to read.
        const capability = session.page.locator(`.si-points__more a[href="${href}"]`)
        assert.ok((await capability.count()) > 0, 'the mining capability offers no way to start mining')
        assert.equal((await capability.first().innerText()).trim(), 'Start mining')
      } finally {
        await session.close()
      }
    },
  },

  /**
   * THE OFFER OF BROWSER MINING IS BESIDE THE ACCOUNT, ON EVERY ADDRESS THIS SITE SERVES.
   *
   * `mining` is an OPT-IN prop on `CloudsForgeBar` (`ui/packages/ui/src/index.tsx`). A bar rendered
   * without it is a perfectly valid bar, so a shell that stops passing it is indistinguishable from
   * one that passes it — by typecheck, by lint, and by every other scenario in this file. Eleven of
   * eighteen frontends passed it on 2026-08-10 and this surface was one of the three that did not.
   *
   * Of those three this is the one the omission costs the most, because it is the front door. This
   * file's own header says why: this is the site search engines crawl, that link checkers walk, and
   * that people paste into chat. It is where a reader who has never heard of any of this ARRIVES
   * FIRST, and a capability missing from the chrome here is missing from the only page most readers
   * will ever open.
   *
   * ── This is not BJ-SITE-10 again ──────────────────────────────────────────────────────────────
   *
   * That scenario is about the home page's hero: one address, one screen, the loudest action on it.
   * This is about all the others — the product pages, `/build`, `/terms`, `/privacy`, and the 404 —
   * where there is no hero and the bar is the whole of what a reader has to move with. Deleting the
   * hero button leaves this green and deleting the bar prop leaves that one green, which is the
   * reason both exist.
   *
   * `src/components/shell.tsx` is where this one is decided, and it is a single line. Reverting
   * `mining={miningOnHub(hosts().hub)}` turns this red and leaves the rest of the suite green,
   * which is the mutation proof.
   *
   * What it does NOT assert is what the control DRAWS — micro-ui's `mining.test.ts` owns that — nor
   * that pressing it mines anything, which is asserted in micro-hub-web, the surface that actually
   * mounts the miner. A session is a WebSocket and two Web Workers pinned to ONE origin, and this
   * bundle is not served from it. What this site owes a reader is that the offer exists, that it is
   * where they will look for it, and that it is a LINK they can middle-click rather than an
   * `onClick` no link check can see.
   */
  {
    id: 'BJ-MINE-BAR',
    title: 'the offer of browser mining is beside the account, on every address this site serves',
    tier: 2,
    asserts: 'presentation',
    async run(surface) {
      // Every owned address, and one this app does not own. `/products/pay` is the bookmark from
      // the previous estate that BJ-SITE-404 pins: nginx answers 404 for it and still serves this
      // shell, and chrome that is absent on the 404 is absent exactly where a lost reader needs a
      // way onwards.
      for (const path of [...OWNED, '/products/pay']) {
        const session = await renderOnlyWithStubbedNetwork(surface.origin, { path, stubs: ANONYMOUS })
        try {
          const found = await session.page.$$('.cf-bar .cf-mine')
          assert.equal(found.length, 1, `${path}: expected one mining control in the bar, found ${found.length}`)
          const mine = found[0] as NonNullable<(typeof found)[number]>

          /*
           * An anchor, and pointed at HUB. Getting the surface wrong is the likely mistake rather
           * than a hypothetical one — every other destination in this shell is an in-app route, and
           * `src/lib/hosts.ts` exists precisely because writing `/mine` here would be the natural
           * thing to type. A control that offered mining and led to a page of this site is
           * indistinguishable from a working one in every screenshot.
           */
          assert.equal(
            await mine.evaluate((el) => el.tagName),
            'A',
            `${path}: the mining control is not a link`,
          )
          const href = (await mine.getAttribute('href')) ?? ''
          assert.ok(
            href.endsWith(HUB_MINE_PATH),
            `${path}: the mining control points at ${href}, not at ${HUB_MINE_PATH}`,
          )
          assert.notEqual(
            new URL(href, surface.origin).origin,
            new URL(surface.origin).origin,
            `${path}: the mining control leads back to this site instead of to Forge Hub`,
          )

          /*
           * DOCUMENT ORDER, NOT CSS. A stylesheet can put a box anywhere on the row — `order:` and
           * `flex-direction: row-reverse` both do it without moving a node — so reading the
           * rendered geometry would pass for a control a keyboard reader reaches last, after the
           * switcher and the whole page. "Beside the account" is a claim about where you find it.
           *
           * The `.cf-sr` skipped between them is the control's own description span, which
           * `MiningControl` renders as a SIBLING so it is a description and not part of the
           * accessible name (`ui/packages/ui/src/mining.tsx`).
           */
          const placement = await session.page.evaluate(() => {
            const inner = document.querySelector('.cf-bar__inner')
            if (!inner) return null
            const kids = [...inner.children]
            const mineAt = kids.findIndex((el) => el.classList.contains('cf-mine'))
            const last = kids.length - 1
            return {
              between: kids.slice(mineAt + 1, last).filter((el) => !el.classList.contains('cf-sr')).length,
              account: kids[last]?.className ?? '',
            }
          })
          assert.ok(placement, `${path}: the bar has no inner row`)
          assert.equal(placement.between, 0, `${path}: something now sits between mining and the account`)
          assert.match(
            placement.account,
            /cf-pop|cf-btn--ember/,
            `${path}: the last control in the bar is not the account (${placement.account})`,
          )

          /*
           * And it promises nothing. `pool/src/payouts.ts` states it — "PAYOUTS ARE OFF" — and
           * `miningOnHub()` defaults `payoutsImplemented` to false rather than asking a bundle that
           * has never spoken to the pool to assert otherwise. This site is the one place where that
           * silence would be read as a promise: the footer says on every address that EMBER has no
           * market, no listing and no price (BJ-SITE-09), and an invitation to mine standing in the
           * same row without the clause is the pair of claims that rule 4 of
           * docs/ecosystem/32-roadmap-ui-and-content.md §1 exists about.
           *
           * Asserted against the exported constant, so rewording the sentence in micro-ui does not
           * leave this checking a string that no longer appears anywhere.
           */
          const clause = await session.page.evaluate(() => {
            const el = document.querySelector('.cf-bar .cf-mine')
            const id = el?.getAttribute('aria-describedby') ?? ''
            return document.getElementById(id)?.textContent ?? null
          })
          assert.ok(clause, `${path}: the mining control carries no description for a screen reader`)
          assert.ok(
            clause.includes(NOT_PAID_CLAUSE),
            `${path}: the mining control does not carry the not-paid clause`,
          )
        } finally {
          await session.close()
        }
      }
    },
  },

  /* ---- estate-wide, on this surface ------------------------------------ */
  {
    id: 'BJ-ACC-06',
    title: 'the SSO callback code is stripped from the address bar before the exchange is sent',
    tier: 1,
    asserts: 'client-request',
    async run(surface) {
      const session = await renderOnlyWithStubbedNetwork(surface.origin, {
        path: '/#cf_code=handoff-code-123',
        stubs: [
          ['POST /auth/handoff/redeem', { json: { accessToken: 'a', refreshToken: 'r' } }],
          ['GET /auth/me', { json: me(['user']) }],
          ...ANONYMOUS,
        ],
      })
      try {
        await assertMounted(session)
        const hash = await session.page.evaluate(() => window.location.hash)
        assert.equal(hash.includes('cf_code'), false, `cf_code is still in the address bar: ${hash}`)
        const redeem = session.apiCalls().find((c) => c.url.includes('/auth/handoff/redeem'))
        assert.ok(redeem, 'the hand-off code was never redeemed')
        assert.ok(redeem.body?.includes('handoff-code-123'), 'the code was not sent in the body')
        assert.equal(redeem.url.includes('handoff-code-123'), false, 'the code was put in a URL')
      } finally {
        await session.close()
      }
    },
  },
  {
    id: 'BJ-SITE-OFFLINE',
    title: 'no page on this site makes a third-party request, and none needs an API to render',
    tier: 1,
    asserts: 'client-request',
    // The privacy notice claims this site embeds no external script, stylesheet, font or image.
    // CI greps the sources for it; this asserts the running page, which is the only place a
    // request actually happens — a URL assembled at runtime is invisible to a grep.
    async run(surface) {
      for (const path of ['/', '/products', '/platform', '/build', '/about', '/terms', '/privacy']) {
        const session = await renderOnlyWithStubbedNetwork(surface.origin, { path, stubs: ANONYMOUS })
        try {
          await assertMounted(session)
          const outside = session
            .apiCalls()
            .filter((call) => !call.url.startsWith(surface.origin) && !call.url.includes('localhost'))
          assert.deepEqual(
            outside.map((c) => `${c.method} ${c.url}`),
            [],
            `${path} reached a host outside CloudsForge`,
          )
        } finally {
          await session.close()
        }
      }
    },
  },
  {
    id: 'BJ-A11Y-01',
    title: 'axe finds no serious or critical violation on any address this site owns',
    tier: 2,
    asserts: 'presentation',
    gate: true,
    async run(surface) {
      const seen = new Set<string>()
      for (const path of [...OWNED, '/nope']) {
        const session = await renderOnlyWithStubbedNetwork(surface.origin, { path, stubs: ANONYMOUS })
        try {
          await assertMounted(session)
          for (const id of await assertAxeClean(session.page, path, UI_CONTRAST)) seen.add(id)
        } finally {
          await session.close()
        }
      }
      assertKnownStillBroken(seen, UI_CONTRAST)
    },
  },
  {
    id: 'BJ-A11Y-12',
    title: 'a reachable skip link, one main landmark, and a heading order with no level skipped',
    tier: 2,
    asserts: 'presentation',
    async run(surface) {
      for (const path of OWNED) {
        const session = await renderOnlyWithStubbedNetwork(surface.origin, { path, stubs: ANONYMOUS })
        try {
          await assertMounted(session)
          const structure = await session.page.evaluate(() => ({
            mains: document.querySelectorAll('main').length,
            levels: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName.slice(1))),
          }))
          assert.equal(structure.mains, 1, `${path} has ${structure.mains} main landmarks`)
          assert.equal(structure.levels[0], 1, `${path} does not open with an h1`)
          let previous = 0
          for (const level of structure.levels) {
            assert.ok(level <= previous + 1, `${path} jumps from h${previous} to h${level}`)
            previous = level
          }

          // Tab once from the top of the document: what a keyboard reader meets first must be the
          // skip link, and it must move into view. A link that stays off-screen when focused is
          // worse than none — the reader activates it and cannot tell whether it did anything.
          const before = await session.page.evaluate(
            () => document.body.querySelector('a[href]')?.getBoundingClientRect().top ?? 0,
          )
          await session.page.keyboard.press('Tab')
          const href = await session.page.evaluate(() =>
            (document.activeElement as HTMLAnchorElement | null)?.getAttribute('href'),
          )
          assert.equal(href, '#main', `${path}: the first thing Tab reaches is not the skip link`)
          const moved = await session.page
            .waitForFunction(
              (top: number) => (document.activeElement?.getBoundingClientRect().top ?? top) > top + 1,
              before,
              { timeout: 3_000 },
            )
            .then(() => true)
            .catch(() => false)
          assert.ok(moved, `${path}: the skip link never became visible while focused`)
        } finally {
          await session.close()
        }
      }
    },
  },

  /* ---- specified, and not writable today -------------------------------- */
  {
    id: 'BJ-XS-10',
    title: 'every entry in the rendered switcher opens a surface that answers 200 on its index',
    tier: 2,
    asserts: 'navigation',
    gate: true,
    expectStatus: 200,
    ownedBy: 'beacon/src/browser/catalogue.ts#BJ-XS-10',
    blocked:
      'Tier 3: it needs every frontend served at once, and deploy/compose/docker-compose.estate.yml ' +
      'defines 22 domain services and no frontend container at all (doc 22 §8.7). The switcher URLs ' +
      'are asserted here as far as this repository can — BJ-SITE-07 checks what is offered — but ' +
      'whether they resolve is a property of a set of versions, which no single repository’s PR ' +
      'can establish. It belongs to micro-beacon.',
  },
  {
    id: 'BJ-ACC-01',
    title: 'a reader arriving from this site can register and come back with a session',
    tier: 2,
    asserts: 'presentation',
    gate: true,
    blocked:
      'Nothing in the estate serves a sign-in page (doc 22 §8.1). signInRedirect() sends the ' +
      'browser to ${accountUrl()}/login and no repository in the working tree serves /login — ' +
      'micro-identity renders no HTML at all. The bar on this site has a Sign in control, and ' +
      'pressing it leads to an address nothing answers.',
  },
]
