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
  readonly slug: 'terms' | 'privacy' | 'risk'
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
    'The structure these terms will take. Sections on how the system works are written out; those creating legal obligations are marked undrafted, not invented.',
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
        'Minimum age, the territories the service is and is not offered in, and the sanctions and financial-crime screening that follows from operating a custodial service. This is regulatory and jurisdiction-specific. Note for whoever drafts it: none of these exists in the software today — there is no age check, no geographic restriction, no sanctions screening and no identity verification anywhere in the estate — so this section is a description of controls that must be BUILT, not merely written.',
    },
    {
      title: 'Regulatory status, and whether this service is authorised',
      status: 'counsel',
      body: [],
      outstanding:
        'Whether the operator holds, requires, or is exempt from authorisation to provide crypto-asset services, and in which jurisdiction. This section is listed because it is missing, and because a reader of a service that holds their assets is entitled to know the answer before they use it. The engineering facts bearing on it are written out under "What it means mechanically that we hold your keys": the platform holds the private keys of client wallets and can move client assets, and it quotes a two-sided buy and sell price at which it converts one asset into another as principal. Both of those correspond to activities that the EU crypto-asset regime treats as regulated services in their own right, independently of whether any order book or exchange venue exists — and there is none here. Whether that regime applies at all turns on where the operator is established and to whom the service is offered, neither of which is settled anywhere in this estate. This must be answered by admitted counsel before it is answered on this page, and it should be treated as blocking rather than as a document to be tidied later.',
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
        'The legal characterisation of held assets, whether they are segregated, what happens to them on insolvency, and what recourse a reader has. This is the single most consequential section on this page and the one it would be most damaging to draft in-house. It must be drafted together with the authorisation question: holding private keys on behalf of clients is, on its face, the regulated activity of custody and administration of crypto-assets on behalf of clients under the EU crypto-asset regime, and the mechanical facts that make it so are written out in the section immediately below.',
    },
    {
      /**
       * The custody MECHANICS, as a `stated` section, sitting directly beneath the `counsel` hole.
       *
       * This is deliberately not an attempt to write the section above by other means. The rule in
       * this file's header is the test: a `stated` section describes how the system is built and an
       * engineer can be held to every sentence. Every sentence here is a description of a mechanism
       * in `custody`, `wallet` and `deploy`, and none of them characterises the assets in law,
       * allocates a loss, limits a liability or grants a right — which is exactly what is missing
       * above and why it is still empty.
       *
       * It exists because the hole above, alone, tells a reader nothing. A person deciding whether
       * to send money here needs to know TODAY that the operator can move it, and that fact is not
       * a legal opinion — it is a property of `custody/src/crypto.ts` and
       * `custody/src/keys.ts`, and withholding it until counsel is engaged would be the worst
       * available option for the reader.
       */
      title: 'What it means mechanically that we hold your keys',
      status: 'stated',
      body: [
        'For a wallet the platform manages for you, the platform generates the private key and keeps it. The key is encrypted before it is stored, and the recovery phrase behind it is encrypted and stored the same way. What that encryption protects against is somebody who obtains the stored files alone.',
        'It does not protect against the operator. The value that decrypts every stored key is held by the platform, and it is supplied to the software as ordinary configuration on the machine that runs it. There is no second key held by you, no password of yours mixed into it, and no hardware module that would refuse to release it. Anyone who holds both that value and the stored files can derive your private key and move your assets without your involvement. That is a plain statement of what the system can do, and it should be read as one.',
        'There is no multi-signature scheme, no threshold or split-key arrangement, and no hardware security module anywhere in this. It is one encrypted file per address on one server.',
        'Deposits arrive at an address minted for you, and are then swept into a single platform-held address per chain. After the sweep, what records that the assets are yours is the ledger — an internal record — rather than a separate on-chain position in your name. Withdrawals are paid out of that shared platform address.',
        'The whole platform runs on a single home server behind one tunnel. There is no second site and no failover, there is no scheduled backup of any kind, and no restore has ever been performed. If the value that decrypts the keys is lost, every stored key and every stored recovery phrase becomes permanently undecryptable, and assets at those addresses can never be moved again — by anyone, including the operator. That is stated because it is the failure mode with no remedy after the fact.',
        'There is no insurance, no compensation scheme, no proof-of-reserves publication and no reserve attestation. No code in the platform produces any of those, and no third party checks the platform\'s holdings. The internal reconciliation that compares the ledger against the chain is an operational alarm that freezes withdrawals when the two disagree; it is not an attestation, and nothing publishes its result.',
        'A wallet you hold the keys to yourself is a different thing and is genuinely different: the browser extension and the mobile and desktop wallets generate and seal keys on your own device under a password of yours, and the platform never sees them. Everything above describes the managed wallet, which is what an ordinary sign-up on the website gets.',
        'You can take a managed wallet out of this arrangement. Exporting the private key or the recovery phrase is a real, supported operation, gated by a password and a second factor, a twenty-four hour waiting period, and a single-use short-lived confirmation. Once exported, that key is marked as exported and does not go back.',
      ],
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
        'The risk disclosures a custodial crypto service is required to make, in the form and place the applicable regime requires them. A summary written by an engineer is not a disclosure. There is now a separate risk page setting out, in plain words, how the system can fail — the operator\'s ability to move held assets, the absence of backups, the irreversibility of transfers and the absence of insurance. It is written from the code, it is not this section, and it does not discharge whatever this section turns out to require.',
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
 *   no cookies              WAS TRUE ON 2026-08-05 AND IS NOT TRUE NOW — see the note on the
 *                           cookies section below, and micro-org#313. Sessions are still
 *                           `cf.accessToken` / `cf.refreshToken` in `localStorage`
 *                           (`hub-web/src/lib/api.ts`, `market-web/src/lib/api.ts`,
 *                           `worlds-web/src/lib/api.ts`) and no service sets `Set-Cookie` on a
 *                           response; what changed is the browser side, where
 *                           `@cloudsforge/ui`'s consent banner writes `cf_consent_analytics` and,
 *                           on acceptance, loads a Google Analytics tag that sets its own.
 *   telemetry session id    `sessionStorage` under `cf-obs-session`, random, dies with the tab:
 *                           `src/lib/obs.ts`.
 *   RUM retention           30 days, `lantern/src/env.ts` — `LANTERN_RUM_RETENTION_DAYS`. Errors
 *                           7 days, issue groupings 90 and rollups 400, each its own
 *                           `*_RETENTION_DAYS` default in the same file.
 *   analytics pseudonym     salted per subject so erasure is possible at all; the salt is the only
 *                           thing destroyed. `analytics/src/pseudonym.ts` header, and the pepper is
 *                           never written to that service's database.
 *   analytics retention     events 400 days, rollups 1200: `analytics/src/env.ts`.
 *   account deletion        a real three-state lifecycle, `identity/src/deletion.ts`, wired at
 *                           `identity/src/server.ts` — the delete route and its cancel — grace
 *                           default 7 days at
 *                           `identity/src/env.ts`.
 *
 * ── THESE CITATIONS NAMED LINES, AND FOUR OF THEM WERE WRONG. THE LINES ARE GONE ──────────────
 *
 * On 2026-08-05 four of the citations above were re-read and each pointed at the wrong line — the
 * `hub-web` token pair at the `store()` fallback body, `obs.ts` three lines early, the deletion
 * route at neither of the two lines named, the grace constant off by twenty-six. They were
 * re-pinned, and then they rotted again, because a line number names a position in a file that a
 * DIFFERENT repository owns and edits without ever running this suite. Nothing here was wrong when
 * it broke, which is the worst property a check can have.
 *
 * So the line numbers are removed rather than corrected once more. Each citation now names the
 * FILE, and where a reader needs the exact place the sentence names the SYMBOL — `store()`,
 * `LANTERN_RUM_RETENTION_DAYS`, the delete route — which moves with the code instead of away from
 * it. Every retention number above was re-measured when the lines came off and each one was right.
 *
 * ── WHAT THIS PASS FOUND THAT THE NOTICE DID NOT DISCLOSE ─────────────────────────────────────
 *
 * Read as an adversary would, the notice was not wrong so much as INCOMPLETE, and every gap ran in
 * the same direction — towards the reader thinking less is kept than is kept:
 *
 *   ip addresses            `faucet` stores FULL client IPs as a primary key and never prunes them
 *                           (`faucet/src/server.ts`, `faucet/src/migrations.ts`).
 *                           `hearth`'s node logs full IPs from `Cf-Connecting-Ip` with no rotation
 *                           limit (`hearth/node/src/ws.js`). `identity` keeps a truncated
 *                           /24-/48 prefix on every session (`identity/src/migrations.ts`)
 *                           and emails it (`notify/src/catalogue.ts`). The notice named none.
 *   user-agent + full url   `lantern` stores the user-agent string and the full page URL INCLUDING
 *                           its query string in `attributes` (`lantern-web/src/lib/obs.ts`).
 *   activity for ever       raw `user_id`, free-text summary and the producer's ENTIRE domain
 *                           payload with no allowlist (`activity/src/migrations.ts`), and
 *                           no retention job of any kind (`activity/src/jobs.ts`).
 *   erasure does not reach  fourteen services store a user reference and DO NOT subscribe to
 *                           `identity.user.deleted`; of the eight that have a handler, only two are
 *                           actually seeded at deploy (`deploy/scripts/estate-bootstrap.sh`).
 *   no identity check       there is no KYC, AML, sanctions or age check anywhere in the estate.
 *
 * These are now written out below as `stated` sections, because each is a description of code.
 * What they MEAN for the reader's rights remains `counsel` and remains empty.
 *
 * ── ONE CLAIM WAS PUT TO ME AND IS NOT WRITTEN HERE, BECAUSE IT IS NOT TRUE YET ───────────────
 *
 * I was told Mailtrap is the SMTP relay for registration and reset mail. **The estate has no SMTP
 * configured at all** — `grep -cE '^SMTP_' .env` returns 0, and `notify/src/email.ts` returns a
 * `no_transport` failure rather than sending when `SMTP_HOST` is unset, which the module documents
 * as a supported mode. Mailtrap appears once in `.env.example`, in a list beside Brevo, Resend,
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
    'What this site and the platform do with your data, from the code: a consent cookie, analytics if you accept, real retention periods. Legal parts undrafted.',
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
        'This site loads no external font and, unless you accept analytics in the banner at the foot of the page, requests nothing from any host outside CloudsForge. Everything a page needs in order to render is served from the address you fetched it from.',
        'Cookies are where the exception lives, and there are two sorts: one that records your answer to that banner, and — only if the answer was yes — the ones the Google Analytics tag sets, which is the single third-party script this site can load. Both are written out by name further down rather than summarised here.',
        'The first paragraph is checked rather than asserted, and the boundary of the check is the sort of thing this page exists to be exact about. A test in this site\'s own suite collects every web address written in its source and fails continuous integration if any of them points outside CloudsForge — but it reads this site\'s source, so it does not see a request assembled at runtime from pieces, nor one made by a shared package rather than by code written here. The analytics arrives through a shared package, which is exactly that gap: this notice went on denying cookies and analytics for as long as it took somebody to read the page against the banner underneath it. A second check now reads that package and fails when what it does and what this page says have come apart.',
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
        'Everything the previous section claims is a claim about a static file, and that file\'s source is public and under the MIT licence — you may read it, build it and run its checks without asking anyone. The check that fails when a request to an external host appears in this site\'s source is in that source too, and it runs on every change.',
        'This is the only kind of privacy claim worth making about a website: one you can refute. A notice that describes behaviour nobody outside the company can observe is a statement of intent wearing the clothes of a disclosure, and the difference matters most exactly when it is least visible.',
      ],
    },
    {
      /**
       * ── THIS SECTION SAID THE OPPOSITE UNTIL 2026-08-09, AND IT WAS `stated` WHILE IT DID ─────
       *
       * It was headed "There are no cookies, on any CloudsForge site" and read, in full: *"Not 'no
       * advertising cookies' and not 'only essential cookies' — none. No page in this estate writes
       * a cookie, and no service sets one on a response. That is why there is no cookie banner:
       * there is nothing to consent to, and a banner that asked would be theatre."*
       *
       * Every clause of that was true when it was written and every clause was false by the time it
       * was read. `@cloudsforge/ui` gained a consent banner, a `cf_consent_analytics` cookie on the
       * registrable domain and a Google Analytics loader; eighteen surfaces render that banner,
       * this site among them (`src/components/shell.tsx`). Measured on the deployed apex on
       * 2026-08-09, the single bundle `https://cloudsforge.online/` loads contains BOTH the string
       * `cf_consent_analytics` AND the sentence "There are no cookies, on any CloudsForge site".
       *
       * WHY THE NOTICE MOVED AND THE ANALYTICS DID NOT. The alternative was to delete the tag so
       * the old text became true again. It was rejected on the facts: nothing loads and no cookie
       * is set before the reader answers, Reject is one click and styled identically to Accept,
       * Consent Mode is primed denied before anything runs, and a refusal deletes what a previous
       * grant left. There was nothing happening that ought to be stopped — only a page describing
       * an estate that had changed underneath it. Removing a working, consented mechanism to
       * vindicate a stale sentence would also have meant editing eighteen repositories to correct
       * one, which is the larger change and the less honest one. micro-org#313.
       *
       * The guard is `test/legal.test.ts` › "the cookie claims, against the package that sets
       * them". It reads `@cloudsforge/ui`'s `consent.ts` rather than this repository's source —
       * which is the seam the old check could not see and the reason this went unnoticed.
       */
      title: 'Cookies: one that records your answer, and more only if you accept',
      status: 'stated',
      body: [
        'A banner at the foot of every CloudsForge page asks whether analytics may count your visit. Answering it — either way — writes one cookie, `cf_consent_analytics`, whose value is the answer you gave. It is set on the CloudsForge domain rather than on the exact address you are reading, so that one answer covers every CloudsForge surface instead of the same question being put to you on each of them, and it lasts six months before you are asked again. The same answer is written to your browser\'s local storage as well, which is what still remembers it if you have blocked cookies.',
        'If you accept, Google Analytics is fetched from Google and sets cookies of its own — `_ga`, and one named after the property — which is how it tells a returning visit from a new one. None of that exists before you answer. The tag is injected by the Accept button and by nothing else, and on every page load, before anything can arrive, the page records a denied position for every category of storage, so there is no window in which a tag that showed up would find permission waiting for it. Refuse, or refuse later having accepted, and those cookies are deleted and the advertising and personalisation features that would turn a page count into a profile are switched off where the tag is configured.',
        'Clearing site data in your browser removes all of it, and the banner then asks again on your next visit. Withdrawing an analytics answer is that same act — clear this site\'s cookie and its local storage entry — because there is no control in the interface that will do it for you, and you are better served by that sentence than by the one a notice usually puts here.',
        'Signing in does not use a cookie. It stores two tokens in your browser\'s local storage instead, and signing out removes them and revokes the session at the server. Local storage is per-origin, which means the tokens are readable only by the exact site that stored them and are never attached automatically to a request the way a cookie is. A consequence a reader can verify: signing into one CloudsForge surface does not sign you into another on a different subdomain, because the storage does not cross origins — and it is that same property which made the consent record a cookie instead, since otherwise the one answer would have had to be given on every surface separately.',
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
        'Two details a careful reader should have rather than have to find. "The address of the page" means the whole address, including anything after the question mark — so if a link you followed carried a value in its address, that value reaches the error service. And the equivalent reports sent by the SERVERS, rather than by your browser, record the route they were handling without passing it through the scrubber that browser reports go through. Neither is a designed collection of anything about you; both are places where something about you could arrive by accident, which is exactly the kind of thing worth saying out loud.',
        'That service stores no IP address. It reads one only to rate-limit an unauthenticated endpoint, in memory, and never writes it to a column or a log line.',
      ],
    },
    {
      title: 'IP addresses, which are personal data, and where they actually are',
      status: 'stated',
      body: [
        'Cloudflare sees the IP address of every request, because every request reaches CloudsForge through it. That is unavoidable while the platform is reached the way it is, and it is stated first because it is the largest and the least visible.',
        'Your account\'s sign-in records keep a TRUNCATED IP address rather than a whole one — enough to say "this session came from a different part of the world from that one", not enough to identify a household. Truncation happens before the value is stored, not after. The truncated value is also included in the security email sent when a new sign-in happens, so it reaches whatever mail system carries that message.',
        'Two components keep WHOLE IP addresses, and a reader is entitled to know which. The test-currency faucet stores the requesting address as part of the record that stops one person draining it, and nothing deletes those records on a schedule. The blockchain node records the addresses of the peers that connect to it in its operational logs, which rotate on size rather than on age. Neither is joined to your account, and neither is a designed piece of profiling — but both are whole IP addresses held without a retention period, and calling that anything other than what it is would be the sort of sentence this page exists to avoid.',
      ],
    },
    {
      title: 'Your activity history is kept indefinitely, and it is detailed',
      status: 'stated',
      body: [
        'Every product writes what you did into one activity record, against your account identifier — not against a pseudonym. Alongside the description and any amount, the record carries the originating product\'s own description of the event, stored whole, without a list of permitted fields to filter it.',
        'Nothing deletes these on a schedule. There is no retention period, no expiry and no pruning job; the only routine cleanup in that service touches an inbox, not the records. This is deliberate — being able to look back at everything you did is a thing the product promises — and it is the single largest store of behavioural data the platform holds about a person.',
        'The tension between that promise and a right to have data erased is real, is not resolved here, and is one of the questions this notice is waiting on advice for. It is written down rather than smoothed over, because a reader deciding what to do here should know that "keep for ever" is the current behaviour rather than an oversight.',
      ],
    },
    {
      title: 'Deleting your account does not yet reach every service',
      status: 'stated',
      body: [
        'The section above describes what deletion does to your account itself, and that part is real. This section is about what happens everywhere else, and it is the most important qualification on this page.',
        'When an account is deleted, a signal is published for other services to erase what they hold. Not every service that holds something about you listens for it. Several that store a reference to your account have no handler for that signal at all — including the ones holding wallet, ledger, custody and billing records. Of the services that DO have a handler, only two are actually connected to the signal in the running system, so the others would not receive it today even though their code could handle it.',
        'Where handlers do run, they do not all do the same thing. Some genuinely delete rows. Others replace your identifier with a random one and keep the content, which is the right answer for a public forum post and should still be described accurately rather than called deletion. One does nothing at all beyond reporting success.',
        'The practical meaning: a request to be erased is honoured by the account service immediately and completely, and is honoured only partly beyond it. This is a defect and it is being tracked as one, not a design. It is written here because a reader is entitled to know the limits of a right before they rely on it, and because a notice claiming complete erasure while this is true would be a false statement rather than an optimistic one.',
      ],
    },
    {
      title: 'There is no identity verification, and no age check',
      status: 'stated',
      body: [
        'The platform asks for an email address and a password. It does not ask for a legal name, a date of birth, a document, a photograph or a proof of address, and there is no code anywhere in it that collects, checks or stores any of those. There is no sanctions screening and no check on where you are.',
        'Stated on a privacy page because the usual reason a service holds identity documents is that it is required to, and a reader may reasonably assume a platform that holds crypto-assets does. This one does not. That is a smaller amount of your personal data held, which is the good half; the other half is that it is one of the open regulatory questions recorded below rather than a settled position, and it may not remain true.',
      ],
    },
    {
      title: 'Product analytics, and why it can actually be erased',
      status: 'stated',
      body: [
        'Usage of the products is recorded against a pseudonym rather than against your account. The mechanism matters and is unusual, so it is worth stating: the pseudonym is salted with random bytes minted once for you and stored separately, rather than being a plain keyed hash of your user id.',
        'The difference is the whole point. A keyed hash of your id is a pure function of two values that both survive an erasure request, so anyone holding the key could recompute it afterwards and find your entire history again — that is an index into a person wearing the word "pseudonym". Because ours is salted, erasing you destroys the salt, and after that the pseudonym cannot be reached from your identity by any means short of guessing a value that no longer exists anywhere. The rows survive as data about nobody.',
        'The key that derives pseudonyms is never written to the analytics database, and that database is forbidden a column called `ip` or `ip_address` by a check that inspects the live schema rather than trusting the migration that made it. It records no IP address and no user-agent string.',
        'One limit of this, stated because a reader would otherwise infer more than is true: while your account exists, the same row also holds a plain, unsalted lookup value derived from your identity. Somebody holding the derivation key AND a copy of the database could use it to find your rows. The salt is what makes erasure final, not what makes you anonymous while you are still here — before erasure this is pseudonymisation, which reduces exposure, and it is not anonymity.',
        `Analytics events are kept for ${claim('analyticsRetentionDays')} days. That number is read from the configuration that enforces it rather than being a policy stated on a page and enforced nowhere.`,
      ],
    },
    {
      title: 'Who else sees your data, and where it physically is',
      status: 'stated',
      body: [
        'Cloudflare. Every request to every CloudsForge address passes through Cloudflare, which terminates the connection and forwards it down a tunnel. Cloudflare therefore sees your IP address, the address you asked for and the metadata of the request. This became true on the day the estate first went public, and it is in the path of every request whatever you answered about analytics.',
        'No mail provider is configured at present. Registration and password-reset mail is sent over plain SMTP with no provider SDK, and with no SMTP server configured the system records that no mail was sent rather than failing or silently losing it. When one is configured, that operator will see the address the mail is sent to.',
        'Google, and only if you accepted analytics. Accepting fetches the Google Analytics tag from Google\'s servers, after which Google receives the fact of the visit, the address of the page, what your browser says about itself, and the identifiers in the cookies it sets. Refusing, or never answering, means no request reaches Google at all. Advertising and personalisation signals are switched off where that tag is configured, so what is asked for is counting rather than profiling — which is a setting on the request and is not an undertaking about what Google does with what it receives.',
        'Beyond that tag there is no advertising network, no other measurement of any kind and no other external script in these pages. The typefaces are served from CloudsForge\'s own address rather than from a font host, so nobody outside is told what you are reading by the act of rendering it. Continuous integration fails if a request to an external host appears in this site\'s own source, and — because that scan cannot see the shared packages this site renders, which is how the tag went undisclosed — a second check now compares those packages against the section on cookies above.',
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
        'Access, rectification, erasure, portability, objection and complaint, per the regimes that apply — with a route to exercise each that actually exists and is staffed. Drafting note, and it is the important one on this page: erasure CANNOT CURRENTLY BE HONOURED IN FULL. Deletion is complete within the account service and propagates to only a fraction of the services holding a reference to the account — fourteen have no handler for the signal, and of the eight that do, only two are connected to it in the running system. There is at present no route at all for access, rectification or portability. A section promising rights the software cannot deliver would be a worse defect than the silence it replaced, so this must be drafted alongside the engineering that makes each right real, not before it.',
    },
  ],
}

/**
 * ── WHY THIS PAGE WAS CREATED ON 2026-08-05, AND WHY IT IS ALLOWED TO EXIST AT ALL ────────────
 *
 * The terms page has carried a `Risk` section marked `counsel` since it was written, and
 * `test/legal.test.ts` names it as one of four sections that must NEVER be drafted in-house. That
 * is right and it does not change. A risk DISCLOSURE — the formal thing, in the form and place a
 * regime prescribes, with the prominence and acknowledgement it requires — is a regulatory
 * instrument and an engineer must not write one.
 *
 * This page is not that. It is the same object as every `stated` section in this file: a
 * description of what the software does and what it cannot do, written so that a person deciding
 * whether to put money into it is not relying on discovering it themselves. Every sentence below is
 * a mechanism, a measurement or an absence, and each is checkable in public source.
 *
 * The reason for making it a PAGE rather than more paragraphs on the terms is prominence. A person
 * about to send assets to a custodial service should not have to read to the middle of a terms page
 * to learn that the operator can move those assets and that nothing is backed up. The most
 * important facts here are bad ones, and burying bad facts inside a long document is a choice.
 *
 * The section that a regime would require, in its required form, is still `counsel` and still empty
 * at the bottom of this page — so the page cannot be mistaken for the regulatory disclosure, and
 * the incomplete notice renders on it exactly as it does on the other two.
 */
export const RISK: LegalPage = {
  slug: 'risk',
  title: 'Risk disclosure',
  blurb:
    'What can go wrong: the operator can move the assets it holds, there are no backups, transfers cannot be reversed, and nothing is insured. Written from the code.',
  standfirst: [
    'This page collects, in one place, the things most likely to cost you money. It is written from the software rather than from a template, and it is deliberately blunt.',
    'It is not the formal risk disclosure a financial regulator would require. That has not been drafted, is marked as outstanding at the bottom, and is not something the people who built this are competent to write.',
  ],
  notice:
    'This document is incomplete. It is a plain description of how the system can fail, written by its engineers; the formal risk disclosure is undrafted and nothing here should be relied on as one.',
  sections: [
    {
      title: 'The operator can move the assets it holds for you',
      status: 'stated',
      body: [
        'For a wallet the platform manages, the platform generates and keeps the private key. The key is stored encrypted, but the value that decrypts it is held by the platform on the machine that runs the software. No part of that decryption needs anything from you.',
        'So the honest summary is: while your assets sit in a managed wallet, whoever controls the platform can move them. Not "in theory" and not "with your co-operation" — the code path exists, it runs every time a payment is signed, and it needs no input from the account holder. Anyone who obtains both the server\'s stored files and that configuration value is in the same position.',
        'The protection you actually have is the ordinary one for a service like this — that the operator does not do it, and that access to the server is controlled. Cryptography is not what is protecting you here, and it is worth being clear about that, because the presence of the word "encrypted" invites the opposite conclusion.',
        'If that is not acceptable to you, the self-custody wallets are the answer rather than a workaround: the browser extension and the mobile and desktop apps generate keys on your own device, sealed under a password only you know. You can also export a managed wallet\'s key and stop relying on the platform holding it.',
      ],
    },
    {
      title: 'There are no backups, and losing one value destroys everything',
      status: 'stated',
      body: [
        'The whole platform runs on a single home server behind a single tunnel. There is no second location, no failover and no standby. No scheduled backup exists, and no restore has ever been carried out.',
        'The value that decrypts stored keys exists in one place. The recovery phrases behind managed wallets are themselves stored inside the encrypted files it protects, so there is no separate copy of them anywhere. If that value is lost, every stored key and every stored recovery phrase becomes permanently undecryptable, and the assets at those addresses can never be moved again — not by you, not by the operator, not by anybody.',
        'This is the failure with no remedy. Most problems on a platform can be fixed afterwards by somebody competent and determined; this one cannot be fixed at all, by anyone, once it has happened.',
      ],
    },
    {
      title: 'Transactions cannot be reversed',
      status: 'stated',
      body: [
        'A transfer that has been broadcast to a blockchain is final. There is no mechanism in this platform, and none in the underlying networks, to recall it, reverse it or charge it back. An address typed wrongly sends assets somewhere nobody can retrieve them from.',
        'This differs from a bank payment in the way that matters most and is least expected: there is no institution with the power to undo the mistake, however obviously a mistake it was, and however quickly it is reported.',
      ],
    },
    {
      title: 'There is no insurance, and no compensation scheme',
      status: 'stated',
      body: [
        'Assets held here are not covered by any deposit guarantee scheme, investor compensation scheme or insurance policy. No such cover exists anywhere in the platform, and no third party underwrites its holdings.',
        'Nor is there any published proof of reserves or reserve attestation. Nothing produces one, and no external party checks that what the platform records it owes matches what it actually holds. There is an internal comparison between the ledger and the chain, and what it does when the two disagree is stop withdrawals in that asset and raise an alarm to an operator — it is a safety catch, not evidence to a customer, and its result is not published.',
        'If the platform fails, or the assets are lost or taken, the position of somebody who is owed assets by it is not established anywhere. What that position is in law is one of the questions marked as needing counsel on the terms page, and it is genuinely unanswered rather than merely unwritten.',
      ],
    },
    {
      title: 'The platform is the other side of every conversion',
      status: 'stated',
      body: [
        'When you convert one asset into another here, you are not being matched with another user. There is no order book and no exchange venue in this platform at all. The platform quotes a price it will buy at and a price it will sell at, and the difference between them is a margin it sets in its own configuration.',
        'That is a legitimate way to run the feature and it is stated because the alternative reading — that a conversion rate is a neutral market price — is the natural one and is wrong. The rate is the platform\'s, the margin is the platform\'s, and for the platform\'s own currency the price can be set by hand by the operator.',
      ],
    },
    {
      title: 'What is actually live, which is less than the interface implies',
      status: 'stated',
      body: [
        'The platform knows about several currencies, and the software can derive addresses for all of them. Only the platform\'s own chain is actually connected to the running system: it is the only one whose deposits are watched and credited, and the only one a withdrawal can be paid in. A deposit sent in another currency to an address this platform generated will not be credited to you, because nothing is watching that chain.',
        'The platform\'s own currency is not a traded asset. It has no market, no listed price and no liquidity, and it runs on a chain started from its own beginning on the deployment machine with no holders outside it. Any number shown as a value in ordinary money is derived from a rate the platform itself sets, not from a price anybody is paying.',
        'Treat everything here as experimental software handling things that behave like money, rather than as a financial service that has been through the checks one of those usually goes through.',
      ],
    },
    {
      title: 'Withdrawals can be switched off, and sometimes switch themselves off',
      status: 'stated',
      body: [
        'Withdrawals are controlled by a setting the operator holds. When it is off, withdrawal requests are refused for everyone until it is turned back on. There is no committed time within which that happens.',
        'Separately, the platform compares what its ledger says it owes against what the chain says it holds, and if those disagree by more than a tolerance it freezes withdrawals in that asset automatically and waits for a human. For some assets the tolerance is zero, which means a discrepancy of the smallest possible unit is enough to stop withdrawals in it.',
        'This is a deliberate design and it is the safer of the two options — a platform that keeps paying out while its records are known to be wrong is worse. The consequence for you is nonetheless real: there are conditions under which you cannot take your assets out, and they do not depend on anything you did.',
      ],
    },
    {
      title: 'Nobody checks who you are, and nobody has checked this service',
      status: 'stated',
      body: [
        'There is no identity verification, no age check, no sanctions screening and no restriction on where you use this from. That means your personal data is not collected for those purposes, which is good, and it means none of the protections that come with a checked financial service are present, which is not.',
        'The platform is run by one operator on one machine. The blockchain behind it is mined by that operator\'s own machines, and there is no evidence of any node run by anybody else. "Open source" describes the licence on the code, and it is true — it does not mean the running service is decentralised or that anyone other than the operator controls it.',
        'Whether a service like this one requires authorisation from a financial regulator, and whether it has any, is not resolved. It is marked as an outstanding question on the terms page rather than answered here, and a reader should treat the absence of an answer as an absence rather than as a reassurance.',
      ],
    },
    {
      title: 'The formal risk disclosure, in the form a regime requires',
      status: 'counsel',
      body: [],
      outstanding:
        'The risk warnings a custodial crypto-asset service is obliged to give, in the wording, prominence, ordering and acknowledgement flow the applicable regime prescribes — including any requirement that the customer positively acknowledge them before their first deposit, and any requirement to repeat them at the point of a transaction. Everything above is an engineer describing failure modes in plain words, which is a useful thing and is not that thing. This must be drafted by admitted counsel against the regime that actually applies, which is itself unsettled: see "Regulatory status, and whether this service is authorised" on the terms page.',
    },
  ],
}

export const LEGAL_PAGES: readonly LegalPage[] = [TERMS, PRIVACY, RISK]

export function legalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug)
}

/** True when a page still has undrafted sections, which is what makes the notice mandatory. */
export function hasOutstanding(page: LegalPage): boolean {
  return page.sections.some((s) => s.status === 'counsel')
}
