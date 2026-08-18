/**
 * How far along a surface is — the vocabulary, and the evidence each value is assigned from.
 *
 * ══════════════════════════════════════════════════════════════════════════════════════════════
 * THIS REPLACES A THREE-VALUE SCALE, AND THE ARGUMENT AGAINST GROWING IT IS WORTH ANSWERING.
 *
 * What was here read `'built' | 'in-build' | 'not-built'`, with this beside it:
 *
 *   "Three values, not five. A scale with more steps invites the halfway-house label that means
 *    nothing — the estate has already learned that 'in progress' and 'nearly done' are the same
 *    status reported twice."
 *
 * That argument is correct and it is not an argument against this file, because it is an argument
 * about a DIFFERENT AXIS. "In progress" and "nearly done" are both estimates of how much work is
 * left; neither can be checked, so a scale made of them gets longer without getting more truthful,
 * and the extra rungs are where the flattery goes.
 *
 * Every value below instead names an EVENT THAT EITHER HAPPENED OR DID NOT:
 *
 *   * are its containers in `deploy/compose/docker-compose.estate.yml`?
 *   * does `beacon/src/browser/smoke.ts` drive a real browser at it through the real gateway?
 *   * is there an address on the public internet?
 *
 * So the scale is still three values. What changed is that they are now three THRESHOLDS instead
 * of three degrees of doneness — which is the fix, because the old scale was short AND wrong: six
 * of seven surfaces sat on "Being built" while every one of them was deployed, healthy, and walked
 * by the smoke tier in a real browser.
 *
 * ── There is deliberately no "not built" and no "being built" ─────────────────────────────────
 *
 * A four-value draft of this file carried one, and it was cut when the thing it was reserved for
 * turned out not to need it. The self-custody wallets were the candidate — the owner's own reading
 * was that they are the one part still being built — and every one of the four repositories
 * behind them is CI-green, builds a real artefact, and carries a test suite that fails rather than
 * skips. They are not being built. They are built and not shipped, which is `tested`, and saying
 * "being built" would have been the same class of error as the one this file exists to fix, just
 * in the direction that happens to sound humble.
 *
 * A value nothing can be is a value somebody will eventually reach for because it is there. If
 * something genuinely unstarted is ever published on this site, the honest move is to add the
 * value back in the same commit as the thing — not to keep a slot warm for it.
 *
 * ── The failure this vocabulary is designed against ───────────────────────────────────────────
 *
 * A single word "Built" is the danger, not the shortage of words. A chip reading "Built" on a
 * crypto platform's marketing site is read as "live, and I may sign up", and a reader who acts on
 * that reading has been misled by a word that was technically true.
 *
 * ── `open` HAS MEMBERS NOW, AND THAT IS THE CHANGE THIS FILE WAS BUILT TO SURVIVE ─────────────
 *
 * What used to be here read "**Nothing here serves the public.** The services run composed against
 * real databases, the chain is a testnet on one machine, and no surface has a user who is not the
 * owner." Every clause of that is now false. On 2026-08-05 the estate went public: the surfaces
 * below answer on the public internet under a publicly trusted certificate.
 *
 * The design held. `open` was defined from the start as an EVENT — "is there an address on the
 * public internet?" — so the fix was to derive that event rather than to re-label anything. The
 * labels, the glyphs and the meanings of `tested` and `running` are untouched.
 *
 * **What being `open` does NOT assert**, and the reason the meaning below says so out loud: not
 * that the surface is finished, not that it is load-bearing, not that anyone has used it, and
 * emphatically not that EMBER is worth anything. The estate is one home server behind a tunnel,
 * with no redundancy and no scheduled backup that has ever run. "Open" means a stranger can reach
 * it, which is the weakest of the three claims to make and the only one that can be checked from
 * outside — see `test/public-endpoints.test.ts`, which fetches every address published here.
 *
 * So no label is a bare past participle. Each is a phrase that says where the thing IS:
 * "Built, not shipped" → "Running in-house" → "Reachable from outside". A stranger reading only
 * the chip gets the right idea, which is the only test a status label has to pass. The last of
 * those read "Open to the public" until micro-org#486; see the note on `STAGE_LABEL` below.
 *
 * "Not shipped" rather than "not deployed" because the scale has to fit two shapes of thing. A
 * service is deployed; a desktop application, a browser extension and a phone application are
 * released. "Shipped" is the word that covers both and is false for both until somebody outside
 * the project can get hold of it.
 *
 * ── Colour is never the only channel, and neither is the glyph ────────────────────────────────
 *
 * The scale carries three independent channels: a fill ramp (◐ ◕ ●), a phrase, and a colour. The
 * glyphs are a monotone progression rather than three unrelated symbols, so their ORDER is legible
 * even to a reader who cannot resolve the difference between two of them; the phrase is the
 * channel that carries the meaning; and the colour is the one that carries none of it alone.
 * `STAGE_MEANING` below is rendered in full in the legend on the build page — the scale explains
 * itself on the page rather than in this comment.
 */

/**
 * The three states, in order.
 *
 * `'open'` used to have no member, and the note here said so: "A scale whose top rung is the one
 * everybody is standing on tells a reader nothing about how far there is to go … and will keep
 * asserting that until there is a public address to point at."
 *
 * There is a public address to point at now, so the assertion inverted rather than being deleted.
 * `test/estate-stages.test.ts` no longer asserts `open` is empty; it derives membership from
 * `PUBLIC_AT` below against the estate's own tunnel configuration, IN BOTH DIRECTIONS — a surface
 * published as `open` without a public hostname fails, and so does a surface that has one and is
 * still published as `running`. The second direction is the one that matters, because an
 * understated claim is never investigated.
 */
/**
 * `planned` is the value the header above promised to add "in the same commit as the thing", and
 * this is that commit: Forge Exchange (2026-08-14, docs/ecosystem/39 in micro-docs). It names an
 * event exactly as the other three do — is there a published plan, and does NOTHING run? — and it
 * is guarded in the same direction: `test/estate-stages.test.ts` fails if a surface published as
 * `planned` ever appears in the deployment file, the smoke tier or the public tunnel, because at
 * that moment the honest chip is one of the other three.
 */
export type Stage = 'tested' | 'running' | 'open' | 'planned'

/** Most finished first. The build page sorts by this, and the legend reads in this order. */
export const STAGE_ORDER: readonly Stage[] = ['open', 'running', 'tested', 'planned']

/**
 * The chip's words. Never a bare participle — see the header for why "Built" alone is a lie.
 *
 * ── `open` READ "Open to the public" UNTIL micro-org#486 ──────────────────────────────────────
 *
 * The owner asked for that phrase off every surface, and the reason given for the site's own
 * footer heading was that it "states something already obvious from the fact that the visitor is
 * looking at the page". On this chip it was never obvious — the chip's whole job is to separate
 * the surfaces a stranger can reach from the ones they cannot — so what was owed here was the
 * same fact in words that do not carry the objection.
 *
 * "Reachable from outside" is that fact, and it is deliberately the mirror of the rung below it:
 * `running` is "Running in-house", `open` is "Reachable from outside", and the two now read as the
 * two ends of one axis rather than as two unrelated phrases. Nothing about the SCALE moved —
 * `test/estate-stages.test.ts` derives membership from the estate's public tunnel exactly as
 * before, in both directions, and this rename touched no derivation.
 *
 * "Outside" is defined a few lines down, in `STAGE_MEANING.open`, which the build page renders in
 * full as the legend: there is an address on the public internet and a stranger can open it.
 */
export const STAGE_LABEL: Readonly<Record<Stage, string>> = {
  tested: 'Built, not shipped',
  running: 'Running in-house',
  open: 'Reachable from outside',
  // Not "not built": the honest word for a surface whose primitives may already exist and pass a
  // suite — which is true of the first page to wear this chip — while nothing is deployed anywhere.
  planned: 'Planned, not deployed',
}

/**
 * A glyph per stage, so the three are separable without colour.
 *
 * A fill ramp rather than three unrelated marks: a reader who cannot tell ◐ from ◕ at a glance can
 * still tell that one is fuller than the other, which is the property that matters.
 */
export const STAGE_GLYPH: Readonly<Record<Stage, string>> = {
  tested: '◐',
  running: '◕',
  open: '●',
  // The empty end of the same fill ramp, which is the honest place for a plan.
  planned: '○',
}

/**
 * What each stage actually asserts, in a sentence, rendered in the legend.
 *
 * These are the definitions `test/estate-stages.test.ts` implements. If a sentence here and the
 * derivation there disagree, the sentence is the one a reader believed, so the test is written to
 * fail rather than the sentence to be quietly widened.
 */
export const STAGE_MEANING: Readonly<Record<Stage, string>> = {
  tested:
    'The code exists and its own tests pass, and nothing runs it where a person could reach it. Passing your own tests is not the same as having been run alongside everything else.',
  running:
    'Deployed in the estate and reached by a real browser through the real gateway, intercepting nothing. It has no address on the public internet.',
  open: 'There is an address on the public internet and a stranger can open it. That is all this says: not that it is finished, not that it has been used, and not that anything on it is worth money. It runs on one machine with no failover.',
  planned:
    'A design exists in public — an engineering document and an issue anyone can read — and nothing is deployed: no service in the estate, no address that answers, nothing a stranger can open. Parts of it may already be written and pass their own tests; the page says which, and none of them is running.',
}

/**
 * What has to be true, in the estate, for a surface to be called `running`.
 *
 * ── This is a claim, so it is derived rather than asserted ────────────────────────────────────
 *
 * Each entry names the compose services that make the surface work. `test/estate-stages.test.ts`
 * opens `deploy/compose/docker-compose.estate.yml` and requires every one of them to be a declared
 * service, and opens `beacon/src/browser/smoke.ts` and requires the surface key to be in
 * `SMOKE_SURFACES`. A surface missing either cannot be published as `running`, whatever this file
 * says about it.
 *
 * Both halves are load-bearing and neither is sufficient. A container declared in compose proves
 * something was meant to run; only the smoke tier — which drives real Chromium through the real
 * gateway and fails structurally if a request intercept ever appears in it — proves a person could
 * have opened it. The estate has already shipped surfaces that were deployed, healthy by their own
 * probe, and completely unstyled in a browser.
 *
 * The service names are NOT guessed from the surface key. `create` is served by `mint` and
 * `mint-web`, and `network` by `network-site` rather than by anything called network — a rule that
 * derived the name from the key would have been wrong on two of seven and right for the wrong
 * reason on the rest.
 */
/**
 * The self-custody wallet repositories, which are `tested` and must never become `running`.
 *
 * Declared so the floor under them is derived rather than asserted: `test/estate-stages.test.ts`
 * requires that none of these is a service in the estate's deployment file and that none is a
 * surface the smoke tier drives. They cannot be published as running while that holds, which is
 * the direction the guard needs to point — the risk with these is overstatement, exactly as it was
 * with the seven surfaces above.
 *
 * **`wallet` is not on this list and must never be added to it.** `wallet` is the CUSTODIAL wallet
 * service, it is a container in the estate, and it is a different thing that happens to share a
 * noun. The two make opposite promises about who holds the keys, so conflating them on a marketing
 * page would be the most expensive possible naming mistake.
 */
export const SELF_CUSTODY_REPOS: readonly string[] = [
  'hearth-wallet-core',
  'wallet-desktop',
  'wallet-extension',
  'wallet-mobile',
]

/**
 * The surfaces that answer on the public internet. The evidence for `open`, and nothing else.
 *
 * ── KEYS, NOT HOSTNAMES, AND THE FIRST DRAFT GOT THIS WRONG ───────────────────────────────────
 *
 * This was a `Record<key, hostname>` and CI rejected it, correctly. The estate's rule — stated in
 * the header of `src/lib/hosts.ts` and enforced by a grep over the whole of `src` — is that a
 * literal hostname anywhere in this repository is a SECOND, UNVERSIONED COPY of the surface
 * registry, and the copy is always the one that ends up wrong. A map of seven hostnames was
 * exactly that, on the one surface that holds more outbound links than any other.
 *
 * So this is a list of registry keys. The hostname is derived where it is needed, in the tests,
 * from `surface(key).subdomain` and an apex read out of the estate's own tunnel configuration —
 * so there is one source for what a surface is called and this file is not it.
 *
 * ── A key earns its place here by being checked twice, and neither check is sufficient ────────
 *
 *   * STATICALLY — `test/estate-stages.test.ts` requires the derived name to appear as a
 *     `hostname:` in `deploy/cloudflared/config.mainnet.public.yml`. That file is what CAUSES the
 *     address to exist, so it is a source rather than a description of one.
 *   * OVER THE NETWORK — `test/public-endpoints.test.ts` fetches it, and it must answer 200 on a
 *     certificate the public already trusts. A documented endpoint that does not answer fails the
 *     build rather than waiting for somebody to notice.
 *
 * The tunnel config proves the address was MEANT to exist; only the fetch proves it does. The
 * estate ships one configured hostname with no DNS record behind it (`worlds-api`) and one that
 * answers 502 (`api`) — neither is on this list, and neither would survive being added to it.
 *
 * ── The mainnet tunnel only ───────────────────────────────────────────────────────────────────
 *
 * The testnet tunnel declares a parallel set of names — `hub-testnet`, `market-testnet`, and the
 * bare environment label for this very page — and none of them may appear on this list. The reason
 * is that they are A DIFFERENT ENVIRONMENT. A reader told a product is "Open to the public" and
 * sent to a testnet address is being shown a rehearsal: throwaway money, a chain that gets reset,
 * and nothing on the card that says so.
 *
 * That is a WEAKER reason than the one recorded here until 2026-08-05, and the difference is worth
 * writing down because it moved a guarantee out of this file's reach. Testnet used to be an apex
 * PREFIX — `hub.testnet.<apex>` — and Cloudflare's Universal SSL certificate is a SINGLE-LABEL
 * wildcard, so every two-label testnet name failed the TLS handshake at Cloudflare's edge before a
 * request reached the estate at all. Testnet was configured and unreachable, and any testnet name
 * published here would have been caught by the network tier below simply by refusing to connect.
 * Covering two labels needs Advanced Certificate Manager, which is paid and is not bought, so the
 * environment moved to a SUFFIX ON THE SUBDOMAIN instead. Those names are one label deep, the
 * certificate that already exists covers them, and they answer. A testnet address published here
 * would now return 200 and sail through the fetch; what refuses it is `test/estate-stages.test.ts`
 * reading the environment out of the first label.
 *
 * Configured is still not reachable — `worlds-api` and `api` above are the standing proof — and
 * that gap remains the reason this list is checked over the network as well as on disk.
 */
export const PUBLIC_SURFACES: readonly string[] = [
  'hub',
  'network',
  'create',
  'trade',
  'foresight',
  'market',
  'worlds',
  // The mining pool console. `deploy/cloudflared/config.mainnet.public.yml` routes
  // `pool.<apex>`, and it answered 200 when read on 2026-08-10. The tunnel file's own comment is
  // worth knowing before trusting this entry: the hostname publishes the CONSOLE and can never
  // publish the stratum port, because a tunnel forwards HTTP and stratum is a raw socket. `open`
  // here means what it means everywhere else on this site — a stranger can reach the address —
  // and deliberately not that a miner can connect to the pool from outside the network.
  'pool',
  // ── `exchange` WAS DELIBERATELY ABSENT UNTIL 2026-08-16, AND THE ENTRY IS THE MEASUREMENT ────
  //
  // What stood here until today was a note explaining why the key must NOT be added: the tunnel
  // configuration carried `exchange.<apex>` because that file is generated from the surface
  // registry, one row per surface whether or not anything answers, so the static probe would have
  // found it and published "Open to the public" over a name that resolved nowhere. The note ended
  // by naming the exact event that would end it — the DNS record and the ingress rule are
  // owner-only actions in the Cloudflare dashboard, and no file in this repository can take them.
  //
  // They were taken. `dig exchange.cloudsforge.online` returns Cloudflare addresses and
  // `curl https://exchange.cloudsforge.online/` returns 200 on a certificate the public already
  // trusts, with no `-k` and no `--cacert`, read on 2026-08-16. So the key joins the list on the
  // fetch, exactly as the note said it would, and the chip moves because the estate moved.
  //
  // The order that note insisted on held: the address existed BEFORE the key was typed here. That
  // is the whole discipline of this file, and it is worth noticing that the fixture which enforced
  // it — `test/public-endpoints.test.ts` fetching every key on this list — is now the thing that
  // will catch the record being deleted again.
  //
  // ONE ADDRESS, BOTH NETWORKS. There is no companion entry for testnet and there must not be: the
  // combined view retired the `-testnet` web hostnames, and a reader reaches testnet by switching
  // network in place on this one address. See the header on why no testnet name may appear in this
  // list at all.
  //
  // That rule used to have a second, cruder justification — `exchange-testnet.<apex>` answered
  // nothing, connection refused before TLS, measured the same morning. It no longer does: the
  // record was taken later on 2026-08-16 and the name now redirects here, exactly as the four other
  // retired testnet hostnames do. The entry stays a single key anyway, because "the address exists"
  // was never the test. The test is whether a key on this list is a surface a reader can USE, and a
  // hostname whose only behaviour is to redirect to the entry above it is not a second surface.
  'exchange',
  // ── `journal` FOLLOWED THE SAME ORDER, ONE RELEASE LATER ─────────────────────────────────────
  //
  // The archive shipped in 2026.8.71 with its key deliberately NOT on this list. The tunnel file
  // already carried `journal.<apex>` — it is generated one row per registry surface, whether or not
  // anything answers — so a key typed here before the deploy would have published "Open to the
  // public" over a name nothing was serving yet. The page went out reading `running`, which is
  // what deployed-and-walked-by-a-browser honestly means, and this comment was the note saying
  // what would end it.
  //
  // The deploy ended it. `curl https://journal.cloudsforge.online/` returns 200 on a certificate
  // the public already trusts — no `-k`, no `--cacert` — read on 2026-08-17, along with all five
  // articles, the topic pages, `feed.xml`, `sitemap.xml` and `robots.txt`. So the key joins on the
  // fetch and the chip recomputes to `open`, and nobody chose a stage.
  //
  // ONE ADDRESS, BOTH NETWORKS, and here the reason is stronger than the combined view: the
  // archive has no network at all. It reads no chain and holds no account, so there is nothing for
  // a `-testnet` name to serve a different copy OF. See the header on why no testnet hostname may
  // appear in this list.
  'journal',
  // ── `agora` MADE THE SAME TRIP, AND IT TOOK ONE DAY ──────────────────────────────────────────
  //
  // The square shipped in 2026.8.74 with its key deliberately off this list, and its page said so
  // in as many words: "there is no address on the public internet yet, so this page offers no
  // button". The tunnel file already named `agora.<apex>` — generated one row per registry surface
  // whether or not anything answers — so typing the key here first would have published "Open to
  // the public" over a name nothing served. That is the failure this list exists to refuse.
  //
  // The deploy ended it inside the hour. `curl https://agora.cloudsforge.online/` returns 200 on a
  // certificate the public already trusts — no `-k`, no `--cacert` — and `/v1/timeline/latest`
  // returns an empty timeline rather than an error, read on 2026-08-18. An empty timeline is the
  // right answer on the first day and it is a REACHED service answering, which is the only thing
  // this list is a claim about.
  //
  // ONE ADDRESS, BOTH NETWORKS, and this one is unusually easy to get wrong. `agora-testnet.<apex>`
  // is in the testnet tunnel file and answers 302 to the name above — but that is only the WEB half
  // being retired. The API half of that hostname is live and load-bearing: `cf-api-agora` matches
  // `/v1` at a higher priority than the redirect, which is how the mainnet bundle reads a testnet
  // timeline. So the testnet name serves something real and still may not appear here, because
  // what it serves is not a surface a reader visits. See the header.
  'agora',
]

/**
 * The surfaces published as `planned`, and the guard that keeps the chip honest in BOTH directions.
 *
 * `test/estate-stages.test.ts` requires each key here to appear in NONE of the places the other
 * three stages draw their evidence from: not a service in the deployment file, not a surface the
 * smoke tier drives, not a hostname in the public tunnel. The risk with a plan is the opposite of
 * the risk with a running surface — there it was understatement, here it is a card that quietly
 * outlives its truth. The day a planned key appears in any of those three files, this list refuses
 * the build until the chip is upgraded, which is the direction a marketing claim must fail.
 *
 * EMPTY, AND THE EMPTINESS IS THE RECORD OF THE GUARD DOING ITS JOB. `exchange` was the only entry
 * this list has ever had, and it sat here for two days. It did not leave because somebody
 * remembered to move it: micro-deploy added the router, declared the `exchange-web` service and
 * deleted the surface from `EXPECTED_UNROUTED` in one commit, and every assertion below went red on
 * the next run — a service in the estate, a surface the smoke tier drives, and no remaining claim
 * that nothing is behind the name. Three independent facts, none of them typed here.
 *
 * WHERE IT WENT IS THE PART WORTH READING, AND IT WENT TWICE. First to `running` and NOT to
 * `open`, because `PUBLIC_SURFACES` above still refused the key: the hostname had no DNS record,
 * so the network tier would have failed on a name that resolved nowhere. Deployed, walked by a
 * real browser through the real gateway, and with no address on the public internet is exactly
 * what `STAGE_MEANING.running` promises a reader, so `running` was the honest chip and it was the
 * one the estate computed.
 *
 * Then, on 2026-08-16, the record was created and the name answered 200 on a public certificate,
 * and the chip moved again — to `open`, on the fetch. Twice now the stage changed without anyone
 * choosing a stage, which is the only property of this scale worth defending.
 *
 * Leave the export. A plan with no entries is the normal state of this file between products, and
 * deleting it would mean re-deriving the whole argument above the next time one is announced.
 */
export const PLANNED_SURFACES: readonly string[] = []

export const RUNS_ON: Readonly<Record<string, readonly string[]>> = {
  hub: ['hub-web', 'hub-api'],
  network: ['network-site', 'explorer-web', 'faucet', 'indexer'],
  create: ['mint-web', 'mint'],
  trade: ['trade-web', 'trade'],
  foresight: ['foresight-web', 'foresight'],
  market: ['market-web', 'market'],
  worlds: ['worlds-web', 'worlds'],
  // `pool` is the Stratum server and `pool-web` the console in front of it, sharing one hostname.
  // `pool-migrate` is deliberately absent: it is a one-shot migrator that runs to completion and
  // exits, so requiring it to be a live service would be requiring the wrong thing.
  pool: ['pool-web', 'pool'],
  // ONE CONTAINER, AND THAT IS THE WHOLE PRODUCT. Every other entry in this record pairs a bundle
  // with the service behind it; `exchange-web` has no service behind it because the exchange is
  // contracts on Hearth, and the page talks to them over `rpc.<apex>` from the reader's browser.
  // There is deliberately no `exchange` service to list here — the router entry check in
  // micro-deploy carries a `# REMOVED: cf-api-exchange` line saying the same thing, so that a
  // reader who goes looking for the API finds the reason rather than a gap.
  exchange: ['exchange-web'],
  // ONE CONTAINER, FOR THE OPPOSITE REASON TO THE EXCHANGE'S. There is no `journal` service
  // because there is nothing for one to do: the archive has no API, no CMS and no database, and
  // `journal-web`'s image already contains every page it will ever serve — `scripts/prerender.ts`
  // writes each route, the feed, the sitemap and the robots file at build time. So the container
  // named here is not a bundle in front of a service; it is the whole product.
  journal: ['journal-web'],
  // BACK TO THE ORDINARY SHAPE: a bundle and the service behind it. Agora is the opposite of the
  // two entries above — the square is a database of posts, replies, rooms and whispers, so there
  // is a service to name and `agora-web` is only the page in front of it.
  //
  // `agora-migrate` is deliberately absent, for the same reason `pool-migrate` is: it runs the
  // schema to completion and exits, and requiring a one-shot migrator to be a live service would
  // be requiring the wrong thing — every deploy would go red the moment it succeeded.
  agora: ['agora-web', 'agora'],
}
