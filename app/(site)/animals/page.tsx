"use client";

// Author: Tyler Siedner
import Link from "next/link";
import { animals } from "../../../data/animals";
import { useState } from "react";

export default function AnimalsPage() {
  const [search, setSearch] = useState("");

  const filteredAnimals = animals.filter((animal) =>
    animal.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <main>
      <h1>Available Animals</h1>

      <p>Meet our residents and find your next companion.</p>
      <label htmlFor="animal-search">Search animals by name</label>

      <input
        id="animal-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {filteredAnimals.map((animal) => (
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
