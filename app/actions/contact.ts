"use server";
// Authors: Tyler Siedner and Tyler Harris
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../lib/auth";
import { getDatabase } from "../../lib/database";
import { submitMessage } from "../../lib/contact-repository";
import { InputError } from "../../lib/validation";
import type { FormState } from "../../types/account";
export async function contactAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  try {
    submitMessage(
      getDatabase(),
      user?.id ?? null,
      Object.fromEntries(
        ["name", "email", "phone", "subject", "message", "animalId"].map(
          (key) => [key, form.get(key)],
        ),
      ),
    );
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Contact submission failed", error);
    return { error: "Could not send your message. Please try again." };
  }
  revalidatePath("/admin/messages");
  revalidatePath("/messages");
  return {
    success: user
      ? "Message sent. You can read replies in Account → Messages."
      : "Message sent to the shelter. Staff can use your contact details to follow up.",
  };
}
