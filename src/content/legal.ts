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
 */

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
