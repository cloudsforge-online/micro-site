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
import { readFileSync, readdirSync } from 'node:fs'
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
