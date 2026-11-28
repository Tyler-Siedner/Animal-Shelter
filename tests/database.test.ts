// Authors: Tyler Siedner and Tyler Harris
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { animals as seedAnimals } from "../data/animals";
import { openShelterDatabase } from "../lib/database";
import { readAnimals, readAnimalById } from "../lib/animal-repository";

function fixture() {
  const base = path.join(process.cwd(), ".tmp-tests");
  mkdirSync(base, { recursive: true });
  const directory = mkdtempSync(path.join(base, "sqlite-"));
  const filePath = path.join(directory, "shelter.sqlite");
  const db = openShelterDatabase(filePath);
  return {
    db,
    filePath,
    cleanup() {
      if (db.open) db.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

test("new database contains exactly the nine seed records in directory order", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  assert.deepEqual(readAnimals(f.db), seedAnimals);
  assert.equal(f.db.pragma("integrity_check", { simple: true }), "ok");
});

test("saved changes survive a separate Node process and reseeding does not overwrite them", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  f.db
    .prepare("UPDATE animals SET name = ?, adoptionStatus = ? WHERE id = ?")
    .run("Jonesy saved in SQLite", "Pending", "xeno-kitten");
  f.db.close();
  const output = execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      `
    import { openShelterDatabase } from './lib/database.ts';
    import { readAnimalById, readAnimals } from './lib/animal-repository.ts';
    const db = openShelterDatabase(process.env.SHELTER_DB_PATH);
    console.log(JSON.stringify({ animal: readAnimalById(db, 'xeno-kitten'), count: readAnimals(db).length }));
    db.close();
  `,
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, SHELTER_DB_PATH: f.filePath },
      encoding: "utf8",
    },
  );
  const saved = JSON.parse(output);
  assert.equal(saved.animal.name, "Jonesy saved in SQLite");
  assert.equal(saved.animal.adoptionStatus, "Pending");
  assert.equal(saved.count, seedAnimals.length);
});

test("unknown IDs and SQL-like text never return an unrelated resident", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  assert.equal(readAnimalById(f.db, "not-a-resident"), undefined);
  assert.equal(readAnimalById(f.db, "' OR 1=1 --"), undefined);
  assert.equal(readAnimals(f.db).length, 9);
});

test("invalid ages and statuses are rejected by the database", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  assert.throws(
    () =>
      f.db
        .prepare("UPDATE animals SET ageYears = -1 WHERE id = ?")
        .run("queen"),
    /CHECK constraint/,
  );
  assert.throws(
    () =>
      f.db
        .prepare("UPDATE animals SET adoptionStatus = 'Missing' WHERE id = ?")
        .run("queen"),
    /CHECK constraint/,
  );
  assert.equal(readAnimalById(f.db, "queen")?.ageYears, 5);
});

test("a failed transaction rolls back earlier changes", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  assert.throws(() =>
    f.db.transaction(() => {
      f.db
        .prepare("UPDATE animals SET name = 'Should roll back' WHERE id = ?")
        .run("queen");
      f.db
        .prepare("UPDATE animals SET size = 'Impossible' WHERE id = ?")
        .run("queen");
    })(),
  );
  assert.equal(readAnimalById(f.db, "queen")?.name, "Queenie");
});

test("reopening an intentionally emptied shelter does not recreate removed residents", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  f.db.prepare("DELETE FROM animals").run();
  f.db.close();
  const reopened = openShelterDatabase(f.filePath);
  try {
    assert.equal(readAnimals(reopened).length, 0);
  } finally {
    reopened.close();
  }
});
