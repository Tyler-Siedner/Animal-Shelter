// Authors: Tyler Siedner and Tyler Harris
import { existsSync } from "node:fs";
import path from "node:path";
import { getDatabasePath, openShelterDatabase } from "../lib/database";
import { readAnimals } from "../lib/animal-repository";

const filePath = getDatabasePath();
if (!existsSync(filePath)) {
  console.error("Database not found. Run npm run db:seed first.");
  process.exitCode = 1;
} else {
  const db = openShelterDatabase(filePath);
  try {
    const integrity = db.pragma("integrity_check", { simple: true });
    if (integrity !== "ok")
      throw new Error(`SQLite integrity check failed: ${integrity}`);
    console.log(
      `Schema version: ${db.pragma("user_version", { simple: true })}`,
    );
    for (const table of [
      "users",
      "favorites",
      "adoption_applications",
      "volunteer_opportunities",
      "volunteer_applications",
    ]) {
      const result = db
        .prepare(`SELECT COUNT(*) AS count FROM ${table}`)
        .get() as { count: number };
      console.log(`${table}: ${result.count}`);
    }
    const animals = readAnimals(db);
    console.log(`SQLite integrity: ${integrity}`);
    console.log(`Database: ${filePath}`);
    console.table(
      animals.map(({ id, name, type, adoptionStatus }) => ({
        id,
        name,
        type,
        adoptionStatus,
      })),
    );
    const missingImages = animals.filter(
      (animal) =>
        animal.imageUrl &&
        !existsSync(path.join(process.cwd(), "public", animal.imageUrl)),
    );
    if (missingImages.length) {
      console.error(
        "Missing image files:",
        missingImages.map((animal) => animal.imageUrl),
      );
      process.exitCode = 1;
    } else {
      console.log(`All ${animals.length} resident image paths checked.`);
    }
  } finally {
    db.close();
  }
}
