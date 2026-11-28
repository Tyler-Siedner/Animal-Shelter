"use server";
// Authors: Tyler Siedner and Tyler Harris
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDatabase } from "../../lib/database";
import {
  createUser,
  findCredentials,
  updateProfile,
  takeAuthAttempt,
  clearAuthAttempts,
  replacePassword,
} from "../../lib/account-repository";
import { hashPassword, verifyPassword } from "../../lib/passwords";
import { requireUser, signInUser, signOutUser } from "../../lib/auth";
import {
  emailAddress,
  passwordValue,
  text,
  safeNext,
  InputError,
} from "../../lib/validation";
import type { FormState } from "../../types/account";

export async function registerAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  let userId: string;
  try {
    const db = getDatabase();
    const email = emailAddress(form.get("email"));
    takeAuthAttempt(db, `register:${email}`, 5);
    const password = passwordValue(form.get("password"));
    if (password !== form.get("confirmPassword"))
      throw new InputError("Passwords do not match.");
    const user = createUser(
      db,
      text(form.get("name"), "Name", 2, 100),
      email,
      await hashPassword(password),
    );
    userId = user.id;
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Registration failed", error);
    return { error: "Could not create your account. Please try again." };
  }
  await signInUser(userId);
  redirect(safeNext(form.get("next")));
}
export async function loginAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  let userId: string;
  try {
    const db = getDatabase();
    const email = emailAddress(form.get("email"));
    takeAuthAttempt(db, `login:${email}`);
    const password = passwordValue(form.get("password"));
    const user = findCredentials(db, email);
    // Use the same expensive derivation for missing users to avoid a quick lookup signal.
    const dummy = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;
    const valid = await verifyPassword(password, user?.passwordHash ?? dummy);
    if (!user || !valid) return { error: "Email or password is incorrect." };
    clearAuthAttempts(db, `login:${email}`);
    userId = user.id;
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Sign-in failed", error);
    return { error: "Could not sign in. Please try again." };
  }
  await signInUser(userId);
  redirect(safeNext(form.get("next")));
}
export async function logoutAction() {
  await signOutUser();
  revalidatePath("/", "layout");
  redirect("/home");
}
export async function profileAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  try {
    updateProfile(
      getDatabase(),
      user.id,
      text(form.get("name"), "Name", 2, 100),
      text(form.get("phone"), "Phone", 0, 40),
      text(form.get("address"), "Address", 0, 500),
    );
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Profile update failed", error);
    return { error: "Could not save your profile." };
  }
  revalidatePath("/account");
  revalidatePath("/", "layout");
  return { success: "Profile saved." };
}
export async function passwordAction(
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  try {
    const db = getDatabase();
    takeAuthAttempt(db, `password:${user.id}`);
    const current = passwordValue(form.get("currentPassword"));
    const next = passwordValue(form.get("password"));
    if (next !== form.get("confirmPassword"))
      throw new InputError("Passwords do not match.");
    const credentials = findCredentials(db, user.email)!;
    if (!(await verifyPassword(current, credentials.passwordHash)))
      return { error: "Current password is incorrect." };
    replacePassword(db, user.id, await hashPassword(next));
    clearAuthAttempts(db, `password:${user.id}`);
  } catch (error) {
    if (error instanceof InputError) return { error: error.message };
    console.error("Password update failed", error);
    return { error: "Could not change your password." };
  }
  await signInUser(user.id);
  return { success: "Password changed. Other sessions have been signed out." };
}
