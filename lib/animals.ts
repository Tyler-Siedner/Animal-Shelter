// Authors: Tyler Siedner and Tyler Harris
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDatabase } from "./database";
import { readAnimals, readAnimalById } from "./animal-repository";

// Cache Components can prerender these database reads. Future admin actions will
// invalidate the "animals" tag immediately after writes.
export async function getAnimals() {
  "use cache";
  cacheLife("minutes");
  cacheTag("animals");
  return readAnimals(getDatabase());
}

export async function getAnimalById(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("animals");
  return readAnimalById(getDatabase(), id);
}
