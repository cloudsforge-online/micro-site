/**
 * A claims verifier. **Nothing in this file is specific to `micro-site`.**
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * THIS IS WRITTEN TO BE MOVED. It is a candidate for `@cloudsforge/ui` — see the note at the foot
 * of this header — and it is kept as one dependency-free module with no import of this site's
 * content, no hard-coded repository name and no hard-coded path, so that moving it is a copy and a
 * re-export rather than a rewrite.
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * ── The problem ───────────────────────────────────────────────────────────────────────────────
 *
 * A claims registry records `{ rendered, meaning, source }` per published number, where `source` is
 * a `path:line` into the estate. That structure is what makes a marketing surface fixable rather
 * than a rewrite — but on its own it is only a promise, and promises rot silently. When this
 * verifier was first run against `micro-site`'s registry — a registry whose own header presented
 * the citations as an audit trail — it found, out of eleven entries:
 *
 *   - four citations off by one to three lines, so each pointed at a real constant that was not
 *     the one claimed (`confirmations` cited at the `reorgAlarmDepth` line, and so on);
 *   - one citation naming `ui scripts/validate_palette.js`, a file that has NEVER existed in that
 *     repository — the design system says so itself, in the same block, two lines above the
 *     figures the site had copied;
 *   - one value, `ΔE 17`, that the cited file explicitly RETRACTS, under a heading reading
 *     "MEASURED NUMBERS, CORRECTED".
 *
 * Every one of those was reachable by opening the file named. Nothing opened it.
 *
 * ── The rule this enforces ────────────────────────────────────────────────────────────────────
 *
 * Every claim must be classified, BY NAME, into exactly one of three kinds:
 *
 *   DERIVED      the value is recomputed here from the file the citation names. The strongest
 *                kind, and the default: if a value can be recomputed, it must be.
 *   RECORDED     the value is a measurement or an event that cannot be recomputed — the reading
 *                of an instrument, or the state of something now deleted. The rendered value must
 *                appear VERBATIM within the cited lines, so the citation is at least load-bearing.
 *   UNDERIVABLE  the value is a decision, a policy, or a fact about software outside the estate.
 *                Only the citation's existence is checked. A written reason is mandatory.
 *
 * **The classification is by key and never by category.** There is no "all the colour ones" and no
 * regex over key names. A claim added to the registry and not named in one of the three maps fails
 * the coverage check with its own key in the message — which means the person adding a number is
 * the person who decides how it can be checked, at the moment they add it, rather than never.
 *
 * A blanket exemption is how the registry drifted the first time: `source` was exempt as a whole
 * category, described as "documentation, not an assertion", and four of them were wrong.
 *
 * ── This returns failures rather than throwing ────────────────────────────────────────────────
 *
 * Deliberate, and it is what makes the verifier itself testable. A checker that can only throw
 * cannot be shown to fail — and "a checker that cannot fail" is this estate's signature defect,
 * found this month in a CI job that read image metadata without running the image, a grep that
 * skipped NUL bytes, a secret scan blinded by `-I`, and a guard that quoted its own subject in
 * prose and so could not detect its own deletion. `selfTest()` below feeds this function a
 * deliberately broken registry and asserts each class of breakage is reported.
 *
 * ── What moving this into `@cloudsforge/ui` would take ────────────────────────────────────────
 *
 * `Claim`, `ClaimKind`, `Derivation`, `checkRegistry`, `selfTest` and the two path helpers move as
 * they are. A consumer then supplies three things and nothing else: its own registry, its own
 * derivation map, and the roots to resolve citations against. Nothing here reads `process.cwd()`,
 * `import.meta.url` or an environment variable, because a shared module that guesses where it is
 * cannot be used from a repository laid out differently.
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** One published number, with its provenance. The shape a consumer's registry entries must have. */
export interface Claim {
  readonly rendered: string
  readonly meaning: string
  readonly source: string
}

export type ClaimKind = 'derived' | 'recorded' | 'underivable'

/**
 * How a DERIVED claim is recomputed.
 *
 * `reads` is not a convenience. It is asserted to equal the path in the claim's own `source`, so a
 * derivation cannot quietly compute the right answer out of a different file than the one the site
 * tells its readers the number came from. That is a real failure mode: the easiest way to make a
 * failing derivation green is to point it somewhere friendlier.
 */
export interface Derivation {
  /** The estate-relative path this derivation reads. Must match the claim's cited path. */
  readonly reads: string
  /** Recompute the value, in its rendered form, from `text`. */
  readonly derive: (text: string) => string
  /**
   * The shape the citation NAMES, found by searching the cited file. Mandatory.
   *
   * This is what replaced the line number, and it is the stronger half of the trade. A citation
   * used to name `chain/src/index.ts` and line 197 — `CHAINS.EMBER.confirmations` — and the
   * check was that
   * line 197 contained something confirmations-shaped. That check broke four times in one week
   * without a single published number being wrong, because `micro-contracts` kept growing above
   * line 197 and this repository does not run when `micro-contracts` is edited.
   *
   * A witness asserts the same thing the line number was trying to — that the cited file really
   * contains the constant, heading or sentence the source names — and it survives the file being
   * edited anywhere else. It is a pattern for the SHAPE of the source rather than for the value,
   * because a witness matching the value would be satisfied by any line carrying the same digits.
   *
   * Required, where it used to be optional. Two derivations had none and were checked only by
   * their own `derive`, so nothing said which part of the file the citation was pointing at.
   */
  readonly witness: RegExp
}

/** A claim that cannot be recomputed, and the stated reason. Reasons are never optional. */
export interface Exemption {
  readonly kind: 'recorded' | 'underivable'
  readonly reason: string
  /**
   * For a RECORDED measurement: the passage it was recorded in, found by searching the cited file.
   *
   * The rendered value must appear INSIDE the text this matches, which is the same guarantee the
   * old line range gave — "the citation is load-bearing, not decorative" — without the part that
   * kept going stale. A witness therefore has to be written wide enough to span its own value; one
   * that has drifted off the sentence it names fails exactly as a stale line number used to.
   *
   * Absent for an UNDERIVABLE claim, where only the citation's existence is checkable by anything.
   */
  readonly witness?: RegExp
}

export interface RegistryCheck {
  /** The registry under test. */
  readonly claims: Readonly<Record<string, Claim>>
  /** Recomputation, by claim key. */
  readonly derivations: Readonly<Record<string, Derivation>>
  /** Everything that cannot be recomputed, by claim key, with a reason. */
  readonly exemptions: Readonly<Record<string, Exemption>>
  /**
   * Where to resolve a cited path.
   *
   * Tried in order. A citation whose first segment names a directory in one root resolves there;
   * this is what lets `nginx.conf` mean the consumer's own file and `ui/packages/…` mean a sibling
   * repository, without either being special-cased by name.
   */
  readonly roots: readonly string[]
}

export interface Failure {
  readonly claim: string
  readonly detail: string
}

/**
 * A cited location: an estate-relative path, and nothing else.
 *
 * `line` exists only so a source that still carries one can be REJECTED by name. It is never used
 * to read a file. A line number names a position in a file another repository owns and edits
 * without ever running this suite, so it is a promise this registry cannot keep — see the header
 * of `src/content/claims.ts`, which is the record of it being broken four times running.
 */
export interface Citation {
  readonly path: string
  readonly line?: number
}

/**
 * Pull a citation out of a `source` string.
 *
 * Sources are prose with a path in them — `"contracts/…/index.ts — CHAINS.EMBER.confirmations"`,
 * or `"@cloudsforge/ui — PRODUCTS, derived from SURFACES in ui/packages/ui/src/surfaces.ts"`. The
 * first path-shaped token wins, which is why a citation is written first wherever there is one.
 *
 * Returns `null` when there is no path at all — reported as a failure rather than skipped, because
 * "no source" is the state this whole mechanism exists to make impossible.
 */
export function parseCitation(source: string): Citation | null {
  const match = /([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*\.(?:ts|tsx|js|mjs|css|md|conf|json|py|sql|yml))(?::(\d+)(?:-\d+)?)?/.exec(
    source,
  )
  if (match === null) return null
  const path = match[1]
  if (path === undefined) return null
  const line = match[2]
  if (line === undefined) return { path }
  // Parsed only so `checkRegistry` can refuse it. See {@link Citation}.
  return { path, line: Number(line) }
}

/**
 * Resolve a cited path against the roots, in order.
 *
 * `null` when it is in none of them — which is the check that would have caught a citation naming
 * a file that never existed.
 */
export function resolveCitation(path: string, roots: readonly string[]): string | null {
  for (const root of roots) {
    const candidate = join(root, path)
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

/**
 * The text a witness matched in the cited file, or `null` when it matched nothing.
 *
 * This is the search that replaced `citedText(file, from, to)`. What the old function returned was
 * "whatever happens to be on lines 771 to 773 today", which is a fact about a file this repository
 * neither owns nor watches. What this returns is the passage that actually says the thing the
 * citation claims, wherever it has moved to.
 *
 * The match is returned rather than a boolean because a RECORDED value is then required to appear
 * INSIDE it — so a witness has to be written wide enough to span its own value, and a witness that
 * has drifted off the sentence it names fails exactly as the stale line number used to.
 */
export function witnessedText(file: string, witness: RegExp): string | null {
  return witness.exec(readFileSync(file, 'utf8'))?.[0] ?? null
}

/**
 * Check a registry against the estate. Returns every disagreement found, in registry order.
 *
 * An empty array is the only passing result, and the caller asserts that. This function never
 * throws for a claim-level problem — a derivation that throws is caught and reported as a failure
 * of that claim, so one broken entry cannot hide the state of the other ten.
 */
export function checkRegistry(input: RegistryCheck): Failure[] {
  const { claims, derivations, exemptions, roots } = input
  const failures: Failure[] = []
  const fail = (claim: string, detail: string): void => void failures.push({ claim, detail })

  const keys = Object.keys(claims)
  const known = new Set(keys)

  // ── Coverage, both directions ───────────────────────────────────────────────────────────────
  // Forwards: every claim is classified. This is the check that makes a NEW number impossible to
  // add without deciding how it is verified.
  for (const key of keys) {
    const inDerived = key in derivations
    const inExempt = key in exemptions
    if (!inDerived && !inExempt) {
      fail(
        key,
        'is in the registry but is classified nowhere. Add a derivation, or name it in the ' +
          'exemptions with a reason. There is deliberately no default and no category rule.',
      )
    }
    if (inDerived && inExempt) {
      fail(key, 'is both derived and exempt. It is one or the other.')
    }
  }
  // Backwards: nothing is classified that no longer exists. An exemption outliving its claim is a
  // licence left lying around for the next value that happens to be given the same key.
  for (const key of Object.keys(derivations)) {
    if (!known.has(key)) fail(key, 'has a derivation but is not in the registry.')
  }
  for (const key of Object.keys(exemptions)) {
    if (!known.has(key)) fail(key, 'is exempted but is not in the registry.')
  }

  // ── Per claim ───────────────────────────────────────────────────────────────────────────────
  for (const key of keys) {
    const claim = claims[key]
    if (claim === undefined) continue

    const citation = parseCitation(claim.source)
    if (citation === null) {
      fail(key, `cites no file at all: ${JSON.stringify(claim.source)}`)
      continue
    }

    const file = resolveCitation(citation.path, roots)
    if (file === null) {
      fail(
        key,
        `cites ${citation.path}, which is in none of the roots. Either the path is wrong, or the ` +
          'repository it lives in is not checked out where this check runs.',
      )
      continue
    }

    // A LINE NUMBER IS REFUSED, NOT FOLLOWED. This used to slice the file at the cited range and
    // check the range was in bounds, which is the check that broke four times in one week while
    // every published number stayed correct. A line names a position in a file another repository
    // owns and edits without running this suite; the registry cites the file and the SYMBOL now,
    // and this refusal is what stops the habit returning by copy-and-paste.
    if (citation.line !== undefined) {
      fail(
        key,
        `cites a line number (${citation.path}, line ${citation.line}). Cite the file and name the ` +
          'constant, heading or sentence — a line in another repository cannot be kept true here.',
      )
      continue
    }

    const exemption = exemptions[key]
    const derivation = derivations[key]

    if (derivation !== undefined) {
      if (derivation.reads !== citation.path) {
        fail(
          key,
          `is derived from ${derivation.reads} but cites ${citation.path}. A derivation must read ` +
            'the file the reader is told the number came from.',
        )
        continue
      }
      let actual: string
      try {
        // Derivations read the WHOLE file, not the cited slice: a derivation confined to the lines
        // somebody already wrote down would agree with them by construction.
        actual = derivation.derive(readFileSync(file, 'utf8'))
      } catch (error) {
        fail(key, `could not be derived from ${citation.path}: ${(error as Error).message}`)
        continue
      }
      if (actual !== claim.rendered) {
        fail(
          key,
          `is published as ${JSON.stringify(claim.rendered)} but ${citation.path} gives ` +
            `${JSON.stringify(actual)}.`,
        )
        continue
      }
      // The value is right. Now: is the cited file really the file that says so? These are
      // independent, and the second is the one that rots without anybody noticing — a derivation
      // that searches a whole file goes on agreeing with the registry long after the thing the
      // citation NAMES has been renamed or deleted out from under it.
      if (witnessedText(file, derivation.witness) === null) {
        fail(
          key,
          `derives correctly, but nothing in ${citation.path} matches ${derivation.witness} — the ` +
            'citation names something that file no longer contains.',
        )
      }
      continue
    }

    if (exemption === undefined) continue // already reported by the coverage check

    if (exemption.reason.trim().length < 40) {
      fail(
        key,
        'is exempt with a reason too short to be one. Say what makes the value irreducible, not ' +
          'that it is.',
      )
    }

    if (exemption.kind === 'recorded') {
      if (exemption.witness === undefined) {
        fail(
          key,
          'is a recorded measurement, so it must declare the witness that finds the passage it was ' +
            'recorded in. It used to name a line, and a line in another repository goes stale.',
        )
        continue
      }
      const passage = witnessedText(file, exemption.witness)
      if (passage === null) {
        fail(
          key,
          `is recorded in ${citation.path}, but nothing there matches ${exemption.witness} — the ` +
            'passage it was quoted from is gone.',
        )
      } else if (!passage.includes(claim.rendered)) {
        fail(
          key,
          `is published as ${JSON.stringify(claim.rendered)}, which does not appear in the passage ` +
            `${exemption.witness} finds in ${citation.path}. That passage reads: ` +
            JSON.stringify(passage.trim().slice(0, 160)),
        )
      }
    }
  }

  return failures
}

/* ─────────────────────────────── the verifier's own test ─────────────────────────────── */

/**
 * Prove this file can fail, without needing the estate.
 *
 * Every assertion here is about a registry constructed to be wrong in one specific way. It is
 * called from a real test, and it is the answer to "how do you know the checker works" that does
 * not require anybody to go and break a real claim by hand — though the suite does that too,
 * against the real estate, because a self-test built out of fixtures can only prove the shape of
 * the logic and not that it is pointed at anything.
 */
export function selfTest(fixtureRoot: string): string[] {
  const problems: string[] = []
  const expect = (condition: boolean, what: string): void => {
    if (!condition) problems.push(what)
  }
  const only = (input: RegistryCheck): string =>
    checkRegistry(input)
      .map((f) => `${f.claim}: ${f.detail}`)
      .join(' | ')

  const claim = (rendered: string, source: string): Claim => ({
    rendered,
    meaning: 'a fixture, not a published number',
    source,
  })
  const roots = [fixtureRoot]

  /** Matches the fixture file, for the cases where the witness itself is not what is under test. */
  const ANY = /error_page/

  /**
   * A source carrying a line number, BUILT rather than written out.
   *
   * The literal is assembled from its parts because this repository sweeps its own source for
   * `path:line` and a fixture spelling one out would be indistinguishable from the defect. What is
   * under test is that such a source is REFUSED, so the fixture has to produce one somehow, and
   * producing it this way says plainly that it is a specimen rather than a citation.
   */
  const withLine = (path: string, line: number): string => `${path}:${line}`

  // A claim classified nowhere.
  expect(
    only({ claims: { a: claim('1', 'nginx.conf') }, derivations: {}, exemptions: {}, roots }).includes(
      'classified nowhere',
    ),
    'an unclassified claim was not reported',
  )

  // A claim classified twice.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: { a: { reads: 'nginx.conf', witness: ANY, derive: () => '1' } },
      exemptions: { a: { kind: 'underivable', reason: 'x'.repeat(50) } },
      roots,
    }).includes('both derived and exempt'),
    'a doubly classified claim was not reported',
  )

  // A derivation for a claim that no longer exists.
  expect(
    only({
      claims: {},
      derivations: { gone: { reads: 'nginx.conf', witness: ANY, derive: () => '1' } },
      exemptions: {},
      roots,
    }).includes('not in the registry'),
    'an orphaned derivation was not reported',
  )

  // A citation naming a file that does not exist — the `validate_palette.js` failure.
  expect(
    only({
      claims: { a: claim('1', 'nowhere/at/all.ts') },
      derivations: { a: { reads: 'nowhere/at/all.ts', witness: ANY, derive: () => '1' } },
      exemptions: {},
      roots,
    }).includes('in none of the roots'),
    'a citation to a missing file was not reported',
  )

  // A derivation that disagrees with the published value.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: { a: { reads: 'nginx.conf', witness: ANY, derive: () => '2' } },
      exemptions: {},
      roots,
    }).includes('published as "1"'),
    'a wrong value was not reported',
  )

  // A derivation reading somewhere other than the file cited.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: { a: { reads: 'package.json', witness: ANY, derive: () => '1' } },
      exemptions: {},
      roots,
    }).includes('but cites'),
    'a derivation reading elsewhere was not reported',
  )

  // A derivation that throws is a failure of that claim, not of the run.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: {
        a: {
          reads: 'nginx.conf',
          witness: ANY,
          derive: () => {
            throw new Error('no match')
          },
        },
      },
      exemptions: {},
      roots,
    }).includes('could not be derived'),
    'a throwing derivation was not reported',
  )

  // An exemption whose reason is not a reason.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: {},
      exemptions: { a: { kind: 'underivable', reason: 'because' } },
      roots,
    }).includes('too short to be one'),
    'an empty exemption reason was not reported',
  )

  // A SOURCE THAT NAMES A LINE. The rule this revision is about, and it is checked before
  // anything is read out of the file, so a stale line cannot even be followed to a wrong answer.
  expect(
    only({
      claims: { a: claim('1', withLine('nginx.conf', 138)) },
      derivations: { a: { reads: 'nginx.conf', witness: ANY, derive: () => '1' } },
      exemptions: {},
      roots,
    }).includes('cites a line number'),
    'a citation carrying a line number was not refused',
  )

  // A RECORDED claim with no witness — the state every recorded claim was in while the citation
  // was a line range. It must fail rather than become a published number checked by nothing.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: {},
      exemptions: { a: { kind: 'recorded', reason: 'y'.repeat(50) } },
      roots,
    }).includes('must declare the witness'),
    'a recorded claim with no witness was not reported',
  )

  // A RECORDED value that is not in the passage its witness finds — the off-by-one failure, in the
  // form it takes now that the passage is searched for rather than sliced out by line number.
  expect(
    only({
      claims: { a: claim('99999', 'nginx.conf') },
      derivations: {},
      exemptions: { a: { kind: 'recorded', reason: 'y'.repeat(50), witness: ANY } },
      roots,
    }).includes('does not appear in the passage'),
    'a recorded value absent from the passage it cites was not reported',
  )

  // A witness that finds nothing at all. Without this the check above passes vacuously the day the
  // sentence a measurement was quoted from is deleted.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: {},
      exemptions: { a: { kind: 'recorded', reason: 'y'.repeat(50), witness: /no such text anywhere/ } },
      roots,
    }).includes('the passage it was quoted from is gone'),
    'a recorded witness that matched nothing was not reported',
  )

  // The same for a DERIVED claim: the value still recomputes, but the file no longer contains the
  // thing the citation names. This is the assertion that replaced "the cited line has drifted".
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: { a: { reads: 'nginx.conf', witness: /no such text anywhere/, derive: () => '1' } },
      exemptions: {},
      roots,
    }).includes('citation names something that file no longer contains'),
    'a derivation whose witness finds nothing was not reported',
  )

  // And the control: a registry that is right produces nothing at all. Without this, every
  // assertion above would still pass if the function simply reported everything.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: { a: { reads: 'nginx.conf', witness: ANY, derive: () => '1' } },
      exemptions: {},
      roots,
    }) === '',
    'a correct registry produced failures',
  )

  return problems
}
