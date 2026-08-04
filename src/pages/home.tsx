/**
 * The front door.
 *
 * Four blocks, in the order a reader who has never heard of this actually needs them: what it is,
 * the loop that makes it one thing rather than several, what you can do inside it, and the state
 * it is in. The last of those is on the home page rather than buried, because a reader who finds
 * out on page four that none of this is running has been misled by pages one to three.
 *
 * Every product on this page comes from the registry through `productCards()`. There is no list of
 * products in this file.
 */
import { Link } from 'react-router-dom'
import { HOME } from '../content/pages.ts'
import { productCards } from '../content/products.ts'
import { PLATFORM } from '../content/pages.ts'
import { Ridge, Section, StageChip, SurfaceMark, accentProps } from '../components/parts.tsx'

export function HomePage() {
  return (
    <>
      <Hero />
      <Ridge />
      <Ember />
      <Products />
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
        <Link className="si-btn si-btn--accent" to="/products">
          What is here
        </Link>
        <Link className="si-btn" to="/build">
          What is built
        </Link>
      </div>
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
      <ul className="si-cards">
        {cards.map(({ surface: s, page }) => (
          <li className="si-card" key={s.key} {...accentProps(s.key)}>
            <Link className="si-card__link" to={`/products/${page.slug}`}>
              <div className="si-card__head">
                <SurfaceMark surfaceKey={s.key} size={30} />
                <div>
                  <p className="si-card__verb">{s.verb}</p>
                  <h3 className="si-card__name">{s.name}</h3>
                </div>
              </div>
              <p className="si-card__blurb">{s.blurb}</p>
              <span className="si-card__foot">
                <StageChip stage={page.stage} />
                <span className="si-card__more" aria-hidden="true">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="si-aside">
        Underneath all of them is <Link to="/products/hub">Forge Hub</Link> — the account, the
        wallet, the portfolio and the history. {HOME.products.hubAside}
      </p>
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
      <p className="si-aside">
        There is a longer version of that promise, written as {PLATFORM.tests.length} statements that
        are each either true or work. <Link to="/platform">Read the definition</Link>.
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
