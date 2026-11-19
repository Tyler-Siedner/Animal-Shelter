// Author: Tyler Siedner
import Link from "next/link";
import { animals } from "../../../data/animals";

export default function AnimalsPage() {
  return (
    <main>
      <h1>Available Animals</h1>

      <p>Meet our residents and find your next companion.</p>

      {animals.map((animal) => (
        <article key={animal.id}>
          <h2>
            <Link href={`/animals/${animal.id}`}>{animal.name}</Link>
          </h2>
          <p>Type: {animal.type}</p>
          <p>Breed: {animal.breed}</p>
          <p>Age: {animal.ageYears} years</p>
          <p>Gender: {animal.gender}</p>
          <p>Size: {animal.size}</p>
          <p>Status: {animal.adoptionStatus}</p>
          <p>{animal.description}</p>
        </article>
      ))}
    </main>
  );
}
