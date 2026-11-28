// Authors: Tyler Siedner and Tyler Harris
import "server-only";
import { connection } from "next/server";
import { getDatabase } from "./database";
import { readAnimals, readAnimalById } from "./animal-repository";

// Read fresh records so staff changes show up right away.
export async function getAnimals() {
  await connection();
  return readAnimals(getDatabase());
}
export async function getAnimalById(id: string) {
  await connection();
  return readAnimalById(getDatabase(), id);
}
