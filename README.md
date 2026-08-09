# micro-site

[![ci](https://github.com/cloudsforge-online/micro-site/actions/workflows/ci.yml/badge.svg)](https://github.com/cloudsforge-online/micro-site/actions/workflows/ci.yml)
![licence](https://img.shields.io/badge/licence-MIT-97CA00)
![node](https://img.shields.io/badge/node-%3E%3D22-5FA04E?logo=node.js&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![module](https://img.shields.io/badge/module-ESM-F7DF1E?logo=javascript&logoColor=black)
![tests](https://img.shields.io/badge/tests-headless%20Chromium-2EAD33?logo=googlechrome&logoColor=white)

The CloudsForge marketing site. What the platform is, what each product does, and — on a page of
its own, linked from the front door — what is actually built.

It is the second frontend cut from [`micro-web-template`][template], after
[`micro-hub-web`][hub-web], and it is the public face of a platform that custodies other people's
money. That second fact is what makes it different from the site it replaces.

[template]: https://github.com/cloudsforge-online/micro-web-template
[hub-web]: https://github.com/cloudsforge-online/micro-hub-web

---

## The idea

**A document of record, not a landing page.**

The company's own vision document names honest copy as an asset and says, in as many words,
"protect it". The estate it describes has a shop that sold a private world and provisioned nothing,
a site that went on claiming a coin credited at the chain tip for however long it took somebody to
notice, and a product list maintained by hand in eight places. Every one of those is a marketing
failure before it is an engineering one: the copy went out ahead of the code and nothing anywhere
held the two together.

So this site is built the other way round. The copy is data, the data is tested, and the two
strongest pages on the site are the ones most companies would not publish:

- **`/platform`** reproduces the eleven statements that define "one platform" — in full, including
  the ones that are not true yet, because a definition you only publish once you pass it is not a
  definition.
- **`/build`** says that nothing is deployed. It says it at the top, and the footer of every page
  says it again.

That is not modesty. It is the only position from which the rest of the site can be believed.

---

## The rules, and the tests that hold them

| Rule | What enforces it |
| --- | --- |
| A digit may not appear in copy unless it is registered, with a source | `src/content/claims.ts` + `test/content.test.ts` |
| No price, percentage, currency symbol or basis-point rate, anywhere | `test/content.test.ts` |
| No hostname, URL or port in copy; every link resolves through the registry | `test/content.test.ts`, and a grep in CI |
| The product pages and the surface registry are the same set | `test/content.test.ts` |
| No legal section is invented; undrafted ones are visibly marked | `src/content/legal.ts` + `test/legal.test.ts` |
| This repository's own source fetches nothing from a third-party host | `test/legal.test.ts` + a grep in CI |
| What the design system's consent banner actually does is what the privacy notice says it does | `test/legal.test.ts`, against `@cloudsforge/ui` |
| Every text pair clears WCAG AA on both grounds, computed | `test/contrast.test.ts` |
| An unknown address answers 404, not 200 | `nginx.conf` + `test/routes.test.ts` + the image probe in CI |
| Nothing in the bundle knows which environment it is in | `test/no-build-time-config.test.ts` + a grep in CI |

### No invented numbers

`src/content/claims.ts` is a register. Every number the site prints is an entry in it with a
citation, copy interpolates `claim('emberConfirmations')` rather than typing `60`, and
`test/content.test.ts` walks every published string, extracts every run of digits and fails on any
token that is not registered.

**There are no prices on this site**, and that is a finding rather than an omission. Three figures
from the monetisation model were checked against the services that now implement them before this
site was written, and all three had drifted:

| The model says | The code says |
| --- | --- |
| Three deployment tiers, 1,500 / 4,000 / 9,000 Shards | one price, `MINT_DEPLOY_PRICE_SHARDS`, defaulting to 2,500 |
| A 200 bps conversion spread | `PRICING_CONVERSION_SPREAD_BPS` defaults to 100 |
| A 15% performance fee | the rate is per-bot (`bot.feeBps`), not a platform number |

A price that is wrong on a marketing site is a price a customer quotes back at support, and they
are right to. So the site publishes what is **free** — a policy of the platform rather than a value
in a config file — and says plainly that prices are not published yet.

There are no user counts, no uptime figures and no testimonials, for the simpler reason that
nothing is deployed and every such number would be either zero or invented.

### The legal pages are honest about being unfinished

Every section carries a status. `stated` means it describes how the system is built and an engineer
can be held to it; those are written out. `counsel` means it creates or limits a legal obligation;
those carry **no body text at all** and render as a visibly dashed hole with a note saying what
belongs there.

The tests make each of those mean something: a `counsel` section may not acquire prose, a `stated`
one may not be empty, and the incomplete notice cannot be removed while anything is outstanding. A
plausible paragraph of terms is worse than an empty one — it reads as though somebody with
authority to bind the company wrote it.

---

## The visual direction

Ember on ash, set like something that expects to be read and cited. Four devices, and only four:

1. **The ridge.** Every brand mark in the system is drawn over a ground line, including the
   company's own. The site repeats it as its section divider — inline SVG, no image request — which
   ties a page of prose to a 24-pixel switcher glyph.
2. **One ember wash**, in the hero only, from `--cf-accent-glow`. A gradient on every section is a
   gradient nobody sees.
3. **Accent scoping.** The page wears the company ember. Each product card, rail step and status
   row carries `data-cf-product`, so five accents are live on one page and the chrome stays
   company-coloured. Nothing in the source names a product hex.
4. **The stage chip.** Glyph, word and colour — three channels, never one.

No font is loaded from outside CloudsForge. The three faces `--cf-font-display`, `--cf-font-sans`
and `--cf-font-mono` name are declared in `@cloudsforge/ui`'s `tokens.css` and served as `.woff2`
from this site's own `/assets`, each with a system fallback behind it, so a reader's browser never
asks anybody else for type. That is what the privacy notice means by "no external font" — the
privacy-relevant property is where the request goes, not whether a face is downloaded at all.

**The one thing this site does fetch from outside CloudsForge, and only on a reader's say-so, is
Google Analytics.** The shared consent banner loads it if, and only if, a reader accepts; nothing
is fetched and no analytics cookie is set before that. The notice says so, in the section on
cookies. `test/legal.test.ts` holds that section to `@cloudsforge/ui` rather than to this
repository's source, because reading only this repository's source is what let the two drift apart:
the cookie and the tag live in the design system, the scan below never saw them, and the notice
went on saying there were no cookies anywhere (micro-org#313).

### Contrast, computed rather than eyeballed

`test/contrast.test.ts` reads the token values out of `tokens.css` and `styles.css`, applies the
`color-mix` declarations exactly as a browser would, and computes every pair the site paints. It
found two things:

- **On the light ground**, the company ember measures **2.99:1** — failing not just the 4.5:1 a
  link needs but the 3:1 a non-text control needs.
- **On the dark ground**, Forge Network's `#d6412f` measures **4.33:1** as type. The five accents
  were validated "all above 3:1 on the panel", which is the floor for a *mark*; this site sets type
  in them.

So `--si-accent` is the accent adjusted for the ground it is on — lifted 12% toward the bone
foreground on dark, darkened 32% toward black on light. It is a derived role, not a change to the
registry: the raw accents still govern the fills, the glow and the marks, and the switcher's
colour-separation guarantee is untouched. Both shortfalls are asserted *inverted* in the test, so
if the registry is ever retuned the test says the mix can be removed rather than leaving it in
place forever.

There is a light theme, and it is the sanctioned one: the semantic tokens are overridden and the
ash and bone ramps are left alone, which is exactly what `tokens.css` instructs a host that wants
one to do. The shared bar stays dark — it carries `.cf-dark` and re-asserts the semantic layer for
itself — and reads as a deliberate dark chrome band rather than as a bug.

---

## Running it

```sh
pnpm install
pnpm dev                      # http://localhost:5170
```

```sh
pnpm typecheck && pnpm test && pnpm build
```

`pnpm dev` serves on **5170**, not the template's 5180. The thing you do while developing a
marketing site is run it next to one of the surfaces it links to — usually Forge Hub, which took
the template's port unchanged — and two Vite servers on one port is a five-minute confusion where
the second silently picks 5181 and every link lands on the first.

```sh
# The `uipkg` context is temporary — see "The one temporary thing".
docker build -t site --build-context uipkg=../ui --build-arg RELEASE="$(git rev-parse --short HEAD)" .
docker run --rm -p 9300:8080 site

curl -si localhost:9300/                 | head -1   # HTTP/1.1 200 OK
curl -si localhost:9300/products/worlds  | head -1   # HTTP/1.1 200 OK
curl -si localhost:9300/products/pay     | head -1   # HTTP/1.1 404 Not Found  ← the point
curl -si localhost:9300/robots.txt       | head -1   # HTTP/1.1 200 OK
```

---

## What is here

| Path | What it is |
| --- | --- |
| `/` | The positioning line, the loop, the five products, and where the state of it is written down |
| `/products` | The control centre and the five products, each with its stage |
| `/products/<key>` | One surface: what it is, what it refuses to do, and where it stands |
| `/platform` | The eleven statements, what is free forever, and why there are no prices |
| `/build` | What is built, surface by surface, and the fact that none of it is deployed |
| `/about` | The eight tie-breakers, and the four refusals |
| `/terms`, `/privacy` | Drafted where the answer is engineering; visibly marked where it is not |
| anything else | A real 404, listing everything that does exist |

### Files worth knowing

| File | What it is |
| --- | --- |
| `src/content/claims.ts` | The numbers register. Nothing may print a digit that is not here. |
| `src/content/products.ts` | The six product pages, as data. `stage` and `stageNote` are the point. |
| `src/content/pages.ts` | Everything else the site says. |
| `src/content/legal.ts` | The legal pages, and the `stated`/`counsel` distinction. |
| `src/lib/routes.ts` | The one declaration the navigation, the footer and `nginx.conf` all answer to. |
| `src/lib/meta.ts` | Per-route title, description, canonical and card, as a pure function. |
| `src/components/parts.tsx` | The ridge, the stage chip, the accent scope, the page furniture. |
| `nginx.conf` | The SPA fallback that keeps its 404. |

---

## Weight

Measured on the current build:

| | Raw | Gzipped |
| --- | ---: | ---: |
| JavaScript | 314.7 kB | **100.0 kB** |
| CSS | 31.5 kB | 6.4 kB |
| `index.html` | 3.6 kB | 1.6 kB |

Attributed by source bytes, that is 48% `react-dom`, 32% `react-router`, 18% this site's own code
and content, and 2% React and the scheduler. **Four fifths of the bundle is the framework the
estate has standardised on**, and the two thirds of that which is the router is not a choice this
repository gets to make: it is the template's idiom, `micro-hub-web` uses it, and a second routing
library in the estate would be worth more than the bytes it saved.

Route-level code splitting was considered and rejected. The pages here are small — all six product
pages together are under 20 kB of source — so splitting would move a few kilobytes out of the first
request in exchange for a network round trip on every navigation, on a site whose pages are meant
to be read in sequence.

CI fails the build at 140 kB gzipped. That is a ceiling rather than a target: it catches something
large being added without anybody deciding to add it, which is the way a bundle actually grows.

Sourcemaps are emitted and served, inherited from the template. They are what lets an error report
from the browser name a line rather than a minified offset.

---

## Testing

`node:test`, no DOM, **185 tests across nine files**.

| File | What it pins |
| --- | --- |
| `test/content.test.ts` | The copy walk; every digit registered with a source; no orphan claims; no URL, port, price, percentage or placeholder; the product pages and the registry as one set; every card image on disk. |
| `test/meta.test.ts` | Titles and descriptions for every address, distinct and inside budget; trailing-slash normalisation; the canonical of a 404 being the address asked for; `og:` as `property` and the rest as `name`; unknown products and third segments treated as unknown. |
| `test/routes.test.ts` | The route declaration, `app.tsx` and `nginx.conf` checked against each other in both directions; the enumerated product slugs against `PRODUCT_PAGES`; the catch-all; that nothing is behind a session gate; the two cache rules in the right order. |
| `test/contrast.test.ts` | Real WCAG ratios for every text and non-text pair on both grounds, computed from the stylesheets, including the two shortfalls that produced `--si-accent`. |
| `test/legal.test.ts` | Undrafted sections carry no prose and a real brief; drafted ones are never empty and make no undertaking; the notice survives; the privacy claim about third-party requests and fonts, checked against this repository's source — and the cookie and analytics claims checked against `@cloudsforge/ui`, which is where the banner, the cookie and the Google tag actually live and is the seam the source scan cannot see. |
| `test/api.test.ts` | Inherited. Token storage, the memory fallback, one refresh for ten concurrent 401s, the request id on the error, 403 marked forbidden, and the auth code stripped from the address bar *before* the exchange is sent. |
| `test/hosts.test.ts` | Inherited. Localhost to dev ports, apex derived from a subdomain, an unknown prefix left alone, same-origin versus cross-origin. |
| `test/obs.test.ts` | Inherited. The queue bound drops the oldest; the envelope stamps the page. |
| `test/no-build-time-config.test.ts` | Inherited. No `VITE_`, no build-time environment object, no `define`, no `envPrefix`, no `.env` file. |

**There is deliberately no jsdom.** It is a second browser implementation to keep current, it
disagrees with real browsers in exactly the places that matter, and a test that renders a component
in it proves the component renders in jsdom. What is tested here is the layer that decides things:
which page an address resolves to, what its title is, whether a number is allowed on the page, and
whether a colour is legible.

### What is not covered here

- **Rendering.** Every component in `src/components` and `src/pages`. The data they read is tested;
  the markup is not.
- **`applyMeta`.** The tag construction is tested; the four lines that write it into `document` are
  not.
- **nginx.** Verified by `curl` against the built image in CI, and by the grep. Not by `pnpm test`.
- **The light theme as rendered.** The ratios are computed; whether the page looks right in it is
  not something a test can answer.

---

## Two things that are known and unfixed

**Per-route Open Graph cards are not seen by link-preview fetchers.** This is one `index.html`, so
titles and descriptions are applied by script on navigation. Browsers and the crawlers that execute
JavaScript see them; the preview fetchers used by chat and social clients generally do not, and
will render the site-level card for every address. Fixing it properly means emitting one
pre-rendered HTML file per route and teaching nginx to serve it, which pulls against the enumerated
routes that make an unknown address answer 404. The trade has not been made, and the reason is
written at the top of `src/lib/meta.ts` so the next person makes it deliberately rather than
discovering the gap in a link preview.

**There is no sitemap.** A sitemap must carry absolute URLs, which means naming a hostname, and
nothing built in this repository is allowed to name one — the same image is served from localhost,
from a preview deployment and from the apex. It belongs to whatever terminates TLS for the apex,
which is the one component that knows what the apex is. `robots.txt` says so.

---

## What was found upstream

Cutting this site turned up a third defect in `micro-web-template`, after the two `micro-hub-web`
found. Fixed there in **`a868231`**:

> **CI checks out a repository that does not exist.** The second checkout in both the `build` and
> `image` jobs names `cloudsforge/ui`. The design system lives at `cloudsforge-online/micro-ui` —
> a different organisation *and* a different repository name — and `cloudsforge/ui` resolves to
> nothing. The checkout fails, so `pnpm install --frozen-lockfile` has no sibling directory for the
> `link:../ui/packages/ui` specifier to resolve against, and the Docker build has no `uipkg`
> context. Both jobs failed on the pristine template, on every push.

It is the second defect of its *kind*: it survived because both frontends cut from the template
fixed the value locally on the way past, so every consumer works while the source everyone copies
stays wrong. `micro-hub-web` already carried the correct value; nothing carried it back.

### And one found in this repository, by running it

`nginx.conf`'s route block was first written as a prefix, `^/(products|platform|…)(/|$)`, which
serves the app shell for **everything** under `/products/`. So `/products/pay` answered `200 OK`:
React rendered the not-found page inside it and the status line said success — the exact failure
the whole configuration exists to prevent, in the one place nobody would have looked.

`/products/pay` is not a hypothetical address. Forge Pay was a destination in the previous estate
and is now a page inside Forge Hub, so it is precisely what an old link or an old bookmark carries.

It was found by building the image and probing it, not by reading the file, and not by any test —
which is why the product slugs are now enumerated in `nginx.conf`, checked against `PRODUCT_PAGES`
in both directions by `test/routes.test.ts`, and probed by name in CI.

One more thing worth recording, which is **not** a defect and was investigated as though it were:
the production bundle contains react-router's development warning strings. `react-router@7.18.2`
ships `dist/development` and `dist/production` directories whose contents are byte-for-byte
equivalent apart from one character, and its `exports` map contains no `production` condition at
all — so every bundler gets the same file. There is nothing to configure here.

---

## The one temporary thing

`@cloudsforge/ui` is consumed as `link:../ui/packages/ui` because it is not published yet. Three
places carry that, and all three are marked:

- `package.json` — the `link:` specifier
- `Dockerfile` — the `uipkg` named build context, and the copy of the design system's
  `tsconfig.base.json` that esbuild needs
- `.github/workflows/ci.yml` — the second checkout, and the sibling directory layout

When the package is published, all three become a registry version and nothing else here changes.

---

## Adding a product

1. Add it to the registry in `@cloudsforge/ui` — the name, the accent, the verb, the blurb, the
   subdomain and the port.
2. Add a block to `PRODUCT_PAGES` in `src/content/products.ts`, with a `stage` and a `stageNote`
   that says something specific.
3. Drop a card into `public/og/<key>.png`.
4. Add a `[data-cf-product='<key>']` block to `tokens.css` if the registry entry is new.

That is all. The grid, the footer, the 404's list, the build page's table, the routes and the
metadata are all derived — and if you miss step 2, 3 or 4, a test tells you which one.

---

## Provenance

The code in this repository was written by **Claude Opus 5** and **Claude Fable 5**, assets
generated with **FLUX 2 Pro**, under human direction and review.
