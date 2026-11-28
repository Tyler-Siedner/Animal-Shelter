// Authors: Tyler Siedner and Tyler Harris
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { openShelterDatabase } from "../lib/database";
import { createUser } from "../lib/account-repository";
import { readAnimals, readAnimalById } from "../lib/animal-repository";
import {
  managedAnimals,
  saveAnimal,
  archiveAnimal,
  adminAdoptions,
  reviewAdoption,
  reviewVolunteer,
} from "../lib/admin-repository";
import {
  submitAdoption,
  userAdoptions,
  withdrawAdoption,
  setFavorite,
  favoriteAnimals,
  submitVolunteer,
  userVolunteerApplications,
} from "../lib/application-repository";
import {
  submitMessage,
  myMessages,
  adminMessages,
  replyToMessage,
} from "../lib/contact-repository";
function fixture() {
  const base = path.join(process.cwd(), ".tmp-tests");
  mkdirSync(base, { recursive: true });
  const dir = mkdtempSync(path.join(base, "admin-"));
  const db = openShelterDatabase(path.join(dir, "shelter.sqlite"));
  const admin = createUser(db, "Staff User", "staff@example.com", "hash"),
    a = createUser(db, "Applicant A", "a@example.com", "hash"),
    b = createUser(db, "Applicant B", "b@example.com", "hash");
  db.prepare("UPDATE users SET role='admin' WHERE id=?").run(admin.id);
  return {
    db,
    admin,
    a,
    b,
    cleanup() {
      if (db.open) db.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
const adoption = {
  animalId: "xeno-kitten",
  applicantName: "Test Applicant",
  phone: "555-010-1234",
  address: "123 Test Street",
  livingSituation: "A home with secure housing.",
  petExperience: "Several years of experience.",
  carePlan: "Specialist care and appropriate containment.",
};
const volunteer = {
  opportunityId: "resident-records",
  applicantName: "Test Applicant",
  phone: "555-010-1234",
  availability: "Tuesday afternoons",
  experience: "I have worked with records before.",
  motivation: "I would like to support the shelter.",
};

test("ordinary or revoked users cannot read admin data or mutate residents", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const animal = readAnimalById(f.db, "xeno-kitten")!;
  assert.throws(() => managedAnimals(f.db, f.a.id), /Administrator/);
  assert.throws(
    () => saveAnimal(f.db, f.a.id, { ...animal, name: "Unauthorized" }, false),
    /Administrator/,
  );
  assert.throws(
    () => archiveAnimal(f.db, f.a.id, animal.id, true),
    /Administrator/,
  );
  assert.throws(() => adminAdoptions(f.db, f.a.id), /Administrator/);
  f.db.prepare("UPDATE users SET role='user' WHERE id=?").run(f.admin.id);
  assert.throws(() => managedAnimals(f.db, f.admin.id), /Administrator/);
  assert.equal(readAnimalById(f.db, animal.id)?.name, "Jonesy");
});
test("staff can add/edit/remove/restore profiles without losing applications", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const original = readAnimalById(f.db, "xeno-kitten")!;
  saveAnimal(
    f.db,
    f.admin.id,
    { ...original, id: "new-resident", name: "New resident" },
    true,
  );
  assert.equal(readAnimals(f.db).length, 10);
  saveAnimal(f.db, f.admin.id, { ...original, name: "Renamed Jonesy" }, false);
  setFavorite(f.db, f.a.id, original.id, true);
  submitAdoption(f.db, f.a, adoption);
  archiveAnimal(f.db, f.admin.id, original.id, true);
  assert.equal(readAnimalById(f.db, original.id), undefined);
  assert.equal(favoriteAnimals(f.db, f.a.id).length, 0);
  assert.equal(userAdoptions(f.db, f.a.id)[0].animalName, "Renamed Jonesy");
  assert.equal(userAdoptions(f.db, f.a.id)[0].animalArchived, 1);
  archiveAnimal(f.db, f.admin.id, original.id, false);
  assert.equal(favoriteAnimals(f.db, f.a.id).length, 1);
});
test("resident validation rejects duplicate IDs, traversal paths, remote images, and invalid ages", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const a = readAnimalById(f.db, "xeno-kitten")!;
  assert.throws(() => saveAnimal(f.db, f.admin.id, a, true), /already in use/);
  for (const change of [
    { id: "../escape" },
    { imageUrl: "/images/../file.png" },
    { imageUrl: "https://evil.invalid/a.png" },
    { ageYears: -1 },
    { ageYears: "" },
    { gender: "other" },
  ])
    assert.throws(() =>
      saveAnimal(f.db, f.admin.id, { ...a, ...change }, false),
    );
});
test("adoption review updates animal availability, prevents double approval, and explains rejected applications", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const a = submitAdoption(f.db, f.a, adoption),
    b = submitAdoption(f.db, f.b, adoption);
  reviewAdoption(
    f.db,
    f.admin.id,
    a,
    "Under Review",
    "Reviewing your care plan.",
  );
  assert.equal(
    readAnimalById(f.db, adoption.animalId)?.adoptionStatus,
    "Pending",
  );
  reviewAdoption(f.db, f.admin.id, a, "Approved", "Approved by staff.");
  assert.equal(
    readAnimalById(f.db, adoption.animalId)?.adoptionStatus,
    "Adopted",
  );
  assert.equal(userAdoptions(f.db, f.b.id)[0].status, "Rejected");
  assert.match(
    userAdoptions(f.db, f.b.id)[0].staffNotes,
    /Another application/,
  );
  assert.throws(
    () => reviewAdoption(f.db, f.admin.id, b, "Approved", ""),
    /already adopted|already been approved/,
  );
  assert.throws(
    () =>
      saveAnimal(
        f.db,
        f.admin.id,
        {
          ...readAnimalById(f.db, adoption.animalId)!,
          adoptionStatus: "Available",
        },
        false,
      ),
    /approved adoption/,
  );
  reviewAdoption(f.db, f.admin.id, a, "Rejected", "Approval reversed.");
  assert.equal(
    readAnimalById(f.db, adoption.animalId)?.adoptionStatus,
    "Available",
  );
});
test("withdrawal releases a pending resident when no other active applications remain", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const id = submitAdoption(f.db, f.a, adoption);
  reviewAdoption(f.db, f.admin.id, id, "Under Review", "");
  withdrawAdoption(f.db, f.a.id, id);
  assert.equal(
    readAnimalById(f.db, adoption.animalId)?.adoptionStatus,
    "Available",
  );
  assert.throws(
    () => reviewAdoption(f.db, f.admin.id, id, "Approved", ""),
    /Withdrawn/,
  );
});
test("volunteer decisions and notes are visible only in the applicant's list", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const id = submitVolunteer(f.db, f.a, volunteer);
  assert.throws(
    () => reviewVolunteer(f.db, f.b.id, id, "Accepted", ""),
    /Administrator/,
  );
  reviewVolunteer(
    f.db,
    f.admin.id,
    id,
    "Accepted",
    "Please attend orientation.",
  );
  assert.equal(userVolunteerApplications(f.db, f.a.id)[0].status, "Accepted");
  assert.equal(
    userVolunteerApplications(f.db, f.a.id)[0].staffNotes,
    "Please attend orientation.",
  );
  assert.equal(userVolunteerApplications(f.db, f.b.id).length, 0);
});
test("guest and registered contact messages are stored and account replies are private", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const input = {
    name: "Test Sender",
    email: "sender@example.com",
    phone: "",
    subject: "Question about Jonesy",
    message: "Can you explain the care requirements?",
    animalId: "xeno-kitten",
  };
  const id = submitMessage(f.db, f.a.id, input);
  submitMessage(f.db, null, { ...input, subject: "Guest inquiry" });
  assert.equal(myMessages(f.db, f.a.id).length, 1);
  assert.equal(myMessages(f.db, f.b.id).length, 0);
  assert.throws(() => adminMessages(f.db, f.b.id), /Administrator/);
  assert.throws(
    () => replyToMessage(f.db, f.b.id, id, "Resolved", "Unauthorized reply"),
    /Administrator/,
  );
  replyToMessage(
    f.db,
    f.admin.id,
    id,
    "Resolved",
    "Staff can explain the care plan.",
  );
  assert.equal(
    myMessages(f.db, f.a.id)[0].reply,
    "Staff can explain the care plan.",
  );
  assert.equal(adminMessages(f.db, f.admin.id).length, 2);
});
test("contact input rejects unknown residents and limits repeated submissions", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  const input = {
    name: "Test Sender",
    email: "sender@example.com",
    phone: "",
    subject: "Shelter question",
    message: "A genuine question about the shelter.",
    animalId: "",
  };
  assert.throws(() =>
    submitMessage(f.db, null, { ...input, email: "invalid" }),
  );
  assert.throws(
    () => submitMessage(f.db, null, { ...input, animalId: "missing" }),
    /no longer listed/,
  );
  for (let i = 0; i < 5; i++) submitMessage(f.db, null, input);
  assert.throws(() => submitMessage(f.db, null, input), /Too many attempts/);
});
test("version 2 migration retains existing account, favorite, and application records", (t) => {
  const f = fixture();
  t.after(f.cleanup);
  setFavorite(f.db, f.a.id, "xeno-kitten", true);
  submitAdoption(f.db, f.a, adoption);
  f.db.pragma("user_version=2");
  f.db.close();
  const reopened = openShelterDatabase(
    (f.db as unknown as { name: string }).name,
  );
  try {
    assert.equal(reopened.pragma("user_version", { simple: true }), 3);
    assert.equal(userAdoptions(reopened, f.a.id).length, 1);
    assert.equal(favoriteAnimals(reopened, f.a.id).length, 1);
  } finally {
    reopened.close();
  }
});
