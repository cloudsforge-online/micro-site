/**
 * The front door.
 *
 * Four blocks, in the order a reader who has never heard of this actually needs them: what it is,
 * the loop that makes it one thing rather than several, what you can do inside it, and the state
 * it is in. The last of those is on the home page rather than buried, because a reader who finds
 * out on page four that none of this is running has been misled by pages one to three.
 *
 * Every surface on this page comes from the registry — the six products through `productCards()`,
 * the places that are not products through `nonProductCards()`. There is no list of either in this
 * file, which is the property that let a publicly addressed surface be added to the estate and
 * appear here on the same edit rather than three releases later (micro-org#488).
 */
import { Link } from 'react-router-dom'
import { minePage } from '../lib/hosts.ts'
import { ALSO_HERE, HOME } from '../content/pages.ts'
import { nonProductCards, productCards, productCount } from '../content/products.ts'
import { PLATFORM } from '../content/pages.ts'
import { Ridge, Section, SurfaceCards, accentProps } from '../components/parts.tsx'

/*
 * ── The order, and the fact that it is the only editorial change on this page ─────────────────
 *
 * Products moved UP, above Capabilities: Hero → Ember → Products → Capabilities → Spans → Closing.
 * A reader who has just been told what an EMBER is for should meet the things it is for sale in
 * before meeting three pieces of detail about how the platform is put together — the capabilities
 * block is an argument, and an argument lands better after its subject has been shown than before.
 *
 * docs/ecosystem/32-roadmap-ui-and-content.md §2.2 proposes this and, unusually for that document,
 * says so about itself: "This is the least evidence-backed proposal in this document — it is an
 * editorial judgement, not a measurement." Everything else changed on this page is a defect with a
 * citation. Nothing here is measured, nothing was moved to fix anything, and no assertion in the
 * suite required it, which is why it arrived as its own commit and can be reverted on its own
 * without taking a single fix with it.
 *
 * What the order still owes a reader is fixed and is tested: BJ-SITE-01 reads document order out of
 * the rendered page and holds Hero before Ember before Spans, and Closing — the state this is
 * actually in — stays last on the page rather than being buried on another one.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <Ridge />
      <Ember />
      <Products />
      <AlsoHere />
      <Capabilities />
      <Spans />
      <Ridge />
      <Closing />
    </>
  )
}

/**
 * The hero.
 *
 * One ember wash, drawn with a CSS radial gradient off `--cf-accent-glow` rather than an image, so
 * it costs nothing and follows the substrate. The headline is the positioning line and the verb
 * line underneath it is the whole product range in six words — which is as much as a person
 * arriving from a link is going to read before deciding whether to stay.
 */
function Hero() {
  return (
    <section className="si-hero" aria-labelledby="hero-title">
      <div className="si-hero__wash" aria-hidden="true" />
      <p className="si-eyebrow">CloudsForge</p>
      <h1 className="si-hero__title" id="hero-title">
        {HOME.spine}
        {/* The verbs on their own line, dimmed: the same sentence, said twice, at two weights. */}
        <span className="si-hero__verbs">{HOME.verbLine}</span>
      </h1>
      <p className="si-hero__standfirst">{HOME.standfirst}</p>
      <div className="si-hero__actions">
        {/*
          Both buttons said "What is …", which is a category rather than a destination: a reader
          cannot tell from "What is here" whether it leads to a product list, a manifesto or a
          changelog. Each one now names what is on the other side of it.

          ── AND THE PRIMARY ONE IS NOW THE THING THE SENTENCE ABOVE IT INSTRUCTS ────────────────

          The standfirst says "Press start on the mining page". It said so with no button: `grep`
          for `href=` and `hosts()` in this file returned nothing, and the shortest route from that
          promise to the product was `/products` → `/products/network` → an aside part way down it
          — three clicks and two page loads (docs/ecosystem/32-roadmap-ui-and-content.md §2.1).

          Mining is also the only complete journey this estate can currently offer a stranger,
          because it is the only one that needs no account: registration cannot be completed today
          (§6.3 of the same document, traced on the host). A front door whose loudest button ends
          at an undeliverable verification email would be worse than this one.

          The product list is kept and demoted to a plain link below. The count stays admissible
          under the rule at the top of this file's content module because `productCount()` derives
          it from the registry rather than stating it.
        */}
        <a className="si-btn si-btn--accent" href={minePage()}>
          Start mining
        </a>
        <Link className="si-btn" to="/build">
          See what already works
        </Link>
      </div>
      <p className="si-hero__more">
        <Link to="/products">See the {productCount()} products</Link>
      </p>
    </section>
  )
}

/**
 * The four things that happen to an EMBER.
 *
 * A numbered rail rather than a row of cards, because the point is that the steps are IN AN ORDER
 * and a grid says nothing about order. Each step wears the accent of the surface that owns it,
 * scoped with `accentProps`, so the rail is read as four different places rather than as four
 * paragraphs.
 *
 * This was `Loop`, under the heading "The loop is the product". The steps are unchanged and the
 * framing is not — `src/content/pages.ts` HOME.ember carries the reason, which is that the old
 * heading argued about the architecture to a reader who had not yet been told what the thing is.
 * The anchor moved with it: `#loop` was a name for the diagram rather than for the subject.
 */
function Ember() {
  return (
    <Section title={HOME.ember.title} lede={HOME.ember.lede} id="ember">
      <ol className="si-rail">
        {HOME.ember.steps.map((step, index) => (
          <li className="si-rail__step" key={step.verb} {...accentProps(step.accentKey)}>
            {/* Numbered from position, zero-padded, and aria-hidden because the <ol> already
                announces the order to a screen reader — reading "01" aloud before every step is
                the list's own numbering said twice. */}
            <span className="si-rail__n cf-num" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="si-rail__body">
              <p className="si-rail__verb">{step.verb}</p>
              <h3 className="si-rail__title">{step.title}</h3>
              <p className="si-rail__text">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/**
 * The three capabilities a reader will not have assumed are here.
 *
 * This block exists because all three were shipped and unadvertised. Browser mining was removed
 * from this site in a commit and never came back; the chain's Ethereum compatibility was one
 * clause that named no tool a developer would recognise; and the coins a person can actually
 * stake and trade were named nowhere on the site at all.
 *
 * Each item links to the product page that explains it. A capability announced with nowhere to
 * read more is a claim, and this site's whole posture is that a claim needs somewhere to go.
 */
function Capabilities() {
  return (
    <Section
      title={HOME.capabilities.title}
      lede={HOME.capabilities.lede}
      id="what-you-can-do"
    >
      <ul className="si-points">
        {HOME.capabilities.items.map((item) => (
          <li key={item.title} {...accentProps(item.accentKey)}>
            <h3 className="si-points__title">{item.title}</h3>
            <p className="si-points__body">{item.body}</p>
            <p className="si-points__more">
              <Link to={`/products/${item.linkTo}`}>{item.linkLabel}</Link>
              {/*
                A second link where the item has one, which today is mining and only mining. The
                page about it is for the reader still deciding; this is for the reader who has, and
                without it the most convincing item on the front page could only offer them another
                page. `minePage()` is the same destination as the hero's primary button.
              */}
              {'startLabel' in item && (
                <>
                  <span className="si-points__sep" aria-hidden="true">
                    ·
                  </span>
                  <a href={minePage()}>{item.startLabel}</a>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/**
 * The product grid.
 *
 * One card per registry product, each in its own accent, each carrying its own stage. Hub is
 * absent by design — `01-product-vision.md` §3: the container "must never appear in a product grid
 * as a peer, because an account is not something a person chooses, it is something they are
 * given". It gets its own line underneath instead.
 *
 * The heading and both asides come from `HOME.products`, not from literals here. They used to be
 * literals, and they went stale when a sixth product was added to the registry: the grid rendered
 * six cards under a line that said five, and nothing could see it because the copy scan only reads
 * `src/content` and only matches digits.
 */
function Products() {
  const cards = productCards()
  return (
    <Section title={HOME.products.title} lede={HOME.products.lede} id="products">
      {/*
        The blurb slot on THIS page is the registry's own one-liner, which is written to introduce a
        surface to somebody who has never heard of it. The products index prints the page headline
        instead, for a reader who is comparing rather than meeting. `SurfaceCards` takes it as a
        parameter so the difference stays a decision; before micro-org#488 it was two copies of the
        same markup that had quietly stopped agreeing.
      */}
      <SurfaceCards
        cards={cards.map(({ surface: s, page }) => ({
          key: page.key,
          slug: page.slug,
          eyebrow: page.eyebrow,
          blurb: s.blurb,
          stage: page.stage,
        }))}
      />

      {/*
        This read "Underneath all of them is Forge Hub — the account, the wallet, the portfolio and
        the history. Hub is not a seventh destination. It is the account, wallet and history the
        other six run on." Three faults, all flagged by the owner: it lists the same four nouns
        twice in consecutive sentences, the middle sentence denies something nobody proposed, and
        "the other six run on" reads as though the products execute inside Hub. What is true and
        useful is that Hub is where the six meet.
      */}
      <p className="si-aside">
        All of them meet at <Link to="/products/hub">Forge Hub</Link>. {HOME.products.hubAside}
      </p>
    </Section>
  )
}

/**
 * The second grid: the places that are not products (micro-org#488).
 *
 * ── WHY IT IS ON THE FRONT PAGE AND NOT ONLY ON /products ─────────────────────────────────────
 *
 * The defect reported was "Forge Exchange has no tile inside the main site", and a tile on the
 * ecosystem index alone would have answered it for the reader who already knows to go looking.
 * That reader is not the one who was lost. The estate's front door is where somebody finds out
 * what CloudsForge has; the exchange had been open at its own public address, in the product
 * switcher and in the footer of eighteen surfaces, and this page — the one the owner opened —
 * offered no way in. So it goes here as well, and the two grids render from one component so they
 * cannot come to disagree about what exists.
 *
 * ── AND WHY IT IS A SEPARATE SECTION RATHER THAN THREE MORE TILES ABOVE ───────────────────────
 *
 * "Where to spend it" is the honest heading for the six, and the pool is not somewhere you spend
 * EMBER — it is where you get some. Folding these three into that grid would have made the heading
 * false in order to make the grid bigger, which is the trade this site exists to refuse. A second
 * heading over the same card costs one line and keeps both sentences true.
 *
 * It sits between the products and the capabilities argument, so the running order is still the
 * one the header of this file describes: what it is, the loop, what you can do inside it, then the
 * argument, then the state it is in. These are part of "what you can do inside it".
 */
function AlsoHere() {
  return (
    <Section title={ALSO_HERE.title} lede={ALSO_HERE.lede} id="also-here">
      <SurfaceCards
        cards={nonProductCards().map(({ surface: s, page }) => ({
          key: page.key,
          slug: page.slug,
          eyebrow: page.eyebrow,
          blurb: s.blurb,
          stage: page.stage,
        }))}
      />
    </Section>
  )
}

/** The one-account promise, in three checkable claims rather than one adjective. */
function Spans() {
  return (
    <Section title={HOME.spans.title} lede={HOME.spans.lede} id="one-account">
      <ul className="si-points">
        {HOME.spans.points.map((p) => (
          <li key={p.title}>
            <h3 className="si-points__title">{p.title}</h3>
            <p className="si-points__body">{p.body}</p>
          </li>
        ))}
      </ul>
      {/*
        "There is a longer version of that promise, written as 11 statements that are each either
        true or work" — "either true or work" is a compression of "either already true, or on the
        list of work still to do", and it does not survive being read once. "Read the definition"
        then labels the destination with a category noun rather than with what is on it.
      */}
      <p className="si-aside">
        We hold ourselves to {PLATFORM.tests.length} promises about that one account.{' '}
        <Link to="/platform">See all {PLATFORM.tests.length}</Link>, including the ones we have not
        finished yet.
      </p>
    </Section>
  )
}

/** The closing block, which is the honest one. */
function Closing() {
  return (
    <section className="si-closing" aria-labelledby="closing-title">
      <h2 className="si-h2" id="closing-title">
        {HOME.closing.title}
      </h2>
      <p className="si-closing__body">{HOME.closing.body}</p>
      <Link className="si-btn si-btn--accent" to="/build">
        See what is built
      </Link>
    </section>
  )
}
