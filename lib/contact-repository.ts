// Authors: Tyler Siedner and Tyler Harris
import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { text, emailAddress, InputError } from "./validation";
import { takeAuthAttempt } from "./account-repository";
import { readAnimalById } from "./animal-repository";
import { assertAdmin } from "./admin-repository";
export type ContactMessage = {
  id: string;
  userId: string | null;
  animalId: string | null;
  animalName: string | null;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  reply: string;
  repliedAt: string | null;
  createdAt: string;
};
export function submitMessage(
  db: Database.Database,
  userId: string | null,
  input: Record<string, unknown>,
): string {
  const values = {
    name: text(input.name, "Name", 2, 100),
    email: emailAddress(input.email),
    phone: text(input.phone, "Phone", 0, 40),
    subject: text(input.subject, "Subject", 3, 150),
    message: text(input.message, "Message", 10, 5000),
    animalId: text(input.animalId, "Resident", 0, 100) || null,
  };
  if (values.animalId && !readAnimalById(db, values.animalId))
    throw new InputError("The selected resident is no longer listed.");
  takeAuthAttempt(db, `contact:${userId || values.email}`, 5);
  const id = randomUUID();
  db.prepare(
    "INSERT INTO contact_messages (id,userId,animalId,name,email,phone,subject,message) VALUES (@id,@userId,@animalId,@name,@email,@phone,@subject,@message)",
  ).run({ ...values, id, userId });
  return id;
}
const joined =
  "SELECT m.*,animals.name AS animalName FROM contact_messages m LEFT JOIN animals ON animals.id=m.animalId";
export function myMessages(
  db: Database.Database,
  userId: string,
): ContactMessage[] {
  return db
    .prepare(
      joined + " WHERE m.userId=? ORDER BY m.createdAt DESC,m.rowid DESC",
    )
    .all(userId) as ContactMessage[];
}
export function adminMessages(
  db: Database.Database,
  actorId: string,
): ContactMessage[] {
  assertAdmin(db, actorId);
  return db
    .prepare(joined + " ORDER BY m.createdAt DESC,m.rowid DESC")
    .all() as ContactMessage[];
}
export function replyToMessage(
  db: Database.Database,
  actorId: string,
  id: string,
  status: string,
  reply: string,
) {
  assertAdmin(db, actorId);
  if (!["New", "In Progress", "Resolved"].includes(status))
    throw new InputError("Choose a valid message status.");
  reply = text(reply, "Reply", 0, 5000);
  if (
    !db
      .prepare(
        "UPDATE contact_messages SET status=?,reply=?,repliedBy=?,repliedAt=CURRENT_TIMESTAMP WHERE id=?",
      )
      .run(status, reply, actorId, id).changes
  )
    throw new InputError("Message not found.");
}
