// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import type { Metadata } from "next";
import AnimalDirectory from "../../../components/AnimalDirectory";
import { getAnimals } from "../../../lib/animals";

export const metadata: Metadata = { title: "Residents" };

async function Residents() {
  const animals = await getAnimals();
  return <AnimalDirectory animals={animals} />;
}

export default function AnimalsPage() {
  return (
    <Suspense
      fallback={
        <main>
          <h1>Residents</h1>
          <p>Loading residents…</p>
        </main>
      }
    >
      <Residents />
    </Suspense>
  );
}
