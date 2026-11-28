"use server";
// Authors: Tyler Siedner and Tyler Harris
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../lib/auth";
import { getDatabase, animalColumns } from "../../lib/database";
import {
  saveAnimal,
  archiveAnimal,
  reviewAdoption,
  reviewVolunteer,
} from "../../lib/admin-repository";
import { replyToMessage } from "../../lib/contact-repository";
import { residentImages } from "../../lib/images";
import { text, InputError } from "../../lib/validation";
import type { FormState } from "../../types/account";
function refreshAnimals() {
  revalidatePath("/animals");
  revalidatePath("/animals/[id]", "page");
  revalidatePath("/favorites");
  revalidatePath("/admin/animals");
}
export async function saveAnimalAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireAdmin();
  let id: string;
  try {
    const values = Object.fromEntries(
      animalColumns.map((key) => [key, form.get(key)]),
    );
    const image = text(values.imageUrl, "Photo", 0, 500);
    if (image && !residentImages().includes(image))
      throw new InputError(
        "Photo not found. Place the image in public/images/creatures and choose it from the list.",
      );
    id = saveAnimal(
      getDatabase(),
      user.id,
      values,
      form.get("creating") === "true",
    );
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Resident save failed", error);
    return { error: "Could not save the resident. Please try again." };
  }
  refreshAnimals();
  redirect(`/admin/animals/${id}?saved=1`);
}
export async function archiveAnimalAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireAdmin();
  try {
    archiveAnimal(
      getDatabase(),
      user.id,
      text(form.get("id"), "Resident", 1, 100),
      form.get("archived") === "true",
    );
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Resident removal failed", error);
    return { error: "Could not update the listing." };
  }
  refreshAnimals();
  return {
    success:
      form.get("archived") === "true"
        ? "Removed from the public directory."
        : "Restored to the public directory.",
  };
}
export async function reviewApplicationAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireAdmin();
  try {
    const id = text(form.get("id"), "Application", 1, 100),
      status = text(form.get("status"), "Status", 1, 40),
      notes = text(form.get("staffNotes"), "Staff notes", 0, 2000);
    if (form.get("kind") === "adoption")
      reviewAdoption(getDatabase(), user.id, id, status, notes);
    else if (form.get("kind") === "volunteer")
      reviewVolunteer(getDatabase(), user.id, id, status, notes);
    else throw new InputError("Invalid application type.");
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Application review failed", error);
    return { error: "Could not save the review." };
  }
  refreshAnimals();
  revalidatePath("/applications");
  revalidatePath("/admin/adoptions", "layout");
  revalidatePath("/admin/volunteers", "layout");
  return { success: "Review saved." };
}
export async function replyAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireAdmin();
  try {
    replyToMessage(
      getDatabase(),
      user.id,
      text(form.get("id"), "Message", 1, 100),
      text(form.get("status"), "Status", 1, 30),
      text(form.get("reply"), "Reply", 0, 5000),
    );
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Reply save failed", error);
    return { error: "Could not save the reply." };
  }
  revalidatePath("/admin/messages", "layout");
  revalidatePath("/messages");
  return { success: "Message updated." };
}
