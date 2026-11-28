// Authors: Tyler Siedner and Tyler Harris
import type Database from "better-sqlite3";
export function migrateAdmin(db: Database.Database) {
  db.transaction(() => {
    const addColumn = (table: string, name: string, definition: string) => {
      const columns = db.pragma(`table_info(${table})`) as { name: string }[];
      if (!columns.some((column) => column.name === name))
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
    };
    addColumn(
      "animals",
      "archived",
      "INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1))",
    );
    for (const table of ["adoption_applications", "volunteer_applications"]) {
      addColumn(table, "staffNotes", "TEXT NOT NULL DEFAULT ''");
      addColumn(
        table,
        "reviewedBy",
        "TEXT REFERENCES users(id) ON DELETE SET NULL",
      );
      addColumn(table, "reviewedAt", "TEXT");
    }
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS one_approved_adoption ON adoption_applications(animalId) WHERE status='Approved';
      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT REFERENCES users(id) ON DELETE SET NULL,
        animalId TEXT REFERENCES animals(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New','In Progress','Resolved')),
        reply TEXT NOT NULL DEFAULT '',
        repliedBy TEXT REFERENCES users(id) ON DELETE SET NULL,
        repliedAt TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS contact_user_idx ON contact_messages(userId);
    `);
    db.pragma("user_version = 3");
  }).immediate();
}
