/**
 * Real contrast ratios, computed from the actual token values, on both grounds.
 *
 * ── Why this is a test and not a review ───────────────────────────────────────────────────────
 *
 * Contrast is the one accessibility property that is fully decidable from the source, and it is
 * also the one that silently breaks. A token is retuned in the design system, a colour is used in
 * a place it was not validated for, or — the case that actually bit this repository — a palette
 * validated against a DARK panel is reused on a light ground, where the company ember measures
 * 2.99:1 and fails even the floor for a non-text control.
 *
 * So the values are read out of the stylesheets rather than restated here, the mixes are applied
 * as the browser would apply them, and every pair the site actually paints is computed. Nothing
 * below is a number somebody typed after looking at a screen.
 *
 * ── What is checked, and against what ────────────────────────────────────────────────────────
 *
 *   - Body and small text: 4.5:1, WCAG 2.2 AA for normal text.
 *   - The hero and display sizes would qualify for the 3:1 large-text allowance; they are held to
 *     4.5 anyway, because they use the same tokens as the body text and a separate, laxer budget
 *     for the same colour is a budget nobody can apply correctly later.
 *   - Non-text: 3:1, WCAG 2.2 AA for user-interface components and graphics. The focus ring and
 *     the card's accent edge are here.
 *
 * ── What is deliberately NOT checked ─────────────────────────────────────────────────────────
 *
 * The brand marks. Each is drawn with a ground line in `--cf-fg-mute` (which is checked) and one
 * accent element, and each is rendered immediately beside the surface's own name in text. An icon
 * that duplicates adjacent text is not required to carry the contrast on its own, and the mark
 * never does: it is never the only thing saying which product a card is about.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { CLOUDSFORGE_EMBER, PRODUCT_ACCENTS, SURFACES } from '@cloudsforge/ui'
import { SCOPED_SURFACES } from '../src/components/parts.tsx'

/* ───────────────────────── the colour maths ───────────────────────── */

type Rgb = readonly [number, number, number]

function parseHex(hex: string): Rgb {
  const value = hex.trim().replace('#', '')
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  assert.equal(full.length, 6, `not a hex colour: ${hex}`)
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ]
}

/** WCAG relative luminance. The sRGB transfer function, not a naive average. */
function luminance([r, g, b]: Rgb): number {
  const channel = (v: number): number => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio, always ≥ 1, order-independent. */
function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * `color-mix(in srgb, <a> <percent>%, <b>)`, as the browser computes it.
 *
 * sRGB mixing is a straight per-channel interpolation of the ENCODED values — deliberately not of
 * the linearised ones — which is why the stylesheet says `in srgb` and why this function must too.
 * Mixing in a linear space would produce a different, lighter result, and this test would report a
 * pass for something the browser paints differently.
 */
function mix(a: Rgb, percent: number, b: Rgb): Rgb {
  const f = percent / 100
  return [
    Math.round(a[0] * f + b[0] * (1 - f)),
    Math.round(a[1] * f + b[1] * (1 - f)),
    Math.round(a[2] * f + b[2] * (1 - f)),
  ] as const
}

const BLACK: Rgb = [0, 0, 0]

/* ───────────────────────── reading the tokens ─────────────────────── */

const tokensCss = readFileSync(
  new URL('../node_modules/@cloudsforge/ui/src/tokens.css', import.meta.url),
  'utf8',
)
const siteCss = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

/**
 * The first declaration of a custom property in a stylesheet, as a hex colour.
 *
 * ── A DECLARATION MAY BE AN INDIRECTION, AND READING ONLY LITERALS MISREPORTED ONE ────────────
 *
 * `@cloudsforge/ui` forked every colour into `-dark`/`-light` raws and pointed the PUBLIC name at
 * one of them, so a light scheme can remap the public name and `.cf-dark` can map it back — the
 * mechanism that keeps the shared bar company-coloured on a light page. `--cf-ember-ink` is now
 * `var(--cf-ember-ink-dark)`, and a reader that accepted only a literal hex reported it as "not
 * declared as a hex in the stylesheet": a token that is declared, resolvable, and correct.
 *
 * So a `var()` reference is FOLLOWED. What is deliberately not relaxed is the end state — the
 * chain must terminate in a literal hex, an undeclared name still fails, and a value that is
 * neither a hex nor a single `var()` still fails and says what it found. The hop limit is a bound
 * rather than a cycle check on purpose: an alias graph this shallow has no legitimate reason to be
 * deep, and a runaway one should fail loudly here rather than hang the suite.
 *
 * Resolution happens within the SAME text that was passed in, which is what keeps `lightToken`
 * below honest: it hands over only the light block, so a value there must be a literal, and an
 * alias out of that block fails rather than silently resolving against the dark scope above it.
 */
function token(css: string, name: string): Rgb {
  let current = name
  for (let hop = 0; hop < 8; hop += 1) {
    const match = new RegExp(`--${current}:\\s*([^;]+);`).exec(css)
    assert.ok(match, `${current} is not declared in the stylesheet`)
    const value = (match[1] ?? '').trim()
    if (/^#[0-9a-fA-F]{3,6}$/.test(value)) return parseHex(value)
    const alias = /^var\(\s*--([A-Za-z0-9-]+)\s*\)$/.exec(value)
    assert.ok(alias, `--${current} is "${value}", which is neither a hex nor a single var()`)
    current = alias[1] ?? ''
  }
  return assert.fail(`--${name} did not resolve to a hex within 8 hops`)
}

/** A declaration inside the light-scope block of the site's own stylesheet. */
function lightToken(name: string): Rgb {
  const block = /@media \(prefers-color-scheme: light\) \{\s*:root \{([\s\S]*?)\n  \}/.exec(siteCss)
  assert.ok(block, 'the light scope is missing from src/styles.css')
  return token(block[1] ?? '', name)
}

/**
 * The percentage in a `--si-*` mix declaration, for a given mixing partner.
 *
 * Two partners are in play and they are what makes the scheme work in both directions: the accent
 * is lifted toward `var(--cf-fg)` on the dark ground and darkened toward `#000` on the light one.
 * Passing the partner in is what stops this reading the wrong declaration of the same property.
 */
function mixPercent(name: string, partner: 'var(--cf-fg)' | '#000'): number {
  const escaped = partner.replace(/[()\\-]/g, (c) => `\\${c}`)
  const match = new RegExp(
    `--${name}: color-mix\\(in srgb, var\\(--cf-accent\\) (\\d+)%, ${escaped}\\)`,
  ).exec(siteCss)
  assert.ok(match, `${name} is not declared as an srgb mix with ${partner}`)
  return Number(match[1])
}

/** The same, for a status colour, which only has a light-ground mix. */
function statusMixPercent(name: string, source: string): number {
  const match = new RegExp(
    `--${name}: color-mix\\(in srgb, var\\(--${source}\\) (\\d+)%, #000\\)`,
  ).exec(siteCss)
  assert.ok(match, `${name} is not declared as an srgb mix with black`)
  return Number(match[1])
}

/* ───────────────────────── the two grounds ────────────────────────── */

const DARK = {
  page: token(tokensCss, 'cf-ash-900'),
  raised: token(tokensCss, 'cf-ash-850'),
  sunken: token(tokensCss, 'cf-ash-950'),
  fg: token(tokensCss, 'cf-bone'),
  fgDim: token(tokensCss, 'cf-bone-dim'),
  fgMute: token(tokensCss, 'cf-khaki'),
}

const LIGHT = {
  page: lightToken('cf-bg'),
  raised: lightToken('cf-bg-raised'),
  sunken: lightToken('cf-bg-sunken'),
  fg: lightToken('cf-fg'),
  fgDim: lightToken('cf-fg-dim'),
  fgMute: lightToken('cf-fg-mute'),
}

const VIZ_GOOD = token(tokensCss, 'cf-viz-good')
const VIZ_WARN = token(tokensCss, 'cf-viz-warn')

/**
 * Every accent this site ever paints — derived from what the site SCOPES, not from a list of
 * products.
 *
 * ── This list was wrong once, and the way it was wrong is the reason it is now computed ───────
 *
 * It used to be `CLOUDSFORGE_EMBER` plus `PRODUCT_ACCENTS`, which reads as "the company colour and
 * every product's", and is a perfectly good description of a set that is not the one this file
 * needs. `PRODUCT_ACCENTS` is the six-entry bijection over `kind: 'product'`; `SCOPED_SURFACES` is
 * what `accentProps()` actually puts on an element of this site. Those two drifted apart the day
 * `pool` was scoped and again the day `exchange` was, because both are `kind: 'service'`.
 *
 * The cost was a red build and a live page. `exchange` entered the switcher with a validated lime,
 * `/products/exchange` began painting type in it, and this file did not measure it because a
 * service is not a product — so the first thing to notice was axe, in CI, on a colour that had
 * already shipped. Every gate the palette applies had passed; the one that would have caught it is
 * this one, and it was looking at the wrong set.
 *
 * So the set is now the site's own scoping list resolved through the registry, deduplicated by
 * value because several keys deliberately share a hue (`pool` with `create`, `site` and `hub` with
 * the company ember). Add a key to `SCOPED_SURFACES` and it is measured here on the next run,
 * whatever its `kind`.
 */
const ACCENTS: ReadonlyArray<{ name: string; rgb: Rgb }> = (() => {
  const byHex = new Map<string, string>([[CLOUDSFORGE_EMBER.toLowerCase(), 'ember']])
  for (const key of SCOPED_SURFACES) {
    const surface = SURFACES.find((s) => s.key === key)
    assert.ok(surface, `${key} is scoped by this site but is not in the registry`)
    const hex = surface.accent.toLowerCase()
    const seen = byHex.get(hex)
    byHex.set(hex, seen ? `${seen}/${key}` : key)
  }
  return [...byHex].map(([hex, name]) => ({ name: `${name} (${hex})`, rgb: parseHex(hex) }))
})()

/*
 * And the set above must still cover the six-product bijection, so that dropping a product from
 * SCOPED_SURFACES cannot quietly shrink what is measured here.
 */
for (const hex of PRODUCT_ACCENTS) {
  assert.ok(
    ACCENTS.some((a) => a.name.endsWith(`(${hex.toLowerCase()})`)),
    `product accent ${hex} is painted by this site but not measured; is it missing from SCOPED_SURFACES?`,
  )
}

/** Dark ground: the accent lifted toward the bone foreground so it can carry type. */
const DARK_ACCENT_MIX = mixPercent('si-accent', 'var(--cf-fg)')
const DARK_ACCENT_HOVER_MIX = mixPercent('si-accent-hover', 'var(--cf-fg)')
/** Light ground: the accent darkened toward black for the same reason. */
const LIGHT_ACCENT_MIX = mixPercent('si-accent', '#000')
const LIGHT_ACCENT_HOVER_MIX = mixPercent('si-accent-hover', '#000')
const GOOD_MIX = statusMixPercent('si-good', 'cf-viz-good')
const WARN_MIX = statusMixPercent('si-warn', 'cf-viz-warn')

/** An accent as this site actually paints TYPE in it, on each ground. */
const asDarkType = (accent: Rgb): Rgb => mix(accent, DARK_ACCENT_MIX, DARK.fg)
const asLightType = (accent: Rgb): Rgb => mix(accent, LIGHT_ACCENT_MIX, BLACK)

const TEXT_AA = 4.5
const NON_TEXT_AA = 3

function check(label: string, fg: Rgb, bg: Rgb, floor: number): void {
  const ratio = contrast(fg, bg)
  assert.ok(ratio >= floor, `${label}: ${ratio.toFixed(2)}:1, below ${floor}:1`)
}

/* ─────────────────────────────── the maths ─────────────────────────── */

describe('the contrast maths', () => {
  it('agrees with the two ratios everybody knows', () => {
    // Without this the whole file could be computing something plausible and wrong, and every
    // assertion below would pass for the wrong reason.
    assert.equal(contrast(parseHex('#ffffff'), parseHex('#000000')).toFixed(2), '21.00')
    assert.equal(contrast(parseHex('#777777'), parseHex('#ffffff')).toFixed(2), '4.48')
  })

  it('is order-independent', () => {
    const a = parseHex('#123456')
    const b = parseHex('#fedcba')
    assert.equal(contrast(a, b), contrast(b, a))
  })

  it('mixes in sRGB, which is what the stylesheet asks for', () => {
    assert.deepEqual(mix(parseHex('#ffffff'), 50, BLACK), [128, 128, 128])
    assert.deepEqual(mix(parseHex('#e8622c'), 100, BLACK), [232, 98, 44])
    assert.deepEqual(mix(parseHex('#000000'), 0, parseHex('#ffffff')), [255, 255, 255])
  })

  it('found real values in both stylesheets', () => {
    // A regex that matched nothing would make every check below a comparison of two zeroes.
    assert.notDeepEqual(DARK.page, LIGHT.page)
    for (const [name, percent] of [
      ['dark accent', DARK_ACCENT_MIX],
      ['light accent', LIGHT_ACCENT_MIX],
      ['good', GOOD_MIX],
      ['warn', WARN_MIX],
    ] as const) {
      assert.ok(percent > 0 && percent < 100, `the ${name} mix is ${percent}%`)
    }
  })
})

/* ───────────────────────────── dark ground ────────────────────────── */

describe('the dark ground', () => {
  it('sets body text well clear of AA', () => {
    check('bone on the page', DARK.fg, DARK.page, TEXT_AA)
    check('bone on a panel', DARK.fg, DARK.raised, TEXT_AA)
  })

  it('keeps the dimmed foreground readable, which is most of the prose on this site', () => {
    check('bone-dim on the page', DARK.fgDim, DARK.page, TEXT_AA)
    check('bone-dim on a panel', DARK.fgDim, DARK.raised, TEXT_AA)
    check('bone-dim in the footer', DARK.fgDim, DARK.sunken, TEXT_AA)
  })

  it('keeps the muted foreground readable, since it carries the footer and the captions', () => {
    // The most-likely-to-fail text pair in the system, and the one used for the smallest type.
    check('khaki on the page', DARK.fgMute, DARK.page, TEXT_AA)
    check('khaki on a panel', DARK.fgMute, DARK.raised, TEXT_AA)
    check('khaki in the footer', DARK.fgMute, DARK.sunken, TEXT_AA)
  })

  it('proves the RAW accents do not all clear AA here, which is why they are lifted', () => {
    /*
     * Inverted on purpose, and this is the finding that produced the dark-ground mix.
     *
     * The five product accents were validated "all above 3:1 on the panel" — the floor for a mark
     * or a control, which is what the switcher uses them for. This site sets TYPE in them, which
     * needs 4.5, and Forge Network's #d6412f measures 4.33 against the page. Close, and under.
     *
     * Asserting the shortfall means that if the registry is ever retuned so the raw accents do
     * carry type, this test fails and says so, instead of leaving a mix in place that nothing
     * needs any more.
     */
    const worst = Math.min(...ACCENTS.map((a) => contrast(a.rgb, DARK.page)))
    assert.ok(
      worst < TEXT_AA,
      `the raw accents now reach ${worst.toFixed(2)}:1 on the dark page — the lift in ` +
        'src/styles.css can be revisited',
    )
  })

  it('sets every LIFTED accent as type at AA, on the page and on a panel', () => {
    // Links, eyebrows, the rail ordinals, the card verbs. On a card the ground is the panel rather
    // than the page, and the panel is lighter, so both are checked.
    for (const accent of ACCENTS) {
      check(`${accent.name} on the page`, asDarkType(accent.rgb), DARK.page, TEXT_AA)
      check(`${accent.name} on a panel`, asDarkType(accent.rgb), DARK.raised, TEXT_AA)
    }
  })

  it('keeps the hover state at AA as well', () => {
    for (const accent of ACCENTS) {
      check(
        `${accent.name} hover`,
        mix(accent.rgb, DARK_ACCENT_HOVER_MIX, DARK.fg),
        DARK.page,
        TEXT_AA,
      )
    }
  })

  it('sets the two stage colours at AA', () => {
    check('viz-good on the page', VIZ_GOOD, DARK.page, TEXT_AA)
    check('viz-warn on the page', VIZ_WARN, DARK.page, TEXT_AA)
    check('viz-good on a panel', VIZ_GOOD, DARK.raised, TEXT_AA)
    check('viz-warn on a panel', VIZ_WARN, DARK.raised, TEXT_AA)
  })

  it('keeps the label on the company button legible against its fill', () => {
    // The one accent FILL on this site, and the only place `--cf-accent-ink` is used. Product
    // accents are drawn as outlines instead, precisely because their ink is tighter than this.
    check('ember-ink on ember', token(tokensCss, 'cf-ember-ink'), parseHex(CLOUDSFORGE_EMBER), TEXT_AA)
  })
})

/* ──────────────────────────── light ground ────────────────────────── */

describe('the light ground', () => {
  it('sets body text well clear of AA', () => {
    check('fg on the page', LIGHT.fg, LIGHT.page, TEXT_AA)
    check('fg on a panel', LIGHT.fg, LIGHT.raised, TEXT_AA)
  })

  it('keeps the dimmed and muted foregrounds readable', () => {
    for (const [name, fg] of [
      ['dim', LIGHT.fgDim],
      ['mute', LIGHT.fgMute],
    ] as const) {
      check(`${name} on the page`, fg, LIGHT.page, TEXT_AA)
      check(`${name} on a panel`, fg, LIGHT.raised, TEXT_AA)
      check(`${name} in the footer`, fg, LIGHT.sunken, TEXT_AA)
    }
  })

  /**
   * ══════════════════════════════════════════════════════════════════════════════════════════
   * THE COMPANY LOGO IN THE FOOTER (micro-org#489)
   *
   * `.cf-logo__word b` — the "Forge" of "CloudsForge" — is `var(--cf-ember)`, and until this site
   * mounted the shared footer there was no company logo on a light ground anywhere on it. The bar
   * has one and carries `.cf-dark`, which re-asserts the dark ember for itself; the footer does
   * not, so the token fell through to the root default and painted `#e8622c` on the light sunken
   * ground at 2.62:1. axe caught it as a serious violation on `/` the first time the suite ran
   * against the shared component.
   *
   * Three assertions, because the fix has three ways to come undone: the value can be deleted from
   * the light block, the ramp it copies can move in the design system, and the pairing with the
   * ink can be broken by changing either half.
   */
  it('sets the company ember as type at AA, which is the footer logo', () => {
    check('ember on the page', lightToken('cf-ember'), LIGHT.page, TEXT_AA)
    check('ember on a panel', lightToken('cf-ember'), LIGHT.raised, TEXT_AA)
    check('ember in the footer', lightToken('cf-ember'), LIGHT.sunken, TEXT_AA)
    check('ember-hover in the footer', lightToken('cf-ember-hover'), LIGHT.sunken, TEXT_AA)
  })

  it('copies the design system light ramp rather than inventing a second one', () => {
    // The light block is written as hexes because this file parses it with a regex and cannot
    // follow a `var()` into another package. That is a real cost and this is what pays it: the
    // hexes have to BE the ramp, so retuning the ramp in `tokens.css` fails here rather than
    // leaving one surface a shade off the other eighteen.
    for (const [here, there] of [
      ['cf-ember', 'cf-ember-light'],
      ['cf-ember-hover', 'cf-ember-hover-light'],
      ['cf-ember-text', 'cf-ember-light'],
      ['cf-ember-ink', 'cf-ember-ink-light'],
    ] as const) {
      assert.deepEqual(
        lightToken(here),
        token(tokensCss, there),
        `--${here} in the site's light block is no longer --${there} from the design system`,
      )
    }
  })

  it('keeps the label on the company fill legible on the light ground too', () => {
    check('ember-ink on ember', lightToken('cf-ember-ink'), lightToken('cf-ember'), TEXT_AA)
  })

  it('proves the RAW accents would fail here, which is why the mix exists', () => {
    // This assertion is inverted on purpose. It records the finding that produced `--si-accent`,
    // so that deleting the mix and going back to `var(--cf-accent)` fails a test that explains
    // itself rather than one that only says a number is too small.
    const ratio = contrast(parseHex(CLOUDSFORGE_EMBER), LIGHT.page)
    assert.ok(
      ratio < TEXT_AA,
      `the raw ember now measures ${ratio.toFixed(2)}:1 on the light page — if the light ground ` +
        'has been retuned, the mix in src/styles.css can be revisited',
    )
  })

  it('sets every mixed accent as type at AA', () => {
    for (const accent of ACCENTS) {
      const mixed = asLightType(accent.rgb)
      check(`${accent.name} mixed, on the page`, mixed, LIGHT.page, TEXT_AA)
      check(`${accent.name} mixed, on a panel`, mixed, LIGHT.raised, TEXT_AA)
    }
  })

  it('keeps the hover state at AA as well, in both directions', () => {
    // A hover colour that fails is a link that becomes unreadable at the moment the reader is
    // pointing at it.
    for (const accent of ACCENTS) {
      check(
        `${accent.name} hover, on the page`,
        mix(accent.rgb, LIGHT_ACCENT_HOVER_MIX, BLACK),
        LIGHT.page,
        TEXT_AA,
      )
    }
  })

  it('sets the two mixed stage colours at AA', () => {
    check('good mixed', mix(VIZ_GOOD, GOOD_MIX, BLACK), LIGHT.page, TEXT_AA)
    check('warn mixed', mix(VIZ_WARN, WARN_MIX, BLACK), LIGHT.page, TEXT_AA)
    check('good mixed, on a panel', mix(VIZ_GOOD, GOOD_MIX, BLACK), LIGHT.raised, TEXT_AA)
    check('warn mixed, on a panel', mix(VIZ_WARN, WARN_MIX, BLACK), LIGHT.raised, TEXT_AA)
  })

  it('keeps the focus ring and the card edge visible as non-text', () => {
    for (const accent of ACCENTS) {
      check(
        `${accent.name} mixed, as a control edge`,
        asLightType(accent.rgb),
        LIGHT.page,
        NON_TEXT_AA,
      )
    }
  })
})

/* ─────────────────────── the accent scoping itself ────────────────── */

describe('accent scoping', () => {
  it('scopes only surfaces the registry knows', () => {
    const known = new Set(SURFACES.map((s) => s.key))
    for (const key of SCOPED_SURFACES) assert.ok(known.has(key), `${key} is not a registry surface`)
  })

  it('scopes only surfaces tokens.css declares a block for', () => {
    /*
     * The failure this exists for is recorded in tokens.css itself: the operator console set
     * `data-cf-product="admin"` against a selector that did not exist and fell through to the
     * ember default in silence, wearing the company's colour by accident rather than by decision.
     *
     * A silent fallthrough here would be worse — it would make five product cards on one page all
     * draw the same colour, which is the exact defect the accent set was re-derived to fix.
     */
    const declared = new Set(
      [...tokensCss.matchAll(/\[data-cf-product='([a-z-]+)'\]/g)].map((m) => m[1]),
    )
    for (const key of SCOPED_SURFACES) {
      assert.ok(declared.has(key), `tokens.css has no [data-cf-product='${key}'] block`)
    }
  })

  it('scopes every product, so no card can fall through to the company colour', () => {
    for (const surface of SURFACES.filter((s) => s.kind === 'product')) {
      assert.ok(SCOPED_SURFACES.includes(surface.key), `${surface.key} is never scoped`)
    }
  })
})
