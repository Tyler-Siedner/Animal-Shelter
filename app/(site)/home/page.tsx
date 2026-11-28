// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";
import Image from "next/image";
import { getAnimals } from "../../../lib/animals";
export default async function HomePage() {
  const animals = await getAnimals();
  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">COLONIAL SERVICES / ANIMAL WELFARE</p>
          <h1>
            Building better
            <br />
            <em>companions.</em>
          </h1>
          <p>
            Extraordinary residents. Exceptional care. Discover a different kind
            of companionship at the frontier of human exploration.
          </p>
          <div className="button-row">
            <Link className="button" href="/animals">
              Explore our residents <span aria-hidden="true">→</span>
            </Link>
            <Link className="button secondary" href="/about">
              Our mission
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{animals.length.toString().padStart(2, "0")}</strong>
              <span>Unique residents</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Specialist care</span>
            </div>
            <div>
              <strong>01</strong>
              <span>Extraordinary mission</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <Image
            src="/images/creatures/xeno_cat.png"
            alt="Jonesy, our Xenomorph kitten, in a containment enclosure"
            width={640}
            height={800}
          />
          <div className="image-caption">
            <span className="status-dot" /> RESIDENT SPOTLIGHT / JONESY
          </div>
        </div>
      </section>
      <section className="section-block">
        <p className="eyebrow">A HOME BEYOND THE ORDINARY</p>
        <h2>Every resident has a story.</h2>
        <div className="info-grid">
          <article className="panel">
            <span className="step-number">01 / DISCOVER</span>
            <h3>Find your companion</h3>
            <p>
              Browse profiles and filter by creature type, age, size, and more.
            </p>
            <Link className="text-link" href="/animals">
              Meet the residents →
            </Link>
          </article>
          <article className="panel">
            <span className="step-number">02 / UNDERSTAND</span>
            <h3>Know their needs</h3>
            <p>
              Review medical assessments, behavioral notes, and specialist
              containment requirements.
            </p>
          </article>
          <article className="panel">
            <span className="step-number">03 / CONNECT</span>
            <h3>Speak to our team</h3>
            <p>
              Learn about the shelter and discuss the next steps with colonial
              services.
            </p>
            <Link className="text-link" href="/contact">
              Contact the shelter →
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
