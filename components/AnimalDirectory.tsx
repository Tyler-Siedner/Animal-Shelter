"use client";

// Authors: Tyler Siedner and Tyler Harris

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Animal } from "../types/animal";

export default function AnimalDirectory({ animals }: { animals: Animal[] }) {
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

  function resetFilters() {
    setSearch("");
    setSelectedType("");
    setSelectedBreed("");
    setSelectedSize("");
    setSelectedGender("");
    setMinAge("");
    setMaxAge("");
  }

  return (
    <main className="directory-page">
      <h1>Residents</h1>

      <p>
        Browse our residents and read their care information before applying.
      </p>

      <section
        className="filter-panel"
        aria-label="Search and filter residents"
      >
        <div className="search-field">
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

        <button
          type="button"
          className="button secondary reset-button"
          onClick={resetFilters}
        >
          Reset filters
        </button>
      </section>
      <p className="results-count" role="status">
        {invalidAgeRange ? 0 : filteredAnimals.length} of {animals.length}{" "}
        residents
      </p>
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

      <div className="animal-grid">
        {!invalidAgeRange &&
          filteredAnimals.map((animal) => (
            <article className="animal-card" key={animal.id}>
              <Link
                className="card-image-link"
                href={`/animals/${animal.id}`}
                aria-label={`View ${animal.name}'s profile`}
              >
                {animal.imageUrl && (
                  <Image
                    src={animal.imageUrl}
                    alt={`${animal.name}, ${animal.type}`}
                    width={480}
                    height={600}
                    loading="lazy"
                  />
                )}
                <span
                  className={`badge ${animal.adoptionStatus.toLowerCase()}`}
                >
                  {animal.adoptionStatus}
                </span>
              </Link>
              <div className="card-body">
                <p className="eyebrow">{animal.type}</p>
                <h2>
                  <Link href={`/animals/${animal.id}`}>{animal.name}</Link>
                </h2>
                <p className="card-description">{animal.description}</p>
                <dl className="card-facts">
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
                </dl>
                <Link className="card-cta" href={`/animals/${animal.id}`}>
                  View resident
                </Link>
              </div>
            </article>
          ))}
      </div>
    </main>
  );
}
