// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "../../../../lib/auth";
import { getDatabase } from "../../../../lib/database";
import { adminAdoptions } from "../../../../lib/admin-repository";
async function List() {
  const user = await requireAdmin();
  const applications = adminAdoptions(getDatabase(), user.id);
  return (
    <section>
      <h2>Adoption applications</h2>
      {applications.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
        <div className="admin-list">
          {applications.map((app) => (
            <article className="admin-list-item" key={app.id}>
              <div>
                <h3>{app.animalName}</h3>
                <p>
                  {app.applicantName} · {app.email}
                </p>
                <p>Status: {app.status}</p>
              </div>
              <Link className="text-link" href={`/admin/adoptions/${app.id}`}>
                Review application
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
export default function ApplicationsPage() {
  return (
    <Suspense fallback={<p>Loading applications…</p>}>
      <List />
    </Suspense>
  );
}
