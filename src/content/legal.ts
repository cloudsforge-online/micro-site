/**
 * The legal pages.
 *
 * ── The rule this file exists to enforce ──────────────────────────────────────────────────────
 *
 * **No section here invents legal text.** A plausible-looking paragraph of terms is worse than an
 * empty one: it reads as though somebody with the authority to bind the company wrote it, it will
 * be relied on by a reader who has no way to tell the difference, and it will sit on a live
 * financial service's website until somebody notices — which, on the evidence of the estate this
 * replaces, is never.
 *
 * So every section carries a `status`:
 *
 *   `stated`  — a fact about how this system is built, which the engineering can be held to and
 *               which somebody here is competent to assert. These are written out in full.
 *   `counsel` — a term, a liability position, a jurisdiction, a warranty, a right of the reader or
 *               an obligation of the company. NOT written. The section says what belongs there and
 *               is rendered with a visible marker saying it is outstanding.
 *
 * `test/legal.test.ts` fails if a `counsel` section acquires body text, if a `stated` section is
 * empty, and if either page loses its outstanding-work notice while sections are still marked
 * `counsel`. The marker cannot be quietly dropped ahead of the drafting.
 *
 * The visible marker is deliberately not subtle. A reader is entitled to know that the terms they
 * are looking at are incomplete, and a company that hides that from them has already answered the
 * question of what kind of company it is.
 *
 * ── What "not populated" turned out to mean, and what was done about it ───────────────────────
 *
 * The owner's report was that the terms of service are not populated. Measured in a real browser
 * through the real gateway before anything was written: `/terms` answers 200, renders, and is
 * linked from the footer of every page — the routing is fine. What a reader met was a page whose
 * own heading said eight of eleven sections were undrafted, which is exactly what it looked like.
 *
 * The design above is right and it survives. What was missing was a section that could be written
 * WITHOUT counsel and had simply never been added: the licensing. It is not a matter of opinion,
 * it is not jurisdiction-specific, and it is on disk in every repository in the estate — one MIT
 * `LICENSE` per repository, a `LICENSE-ASSETS` under Creative Commons Attribution wherever there
 * is artwork, and a `TRADEMARKS.md` reserving the names from both. That is a `stated` section by
 * the definition above: an engineer can be held to it because it is a description of files.
 *
 * Nothing else moved. No entity, no jurisdiction, no age limit, no sanctions posture and no
 * governing law was invented, and the sections that need a lawyer still say so and still carry
 * empty bodies. A page that LOOKS complete stops anybody chasing the parts that are not.
 */

import { claim } from './claims.ts'

export type LegalStatus = 'stated' | 'counsel'

export interface LegalSection {
  readonly title: string
  readonly status: LegalStatus
  /** Written out for `stated`. Empty for `counsel` — the test enforces it. */
  readonly body: readonly string[]
  /** For `counsel`: what has to go here, so the drafting brief is not reconstructed from scratch. */
  readonly outstanding?: string
}

export interface LegalPage {
  readonly slug: 'terms' | 'privacy'
  readonly title: string
  /** The search-result and link-preview description. Held to a length budget by test/meta.test.ts. */
  readonly blurb: string
  readonly standfirst: readonly string[]
  /** Shown at the top of the page whenever any section is `counsel`. */
  readonly notice: string
  readonly sections: readonly LegalSection[]
}

export const TERMS: LegalPage = {
  slug: 'terms',
  title: 'Terms of service',
  blurb:
    'The structure these terms will take. Sections describing how the system is built are written out; sections that create or limit legal obligations are marked as undrafted rather than invented.',
  standfirst: [
    'These terms are not finished. What follows is the structure they will take, with the sections that describe how the system is built written out, and the sections that create or limit legal obligations left to be drafted.',
  ],
  notice:
    'This document is incomplete. The sections marked below have not been drafted and nothing on this page should be relied on as the terms of an agreement.',
  sections: [
    {
      title: 'Who these terms are between',
      status: 'counsel',
      body: [],
      outstanding:
        'The contracting entity, its registration, its address, and the jurisdiction whose law governs the agreement. None of these is an engineering question and none may be guessed at.',
    },
    {
      title: 'Eligibility, and where the service is offered',
      status: 'counsel',
      body: [],
      outstanding:
        'Minimum age, the territories the service is and is not offered in, and the sanctions and financial-crime screening that follows from operating a custodial service. This is regulatory and jurisdiction-specific.',
    },
    {
      title: 'Your account',
      status: 'stated',
      body: [
        'One account signs into every product. There is no separate registration per product, and there is no separate balance per product, because there is only one of each.',
        'Access to an account is controlled by credentials you hold, optionally with a second factor. Sessions are individually revocable, and revoking one does not disturb the others.',
      ],
    },
    {
      title: 'Custody, and what it means that we hold assets',
      status: 'counsel',
      body: [],
      outstanding:
        'The legal characterisation of held assets, whether they are segregated, what happens to them on insolvency, and what recourse a reader has. This is the single most consequential section on this page and the one it would be most damaging to draft in-house.',
    },
    {
      title: 'How the system treats your money',
      status: 'stated',
      body: [
        'Balances are recorded in a double-entry ledger. An entry that does not balance cannot be committed to it — that is enforced by a database constraint rather than by application code, so it holds against something that has bypassed the service entirely.',
        'The ledger is the source of truth for value and the chain is the source of truth for ownership. Where the two disagree the system stops and raises the disagreement to an operator rather than choosing between them.',
        'Deposits are credited at a published confirmation depth per chain, never at the chain tip. Below that depth a deposit is visible to you as pending and is not spendable.',
      ],
    },
    {
      title: 'Withdrawal and export',
      status: 'stated',
      body: [
        'You may withdraw held assets to an address you control, and you may export the private key or recovery phrase of a wallet that is yours. Both are product requirements rather than discretionary favours, and neither is charged for beyond what the network itself costs to carry.',
        'The safeguards around key export — what must be confirmed, and what is recorded when it happens — are ours to design. The right itself is not ours to withhold.',
      ],
    },
    {
      /**
       * The one section on this page that was written rather than briefed.
       *
       * It qualifies as `stated` for a specific reason and not as an exception: every sentence in
       * it is a description of a file that exists in every repository of this estate, and
       * `test/legal.test.ts` reads those files rather than taking the paragraphs' word for it. It
       * creates no obligation, limits no liability, and names no jurisdiction — the moment it
       * starts doing any of those it has become a section for counsel and belongs in one.
       */
      title: 'Licensing: the code, the artwork and the names',
      status: 'stated',
      body: [
        'The software is offered under the MIT licence, and every repository in this estate carries a copy of it. MIT is short and permissive: you may use it, change it, sell it and redistribute it, and what it asks in return is that the notice travels with the copy. There is no attribution requirement on the code beyond keeping that notice intact.',
        `The artwork is licensed separately, under the Creative Commons Attribution licence, version ${claim('assetLicenceVersion')} international, in a LICENSE-ASSETS file beside the MIT one wherever there are images. The reason is a limit of the first licence rather than a change of posture — MIT speaks throughout of "the Software", and a generated image is not software. The images may be shared and adapted, including commercially, and the single condition is credit.`,
        'That asymmetry is the usual one and it surprises people, so it is worth stating plainly: attribution is required for the pictures and is not required for the code.',
        // ── One sentence, holding nothing but the marks ────────────────────────────────────────
        //
        // The guard in `test/legal.test.ts` EXTRACTS the reserved names from this sentence and
        // resolves each against the estate's own trademark notice, rather than checking a list
        // typed into the test — which is the only version of that guard that can catch a mark
        // being added here that the estate never reserved.
        //
        // The consequence is that this sentence may name nothing capitalised except a mark. The
        // filename that used to sit at the end of it moved to the next paragraph for exactly that
        // reason, and the reason is here so nobody moves it back.
        'The names and the marks are reserved from both grants: CloudsForge, Forge, Hearth and EMBER, together with the logos and wordmarks that identify them, are covered by neither licence.',
        'You may use them to say truthfully what your work is — that it builds on this, forks it, or works with it. You may not use them to label your own thing as though it were this one. Each repository that carries artwork carries the boundary in full, in a trademark notice beside the two licence files.',
        'The reservation is what makes the rest safe to give away rather than a hedge against it. A brand mark works by telling somebody who made a thing, and a mark that anybody may apply to anything has stopped doing the one job it has.',
      ],
    },
    {
      title: 'Fees',
      status: 'counsel',
      body: [],
      outstanding:
        'What is charged, when, how it is quoted, how a fee is refunded or reversed, and the notice given before a fee changes. Prices are deliberately not published on this site yet — see the platform page for why — and this section is drafted alongside the first published price, not before it.',
    },
    {
      title: 'Acceptable use',
      status: 'counsel',
      body: [],
      outstanding:
        'Prohibited conduct, the consequences of it, and the process by which an account is restricted or closed — including notice, appeal, and what happens to held assets while a restriction is in force.',
    },
    {
      title: 'Risk',
      status: 'counsel',
      body: [],
      outstanding:
        'The risk disclosures a custodial crypto service is required to make, in the form and place the applicable regime requires them. A summary written by an engineer is not a disclosure.',
    },
    {
      title: 'Liability, warranties and indemnities',
      status: 'counsel',
      body: [],
      outstanding:
        'Limitations, exclusions, and their interaction with the non-excludable rights of consumers in each territory the service is offered in.',
    },
    {
      title: 'Changes to these terms',
      status: 'counsel',
      body: [],
      outstanding:
        'How a change is notified, how much notice is given, and what a reader may do if they do not accept it.',
    },
  ],
}

/**
 * ── WHY THIS PAGE GREW ON 2026-08-05 ──────────────────────────────────────────────────────────
 *
 * Until today this notice made exactly one claim — that the build fails if a request to an external
 * host appears in the bundle — and said outright that this was "the only kind of privacy claim a
 * static site is in a position to make on its own". That was **honest and correct while the
 * marketing site was all there was**. It became wrong by omission the moment the estate went
 * public, because there are now real accounts behind it and the notice was describing a brochure.
 *
 * The original claim survives untouched below. What is added around it is the same kind of claim:
 * every sentence describes something a reader could go and check in source, and each is cited here
 * so the next person does not have to rediscover it.
 *
 *   no cookies              no `document.cookie` write and no `Set-Cookie` exists in any frontend
 *                           in the estate. `test/legal.test.ts:390` already asserted this for this
 *                           repository before today. Sessions are `cf.accessToken` /
 *                           `cf.refreshToken` in `localStorage` — `hub-web/src/lib/api.ts:53-56`,
 *                           `market-web/src/lib/api.ts:27-28`, `worlds-web/src/lib/api.ts:27-28`.
 *   telemetry session id    `sessionStorage` under `cf-obs-session`, random, dies with the tab:
 *                           `src/lib/obs.ts:182-197`.
 *   RUM retention           30 days, `lantern/src/env.ts:289`. Errors 7 days (`:250`), issues 90
 *                           (`:251`), rollups 400 (`:288`).
 *   analytics pseudonym     salted per subject so erasure is possible at all; the salt is the only
 *                           thing destroyed. `analytics/src/pseudonym.ts` header, and the pepper is
 *                           never written to that service's database.
 *   analytics retention     events 400 days, rollups 1200: `analytics/src/env.ts:208-209`.
 *   account deletion        a real three-state lifecycle, `identity/src/deletion.ts`, wired at
 *                           `identity/src/server.ts:1669` and `:1692`, grace default 7 days at
 *                           `identity/src/env.ts:270`.
 *
 * ── ONE CLAIM WAS PUT TO ME AND IS NOT WRITTEN HERE, BECAUSE IT IS NOT TRUE YET ───────────────
 *
 * I was told Mailtrap is the SMTP relay for registration and reset mail. **The estate has no SMTP
 * configured at all** — `grep -cE '^SMTP_' .env` returns 0, and `notify/src/email.ts:81` returns a
 * `no_transport` failure rather than sending when `SMTP_HOST` is unset, which the module documents
 * as a supported mode. Mailtrap appears once in `.env.example:64`, in a list beside Brevo, Resend,
 * SendGrid and postfix, as an *example* of what generic SMTP can point at. Naming a processor that
 * is not processing anything would be exactly the invented paragraph the header of this file
 * exists to forbid, so the notice says no mail provider is configured and what happens when one is.
 *
 * ── THIS NEEDS A LAWYER AND HAS NOT HAD ONE ───────────────────────────────────────────────────
 *
 * Everything below is a description of code, written by an engineer, and it is accurate to source.
 * It is NOT a data-protection notice: it establishes no lawful basis, grants no right, names no
 * controller and makes no cross-border transfer assessment. The sections that require those are
 * still `counsel` and still empty. A custodial crypto service's privacy notice carries regulatory
 * weight and this one has not been reviewed.
 */
export const PRIVACY: LegalPage = {
  slug: 'privacy',
  title: 'Privacy notice',
  blurb:
    'What this website and the platform behind it do with data, written from the code: no cookies anywhere, pseudonymised analytics, real retention periods. The legal sections are marked undrafted, not invented.',
  standfirst: [
    'This notice is not finished. What the code does is written out and is checkable against public source; the parts that create legal rights and obligations — who the controller is, on what basis data is processed, and how you enforce your rights — are data-protection questions and are left to be drafted properly.',
    'Everything in the written sections is a description of software, not a promise about it. Where a thing is not implemented, this page says it is not implemented rather than stating a policy nobody enforces.',
  ],
  notice:
    'This document is incomplete. The sections marked below have not been drafted and nothing on this page should be relied on as a data-protection notice.',
  sections: [
    {
      title: 'What this website does',
      status: 'stated',
      body: [
        'This site sets no cookies of its own, runs no analytics, embeds no third-party script, loads no external font, and makes no request to any host outside CloudsForge. Everything the page needs is served from the address you fetched it from.',
        'That is checked rather than asserted: the build fails if a request to an external host appears in the bundle. It is a small claim and it is the only kind of privacy claim a static site is in a position to make on its own.',
      ],
    },
    {
      title: 'Errors this page reports about itself',
      status: 'stated',
      body: [
        'When something in this page fails — an uncaught error, a script that would not load, a page that took an unreasonable time to render — a report is sent to CloudsForge\'s own error-collection service. It carries the message, the stack, the address of the page, the build identifier and the browser\'s user-agent string.',
        'It goes to a CloudsForge host and to no one else. It is capped, so a page stuck in a loop sends a bounded number of reports rather than one per frame, and a failure to send is dropped rather than retried.',
        'If you are signed in, the report does not carry your identity: it is sent without credentials, deliberately, because an error collector that accepts a session is a target that has no reason to be one.',
      ],
    },
    {
      title: 'Signing in',
      status: 'stated',
      body: [
        'If you sign in from this site you are sent to the CloudsForge account service and returned here with a single-use hand-off code in the address. That code is removed from the address bar before it is exchanged, so it is not left in your browser history, in the referrer of anything the page loads next, or in a screenshot taken while the exchange is in flight.',
      ],
    },
    {
      /**
       * The licensing distinction, stated where it is actually useful on a privacy page.
       *
       * A privacy notice's weakest form is a list of assurances a reader has no way to test. The
       * section above makes three claims about a static file; this one says the file is public and
       * licensed for them to go and check, which is what turns the assurance into a claim.
       */
      title: 'You can check the section above without asking us',
      status: 'stated',
      body: [
        'Everything the previous section claims is a claim about a static file, and that file\'s source is public and under the MIT licence — you may read it, build it and run its checks without asking anyone. The check that fails the build when a request to an external host appears in the bundle is in that source too, and it runs on every change.',
        'This is the only kind of privacy claim worth making about a website: one you can refute. A notice that describes behaviour nobody outside the company can observe is a statement of intent wearing the clothes of a disclosure, and the difference matters most exactly when it is least visible.',
      ],
    },
    {
      title: 'There are no cookies, on any CloudsForge site',
      status: 'stated',
      body: [
        'Not "no advertising cookies" and not "only essential cookies" — none. No page in this estate writes a cookie, and no service sets one on a response. That is why there is no cookie banner: there is nothing to consent to, and a banner that asked would be theatre.',
        'Signing in stores two tokens in your browser\'s local storage instead. Local storage is per-origin, which means the tokens are readable only by the exact site that stored them and are never attached automatically to a request the way a cookie is. A consequence a reader can verify: signing into one CloudsForge surface does not sign you into another on a different subdomain, because the storage does not cross origins.',
        'Clearing site data in your browser removes them completely, and signing out removes them and revokes the session at the server.',
      ],
    },
    {
      title: 'What the platform holds about you, if you have an account',
      status: 'stated',
      body: [
        'Your account itself — address, credentials, any second factor, and the list of sessions and devices you are signed in from. Credentials are stored as verifiers rather than as passwords, so the stored value cannot be used to sign in as you elsewhere.',
        'If you hold assets: a double-entry ledger record of every movement, and, for a custodial wallet, key material held under an encryption envelope in a service that exists for nothing else. Financial records are the category least likely to be deletable on request, because a ledger that can be edited after the fact is not a ledger.',
        'Your activity history across the products. This is deliberately kept without a retention limit — it is a product promise that you can look back at what you did — and that sits in tension with a right to erasure. The tension is stated here rather than resolved, because resolving it is a legal question and this section is not one.',
      ],
    },
    {
      title: 'Errors and performance this page reports about itself',
      status: 'stated',
      body: [
        'When something in a CloudsForge page fails — an uncaught error, a script that would not load, a page that took an unreasonable time to render — a report goes to CloudsForge\'s own error-collection service. It carries the message, the stack, the address of the page, the build identifier and the browser\'s user-agent string.',
        `Those reports are held for ${claim('rumRetentionDays')} days and then deleted, and the deletion is a scheduled job rather than an intention. Before anything is stored, the message and the stack are scrubbed for credentials, and an HTTP header that looks like a session is stripped out — error text is exactly where a secret gets printed by accident.`,
        'To join two reports from one visit, the page mints a random identifier in session storage. It dies when you close the tab, it never follows you between visits, and it says nothing about who you are. That service has no column to put an identity in.',
      ],
    },
    {
      title: 'Product analytics, and why it can actually be erased',
      status: 'stated',
      body: [
        'Usage of the products is recorded against a pseudonym rather than against your account. The mechanism matters and is unusual, so it is worth stating: the pseudonym is salted with random bytes minted once for you and stored separately, rather than being a plain keyed hash of your user id.',
        'The difference is the whole point. A keyed hash of your id is a pure function of two values that both survive an erasure request, so anyone holding the key could recompute it afterwards and find your entire history again — that is an index into a person wearing the word "pseudonym". Because ours is salted, erasing you destroys the salt, and after that the pseudonym cannot be reached from your identity by any means short of guessing a value that no longer exists anywhere. The rows survive as data about nobody.',
        'The key that derives pseudonyms is never written to the analytics database. Someone who obtained a copy of that database would hold, for each subject, two unrelated values and a random salt, with no way to test a guess at whose they are.',
        `Analytics events are kept for ${claim('analyticsRetentionDays')} days. That number is read from the configuration that enforces it rather than being a policy stated on a page and enforced nowhere.`,
      ],
    },
    {
      title: 'Who else sees your data, and where it physically is',
      status: 'stated',
      body: [
        'Cloudflare. Every request to every CloudsForge address passes through Cloudflare, which terminates the connection and forwards it down a tunnel. Cloudflare therefore sees your IP address, the address you asked for and the metadata of the request. This became true on the day the estate first went public, and it is the only third party in the path of an ordinary request.',
        'No mail provider is configured at present. Registration and password-reset mail is sent over plain SMTP with no provider SDK, and with no SMTP server configured the system records that no mail was sent rather than failing or silently losing it. When one is configured, that operator will see the address the mail is sent to.',
        'There is no advertising network, no tag manager, no third-party analytics, no embedded font and no external script anywhere in these pages. The build fails if a request to an external host appears in the bundle.',
        'The platform runs on a single home server behind that tunnel. There is no second site, no failover, and no backup that has ever been restored. That is a statement about resilience rather than about privacy, but it is the kind of thing a reader deciding what to trust with money is entitled to know.',
      ],
    },
    {
      title: 'Deleting your account',
      status: 'stated',
      body: [
        'You can request deletion, and it is a real operation rather than a flag. Your sessions are revoked immediately, the account enters a pending state, and an erasure signal is written in the same database transaction — so it cannot be lost if the process dies at the wrong moment.',
        'A grace period of seven days follows, during which you can cancel. This exists because a deletion requested by someone who had hijacked your session should be recoverable by you, and you will have noticed, having been signed out everywhere.',
        'After it, the row keeps only its identifier and its dates. Address, handle, credentials, second factors and profile are gone or overwritten. The identifier is kept deliberately: it is what other services reference, and keeping it is what allows the question "was this person erased, or did they never exist" to be answered at all.',
        'What this does not yet do is guarantee that every service downstream has finished erasing before the identifier is tombstoned. The signal is published and the services consume it; the end-to-end proof that all of them completed is not something this page can claim today.',
      ],
    },
    {
      title: 'Who the data controller is',
      status: 'counsel',
      body: [],
      outstanding:
        'The controlling entity, its registration, its representative where one is required, and how to contact its data-protection function.',
    },
    {
      title: 'What personal data the platform holds, and why',
      status: 'counsel',
      body: [],
      outstanding:
        'The LAWFUL BASIS for each category and the purpose limitation on each. The categories themselves are now written out above, from the schemas rather than from a template — what is still missing is the part an engineer cannot supply: which basis is relied on for each, and what that commits the company to.',
    },
    {
      title: 'Identity verification',
      status: 'counsel',
      body: [],
      outstanding:
        'What a custodial financial service is obliged to collect and verify, what it does with it, and how long it must keep it — which is frequently longer than a reader would expect and must be stated plainly rather than buried.',
    },
    {
      title: 'Retention',
      status: 'counsel',
      body: [],
      outstanding:
        'The retention periods that ARE implemented are stated above and are read from the code that enforces them: error reports and their groupings, analytics events and their rollups, and a seven-day grace before an account is tombstoned. What is outstanding is everything with no period implemented at all — ledger records, custody material and identity rows are not on a deletion schedule, and the activity history is deliberately kept without a limit as a product promise. That last one has to be reconciled with erasure rights by somebody qualified to, rather than left for a reader to discover.',
    },
    {
      title: 'Sharing, and transfers out of your territory',
      status: 'counsel',
      body: [],
      outstanding:
        'The LAWFUL BASIS for transferring personal data across a border, and the transfer mechanism relied on. The processors themselves are now listed above from the deployment inventory — Cloudflare in the path of every request, and no mail provider configured yet — but which jurisdictions the data reaches and what makes that lawful is not an engineering question. This section stops being accurate the day a dependency is added, so it is checked against the tunnel configuration rather than remembered.',
    },
    {
      title: 'Your rights, and how to exercise them',
      status: 'counsel',
      body: [],
      outstanding:
        'Access, rectification, erasure, portability, objection and complaint, per the regimes that apply — with a route to exercise each that actually exists and is staffed.',
    },
  ],
}

export const LEGAL_PAGES: readonly LegalPage[] = [TERMS, PRIVACY]

export function legalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug)
}

/** True when a page still has undrafted sections, which is what makes the notice mandatory. */
export function hasOutstanding(page: LegalPage): boolean {
  return page.sections.some((s) => s.status === 'counsel')
}
