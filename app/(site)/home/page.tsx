// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";
import Image from "next/image";
export default function HomePage() {
  return (
    <main className="simple-home">
      <section>
        <h1>Weyland-Yutani Animal Shelter</h1>
        <p>Find a home for something a little unusual.</p>
        <p>
          Browse our residents, read about their care needs, or help out at the
          shelter.
        </p>
        <div className="button-row">
          <Link className="button" href="/animals">
            View residents
          </Link>
          <Link className="button secondary" href="/volunteer">
            Volunteer
          </Link>
        </div>
      </section>
      <Image
        src="/images/creatures/xeno_cat.png"
        alt="Jonesy, a Xenomorph kitten"
        width={480}
        height={600}
        loading="eager"
      />
    </main>
  );
}
