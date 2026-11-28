// Authors: Tyler Siedner and Tyler Harris
import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import type { Animal } from "../types/animal";
import type {
  User,
  Opportunity,
  AdoptionApplication,
  VolunteerApplication,
} from "../types/account";
import { InputError, text } from "./validation";
import { readAnimalById } from "./animal-repository";

export function favoriteIds(db: Database.Database, userId: string): string[] {
  return (
    db
      .prepare(
        "SELECT animalId FROM favorites WHERE userId = ? ORDER BY createdAt DESC",
      )
      .all(userId) as { animalId: string }[]
  ).map((row) => row.animalId);
}
export function setFavorite(
  db: Database.Database,
  userId: string,
  animalId: string,
  saved: boolean,
) {
  if (!readAnimalById(db, animalId))
    throw new InputError("This resident could not be found.");
  if (saved)
    db.prepare(
      "INSERT INTO favorites (userId,animalId) VALUES (?,?) ON CONFLICT DO NOTHING",
    ).run(userId, animalId);
  else
    db.prepare("DELETE FROM favorites WHERE userId = ? AND animalId = ?").run(
      userId,
      animalId,
    );
}
export function favoriteAnimals(
  db: Database.Database,
  userId: string,
): Animal[] {
  const ids = favoriteIds(db, userId);
  return ids
    .map((id) => readAnimalById(db, id))
    .filter((animal): animal is Animal => Boolean(animal));
}
export type AdoptionInput = {
  animalId: string;
  applicantName: string;
  phone: string;
  address: string;
  livingSituation: string;
  petExperience: string;
  carePlan: string;
};
export function submitAdoption(
  db: Database.Database,
  user: User,
  input: AdoptionInput,
): string {
  const values = {
    animalId: text(input.animalId, "Resident", 1, 100),
    applicantName: text(input.applicantName, "Name", 2, 100),
    phone: text(input.phone, "Phone", 7, 40),
    address: text(input.address, "Address", 5, 500),
    livingSituation: text(input.livingSituation, "Living situation", 10, 2000),
    petExperience: text(input.petExperience, "Pet experience", 10, 2000),
    carePlan: text(input.carePlan, "Care plan", 10, 2000),
  };
  return db
    .transaction(() => {
      const animal = readAnimalById(db, values.animalId);
      if (!animal || animal.adoptionStatus !== "Available")
        throw new InputError(
          "This resident is not currently accepting applications.",
        );
      if (
        db
          .prepare(
            "SELECT id FROM adoption_applications WHERE userId = ? AND animalId = ? AND status IN ('Submitted','Under Review','Approved')",
          )
          .get(user.id, values.animalId)
      )
        throw new InputError(
          "You already have an active application for this resident.",
        );
      const id = randomUUID();
      db.prepare(
        `INSERT INTO adoption_applications (id,userId,animalId,applicantName,email,phone,address,livingSituation,petExperience,carePlan)
      VALUES (@id,@userId,@animalId,@applicantName,@email,@phone,@address,@livingSituation,@petExperience,@carePlan)`,
      ).run({ ...values, id, userId: user.id, email: user.email });
      return id;
    })
    .immediate();
}
export function userAdoptions(
  db: Database.Database,
  userId: string,
): AdoptionApplication[] {
  return db
    .prepare(
      `SELECT a.*, animals.name AS animalName, animals.archived AS animalArchived FROM adoption_applications a JOIN animals ON animals.id=a.animalId WHERE a.userId = ? ORDER BY a.createdAt DESC,a.rowid DESC`,
    )
    .all(userId) as AdoptionApplication[];
}
export function withdrawAdoption(
  db: Database.Database,
  userId: string,
  id: string,
) {
  db.transaction(() => {
    const application = db
      .prepare(
        "SELECT animalId FROM adoption_applications WHERE id=? AND userId=? AND status IN ('Submitted','Under Review')",
      )
      .get(id, userId) as { animalId: string } | undefined;
    if (!application)
      throw new InputError("This application cannot be withdrawn.");
    db.prepare(
      "UPDATE adoption_applications SET status='Withdrawn',updatedAt=CURRENT_TIMESTAMP WHERE id=? AND userId=?",
    ).run(id, userId);
    const active = db
      .prepare(
        "SELECT id FROM adoption_applications WHERE animalId=? AND status IN ('Submitted','Under Review','Approved')",
      )
      .get(application.animalId);
    if (!active)
      db.prepare(
        "UPDATE animals SET adoptionStatus='Available',updatedAt=CURRENT_TIMESTAMP WHERE id=? AND adoptionStatus='Pending'",
      ).run(application.animalId);
  }).immediate();
}
export function opportunities(db: Database.Database): Opportunity[] {
  return db
    .prepare(
      "SELECT * FROM volunteer_opportunities WHERE active=1 ORDER BY rowid",
    )
    .all() as Opportunity[];
}
export type VolunteerInput = {
  opportunityId: string;
  applicantName: string;
  phone: string;
  availability: string;
  experience: string;
  motivation: string;
};
export function submitVolunteer(
  db: Database.Database,
  user: User,
  input: VolunteerInput,
): string {
  const values = {
    opportunityId: text(input.opportunityId, "Opportunity", 1, 100),
    applicantName: text(input.applicantName, "Name", 2, 100),
    phone: text(input.phone, "Phone", 7, 40),
    availability: text(input.availability, "Availability", 5, 1000),
    experience: text(input.experience, "Experience", 10, 2000),
    motivation: text(input.motivation, "Reason for volunteering", 10, 2000),
  };
  return db
    .transaction(() => {
      if (
        !db
          .prepare(
            "SELECT id FROM volunteer_opportunities WHERE id = ? AND active=1",
          )
          .get(values.opportunityId)
      )
        throw new InputError("This opportunity is no longer available.");
      if (
        db
          .prepare(
            "SELECT id FROM volunteer_applications WHERE userId = ? AND opportunityId = ? AND status IN ('Submitted','Under Review','Accepted')",
          )
          .get(user.id, values.opportunityId)
      )
        throw new InputError(
          "You already have an active application for this opportunity.",
        );
      const id = randomUUID();
      db.prepare(
        `INSERT INTO volunteer_applications (id,userId,opportunityId,applicantName,email,phone,availability,experience,motivation) VALUES (@id,@userId,@opportunityId,@applicantName,@email,@phone,@availability,@experience,@motivation)`,
      ).run({ ...values, id, userId: user.id, email: user.email });
      return id;
    })
    .immediate();
}
export function userVolunteerApplications(
  db: Database.Database,
  userId: string,
): VolunteerApplication[] {
  return db
    .prepare(
      `SELECT a.*, o.title FROM volunteer_applications a JOIN volunteer_opportunities o ON o.id=a.opportunityId WHERE a.userId = ? ORDER BY a.createdAt DESC,a.rowid DESC`,
    )
    .all(userId) as VolunteerApplication[];
}
export function withdrawVolunteer(
  db: Database.Database,
  userId: string,
  id: string,
) {
  if (
    !db
      .prepare(
        "UPDATE volunteer_applications SET status='Withdrawn',updatedAt=CURRENT_TIMESTAMP WHERE id = ? AND userId = ? AND status IN ('Submitted','Under Review')",
      )
      .run(id, userId).changes
  )
    throw new InputError("This application cannot be withdrawn.");
}
