// Authors: Tyler Siedner and Tyler Harris
import "server-only";
import { connection } from "next/server";
import { getDatabase } from "./database";
import { readAnimals, readAnimalById } from "./animal-repository";

// These small local queries run on each request. Staff edits and adoption
// decisions must not be served from an older cross-request cache entry.
export async function getAnimals() {
  await connection();
  return readAnimals(getDatabase());
}
export async function getAnimalById(id: string) {
  await connection();
  return readAnimalById(getDatabase(), id);
}
