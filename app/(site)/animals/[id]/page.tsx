// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import ResidentActions from "../../../../components/ResidentActions";
import { notFound } from "next/navigation";
import { getAnimalById } from "../../../../lib/animals";
import Link from "next/link";
import Image from "next/image";
type AnimalProfileProps = { params: Promise<{ id: string }> };
async function AnimalProfileContent({ params }: AnimalProfileProps) {
  const { id } = await params;
  const animal = await getAnimalById(id);
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
              loading="eager"
            />
          )}
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
          <h2>Care information</h2>
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
            <h3>Special care</h3>
            <p>{animal.specialCareRequirements}</p>
          </aside>
          <Suspense fallback={<p>Loading account options…</p>}>
            <ResidentActions animal={animal} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

export default function AnimalProfilePage(props: AnimalProfileProps) {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading…</p>
        </main>
      }
    >
      <AnimalProfileContent {...props} />
    </Suspense>
  );
}
