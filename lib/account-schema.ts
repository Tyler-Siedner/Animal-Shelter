// Authors: Tyler Siedner and Tyler Harris
import type Database from "better-sqlite3";

// Version 2 is additive: existing animals and the seed marker are preserved.
export function migrateAccounts(db: Database.Database) {
  db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        passwordHash TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        address TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sessions (
        tokenHash TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expiresAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(userId);
      CREATE TABLE IF NOT EXISTS auth_attempts (
        key TEXT PRIMARY KEY NOT NULL,
        attempts INTEGER NOT NULL,
        windowStart INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS favorites (
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        animalId TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(userId, animalId)
      );
      CREATE TABLE IF NOT EXISTS adoption_applications (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        animalId TEXT NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
        applicantName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        livingSituation TEXT NOT NULL,
        petExperience TEXT NOT NULL,
        carePlan TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Submitted'
          CHECK(status IN ('Submitted','Under Review','Approved','Rejected','Withdrawn')),
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS adoption_user_idx ON adoption_applications(userId);
      CREATE UNIQUE INDEX IF NOT EXISTS adoption_active_unique
        ON adoption_applications(userId,animalId)
        WHERE status IN ('Submitted','Under Review','Approved');
      CREATE TABLE IF NOT EXISTS volunteer_opportunities (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        schedule TEXT NOT NULL,
        requirements TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
      );
      CREATE TABLE IF NOT EXISTS volunteer_applications (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        opportunityId TEXT NOT NULL REFERENCES volunteer_opportunities(id) ON DELETE RESTRICT,
        applicantName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        availability TEXT NOT NULL,
        experience TEXT NOT NULL,
        motivation TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Submitted'
          CHECK(status IN ('Submitted','Under Review','Accepted','Declined','Withdrawn')),
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS volunteer_user_idx ON volunteer_applications(userId);
      CREATE UNIQUE INDEX IF NOT EXISTS volunteer_active_unique
        ON volunteer_applications(userId,opportunityId)
        WHERE status IN ('Submitted','Under Review','Accepted');
    `);
    if (
      !db
        .prepare("SELECT key FROM app_metadata WHERE key = 'volunteer_seed_v1'")
        .get()
    ) {
      const insert = db.prepare(
        "INSERT INTO volunteer_opportunities (id,title,description,schedule,requirements) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
      );
      insert.run(
        "shelter-support",
        "Shelter support",
        "Help prepare supplies, clean unoccupied enclosures, and organize the shelter.",
        "Saturdays, 10 a.m.–noon",
        "Age 18 or older. An orientation session is required.",
      );
      insert.run(
        "resident-records",
        "Resident records",
        "Help staff organize resident records and prepare adoption information.",
        "Tuesdays and Thursdays, 4–6 p.m.",
        "Basic computer skills and attention to detail.",
      );
      insert.run(
        "visitor-support",
        "Visitor support",
        "Welcome visitors and help them find shelter information.",
        "Sundays, 1–4 p.m.",
        "Comfortable speaking with visitors. Orientation is provided.",
      );
      db.prepare(
        "INSERT INTO app_metadata (key,value) VALUES ('volunteer_seed_v1',?)",
      ).run(new Date().toISOString());
    }
    db.pragma("user_version = 2");
  }).immediate();
}
