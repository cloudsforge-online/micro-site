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
 * ── The privacy claim ─────────────────────────────────────────────────────────────────────────
 *
 * The privacy page asserts that this site sets no cookies, runs no analytics, embeds no
 * third-party script and requests nothing from an external host. That is the only kind of privacy
 * claim a static site can make on its own — and it is only worth making if it is checked, so the
 * last suite here checks it.
 */
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { LEGAL_PAGES, PRIVACY, TERMS, hasOutstanding, legalPage } from '../src/content/legal.ts'
import { LEGAL_PATHS } from '../src/lib/routes.ts'

const root = fileURLToPath(new URL('..', import.meta.url))

describe('the legal pages', () => {
  it('exist, and are the ones the router serves', () => {
    assert.equal(LEGAL_PAGES.length, LEGAL_PATHS.length)
    for (const path of LEGAL_PATHS) assert.ok(legalPage(path), `no content for /${path}`)
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
    const stated = TERMS.sections.filter((s) => s.status === 'stated').map((s) => s.title)
    assert.deepEqual(stated, [
      'Your account',
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
