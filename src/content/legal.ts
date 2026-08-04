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

export const PRIVACY: LegalPage = {
  slug: 'privacy',
  title: 'Privacy notice',
  blurb:
    'What this website itself does — no cookies, no analytics, no third-party requests — written out and checked by a test. What the platform behind it does with personal data is marked as undrafted.',
  standfirst: [
    'This notice is not finished either. What this website itself does is written out and is verifiable; what the platform behind it does with personal data is a data-protection question and is left to be drafted properly.',
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
        'The categories of data, the lawful basis for each, and the purpose limitation on each. This has to be produced from the actual schemas rather than from a template, and reviewed.',
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
        'How long each category is kept and what is deleted on account closure. Note the tension to resolve: the activity history is deliberately kept without a retention limit as a product promise, and that has to be reconciled with erasure rights rather than left for a reader to discover.',
    },
    {
      title: 'Sharing, and transfers out of your territory',
      status: 'counsel',
      body: [],
      outstanding:
        'Every processor and sub-processor, what each of them is given and why, and the lawful basis for any transfer of personal data across a border. This one has to be produced from the deployment inventory rather than from a template, and it stops being accurate the day a dependency is added.',
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
