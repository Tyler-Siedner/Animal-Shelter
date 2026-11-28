// Authors: Tyler Siedner and Tyler Harris
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { openShelterDatabase } from "../lib/database";
import { hashPassword, verifyPassword } from "../lib/passwords";
import {
  createUser,
  findUser,
  findCredentials,
  createSession,
  sessionUser,
  revokeSession,
  replacePassword,
  takeAuthAttempt,
} from "../lib/account-repository";
import {
  favoriteIds,
  setFavorite,
  submitAdoption,
  userAdoptions,
  withdrawAdoption,
  opportunities,
  submitVolunteer,
  userVolunteerApplications,
  withdrawVolunteer,
} from "../lib/application-repository";
import { safeNext, passwordValue, emailAddress } from "../lib/validation";
function fixture() {
  const base = path.join(process.cwd(), ".tmp-tests");
  mkdirSync(base, { recursive: true });
  const directory = mkdtempSync(path.join(base, "accounts-"));
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
const adoption = {
  animalId: "xeno-kitten",
  applicantName: "Test One",
  phone: "555-010-1234",
  address: "123 Test Lane",
  livingSituation: "Own a home with a secure enclosure.",
  petExperience: "Several years caring for animals.",
  carePlan: "Provide specialist care and secure containment.",
};
const volunteer = {
  opportunityId: "shelter-support",
  applicantName: "Test One",
  phone: "555-010-1234",
  availability: "Saturday mornings",
  experience: "I have helped at shelters before.",
  motivation: "I want to support the shelter residents.",
};

test("passwords use different salts and verify without storing plaintext", async () => {
  const password = "a long test password";
  const a = await hashPassword(password);
  const b = await hashPassword(password);
  assert.notEqual(a, b);
  assert.ok(!a.includes(password));
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword("wrong password", a), false);
  assert.equal(await verifyPassword(password, "invalid"), false);
});
test("account email is normalized, unique, and public user reads omit the hash", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const u = createUser(f.db, "Test User", "TEST@EXAMPLE.COM", "hash");
  assert.equal(u.email, "test@example.com");
  assert.equal(u.role, "user");
  assert.ok(!("passwordHash" in findUser(f.db, u.id)!));
  assert.equal(findCredentials(f.db, "test@example.com")?.passwordHash, "hash");
  assert.throws(
    () => createUser(f.db, "Another", "test@example.com", "hash"),
    /already exists/,
  );
});
test("sessions store only token hashes, expire, and can be revoked", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const u = createUser(f.db, "Test User", "test@example.com", "hash");
  const a = createSession(f.db, u.id);
  const stored = f.db.prepare("SELECT tokenHash FROM sessions").get() as {
    tokenHash: string;
  };
  assert.notEqual(stored.tokenHash, a.token);
  assert.equal(sessionUser(f.db, a.token)?.id, u.id);
  assert.equal(sessionUser(f.db, "invalid"), undefined);
  revokeSession(f.db, a.token);
  assert.equal(sessionUser(f.db, a.token), undefined);
  const b = createSession(f.db, u.id);
  f.db.prepare("UPDATE sessions SET expiresAt=1").run();
  assert.equal(sessionUser(f.db, b.token), undefined);
});
test("password changes revoke all existing sessions", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const u = createUser(f.db, "Test User", "test@example.com", "oldhash");
  const a = createSession(f.db, u.id),
    b = createSession(f.db, u.id);
  replacePassword(f.db, u.id, "newhash");
  assert.equal(findCredentials(f.db, u.email)?.passwordHash, "newhash");
  assert.equal(sessionUser(f.db, a.token), undefined);
  assert.equal(sessionUser(f.db, b.token), undefined);
});
test("login throttling persists in SQLite and resets after its window", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  for (let i = 0; i < 3; i++) takeAuthAttempt(f.db, "test", 3);
  assert.throws(() => takeAuthAttempt(f.db, "test", 3), /Too many attempts/);
  f.db.prepare("UPDATE auth_attempts SET windowStart=0").run();
  assert.doesNotThrow(() => takeAuthAttempt(f.db, "test", 3));
});
test("favorites are idempotent and private to each user", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const a = createUser(f.db, "User A", "a@example.com", "hash"),
    b = createUser(f.db, "User B", "b@example.com", "hash");
  setFavorite(f.db, a.id, "xeno-kitten", true);
  setFavorite(f.db, a.id, "xeno-kitten", true);
  assert.deepEqual(favoriteIds(f.db, a.id), ["xeno-kitten"]);
  assert.deepEqual(favoriteIds(f.db, b.id), []);
  setFavorite(f.db, b.id, "xeno-kitten", false);
  assert.equal(favoriteIds(f.db, a.id).length, 1);
  assert.throws(() => setFavorite(f.db, a.id, "missing", true), /not be found/);
});
test("adoption submissions reject duplicates, unavailable residents, invalid fields, and cross-user withdrawals", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const a = createUser(f.db, "User A", "a@example.com", "hash"),
    b = createUser(f.db, "User B", "b@example.com", "hash");
  const id = submitAdoption(f.db, a, adoption);
  assert.equal(userAdoptions(f.db, a.id)[0].status, "Submitted");
  assert.equal(userAdoptions(f.db, a.id)[0].email, a.email);
  assert.equal(userAdoptions(f.db, b.id).length, 0);
  assert.throws(() => submitAdoption(f.db, a, adoption), /active application/);
  assert.throws(
    () => submitAdoption(f.db, a, { ...adoption, animalId: "queen" }),
    /not currently accepting/,
  );
  assert.throws(
    () => submitAdoption(f.db, a, { ...adoption, phone: "1" }),
    /Phone/,
  );
  assert.throws(() => withdrawAdoption(f.db, b.id, id), /cannot be withdrawn/);
  withdrawAdoption(f.db, a.id, id);
  assert.equal(userAdoptions(f.db, a.id)[0].status, "Withdrawn");
  assert.doesNotThrow(() => submitAdoption(f.db, a, adoption));
});
test("volunteer applications enforce availability, duplicates, and ownership", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const a = createUser(f.db, "User A", "a@example.com", "hash"),
    b = createUser(f.db, "User B", "b@example.com", "hash");
  assert.equal(opportunities(f.db).length, 3);
  const id = submitVolunteer(f.db, a, volunteer);
  assert.equal(userVolunteerApplications(f.db, a.id)[0].status, "Submitted");
  assert.equal(userVolunteerApplications(f.db, b.id).length, 0);
  assert.throws(
    () => submitVolunteer(f.db, a, volunteer),
    /active application/,
  );
  assert.throws(() => withdrawVolunteer(f.db, b.id, id), /cannot be withdrawn/);
  withdrawVolunteer(f.db, a.id, id);
  assert.equal(userVolunteerApplications(f.db, a.id)[0].status, "Withdrawn");
  f.db
    .prepare("UPDATE volunteer_opportunities SET active=0 WHERE id=?")
    .run(volunteer.opportunityId);
  assert.throws(
    () => submitVolunteer(f.db, a, volunteer),
    /no longer available/,
  );
});
test("version 1 databases migrate without replacing existing animals", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  f.db
    .prepare(
      "UPDATE animals SET name='Existing custom name' WHERE id='xeno-kitten'",
    )
    .run();
  for (const table of [
    "volunteer_applications",
    "volunteer_opportunities",
    "adoption_applications",
    "favorites",
    "sessions",
    "auth_attempts",
    "users",
  ])
    f.db.exec(`DROP TABLE ${table}`);
  f.db.prepare("DELETE FROM app_metadata WHERE key='volunteer_seed_v1'").run();
  f.db.pragma("user_version = 1");
  f.db.close();
  const upgraded = openShelterDatabase(f.filePath);
  try {
    assert.equal(upgraded.pragma("user_version", { simple: true }), 2);
    assert.equal(
      (
        upgraded
          .prepare("SELECT name FROM animals WHERE id='xeno-kitten'")
          .get() as { name: string }
      ).name,
      "Existing custom name",
    );
    assert.equal(opportunities(upgraded).length, 3);
    assert.equal(
      (
        upgraded.prepare("SELECT COUNT(*) AS count FROM animals").get() as {
          count: number;
        }
      ).count,
      9,
    );
  } finally {
    upgraded.close();
  }
});
test("validation rejects unsafe return URLs and unreasonable credentials", () => {
  assert.equal(safeNext("https://evil.invalid"), "/account");
  assert.equal(
    safeNext("/volunteer/apply?opportunity=resident-records"),
    "/volunteer/apply?opportunity=resident-records",
  );
  assert.equal(
    safeNext("/volunteer/apply?opportunity=//evil.invalid"),
    "/account",
  );
  assert.equal(safeNext("//evil.invalid"), "/account");
  assert.equal(safeNext("/animals/xeno-kitten"), "/animals/xeno-kitten");
  assert.throws(() => passwordValue("short"));
  assert.throws(() => passwordValue("x".repeat(129)));
  assert.throws(() => emailAddress("invalid"));
});

test("accounts, favorites, applications, and sessions survive closing and reopening SQLite", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const user = createUser(
    f.db,
    "Persistent User",
    "persistent@example.com",
    "stored-hash",
  );
  setFavorite(f.db, user.id, "xeno-kitten", true);
  submitAdoption(f.db, user, adoption);
  submitVolunteer(f.db, user, volunteer);
  const session = createSession(f.db, user.id);
  f.db.close();
  const reopened = openShelterDatabase(f.filePath);
  try {
    assert.equal(
      findCredentials(reopened, user.email)?.passwordHash,
      "stored-hash",
    );
    assert.deepEqual(favoriteIds(reopened, user.id), ["xeno-kitten"]);
    assert.equal(userAdoptions(reopened, user.id).length, 1);
    assert.equal(userVolunteerApplications(reopened, user.id).length, 1);
    assert.equal(sessionUser(reopened, session.token)?.id, user.id);
  } finally {
    reopened.close();
  }
});
