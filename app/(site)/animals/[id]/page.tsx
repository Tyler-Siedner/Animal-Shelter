// Author: Tyler Siedner

import { notFound } from "next/navigation";
import { animals } from "../../../../data/animals";
import Link from "next/link";

export function generateStaticParams() {
  return animals.map((animal) => ({
    id: animal.id,
  }));
}

type AnimalProfileProps = {
  params: Promise<{ id: string }>;
};

export default async function AnimalProfilePage({
  params,
}: AnimalProfileProps) {
  const { id } = await params;
  const animal = animals.find((animal) => animal.id === id);

  if (!animal) {
    notFound();
  }

  return (
    <main>
      <Link href="/animals">Back to all animals</Link>
      <h1>{animal.name}</h1>
      <img src={animal.imageUrl} alt={`Photo of ${animal.name}`} width={400} />
      <p>{animal.description}</p>

      <h2>About This Animal</h2>
      <p>Type: {animal.type}</p>
      <p>Breed: {animal.breed}</p>
      <p>Age: {animal.ageYears} years</p>
      <p>Gender: {animal.gender}</p>
      <p>Size: {animal.size}</p>
      <p>Adoption status: {animal.adoptionStatus}</p>

      <h2>Medical and Care Information</h2>
      <p>Vaccinations: {animal.vaccinationInfo}</p>
      <p>Spayed/neutered: {animal.spayNeuterStatus}</p>
      <p>Dietary needs: {animal.dietaryNeeds}</p>
      <p>Behavior: {animal.behavioralInfo}</p>
      <p>Special care: {animal.specialCareRequirements}</p>
    </main>
  );
}
