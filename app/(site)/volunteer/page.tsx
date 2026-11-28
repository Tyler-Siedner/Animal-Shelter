// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";
import { getOpportunities } from "../../../lib/volunteers";
export const metadata = { title: "Volunteer" };
export default async function VolunteerPage() {
  const roles = await getOpportunities();
  return (
    <main className="plain-page">
      <h1>Volunteer</h1>
      <p>
        Help out at the shelter. See the roles and times below. All times are local.
      </p>
      <div className="opportunity-list">
        {roles.map((role) => (
          <article className="opportunity" key={role.id}>
            <h2>{role.title}</h2>
            <p>{role.description}</p>
            <p>
              <strong>Schedule:</strong> {role.schedule}
            </p>
            <p>
              <strong>Requirements:</strong> {role.requirements}
            </p>
            <Link
              className="button"
              href={`/volunteer/apply?opportunity=${role.id}`}
            >
              Apply
            </Link>
          </article>
        ))}
      </div>
      {roles.length === 0 && <p>No opportunities are currently open.</p>}
    </main>
  );
}
