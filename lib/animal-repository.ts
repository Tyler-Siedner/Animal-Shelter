// Authors: Tyler Siedner and Tyler Harris
// Prepared read queries shared by server pages, setup checks, and database tests.
import type Database from "better-sqlite3";
import type { Animal } from "../types/animal";
import { animalColumns } from "./database";

const selectColumns = animalColumns.join(", ");

export function readAnimals(db: Database.Database): Animal[] {
  return db
    .prepare(
      `SELECT ${selectColumns} FROM animals WHERE archived=0 ORDER BY sortOrder, id`,
    )
    .all() as Animal[];
}

export function readAnimalById(
  db: Database.Database,
  id: string,
): Animal | undefined {
  return db
    .prepare(`SELECT ${selectColumns} FROM animals WHERE id = ? AND archived=0`)
    .get(id) as Animal | undefined;
}
