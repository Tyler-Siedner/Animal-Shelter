// Authors: Tyler Siedner and Tyler Harris
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDatabase } from "./database";
import {
  sessionUser,
  createSession,
  revokeSession,
  sessionLifetime,
} from "./account-repository";
import { safeNext } from "./validation";
const cookieName = "shelter_session";
// Share this lookup within the current request.
export const getCurrentUser = cache(async () => {
  // Check session expiry at request time.
  await connection();
  const token = (await cookies()).get(cookieName)?.value;
  return token ? (sessionUser(getDatabase(), token) ?? null) : null;
});
export async function requireUser(next = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeNext(next))}`);
  return user;
}
export async function signInUser(userId: string) {
  const jar = await cookies();
  const old = jar.get(cookieName)?.value;
  if (old) revokeSession(getDatabase(), old);
  const session = createSession(getDatabase(), userId);
  jar.set(cookieName, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetime / 1000,
    expires: new Date(session.expiresAt),
  });
}
export async function signOutUser() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) revokeSession(getDatabase(), token);
  jar.delete(cookieName);
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/admin-access");
  return user;
}
