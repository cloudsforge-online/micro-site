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

/** The first declaration of a custom property in a stylesheet, as a hex colour. */
function token(css: string, name: string): Rgb {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`).exec(css)
  assert.ok(match, `${name} is not declared as a hex in the stylesheet`)
  return parseHex(match[1] ?? '')
}

/**
 * The light ramp, READ OUT OF THE DESIGN SYSTEM rather than out of this repository.
 *
 * This function used to parse a `@media (prefers-color-scheme: light) { :root { … } }` block in
 * `src/styles.css` — this surface's own private light theme, which was the only one in the estate.
 * @cloudsforge/ui 1.1 has a light scheme at token level, so the block is gone and the values it
 * held are now `--cf-kiln-*` and `--cf-char*` in tokens.css, available to all seventeen surfaces.
 *
 * The mapping below is the light block's own: `--cf-bg` resolves to `--cf-kiln-100`, and so on.
 * Reading the RAW ramp rather than the semantic name is deliberate — `token()` takes the first
 * declaration in the file, and the semantic names are declared for the dark scheme first.
 */
const LIGHT_RAMP: Readonly<Record<string, string>> = {
  'cf-bg': 'cf-kiln-100',
  'cf-bg-raised': 'cf-kiln-50',
  'cf-bg-sunken': 'cf-kiln-200',
  'cf-fg': 'cf-char',
  'cf-fg-dim': 'cf-char-dim',
  'cf-fg-mute': 'cf-char-mute',
}

function lightToken(name: string): Rgb {
  const raw = LIGHT_RAMP[name]
  assert.ok(raw, `${name} has no light counterpart in LIGHT_RAMP`)
  return token(tokensCss, raw)
}

/**
 * The percentage in a `--si-*` mix declaration.
 *
 * There used to be two partners — `var(--cf-fg)` on the dark ground and `#000` on the light one —
 * because `--cf-fg` was always bone and mixing toward it could only lighten. It flips with the
 * scheme now, so there is ONE declaration, one partner and one percentage, and this function no
 * longer needs to be told which of two rules to read. That collapse is the change; if a second
 * declaration ever reappears this returns the first and the assertions below stop describing what
 * the browser paints, so `found real values` pins the count as well as the value.
 */
function mixPercent(name: string): number {
  const matches = [
    ...siteCss.matchAll(
      new RegExp(`--${name}: color-mix\\(in srgb, var\\(--cf-accent\\) (\\d+)%, var\\(--cf-fg\\)\\)`, 'g'),
    ),
  ]
  assert.equal(matches.length, 1, `--${name} is declared ${matches.length} times, not once`)
  return Number(matches[0]?.[1])
}

/** Every `--cf-accent-light` hex tokens.css declares, which is what a light page actually paints. */
function lightAccents(): Rgb[] {
  const found = [...tokensCss.matchAll(/--cf-(?:accent|ember)-light: (#[0-9a-f]{6})/g)].map((m) =>
    parseHex(m[1] ?? ''),
  )
  assert.ok(found.length >= 7, `only ${found.length} light accents found in tokens.css`)
  return found
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

/**
 * The stage colours, as the chip actually paints them: the severity TEXT steps.
 *
 * `--cf-viz-good` is a CHART role, validated at 3:1 against a panel because it colours a mark. The
 * stage chip sets a word in it. That is the same distinction as `--cf-accent` against
 * `--cf-accent-text`, and 1.1 gives severity the same treatment — so `src/styles.css` points
 * `--si-good` and `--si-warn` at `--cf-good-text` / `--cf-warn-text`, and this reads those.
 */
const GOOD = token(tokensCss, 'cf-good-text')
const WARN = token(tokensCss, 'cf-warn-text')
/** Their light counterparts, declared inside the `[data-cf-scheme='light']` block. */
function lightSeverity(name: 'good' | 'warn'): Rgb {
  const block = /\[data-cf-scheme='light'\] \{([\s\S]*?)\n\}/.exec(tokensCss)
  assert.ok(block, "the [data-cf-scheme='light'] block is missing from tokens.css")
  return token(block[1] ?? '', `cf-${name}-text`)
}

/** Every accent this site ever paints: the company's, plus the five products'. */
const ACCENTS: ReadonlyArray<{ name: string; rgb: Rgb }> = [
  { name: 'ember', rgb: parseHex(CLOUDSFORGE_EMBER) },
  ...PRODUCT_ACCENTS.map((hex, i) => ({ name: `product ${i + 1} (${hex})`, rgb: parseHex(hex) })),
]

/** The one mix, which lightens on the dark ground and darkens on the light one. */
const ACCENT_MIX = mixPercent('si-accent')
const ACCENT_HOVER_MIX = mixPercent('si-accent-hover')

/** An accent as this site actually paints TYPE in it, on each ground. */
const asDarkType = (accent: Rgb): Rgb => mix(accent, ACCENT_MIX, DARK.fg)
const asLightType = (accent: Rgb): Rgb => mix(accent, ACCENT_MIX, LIGHT.fg)

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
      ['accent', ACCENT_MIX],
      ['accent hover', ACCENT_HOVER_MIX],
    ] as const) {
      assert.ok(percent > 0 && percent < 100, `the ${name} mix is ${percent}%`)
    }
    // The light palette must actually differ from the dark one, or every light assertion below is
    // measuring the dark ground twice.
    assert.notDeepEqual(GOOD, lightSeverity('good'))
    assert.notDeepEqual(lightAccents()[0], parseHex(CLOUDSFORGE_EMBER))
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
        mix(accent.rgb, ACCENT_HOVER_MIX, DARK.fg),
        DARK.page,
        TEXT_AA,
      )
    }
  })

  it('sets the two stage colours at AA', () => {
    check('good on the page', GOOD, DARK.page, TEXT_AA)
    check('warn on the page', WARN, DARK.page, TEXT_AA)
    check('good on a panel', GOOD, DARK.raised, TEXT_AA)
    check('warn on a panel', WARN, DARK.raised, TEXT_AA)
  })

  it('keeps the label on the company button legible against its fill', () => {
    // The one accent FILL on this site, and the only place `--cf-accent-ink` is used. Product
    // accents are drawn as outlines instead, precisely because their ink is tighter than this.
    // `-dark` because 1.1 splits the ember family per scheme: `--cf-ember-ink` is now the mapping
    // and `--cf-ember-ink-dark` is the hex. The registry ember is the DARK one, so this pairs the
    // two values the browser actually composites on a dark page.
    check('ember-ink on ember', token(tokensCss, 'cf-ember-ink-dark'), parseHex(CLOUDSFORGE_EMBER), TEXT_AA)
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

  it('sets every LIGHT-SCHEME accent as type at AA, raw and mixed', () => {
    /*
     * The set is `--cf-accent-light`, not the registry accents. That is the change 1.1 makes to
     * this file: the light palette is no longer the dark hexes with a local correction applied on
     * top, it is a derived set of its own, and the design system's own suite measures it on every
     * ground it composes text on. What is checked HERE is the extra step this surface adds — the
     * `--si-accent` mix a scoped card paints its type in — on this surface's own two grounds.
     */
    for (const accent of lightAccents()) {
      const label = `#${accent.map((v) => v.toString(16).padStart(2, '0')).join('')}`
      check(`${label} raw, on the page`, accent, LIGHT.page, TEXT_AA)
      check(`${label} mixed, on the page`, asLightType(accent), LIGHT.page, TEXT_AA)
      check(`${label} mixed, on a panel`, asLightType(accent), LIGHT.raised, TEXT_AA)
    }
  })

  it('keeps the hover state at AA as well, in both directions', () => {
    // A hover colour that fails is a link that becomes unreadable at the moment the reader is
    // pointing at it. On a light ground the SAME mix darkens, because --cf-fg is the dark ink here.
    for (const accent of lightAccents()) {
      check('hover, on the page', mix(accent, ACCENT_HOVER_MIX, LIGHT.fg), LIGHT.page, TEXT_AA)
    }
  })

  it('sets the two stage colours at AA', () => {
    for (const name of ['good', 'warn'] as const) {
      const colour = lightSeverity(name)
      check(`${name} on the page`, colour, LIGHT.page, TEXT_AA)
      check(`${name} on a panel`, colour, LIGHT.raised, TEXT_AA)
    }
  })

  it('keeps the focus ring and the card edge visible as non-text', () => {
    for (const accent of lightAccents()) {
      check('as a control edge', asLightType(accent), LIGHT.page, NON_TEXT_AA)
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
