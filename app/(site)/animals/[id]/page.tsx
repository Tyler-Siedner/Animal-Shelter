// Authors: Tyler Siedner and Tyler Harris
import { notFound } from "next/navigation";
import { animals } from "../../../../data/animals";
import Link from "next/link";
import Image from "next/image";
export function generateStaticParams() {
  return animals.map((animal) => ({ id: animal.id }));
}
type AnimalProfileProps = { params: Promise<{ id: string }> };
export default async function AnimalProfilePage({
  params,
}: AnimalProfileProps) {
  const { id } = await params;
  const animal = animals.find((animal) => animal.id === id);
  if (!animal) notFound();
  return (
    <main>
      <Link className="back-link" href="/animals">
        ← Back to all residents
      </Link>
      <div className="profile-grid">
        <div className="profile-photo">
          {animal.imageUrl && (
            <Image
              src={animal.imageUrl}
              alt={`${animal.name}, ${animal.type}`}
              width={720}
              height={900}
            />
          )}
          <div className="image-caption">WEYLAND-YUTANI / RESIDENT RECORD</div>
        </div>
        <section className="profile-copy">
          <p className="eyebrow">
            {animal.type} / {animal.breed}
          </p>
          <h1>{animal.name}</h1>
          <span
            className={`badge inline-badge ${animal.adoptionStatus.toLowerCase()}`}
          >
            {animal.adoptionStatus}
          </span>
          <p className="profile-intro">{animal.description}</p>
          <dl className="profile-facts">
            <div>
              <dt>Age</dt>
              <dd>{animal.ageYears} years</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>{animal.size}</dd>
            </div>
            <div>
              <dt>Gender</dt>
              <dd>{animal.gender}</dd>
            </div>
            <div>
              <dt>Classification</dt>
              <dd>{animal.breed}</dd>
            </div>
          </dl>
          <h2>Medical &amp; care record</h2>
          <dl className="care-list">
            <div>
              <dt>Vaccination assessment</dt>
              <dd>{animal.vaccinationInfo}</dd>
            </div>
            <div>
              <dt>Spayed / neutered</dt>
              <dd>{animal.spayNeuterStatus}</dd>
            </div>
            <div>
              <dt>Dietary needs</dt>
              <dd>{animal.dietaryNeeds}</dd>
            </div>
            <div>
              <dt>Behavioral notes</dt>
              <dd>{animal.behavioralInfo}</dd>
            </div>
          </dl>
          <aside className="containment-note">
            <p className="eyebrow">SPECIAL CARE / CONTAINMENT</p>
            <p>{animal.specialCareRequirements}</p>
          </aside>
          <Link className="button" href="/contact">
            Contact the shelter →
          </Link>
        </section>
      </div>
    </main>
  );
}
