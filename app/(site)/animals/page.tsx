// Authors: Tyler Siedner and Tyler Harris
import type { Metadata } from "next";
import AnimalDirectory from "../../../components/AnimalDirectory";
import { getAnimals } from "../../../lib/animals";

export const metadata: Metadata = { title: "Residents" };

export default async function AnimalsPage() {
  const animals = await getAnimals();
  return <AnimalDirectory animals={animals} />;
}
