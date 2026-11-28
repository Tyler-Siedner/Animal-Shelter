// Authors: Tyler Siedner and Tyler Harris
import type Database from "better-sqlite3";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { User } from "../types/account";
import { emailAddress, text, InputError } from "./validation";
const userColumns = "id,name,email,phone,address,role";
export function findUser(db: Database.Database, id: string): User | undefined {
  return db.prepare(`SELECT ${userColumns} FROM users WHERE id = ?`).get(id) as
    User | undefined;
}
export function findCredentials(
  db: Database.Database,
  email: string,
): (User & { passwordHash: string }) | undefined {
  return db
    .prepare(
      `SELECT ${userColumns},passwordHash FROM users WHERE email = ? COLLATE NOCASE`,
    )
    .get(email) as (User & { passwordHash: string }) | undefined;
}
export function createUser(
  db: Database.Database,
  name: string,
  email: string,
  passwordHash: string,
): User {
  name = text(name, "Name", 2, 100);
  email = emailAddress(email);
  if (findCredentials(db, email))
    throw new InputError(
      "An account with that email already exists. Please sign in.",
    );
  const id = randomUUID();
  try {
    db.prepare(
      "INSERT INTO users (id,name,email,passwordHash) VALUES (?,?,?,?)",
    ).run(id, name, email, passwordHash);
  } catch (error) {
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE")
      throw new InputError(
        "An account with that email already exists. Please sign in.",
      );
    throw error;
  }
  return findUser(db, id)!;
}
export function updateProfile(
  db: Database.Database,
  userId: string,
  name: string,
  phone: string,
  address: string,
) {
  db.prepare(
    "UPDATE users SET name = ?,phone = ?,address = ? WHERE id = ?",
  ).run(
    text(name, "Name", 2, 100),
    text(phone, "Phone", 0, 40),
    text(address, "Address", 0, 500),
    userId,
  );
}
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const sessionLifetime = 7 * 24 * 60 * 60 * 1000;
export function createSession(db: Database.Database, userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + sessionLifetime;
  db.prepare("DELETE FROM sessions WHERE expiresAt <= ?").run(Date.now());
  db.prepare(
    "INSERT INTO sessions (tokenHash,userId,expiresAt) VALUES (?,?,?)",
  ).run(tokenHash(token), userId, expiresAt);
  return { token, expiresAt };
}
export function sessionUser(
  db: Database.Database,
  token: string,
): User | undefined {
  if (!/^[a-f0-9]{64}$/.test(token)) return undefined;
  const session = db
    .prepare(
      "SELECT userId FROM sessions WHERE tokenHash = ? AND expiresAt > ?",
    )
    .get(tokenHash(token), Date.now()) as { userId: string } | undefined;
  return session ? findUser(db, session.userId) : undefined;
}
export function revokeSession(db: Database.Database, token: string) {
  db.prepare("DELETE FROM sessions WHERE tokenHash = ?").run(tokenHash(token));
}
export function replacePassword(
  db: Database.Database,
  userId: string,
  passwordHash: string,
) {
  db.transaction(() => {
    db.prepare("UPDATE users SET passwordHash = ? WHERE id = ?").run(
      passwordHash,
      userId,
    );
    db.prepare("DELETE FROM sessions WHERE userId = ?").run(userId);
  }).immediate();
}
// Keep attempt limits after a restart.
export function takeAuthAttempt(
  db: Database.Database,
  identity: string,
  limit = 10,
) {
  const key = tokenHash(identity);
  const now = Date.now();
  const window = 15 * 60 * 1000;
  db.transaction(() => {
    db.prepare("DELETE FROM auth_attempts WHERE windowStart < ?").run(
      now - window,
    );
    const entry = db
      .prepare("SELECT attempts FROM auth_attempts WHERE key = ?")
      .get(key) as { attempts: number } | undefined;
    if (entry && entry.attempts >= limit)
      throw new InputError(
        "Too many attempts. Please try again in 15 minutes.",
      );
    db.prepare(
      "INSERT INTO auth_attempts (key,attempts,windowStart) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1",
    ).run(key, now);
  }).immediate();
}
export function clearAuthAttempts(db: Database.Database, identity: string) {
  db.prepare("DELETE FROM auth_attempts WHERE key = ?").run(
    tokenHash(identity),
  );
}
