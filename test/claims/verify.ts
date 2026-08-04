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
   * What must appear within the CITED LINES for the citation to be load-bearing.
   *
   * Without this, a derivation that searches a whole file keeps agreeing with the registry while
   * the line number beside it rots — which is precisely what happened: four citations had drifted
   * one to three lines and each landed on a different real constant, so a reader who followed one
   * was shown the wrong number with total confidence.
   *
   * It is a pattern for the SHAPE of the source rather than for the value, because a witness that
   * matched the value would be satisfied by any line that happened to contain the same digits —
   * and `confirmations: 60` sitting one line from `reorgAlarmDepth: 5` is exactly that hazard.
   *
   * Optional only because a citation may legitimately name a file and no line, for a value derived
   * from a whole declaration rather than from a constant.
   */
  readonly witness?: RegExp
}

/** A claim that cannot be recomputed, and the stated reason. Reasons are never optional. */
export interface Exemption {
  readonly kind: 'recorded' | 'underivable'
  readonly reason: string
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

/** A cited location: an estate-relative path, and the line range if one was given. */
export interface Citation {
  readonly path: string
  readonly from?: number
  readonly to?: number
}

/**
 * Pull a citation out of a `source` string.
 *
 * Sources are prose with a path in them — `"contracts/…/index.ts:55 — CHAINS.EMBER.confirmations"`,
 * or `"@cloudsforge/ui — PRODUCTS, derived from SURFACES in ui/packages/ui/src/surfaces.ts"`. The
 * first path-shaped token wins, which is why a citation is written first wherever there is one.
 *
 * Returns `null` when there is no path at all — reported as a failure rather than skipped, because
 * "no source" is the state this whole mechanism exists to make impossible.
 */
export function parseCitation(source: string): Citation | null {
  const match = /([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*\.(?:ts|tsx|js|mjs|css|md|conf|json|py|sql|yml))(?::(\d+)(?:-(\d+))?)?/.exec(
    source,
  )
  if (match === null) return null
  const path = match[1]
  if (path === undefined) return null
  const from = match[2]
  const to = match[3]
  if (from === undefined) return { path }
  return { path, from: Number(from), to: to === undefined ? Number(from) : Number(to) }
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

/** The cited lines, 1-based and inclusive. The whole file when no range was given. */
export function citedText(file: string, citation: Citation): { text: string; lines: number } {
  const all = readFileSync(file, 'utf8').split('\n')
  if (citation.from === undefined) return { text: all.join('\n'), lines: all.length }
  return { text: all.slice(citation.from - 1, citation.to).join('\n'), lines: all.length }
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

    const { text, lines } = citedText(file, citation)
    if (citation.from !== undefined && (citation.from > lines || (citation.to ?? 0) > lines)) {
      fail(key, `cites ${citation.path}:${citation.from}-${citation.to}, but that file has ${lines} lines.`)
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
      // The value is right. Now: is the line beside it right? These are independent, and the
      // second is the one that rots without anybody noticing.
      if (derivation.witness !== undefined && citation.from !== undefined) {
        if (!derivation.witness.test(text)) {
          fail(
            key,
            `derives correctly, but ${citation.path}:${citation.from}` +
              `${citation.to === citation.from ? '' : `-${citation.to}`} does not contain ` +
              `${derivation.witness} — the citation has drifted off the value it names. Those ` +
              `lines read: ${JSON.stringify(text.trim().slice(0, 120))}`,
          )
        }
      } else if (derivation.witness === undefined && citation.from !== undefined) {
        fail(
          key,
          'cites a line but declares no witness, so nothing checks that the line is the right one.',
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
      if (citation.from === undefined) {
        fail(key, 'is a recorded measurement, so its citation must name the line it was recorded on.')
      } else if (!text.includes(claim.rendered)) {
        fail(
          key,
          `is published as ${JSON.stringify(claim.rendered)}, which does not appear at ` +
            `${citation.path}:${citation.from}-${citation.to}. The cited lines read: ` +
            JSON.stringify(text.trim().slice(0, 160)),
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
      derivations: { a: { reads: 'nginx.conf', derive: () => '1' } },
      exemptions: { a: { kind: 'underivable', reason: 'x'.repeat(50) } },
      roots,
    }).includes('both derived and exempt'),
    'a doubly classified claim was not reported',
  )

  // A derivation for a claim that no longer exists.
  expect(
    only({
      claims: {},
      derivations: { gone: { reads: 'nginx.conf', derive: () => '1' } },
      exemptions: {},
      roots,
    }).includes('not in the registry'),
    'an orphaned derivation was not reported',
  )

  // A citation naming a file that does not exist — the `validate_palette.js` failure.
  expect(
    only({
      claims: { a: claim('1', 'nowhere/at/all.ts:1') },
      derivations: { a: { reads: 'nowhere/at/all.ts', derive: () => '1' } },
      exemptions: {},
      roots,
    }).includes('in none of the roots'),
    'a citation to a missing file was not reported',
  )

  // A derivation that disagrees with the published value.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: { a: { reads: 'nginx.conf', derive: () => '2' } },
      exemptions: {},
      roots,
    }).includes('published as "1"'),
    'a wrong value was not reported',
  )

  // A derivation reading somewhere other than the file cited.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: { a: { reads: 'package.json', derive: () => '1' } },
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

  // A RECORDED value that is not on the line it cites — the off-by-one failure.
  expect(
    only({
      claims: { a: claim('99999', 'nginx.conf:1') },
      derivations: {},
      exemptions: { a: { kind: 'recorded', reason: 'y'.repeat(50) } },
      roots,
    }).includes('does not appear at'),
    'a recorded value absent from its cited line was not reported',
  )

  // And the control: a registry that is right produces nothing at all. Without this, every
  // assertion above would still pass if the function simply reported everything.
  expect(
    only({
      claims: { a: claim('1', 'nginx.conf') },
      derivations: { a: { reads: 'nginx.conf', derive: () => '1' } },
      exemptions: {},
      roots,
    }) === '',
    'a correct registry produced failures',
  )

  return problems
}
