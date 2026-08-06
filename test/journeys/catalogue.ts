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
import { PRODUCTS, SWITCHER_SURFACES } from '@cloudsforge/ui'
import { assertMounted, renderOnlyWithStubbedNetwork, type Stubs } from './browser.ts'
import { assertAxeClean, assertKnownStillBroken, textOrder, type KnownViolation } from './axe.ts'
import type { Scenario } from './scenario.ts'
import { PRODUCT_PAGES } from '../../src/content/products.ts'
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
          ['EMBER has no market, listing or price', /no market, no listing and no price/i],
          ['nobody outside the project has used it', /nobody outside the project has used/i],
          ['there is no redundancy or failover', /no redundancy, no failover/i],
          ['no backup has ever been restored', /no backup that has ever been restored/i],
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
