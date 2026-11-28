"use client";

// Authors: Tyler Siedner and Tyler Harris

import Link from "next/link";
import { useState } from "react";
import { animals } from "../../../data/animals";

export default function AnimalsPage() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  const types = [...new Set(animals.map((animal) => animal.type))].sort();

  const breeds = [...new Set(animals.map((animal) => animal.breed))].sort();

  const filteredAnimals = animals.filter((animal) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      animal.name.toLowerCase().includes(searchText) ||
      animal.type.toLowerCase().includes(searchText);

    const matchesType = selectedType === "" || animal.type === selectedType;

    const matchesBreed = selectedBreed === "" || animal.breed === selectedBreed;

    const matchesSize = selectedSize === "" || animal.size === selectedSize;

    const matchesGender =
      selectedGender === "" || animal.gender === selectedGender;

    const matchesMinAge = minAge === "" || animal.ageYears >= Number(minAge);

    const matchesMaxAge = maxAge === "" || animal.ageYears <= Number(maxAge);

    return (
      matchesSearch &&
      matchesType &&
      matchesBreed &&
      matchesSize &&
      matchesGender &&
      matchesMinAge &&
      matchesMaxAge
    );
  });

  const invalidAgeRange =
    minAge !== "" && maxAge !== "" && Number(minAge) > Number(maxAge);

  return (
    <main>
      <h1>Meet Our Residents</h1>

      <p>
        Building Better Companions. Explore the Weyland-Yutani shelter directory
        and review each resident&apos;s care requirements before applying.
      </p>

      <div>
        <label htmlFor="animal-search">
          Search residents by name or creature type
        </label>

        <input
          id="animal-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="animal-type">Creature type</label>

        <select
          id="animal-type"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
        >
          <option value="">All types</option>

          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="animal-breed">Breed / Classification</label>

        <select
          id="animal-breed"
          value={selectedBreed}
          onChange={(event) => setSelectedBreed(event.target.value)}
        >
          <option value="">All classifications</option>

          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="animal-size">Size</label>

        <select
          id="animal-size"
          value={selectedSize}
          onChange={(event) => setSelectedSize(event.target.value)}
        >
          <option value="">All sizes</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
        </select>
      </div>

      <div>
        <label htmlFor="animal-gender">Gender</label>

        <select
          id="animal-gender"
          value={selectedGender}
          onChange={(event) => setSelectedGender(event.target.value)}
        >
          <option value="">All genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      <fieldset>
        <legend>Age range in years</legend>

        <div>
          <label htmlFor="minimum-age">Minimum age</label>

          <input
            id="minimum-age"
            type="number"
            min="0"
            step="any"
            value={minAge}
            onChange={(event) => setMinAge(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="maximum-age">Maximum age</label>

          <input
            id="maximum-age"
            type="number"
            min="0"
            step="any"
            value={maxAge}
            onChange={(event) => setMaxAge(event.target.value)}
          />
        </div>
      </fieldset>

      {invalidAgeRange && (
        <p role="status">
          Minimum age must be less than or equal to maximum age.
        </p>
      )}

      {!invalidAgeRange && filteredAnimals.length === 0 && (
        <p role="status">
          No residents found. Try a different search or filter.
        </p>
      )}

      {!invalidAgeRange &&
        filteredAnimals.map((animal) => (
          <article key={animal.id}>
            <h2>
              <Link href={`/animals/${animal.id}`}>{animal.name}</Link>
            </h2>

            <p>Creature type: {animal.type}</p>
            <p>Breed / Classification: {animal.breed}</p>
            <p>Age: {animal.ageYears} years</p>
            <p>Gender: {animal.gender}</p>
            <p>Size: {animal.size}</p>
            <p>Adoption status: {animal.adoptionStatus}</p>
            <p>{animal.description}</p>
          </article>
        ))}
    </main>
  );
}
