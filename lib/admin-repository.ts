// Authors: Tyler Siedner and Tyler Harris
import type Database from "better-sqlite3";
import type { Animal } from "../types/animal";
import type {
  AdoptionApplication,
  VolunteerApplication,
} from "../types/account";
import { animalColumns } from "./database";
import { findUser } from "./account-repository";
import { text, InputError } from "./validation";
export type ManagedAnimal = Animal & { archived: number };
export function assertAdmin(db: Database.Database, actorId: string) {
  if (findUser(db, actorId)?.role !== "admin")
    throw new InputError("Administrator access is required.");
}
export function managedAnimals(
  db: Database.Database,
  actorId: string,
): ManagedAnimal[] {
  assertAdmin(db, actorId);
  return db
    .prepare(
      `SELECT ${animalColumns.join(",")},archived FROM animals ORDER BY archived,sortOrder,id`,
    )
    .all() as ManagedAnimal[];
}
export function managedAnimal(
  db: Database.Database,
  actorId: string,
  id: string,
): ManagedAnimal | undefined {
  assertAdmin(db, actorId);
  return db
    .prepare(
      `SELECT ${animalColumns.join(",")},archived FROM animals WHERE id=?`,
    )
    .get(id) as ManagedAnimal | undefined;
}
function choice<T extends string>(
  value: unknown,
  label: string,
  values: readonly T[],
): T {
  if (typeof value !== "string" || !values.includes(value as T))
    throw new InputError(`Choose a valid ${label}.`);
  return value as T;
}
export function validateAnimal(input: Record<string, unknown>): Animal {
  const id = text(input.id, "ID", 1, 100);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
    throw new InputError(
      "Use lowercase letters, numbers, and hyphens for the ID.",
    );
  if (typeof input.ageYears !== "string" && typeof input.ageYears !== "number")
    throw new InputError("Enter a valid age.");
  if (String(input.ageYears).trim() === "")
    throw new InputError("Age is required.");
  const ageYears = Number(input.ageYears);
  if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 1000)
    throw new InputError("Age must be between 0 and 1000 years.");
  const imageUrl = text(input.imageUrl, "Photo", 0, 500);
  if (
    imageUrl &&
    (!/^\/images\/[a-zA-Z0-9/_ .-]+\.(png|jpe?g|webp|gif)$/i.test(imageUrl) ||
      imageUrl.includes("..") ||
      imageUrl.includes("//"))
  )
    throw new InputError("Choose a local image from the images folder.");
  return {
    id,
    name: text(input.name, "Name", 1, 100),
    type: text(input.type, "Creature type", 1, 100),
    breed: text(input.breed, "Breed", 1, 100),
    ageYears,
    imageUrl,
    gender: choice(input.gender, "gender", ["Male", "Female", "Unknown"]),
    size: choice(input.size, "size", ["Small", "Medium", "Large"]),
    adoptionStatus: choice(input.adoptionStatus, "adoption status", [
      "Available",
      "Pending",
      "Adopted",
    ]),
    spayNeuterStatus: choice(input.spayNeuterStatus, "spay/neuter status", [
      "Yes",
      "No",
      "Unknown",
    ]),
    description: text(input.description, "Description", 10, 2000),
    vaccinationInfo: text(
      input.vaccinationInfo,
      "Vaccination information",
      1,
      2000,
    ),
    dietaryNeeds: text(input.dietaryNeeds, "Dietary needs", 1, 2000),
    behavioralInfo: text(input.behavioralInfo, "Behavior", 1, 2000),
    specialCareRequirements: text(
      input.specialCareRequirements,
      "Special care",
      1,
      2000,
    ),
  };
}
export function saveAnimal(
  db: Database.Database,
  actorId: string,
  input: Record<string, unknown>,
  creating: boolean,
): string {
  assertAdmin(db, actorId);
  const animal = validateAnimal(input);
  db.transaction(() => {
    const existing = managedAnimal(db, actorId, animal.id);
    if (creating) {
      if (existing)
        throw new InputError(
          "That ID is already in use. Choose a different ID.",
        );
      const order = (
        db
          .prepare("SELECT COALESCE(MAX(sortOrder),-1)+1 AS next FROM animals")
          .get() as { next: number }
      ).next;
      db.prepare(
        `INSERT INTO animals (${animalColumns.join(",")},sortOrder) VALUES (${animalColumns.map((c) => "@" + c).join(",")},@sortOrder)`,
      ).run({ ...animal, sortOrder: order });
    } else {
      if (!existing) throw new InputError("Resident not found.");
      if (
        animal.adoptionStatus !== "Adopted" &&
        db
          .prepare(
            "SELECT id FROM adoption_applications WHERE animalId=? AND status='Approved'",
          )
          .get(animal.id)
      )
        throw new InputError(
          "This resident has an approved adoption. Change that decision before changing availability.",
        );
      db.prepare(
        `UPDATE animals SET ${animalColumns
          .filter((c) => c !== "id")
          .map((c) => `${c}=@${c}`)
          .join(",")},updatedAt=CURRENT_TIMESTAMP WHERE id=@id`,
      ).run(animal);
    }
  }).immediate();
  return animal.id;
}
export function archiveAnimal(
  db: Database.Database,
  actorId: string,
  id: string,
  archived: boolean,
) {
  assertAdmin(db, actorId);
  if (
    !db
      .prepare(
        "UPDATE animals SET archived=?,updatedAt=CURRENT_TIMESTAMP WHERE id=?",
      )
      .run(archived ? 1 : 0, id).changes
  )
    throw new InputError("Resident not found.");
}
export function adminAdoptions(
  db: Database.Database,
  actorId: string,
): AdoptionApplication[] {
  assertAdmin(db, actorId);
  return db
    .prepare(
      "SELECT a.*,animals.name AS animalName,animals.archived AS animalArchived FROM adoption_applications a JOIN animals ON animals.id=a.animalId ORDER BY a.createdAt DESC,a.rowid DESC",
    )
    .all() as AdoptionApplication[];
}
export function adminVolunteers(
  db: Database.Database,
  actorId: string,
): VolunteerApplication[] {
  assertAdmin(db, actorId);
  return db
    .prepare(
      "SELECT a.*,o.title FROM volunteer_applications a JOIN volunteer_opportunities o ON o.id=a.opportunityId ORDER BY a.createdAt DESC,a.rowid DESC",
    )
    .all() as VolunteerApplication[];
}
export function reviewAdoption(
  db: Database.Database,
  actorId: string,
  id: string,
  status: string,
  notes: string,
) {
  assertAdmin(db, actorId);
  choice(status, "application status", [
    "Submitted",
    "Under Review",
    "Approved",
    "Rejected",
  ]);
  notes = text(notes, "Staff notes", 0, 2000);
  db.transaction(() => {
    const app = db
      .prepare("SELECT * FROM adoption_applications WHERE id=?")
      .get(id) as AdoptionApplication | undefined;
    if (!app) throw new InputError("Application not found.");
    if (app.status === "Withdrawn")
      throw new InputError("Withdrawn applications cannot be changed.");
    const animal = managedAnimal(db, actorId, app.animalId)!;
    if (app.status === "Approved" && !["Approved", "Rejected"].includes(status))
      throw new InputError(
        "To reverse an approval, change it to Rejected first.",
      );
    if (["Submitted", "Under Review", "Approved"].includes(status)) {
      if (animal.archived)
        throw new InputError(
          "Restore this resident before reopening or approving an application.",
        );
      if (animal.adoptionStatus === "Adopted" && app.status !== "Approved")
        throw new InputError("This resident is already adopted.");
      if (
        db
          .prepare(
            "SELECT id FROM adoption_applications WHERE userId=? AND animalId=? AND id<>? AND status IN ('Submitted','Under Review','Approved')",
          )
          .get(app.userId, app.animalId, id)
      )
        throw new InputError(
          "This applicant already has another active application for this resident.",
        );
    }
    if (
      status === "Approved" &&
      db
        .prepare(
          "SELECT id FROM adoption_applications WHERE animalId=? AND id<>? AND status='Approved'",
        )
        .get(app.animalId, id)
    )
      throw new InputError("Another application has already been approved.");
    db.prepare(
      "UPDATE adoption_applications SET status=?,staffNotes=?,reviewedBy=?,reviewedAt=CURRENT_TIMESTAMP,updatedAt=CURRENT_TIMESTAMP WHERE id=?",
    ).run(status, notes, actorId, id);
    if (status === "Approved") {
      db.prepare(
        "UPDATE animals SET adoptionStatus='Adopted',updatedAt=CURRENT_TIMESTAMP WHERE id=?",
      ).run(app.animalId);
      db.prepare(
        "UPDATE adoption_applications SET status='Rejected',staffNotes='Another application was approved.',reviewedBy=?,reviewedAt=CURRENT_TIMESTAMP,updatedAt=CURRENT_TIMESTAMP WHERE animalId=? AND id<>? AND status IN ('Submitted','Under Review')",
      ).run(actorId, app.animalId, id);
    } else if (
      status === "Under Review" &&
      animal.adoptionStatus === "Available"
    )
      db.prepare(
        "UPDATE animals SET adoptionStatus='Pending',updatedAt=CURRENT_TIMESTAMP WHERE id=?",
      ).run(app.animalId);
    else if (status === "Rejected") {
      const active = db
        .prepare(
          "SELECT id FROM adoption_applications WHERE animalId=? AND status IN ('Submitted','Under Review','Approved')",
        )
        .get(app.animalId);
      if (
        !active &&
        (animal.adoptionStatus === "Pending" || app.status === "Approved")
      )
        db.prepare(
          "UPDATE animals SET adoptionStatus='Available',updatedAt=CURRENT_TIMESTAMP WHERE id=?",
        ).run(app.animalId);
    }
  }).immediate();
}
export function reviewVolunteer(
  db: Database.Database,
  actorId: string,
  id: string,
  status: string,
  notes: string,
) {
  assertAdmin(db, actorId);
  choice(status, "volunteer status", [
    "Submitted",
    "Under Review",
    "Accepted",
    "Declined",
  ]);
  notes = text(notes, "Staff notes", 0, 2000);
  const app = db
    .prepare("SELECT * FROM volunteer_applications WHERE id=?")
    .get(id) as VolunteerApplication | undefined;
  if (!app) throw new InputError("Application not found.");
  if (app.status === "Withdrawn")
    throw new InputError("Withdrawn applications cannot be changed.");
  try {
    db.prepare(
      "UPDATE volunteer_applications SET status=?,staffNotes=?,reviewedBy=?,reviewedAt=CURRENT_TIMESTAMP,updatedAt=CURRENT_TIMESTAMP WHERE id=?",
    ).run(status, notes, actorId, id);
  } catch (error) {
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE")
      throw new InputError(
        "This applicant already has another active application for this opportunity.",
      );
    throw error;
  }
}
