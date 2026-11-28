// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "../../../lib/auth";
import { getDatabase } from "../../../lib/database";
import {
  managedAnimals,
  adminAdoptions,
  adminVolunteers,
} from "../../../lib/admin-repository";
import { adminMessages } from "../../../lib/contact-repository";
async function Overview() {
  const user = await requireAdmin();
  const db = getDatabase();
  const animals = managedAnimals(db, user.id),
    adoptions = adminAdoptions(db, user.id),
    volunteers = adminVolunteers(db, user.id),
    messages = adminMessages(db, user.id);
  return (
    <section>
      <h2>Overview</h2>
      <ul className="admin-summary">
        <li>
          <Link href="/admin/animals">
            {animals.filter((a) => !a.archived).length} listed residents
          </Link>
        </li>
        <li>
          <Link href="/admin/adoptions">
            {
              adoptions.filter((a) =>
                ["Submitted", "Under Review"].includes(a.status),
              ).length
            }{" "}
            adoption applications awaiting a decision
          </Link>
        </li>
        <li>
          <Link href="/admin/volunteers">
            {
              volunteers.filter((a) =>
                ["Submitted", "Under Review"].includes(a.status),
              ).length
            }{" "}
            volunteer applications awaiting a decision
          </Link>
        </li>
        <li>
          <Link href="/admin/messages">
            {messages.filter((m) => m.status !== "Resolved").length} open
            messages
          </Link>
        </li>
      </ul>
    </section>
  );
}
export default function AdminPage() {
  return (
    <Suspense fallback={<p>Loading dashboard…</p>}>
      <Overview />
    </Suspense>
  );
}
