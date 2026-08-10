/**
 * The legal pages, and the one privacy claim this site is in a position to make about itself.
 *
 * ── Why undrafted sections are a tested property ──────────────────────────────────────────────
 *
 * The failure mode here is not a missing page. It is a page that LOOKS finished. A plausible
 * paragraph of terms reads as though somebody with authority to bind the company wrote it, it will
 * be relied on by a reader who cannot tell the difference, and it will stay up until somebody
 * notices — which, on the evidence of the estate this replaces, is never.
 *
 * So the structure carries the honesty rather than the prose: a section is either `stated`, which
 * means it describes how the system is built and an engineer can be held to it, or it is
 * `counsel`, which means it creates or limits a legal obligation and has not been drafted. The
 * tests below make each of those mean something:
 *
 *   - a `counsel` section may not acquire body text, so nobody "fills one in" quickly;
 *   - a `stated` section may not be empty, so nobody marks a real section outstanding to avoid
 *     writing it;
 *   - the incomplete notice may not be removed while any section is still outstanding, so the
 *     warning cannot be quietly dropped ahead of the drafting.
 *
 * ── The privacy claims, and the three distances they sit at ───────────────────────────────────
 *
 * This header used to say the privacy page "asserts that this site sets no cookies, runs no
 * analytics, embeds no third-party script and requests nothing from an external host", and that
 * the last suite checked it. Every clause of that is now wrong, and the way it went wrong is worth
 * keeping, because it decides what each suite below can honestly claim to do.
 *
 *   IN THIS REPOSITORY   "no external host in our own source". Checkable exactly, by reading
 *                        `src/**` and `index.html`. It was checked, it was green, and it was true.
 *   IN A LINKED PACKAGE  the cookie and the Google tag live in `@cloudsforge/ui`, which the scan
 *                        above never opened. The notice denied both for as long as it took a human
 *                        to read the page against the banner underneath it (micro-org#313). The
 *                        `cookie claims` suite closes that seam by reading the sibling's source.
 *   ON THE ESTATE HOST   the mail relay's settings and the state of the backups are in neither
 *                        repository. Nothing CI checks out can see them, so the last suite asserts
 *                        only that the page does not go back to DENYING what was measured on the
 *                        host — the half that is checkable from here, and the half that failed.
 *
 * The pattern in all three: a check was correct, green, and looking one boundary short of where
 * the behaviour was. That is a stronger failure than a missing test, because it produces a tick.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { LEGAL_PAGES, PRIVACY, RISK, TERMS, hasOutstanding, legalPage } from '../src/content/legal.ts'
import { LEGAL_PATHS, ROUTES } from '../src/lib/routes.ts'

const root = fileURLToPath(new URL('..', import.meta.url))

/**
 * Every string the privacy notice publishes, as data. Never as this repository's source text.
 *
 * Read from the exported objects rather than by scanning the file, so a claim that is written in a
 * comment — several are, at length — cannot satisfy a check about what a reader is shown.
 */
function privacyCopy(): string {
  const out: string[] = [PRIVACY.blurb, PRIVACY.notice, ...PRIVACY.standfirst]
  for (const section of PRIVACY.sections) {
    out.push(section.title, ...section.body, section.outstanding ?? '')
  }
  return out.join('\n')
}

describe('the legal pages', () => {
  it('exist, and are the ones the router serves', () => {
    assert.equal(LEGAL_PAGES.length, LEGAL_PATHS.length)
    for (const path of LEGAL_PATHS) assert.ok(legalPage(path), `no content for /${path}`)
  })

  it('are called the same thing by the page and by the link every surface renders', () => {
    /*
     * A legal route carries no nav `label`, so the link text for it is the clause of its `summary`
     * before the em dash — `src/components/shell.tsx` derives this site's own footer links that
     * way, and `@cloudsforge/ui`'s FOOTER_LEGAL_LINKS restates the same two strings for the shared
     * footer that fifteen other surfaces render. The page's own `title` is a THIRD copy, and
     * nothing tied it to the other two: `/terms` could have been retitled here and gone on being
     * linked as "Terms of service" from every surface in the estate, with no test going red.
     *
     * `ui/packages/ui/src/footer.test.ts` now pins the shared footer to the summary clause. This is
     * the other half of that seam — the clause to the heading a reader actually lands on.
     */
    for (const page of LEGAL_PAGES) {
      const route = ROUTES.find((r) => r.path === page.slug)
      assert.ok(route, `/${page.slug} is not routed`)
      assert.equal(
        route.summary.split(' — ')[0],
        page.title,
        `/${page.slug} is titled "${page.title}" and linked as something else`,
      )
    }
  })

  it('are lookupable by slug and nothing else', () => {
    assert.equal(legalPage('terms'), TERMS)
    assert.equal(legalPage('privacy'), PRIVACY)
    assert.equal(legalPage('cookies'), undefined)
    assert.equal(legalPage(''), undefined)
  })

  it('are not thin: a two-section terms page is a page that says nothing', () => {
    for (const page of LEGAL_PAGES) {
      assert.ok(page.sections.length >= 8, `${page.slug} has ${page.sections.length} sections`)
    }
  })

  it('repeat no section title within a page', () => {
    for (const page of LEGAL_PAGES) {
      const titles = page.sections.map((s) => s.title)
      assert.equal(new Set(titles).size, titles.length, `${page.slug} repeats a section title`)
    }
  })
})

describe('undrafted sections', () => {
  it('carry no body text at all', () => {
    // The whole mechanism. A `counsel` section with a paragraph in it is a paragraph of invented
    // legal text wearing a warning label, which is worse than either alone.
    for (const page of LEGAL_PAGES) {
      for (const section of page.sections) {
        if (section.status !== 'counsel') continue
        assert.deepEqual(section.body, [], `${page.slug} › ${section.title} has drafted text`)
      }
    }
  })

  it('say what belongs in them, so the drafting brief is not reconstructed from scratch', () => {
    for (const page of LEGAL_PAGES) {
      for (const section of page.sections) {
        if (section.status !== 'counsel') continue
        assert.ok(section.outstanding, `${page.slug} › ${section.title} has no brief`)
        assert.ok(
          (section.outstanding ?? '').length > 80,
          `${page.slug} › ${section.title} has a stub brief`,
        )
      }
    }
  })

  it('include the sections that must never be written in-house', () => {
    // Named individually rather than counted. These four are the ones where an engineer writing a
    // plausible paragraph does real damage, and a refactor that reclassified any of them as
    // `stated` would otherwise pass every other test in this file.
    const mustBeCounsel = [
      'Custody, and what it means that we hold assets',
      'Liability, warranties and indemnities',
      'Risk',
      'Fees',
    ]
    for (const title of mustBeCounsel) {
      const section = TERMS.sections.find((s) => s.title === title)
      assert.ok(section, `the terms no longer have a "${title}" section`)
      assert.equal(section?.status, 'counsel', `"${title}" has been drafted in-house`)
    }
  })

  it('include identity verification and retention on the privacy page', () => {
    for (const title of ['Identity verification', 'Retention']) {
      const section = PRIVACY.sections.find((s) => s.title === title)
      assert.ok(section, `the privacy notice no longer has a "${title}" section`)
      assert.equal(section?.status, 'counsel')
    }
  })
})

describe('drafted sections', () => {
  it('are never empty, so nothing is marked outstanding to avoid writing it', () => {
    for (const page of LEGAL_PAGES) {
      for (const section of page.sections) {
        if (section.status !== 'stated') continue
        assert.ok(section.body.length >= 1, `${page.slug} › ${section.title} is empty`)
        for (const paragraph of section.body) {
          assert.ok(paragraph.length > 80, `${page.slug} › ${section.title} has a stub paragraph`)
        }
      }
    }
  })

  it('carry no drafting brief, which would mean the section is not actually stated', () => {
    for (const page of LEGAL_PAGES) {
      for (const section of page.sections) {
        if (section.status !== 'stated') continue
        assert.equal(section.outstanding, undefined, `${page.slug} › ${section.title}`)
      }
    }
  })

  it('describe how the system is built rather than what the company promises', () => {
    // A weak heuristic on purpose: it catches the shape of a warranty, not its meaning. A `stated`
    // section is an engineer describing a mechanism, and the moment it starts making undertakings
    // it has become a section for counsel.
    for (const page of LEGAL_PAGES) {
      for (const section of page.sections) {
        if (section.status !== 'stated') continue
        for (const paragraph of section.body) {
          assert.ok(
            !/\bwe (warrant|guarantee|undertake|indemnif)/i.test(paragraph),
            `${page.slug} › ${section.title} makes an undertaking`,
          )
        }
      }
    }
  })
})

describe('the incomplete notice', () => {
  it('is present on both pages while anything is outstanding', () => {
    for (const page of LEGAL_PAGES) {
      assert.equal(hasOutstanding(page), true, `${page.slug} claims to be complete`)
      assert.ok(page.notice.length > 60, `${page.slug} has no notice`)
    }
  })

  it('says the document may not be relied on, in those words', () => {
    // The one sentence a reader needs. Asserted by meaning rather than by presence, because a
    // notice that keeps its position and loses its force is how this gets softened.
    for (const page of LEGAL_PAGES) {
      assert.match(page.notice, /incomplete/i, page.slug)
      assert.match(page.notice, /should (not )?be relied on/i, page.slug)
    }
  })

  it('reports honestly when a page has nothing outstanding', () => {
    // The function itself, on a page where every section is drafted — otherwise `hasOutstanding`
    // could be a function that returns true and this suite would never notice.
    assert.equal(
      hasOutstanding({ ...TERMS, sections: TERMS.sections.filter((s) => s.status === 'stated') }),
      false,
    )
  })
})

/* ─────────────── the licensing section, against the files it describes ─────────────── */

/**
 * The one section of the terms that was written rather than briefed, checked against disk.
 *
 * ── Why this suite exists and is not merely thorough ──────────────────────────────────────────
 *
 * The whole justification for marking this section `stated` instead of `counsel` is that it
 * describes files rather than creating obligations. That justification is worth exactly as much as
 * the checking behind it: an unchecked description of a file is a paragraph somebody wrote once
 * about a file that has since changed, which is the same object as an unchecked number.
 *
 * It reads the estate and does NOT skip when the estate is absent, for the reason
 * `test/estate-claims.test.ts` gives at length — a check that turns itself off produces the same
 * green tick as one that ran.
 */
describe('the licensing section, against the files it describes', () => {
  const ESTATE = fileURLToPath(new URL('../../', import.meta.url))
  const section = TERMS.sections.find((s) => s.title.startsWith('Licensing'))
  const text = (section?.body ?? []).join(' ')

  it('is on the terms page, and is stated rather than outstanding', () => {
    assert.ok(section, 'the terms no longer carry a licensing section')
    assert.equal(section?.status, 'stated')
  })

  it('describes this repository\'s own licence correctly', () => {
    // The nearest file it makes a claim about, and the only one guaranteed to be beside this test.
    const licence = readFileSync(join(root, 'LICENSE'), 'utf8')
    assert.match(licence, /MIT License/, 'this repository is no longer MIT-licensed')
    assert.match(text, /\bMIT licence\b/, 'the terms no longer name the code licence')
    // MIT's actual condition, which the paragraph states and which is the part people get wrong.
    assert.match(licence, /above copyright notice[\s\S]*shall be included/)
  })

  it('describes the artwork licence, and the reason it is a different one', () => {
    const assets = join(ESTATE, 'brand/LICENSE-ASSETS')
    assert.ok(existsSync(assets), 'micro-brand is not checked out; this check will not skip')
    const licence = readFileSync(assets, 'utf8')
    assert.match(licence, /Creative Commons Attribution 4\.0 International/)
    // The reason the terms give for the split is the reason the licence file itself gives. If
    // micro-brand ever restates it differently, the terms page is the thing that is now wrong.
    assert.match(licence, /MIT is a software\s*\n?licence and these are not software/)
    assert.match(text, /Creative Commons Attribution licence/)
    assert.match(text, /not software/, 'the terms no longer say WHY the artwork is licensed apart')
    assert.match(text, /attribution is required for the pictures and is not required for the code/i)
  })

  /**
   * The over-claim guard, and it is written the way it is because the obvious version was wrong.
   *
   * The first draft looped over a list of four marks typed into this test and asserted each
   * appeared in both the notice and the copy. It was then broken on purpose by adding a FIFTH mark
   * to the terms page that the estate reserves nothing about — and it stayed green, because a test
   * that iterates a hard-coded list can only ever check the things on the list.
   *
   * So the marks are EXTRACTED FROM THE PUBLISHED SENTENCE and each is resolved against the notice.
   * Over-claiming is the one direction of error a reader cannot detect and cannot recover from: a
   * trademark asserted over a name the company has not reserved is a threat made on false
   * pretences, and it is made in the company's own voice on its own terms page.
   */
  it('reserves exactly the marks the trademark notice reserves, and no more', () => {
    const notice = readFileSync(join(ESTATE, 'brand/TRADEMARKS.md'), 'utf8')
    const sentence = (section?.body ?? []).find((p) => p.includes('reserved from both grants'))
    assert.ok(sentence, 'the terms no longer state which marks are reserved')

    // The capitalised names in the reservation sentence, minus the ordinary sentence-initial words
    // any English sentence starts with. Deriving the list is the whole point; a miss here is a
    // mark the estate never claimed being asserted on a public terms page.
    const claimed = [...new Set(sentence.match(/\b[A-Z][A-Za-z]+\b/g) ?? [])].filter(
      (word) => !['The', 'You', 'It', 'A', 'This', 'They'].includes(word),
    )
    assert.ok(claimed.length >= 4, `only found ${claimed.length} marks in the sentence`)
    const unreserved = claimed.filter((mark) => !notice.includes(mark))
    assert.deepEqual(
      unreserved,
      [],
      `the terms assert a trademark the estate's own notice does not reserve: ${unreserved.join(', ')}`,
    )

    // And the other direction, so dropping a mark from the copy is visible too.
    for (const mark of ['CloudsForge', 'Forge', 'Hearth', 'EMBER']) {
      assert.ok(notice.includes(mark), `the trademark notice no longer names ${mark}`)
      assert.ok(claimed.includes(mark), `the terms no longer reserve ${mark}`)
    }
    assert.match(notice, /are trademarks of CloudsForge/)
    // The nominative permission, which is the half that makes the reservation reasonable rather
    // than merely restrictive. A terms page stating only the prohibition would be accurate and
    // would misrepresent the position.
    assert.match(text, /say truthfully what your work is/)
    assert.match(notice, /nominatively/)
  })

  it('makes no undertaking, which is what keeps it out of counsel\'s hands', () => {
    // Broader than the generic heuristic above, because this section is the one most likely to
    // drift into a warranty: it is the only place on the page where something is being granted.
    for (const paragraph of section?.body ?? []) {
      assert.ok(
        !/\b(we|CloudsForge) (warrant|guarantee|undertake|indemnif|shall be liable)/i.test(paragraph),
        `the licensing section makes an undertaking: ${paragraph.slice(0, 90)}`,
      )
    }
  })

  it('leaves every section that needs a lawyer exactly where it was', () => {
    // The instruction was to populate the licensing, not to populate the terms. This is the guard
    // on that boundary: adding a drafted section must not have been an excuse to draft others.
    //
    // ── Why this list grew by one on 2026-08-05, and why that is not the thing it guards against ──
    //
    // "What it means mechanically that we hold your keys" was added beneath the Custody hole. The
    // guard is doing its job by making that an explicit, reviewed edit rather than a silent one, so
    // the reasoning is recorded here where the next person meets it.
    //
    // It is a description of mechanism, not a term: the operator can decrypt stored keys because of
    // how `custody/src/crypto.ts` derives them and where the secret comes from; there are no
    // backups; loss of the keyring is unrecoverable; there is no insurance or proof of reserves.
    // None of that characterises the assets in law, allocates a loss or limits a liability — which
    // is why the Custody section above it is STILL `counsel` and still empty, and why the assertion
    // below that it is counsel is the one that actually matters.
    //
    // The thing this test exists to catch would be that hole quietly acquiring prose. It has not.
    const stated = TERMS.sections.filter((s) => s.status === 'stated').map((s) => s.title)
    assert.deepEqual(stated, [
      'Your account',
      'What it means mechanically that we hold your keys',
      'How the system treats your money',
      'Withdrawal and export',
      'Licensing: the code, the artwork and the names',
    ])
  })
})

/* ───────────────────── the privacy claim, checked ──────────────────── */

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.html'])

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...sourceFiles(full))
    else if (SOURCE_EXTENSIONS.has(extname(entry.name))) out.push(full)
  }
  return out
}

describe('what the privacy page claims about this site', () => {
  const files = [...sourceFiles(join(root, 'src')), join(root, 'index.html')]

  it('has files to check', () => {
    assert.ok(files.length >= 15, `expected the source tree, found ${files.length} files`)
  })

  /**
   * Every absolute URL in the source, with the file it is in.
   *
   * Comments are stripped first — the same lesson as the SPA-fallback guard in `routes.test.ts`,
   * which failed on a correct config because the config explained itself. Several files here
   * document a decision by naming what was rejected, and a rule that fires on its own rationale is
   * a rule people delete.
   */
  function externalUrls(): Array<{ file: string; url: string }> {
    const found: Array<{ file: string; url: string }> = []
    for (const file of files) {
      const code = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/<!--[\s\S]*?-->/g, '')
      for (const match of code.matchAll(/https?:\/\/[^\s"'`)<>]+/g)) {
        found.push({ file: relative(root, file), url: match[0] })
      }
    }
    return found
  }

  it('embeds no third-party script, stylesheet, font or image', () => {
    // The claim on the privacy page, in one assertion. `localhost` is the only URL the source is
    // allowed to contain, and only inside the runtime host-resolution fallbacks it inherits.
    const external = externalUrls().filter((u) => !u.url.includes('localhost'))
    assert.deepEqual(
      external,
      [],
      `the bundle would request an external host:\n  ${external
        .map((u) => `${u.file}: ${u.url}`)
        .join('\n  ')}`,
    )
  })

  it('loads no web font, which is also why the type scale carries the hierarchy', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8')
    assert.ok(!html.includes('fonts.googleapis'), 'index.html loads a hosted font')
    assert.ok(!/@import/.test(readFileSync(join(root, 'src/styles.css'), 'utf8')), 'styles.css imports')
    assert.ok(!/@font-face/.test(readFileSync(join(root, 'src/styles.css'), 'utf8')))
  })

  it('sets no cookie', () => {
    for (const file of files) {
      const code = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      assert.ok(!/document\.cookie/.test(code), `${relative(root, file)} touches document.cookie`)
    }
  })

  it('says all of that on the privacy page, so the claim and the check cannot diverge', () => {
    const section = PRIVACY.sections.find((s) => s.title === 'What this website does')
    assert.ok(section, 'the privacy notice no longer describes this website')
    const text = (section?.body ?? []).join(' ')
    for (const word of ['cookies', 'analytics', 'third-party', 'font']) {
      assert.ok(text.includes(word), `the privacy notice no longer mentions ${word}`)
    }
  })

  it('discloses the error reporting, which is the one thing this page does send', () => {
    // The site does post browser error reports to CloudsForge's own ingest. A privacy notice that
    // listed only the things it does NOT do would be true and misleading.
    const section = PRIVACY.sections.find((s) => s.title.startsWith('Errors'))
    assert.ok(section, 'the privacy notice no longer discloses error reporting')
    assert.equal(section?.status, 'stated')
    assert.ok((section?.body ?? []).join(' ').includes('user-agent'))
  })
})

/* ────────── the cookie claims, against the package that actually sets them ────────── */

/**
 * THE CHECK ABOVE READS THIS REPOSITORY'S SOURCE, AND THAT IS EXACTLY HOW THE NOTICE BECAME FALSE.
 *
 * `what the privacy page claims about this site` scans `src/**` and `index.html` for
 * `document.cookie` and for an external URL. Both scans were green, and both were green correctly:
 * nothing in this repository writes a cookie or names a third-party host. The cookie and the Google
 * Analytics loader arrive from `@cloudsforge/ui`, a linked sibling package whose source this
 * repository does not scan — and `src/components/shell.tsx` renders that package's `CookieBanner`
 * on every page of this site.
 *
 * So the estate shipped a consent banner, a cookie on the registrable domain and a third-party tag,
 * while the privacy notice went on saying in a `stated`, marker-free section that there were no
 * cookies anywhere, no analytics and no third-party script — and no test in either repository
 * compared the two. Measured on the deployed apex on 2026-08-09: `GET https://cloudsforge.online/`
 * carries `<meta name="cf-analytics">` with a live GA4 property, and the one bundle it loads
 * contains BOTH the string `cf_consent_analytics` and the sentence "There are no cookies, on any
 * CloudsForge site". Same artefact, both claims. micro-org#313.
 *
 * The notice itself already named this gap — it says the source scan "would not see ... one made by
 * a third-party dependency rather than by code written here" — which is a confession, not a
 * control. This suite is the control: it reads what the design system DOES and holds the notice to
 * it, so the next behaviour change in that package fails here rather than being discovered by a
 * reader comparing a banner against a page that denies it exists.
 *
 * It does NOT skip when micro-ui is absent, for the reason `test/estate-claims.test.ts` gives at
 * length: a check that turns itself off produces the same green tick as one that ran. CI checks
 * micro-ui out at `ui/`, beside this repository's `site/`, because the package is a `link:`
 * dependency and nothing here installs without it.
 */
describe('the cookie claims, against the package that sets them', () => {
  const UI = fileURLToPath(new URL('../../ui/packages/ui/src/', import.meta.url))
  const consentPath = join(UI, 'consent.ts')

  it('can read the design system, which is not optional here', () => {
    assert.ok(
      existsSync(consentPath),
      'micro-ui is not checked out beside this repository; this check will not skip',
    )
  })

  const consent = existsSync(consentPath) ? readFileSync(consentPath, 'utf8') : ''
  /** The package's source with its comments removed — it documents at length what it rejected. */
  const code = consent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

  const notice = privacyCopy()

  it('is rendered by this site, so the notice is describing this page and not somebody else\'s', () => {
    const shell = readFileSync(join(root, 'src/components/shell.tsx'), 'utf8')
    assert.match(shell, /<CookieBanner\b/, 'this site no longer renders the consent banner')
  })

  it('writes a cookie, and the notice calls it by the name it is written under', () => {
    assert.match(code, /document\.cookie\s*=/, 'the design system no longer writes a cookie')
    const declared = /CONSENT_COOKIE_NAME\s*=\s*'([^']+)'/.exec(consent)?.[1]
    assert.ok(declared, 'the design system no longer declares a consent cookie name')
    // Named, not gestured at. A reader clearing one cookie needs the string the browser shows them,
    // and a notice that says "a consent cookie" cannot be checked against anything.
    //
    // `declared` is passed bare rather than through a fallback. It carried `?? '\0'` — an actual
    // NUL byte, typed into the source when this suite was written — and `assert.ok` above is an
    // assertion signature, so the fallback was unreachable in every run. It was not unreachable to
    // the tools that read this file: measured 2026-08-10, `rg` and `grep -rI` both classify the
    // whole file as binary on that one byte and report NO match for the suite name below, which is
    // how a guard disappears from every search a reader or a reviewer runs while continuous
    // integration stays green. (`git grep` was unaffected — it samples only the head of a file and
    // the byte sat well past it — so the org's `git grep -nIE` secret scan did still read this
    // file. The exposure was to everything else.) `.github/workflows/ci.yml` now fails on a NUL in
    // any tracked source file, because this suite's whole value is that somebody can find it.
    assert.ok(
      notice.includes(declared),
      `the privacy notice never names the cookie the estate sets (${declared})`,
    )
  })

  it('states the lifetime the package actually sets, in the same words', () => {
    // Derived rather than typed. `CONSENT_MAX_AGE_SECONDS` is a product of literals; the notice
    // says how long a reader's answer lasts, and the two may not drift apart silently.
    const expr = /CONSENT_MAX_AGE_SECONDS\s*=\s*([\d\s*]+)/.exec(consent)?.[1]
    assert.ok(expr, 'the design system no longer declares how long an answer lasts')
    const seconds = (expr ?? '')
      .split('*')
      .map((part) => Number(part.trim()))
      .reduce((a, b) => a * b, 1)
    const months = Math.round(seconds / 60 / 60 / 24 / 30.44)
    assert.equal(months, 6, `the consent record now lasts ${months} months, not six`)
    assert.match(notice, /six months/i, 'the privacy notice no longer states how long an answer lasts')
  })

  it('loads Google Analytics on acceptance, and the notice says so by name', () => {
    assert.match(code, /googletagmanager\.com/, 'the design system no longer loads a Google tag')
    assert.match(notice, /Google Analytics/, 'the privacy notice never names Google Analytics')
    // The banner is the mechanism. A notice describing the cookies without the thing that asks for
    // them leaves a reader unable to connect the page they are on to the box at the foot of it.
    assert.match(notice, /banner/i, 'the privacy notice never mentions the consent banner')
  })

  it('sets nothing before the answer, which is the fact worth publishing, and is published', () => {
    // The one genuinely good property of this implementation, and the reason the fix here was to
    // correct the notice rather than to remove the tag: `grantConsent` is the only caller that
    // injects, and `initAnalytics` calls it only when a previous answer was already `granted`.
    assert.match(code, /if \(readConsent\(\) === 'granted'\) grantConsent\(\)/)
    assert.match(
      notice,
      /before you answer|until you answer|unless you accept|before you accept/i,
      'the privacy notice does not say that nothing is set before the reader answers',
    )
  })

  it('serves its typefaces from CloudsForge, which is what "no external font" means', () => {
    // The same seam, one claim over: `loads no web font` above reads index.html and src/styles.css
    // and would not see a face declared in the design system. Six are, and the privacy-relevant
    // property is not that a face is downloaded — it is that no font host is told what you read.
    const tokens = readFileSync(join(UI, 'tokens.css'), 'utf8')
    const faces = [...tokens.matchAll(/@font-face\s*\{[\s\S]*?\}/g)].map((m) => m[0])
    assert.ok(faces.length >= 1, 'the design system declares no typeface; this check reads nothing')
    const hosted = faces.flatMap((face) =>
      [...face.matchAll(/url\(\s*['"]?([^'")]+)/g)].map((m) => m[1] ?? ''),
    ).filter((url) => /^(https?:)?\/\//.test(url))
    assert.deepEqual(hosted, [], `a typeface is fetched from outside CloudsForge: ${hosted.join(', ')}`)
    assert.match(notice, /no external font|font host|typefaces are served/i)
  })

  it('carries none of the denials that were true before the banner shipped', () => {
    /*
     * Named individually rather than matched by a pattern, for the reason the trademark suite above
     * gives: these are the exact published sentences that became false, and a list is the only
     * form in which "this specific claim may not come back" can be asserted. Each was `stated` —
     * rendered with no outstanding marker — which is what made it worse than an undrafted section.
     */
    const denials: ReadonlyArray<readonly [RegExp, string]> = [
      [/there are no cookies/i, `the estate writes a cookie on the registrable domain`],
      [/no page in this estate writes a cookie/i, `the shared banner writes one on every surface`],
      [/sets no cookies of its own/i, `this site renders the banner that writes it`],
      [/there is no cookie banner/i, `this site renders one, last in the document`],
      [/would be theatre/i, `the banner exists and gates a real third-party script`],
      [/runs no analytics/i, `Google Analytics loads on acceptance`],
      [/no third-party analytics/i, `Google Analytics is a third party`],
      [/embeds no third-party script/i, `the tag is fetched from googletagmanager.com`],
    ]
    const revived = denials
      .filter(([pattern]) => pattern.test(notice))
      .map(([pattern, why]) => `${String(pattern)} — ${why}`)
    assert.deepEqual(
      revived,
      [],
      `the privacy notice denies what @cloudsforge/ui does:\n  ${revived.join('\n  ')}`,
    )
  })
})

/* ────────── the claims about the estate, which no checkout can measure ────────── */

/**
 * The cookies suite above works because the thing it describes is IN A FILE — `consent.ts` is a
 * `link:` sibling and can be read and compared. Two other classes of claim on this page are not
 * like that, and pretending otherwise is how both of them rotted:
 *
 *   the mail relay   its settings are in an untracked file on the estate host, not in any
 *                    repository. The measurement that once refused the claim — `grep -cE '^SMTP_'
 *                    .env` returning 0 — went on returning 0 after a relay was configured, because
 *                    it was looking at a checkout. Same boundary as the cookie, one repository
 *                    further out.
 *   the backups      `backup_runs` rows, an empty destination directory and a restore rehearsal
 *                    live on the host. Nothing here can see any of it.
 *
 * So this suite does not assert what the estate does. It asserts that the page does not go back to
 * DENYING what the estate was measured doing, which is the only half that is checkable from here
 * and is the half that failed. Each entry names the measurement that retired it, with a date and
 * an issue, so a future reader who finds one of these sentences true again can put it back and
 * delete its line rather than argue with a regular expression.
 *
 * All measurements below were read from the running estate, not from a repository.
 */
describe('the estate claims the notice cannot check, which may not be re-denied', () => {
  const notice = privacyCopy()
  const risk = [RISK.blurb, ...RISK.sections.flatMap((s) => [s.title, ...s.body])].join('\n')
  const terms = TERMS.sections.flatMap((s) => [s.title, ...s.body]).join('\n')

  it('does not go back to saying no mail provider is configured', () => {
    /*
     * micro-org#233, 2026-08-08: a real AUTH LOGIN handshake driven against the relay from inside
     * the notify container — configured, authenticated, and externally deliverable with SPF, DKIM
     * and DMARC passing. micro-org#243, measured on the host 2026-08-07: mail both succeeded and
     * failed that day against a free-tier daily allowance, i.e. it is sending.
     *
     * A processor holding readers' addresses is the single most consequential entry on this page,
     * and it was absent while the page affirmatively said there was none.
     */
    const denials: ReadonlyArray<readonly [RegExp, string]> = [
      [/no mail provider is configured/i, 'a relay is configured and sending (micro-org#233)'],
      [/no mail provider configured/i, 'the same claim, as it appeared in the drafting brief'],
      [/no SMTP server configured/i, 'SMTP is configured on the live estate'],
    ]
    const revived = denials
      .filter(([pattern]) => pattern.test(notice))
      .map(([pattern, why]) => `${String(pattern)} — ${why}`)
    assert.deepEqual(revived, [], `the notice denies a processor:\n  ${revived.join('\n  ')}`)
  })

  it('names the mail relay, because a reader needs to know who holds their address', () => {
    // Not "a third party" and not "a provider". The entry that is worth anything to a reader is
    // the company, and a notice that will not name one is not disclosing a recipient.
    assert.match(notice, /Mailtrap/, 'the notice no longer names the mail relay')
    assert.match(
      notice,
      /verification|password-reset/i,
      'the notice no longer says what the relay is used for',
    )
  })

  it('carries the same processor inventory into the brief a lawyer would work from', () => {
    /*
     * The wrong inventory was not only published — it was repeated inside the `outstanding` brief
     * for `Sharing, and transfers out of your territory`, which is the text a drafter reads once
     * and cannot check. An error in a notice is read by people able to notice; an error in a brief
     * is read by somebody hired because they were not there when it was written.
     */
    const brief = PRIVACY.sections.find((s) => /transfers out of your territory/i.test(s.title))
    assert.ok(brief, 'the transfers section is gone')
    const text = brief.outstanding ?? ''
    for (const [what, pattern] of [
      ['Cloudflare', /Cloudflare/],
      ['the mail relay', /mail relay/i],
      ['Google', /Google/],
    ] as const) {
      assert.match(text, pattern, `the transfers brief no longer lists ${what} as a processor`)
    }
  })

  it('does not go back to saying no restore has ever been performed', () => {
    /*
     * micro-org#214: a restore was rehearsed on the live host into throwaway databases, five
     * databases compared row for row against the source, and miner key material recovered on a
     * SEPARATE machine and verified by re-deriving the address. It went nowhere near the live
     * cluster, and "no restore has ever been performed" is nonetheless not what happened.
     *
     * The page had drifted in both directions at once, which is why this is not simply softened:
     * the same issue's triage of 2026-08-09 found a backup run queued daily since 2026-08-05, no
     * runner to claim any of them, and the destination directory empty. So a reader was told
     * something too pessimistic about restores and something too optimistic about backups by the
     * word "scheduled" being absent. Both halves are now published.
     */
    const denials: ReadonlyArray<readonly [RegExp, string]> = [
      [/no backup that has ever been restored/i, 'one was restored into a throwaway (#214)'],
      [/no restore has ever been (performed|carried out)/i, 'a restore was rehearsed (#214)'],
      [/no backup anyone has ever restored/i, 'the same claim, in the shorter phrasing'],
      [/there is no scheduled backup of any kind/i, 'a run is queued nightly; nothing claims it'],
      [/there are no backups\b/i, 'hand-taken pre-release database dumps exist on the host'],
    ]
    const revived = denials
      .filter(([pattern]) => [notice, risk, terms].some((page) => pattern.test(page)))
      .map(([pattern, why]) => `${String(pattern)} — ${why}`)
    assert.deepEqual(
      revived,
      [],
      `a legal page states a backup claim the estate disproved:\n  ${revived.join('\n  ')}`,
    )
  })

  it('still states the resilience risk, which is the half that has not changed', () => {
    // The correction above must not become a softening. One machine, one tunnel, nothing standing
    // by, and no scheduled backup that has ever produced anything: every one of those is still
    // true, and a reader deciding what to trust with money is owed them in the same breath.
    for (const [what, pattern] of [
      ['a single machine', /single home server|one machine/i],
      ['no failover', /no failover/i],
      ['no scheduled backup has run', /no scheduled backup that has ever run/i],
      ['no live restore', /never been (performed|run) on(to)? the live system/i],
    ] as const) {
      assert.ok(
        [notice, risk, terms].some((page) => pattern.test(page)),
        `no legal page states ${what} any more`,
      )
    }
  })
})
