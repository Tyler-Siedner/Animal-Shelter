"use server";
// Authors: Tyler Siedner and Tyler Harris
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDatabase } from "../../lib/database";
import { requireUser } from "../../lib/auth";
import {
  setFavorite,
  submitAdoption,
  submitVolunteer,
  withdrawAdoption,
  withdrawVolunteer,
} from "../../lib/application-repository";
import { InputError, text, safeNext } from "../../lib/validation";
import type { FormState } from "../../types/account";

export async function favoriteAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const next = safeNext(form.get("next"));
  const user = await requireUser(next);
  try {
    setFavorite(
      getDatabase(),
      user.id,
      text(form.get("animalId"), "Resident", 1, 100),
      form.get("saved") === "true",
    );
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Favorite update failed", error);
    return { error: "Could not update favorites." };
  }
  revalidatePath("/favorites");
  revalidatePath("/animals/[id]", "page");
  return {};
}
export async function adoptionAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const animalId =
    typeof form.get("animalId") === "string"
      ? String(form.get("animalId"))
      : "";
  const user = await requireUser(`/adopt/${animalId}`);
  try {
    submitAdoption(getDatabase(), user, {
      animalId,
      applicantName: text(form.get("applicantName"), "Name", 2, 100),
      phone: text(form.get("phone"), "Phone", 7, 40),
      address: text(form.get("address"), "Address", 5, 500),
      livingSituation: text(
        form.get("livingSituation"),
        "Living situation",
        10,
        2000,
      ),
      petExperience: text(
        form.get("petExperience"),
        "Pet experience",
        10,
        2000,
      ),
      carePlan: text(form.get("carePlan"), "Care plan", 10, 2000),
    });
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Adoption application failed", error);
    return { error: "Could not submit your application. Please try again." };
  }
  revalidatePath("/applications");
  redirect("/applications?submitted=adoption");
}
export async function volunteerAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser("/volunteer/apply");
  try {
    submitVolunteer(getDatabase(), user, {
      opportunityId: text(form.get("opportunityId"), "Opportunity", 1, 100),
      applicantName: text(form.get("applicantName"), "Name", 2, 100),
      phone: text(form.get("phone"), "Phone", 7, 40),
      availability: text(form.get("availability"), "Availability", 5, 1000),
      experience: text(form.get("experience"), "Experience", 10, 2000),
      motivation: text(
        form.get("motivation"),
        "Reason for volunteering",
        10,
        2000,
      ),
    });
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Volunteer application failed", error);
    return { error: "Could not submit your application. Please try again." };
  }
  revalidatePath("/applications");
  redirect("/applications?submitted=volunteer");
}
export async function withdrawAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser("/applications");
  try {
    const id = text(form.get("id"), "Application", 1, 100);
    if (form.get("kind") === "adoption")
      withdrawAdoption(getDatabase(), user.id, id);
    else if (form.get("kind") === "volunteer")
      withdrawVolunteer(getDatabase(), user.id, id);
    else throw new InputError("Invalid application.");
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Withdrawal failed", error);
    return { error: "Could not withdraw the application." };
  }
  revalidatePath("/applications");
  return { success: "Application withdrawn." };
}
