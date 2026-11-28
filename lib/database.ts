// Authors: Tyler Siedner and Tyler Harris
// Node-only SQLite connection, schema setup, and one-time sample-data import.
import Database from "better-sqlite3";
import { migrateAdmin } from "./admin-schema";
import { migrateAccounts } from "./account-schema";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { animals as seedAnimals } from "../data/animals";

export const animalColumns = [
  "id",
  "name",
  "type",
  "breed",
  "ageYears",
  "gender",
  "size",
  "description",
  "imageUrl",
  "adoptionStatus",
  "vaccinationInfo",
  "spayNeuterStatus",
  "dietaryNeeds",
  "behavioralInfo",
  "specialCareRequirements",
] as const;

export function getDatabasePath(): string {
  return path.join(process.cwd(), "storage", "shelter.sqlite");
}

// Exported separately so database tests and setup commands can use isolated files.
export function openShelterDatabase(filePath: string): Database.Database {
  if (filePath !== ":memory:")
    mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  try {
    db.pragma("busy_timeout = 10000");
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    const version = db.pragma("user_version", { simple: true }) as number;
    if (version > 3)
      throw new Error(
        "This database was created by a newer shelter version. Update the application before opening it.",
      );
    db.exec(`
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS animals (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        breed TEXT NOT NULL,
        ageYears REAL NOT NULL CHECK (ageYears >= 0),
        gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Unknown')),
        size TEXT NOT NULL CHECK (size IN ('Small', 'Medium', 'Large')),
        description TEXT NOT NULL,
        imageUrl TEXT NOT NULL DEFAULT '',
        adoptionStatus TEXT NOT NULL CHECK (adoptionStatus IN ('Available', 'Pending', 'Adopted')),
        vaccinationInfo TEXT NOT NULL,
        spayNeuterStatus TEXT NOT NULL CHECK (spayNeuterStatus IN ('Yes', 'No', 'Unknown')),
        dietaryNeeds TEXT NOT NULL,
        behavioralInfo TEXT NOT NULL,
        specialCareRequirements TEXT NOT NULL,
        sortOrder INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS animals_type_idx ON animals(type);
      CREATE INDEX IF NOT EXISTS animals_status_idx ON animals(adoptionStatus);
    `);

    // The marker distinguishes an intentionally empty shelter from a new database.
    // This transaction prevents two Next.js workers from seeding the same file twice.
    db.transaction(() => {
      const seeded = db
        .prepare("SELECT value FROM app_metadata WHERE key = ?")
        .get("animals_seed_v1");
      if (!seeded) {
        const insert = db.prepare(`
          INSERT INTO animals (${animalColumns.join(", ")}, sortOrder)
          VALUES (${animalColumns.map((column) => "@" + column).join(", ")}, @sortOrder)
          ON CONFLICT(id) DO NOTHING
        `);
        seedAnimals.forEach((animal, sortOrder) =>
          insert.run({ ...animal, sortOrder }),
        );
        db.prepare("INSERT INTO app_metadata (key, value) VALUES (?, ?)").run(
          "animals_seed_v1",
          new Date().toISOString(),
        );
      }
      if (version < 1) db.pragma("user_version = 1");
    }).immediate();
    migrateAccounts(db);
    migrateAdmin(db);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

// Reuse the connection across development hot reloads; never expose it to the browser.
const globalDatabase = globalThis as typeof globalThis & {
  shelterConnections?: Map<string, Database.Database>;
};

export function getDatabase(): Database.Database {
  const filePath = getDatabasePath();
  const connections = (globalDatabase.shelterConnections ??= new Map());
  let db = connections.get(filePath);
  if (!db || !db.open) {
    db = openShelterDatabase(filePath);
    connections.set(filePath, db);
  }
  return db;
}
