// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "../../../lib/auth";
import { getDatabase } from "../../../lib/database";
import {
  userAdoptions,
  userVolunteerApplications,
} from "../../../lib/application-repository";
import { withdrawAction } from "../../actions/applications";
import ActionForm from "../../../components/ActionForm";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Your applications",
};
function submittedDate(value: string) {
  return new Date(value.replace(" ", "T") + "Z").toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
async function ApplicationsContent({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await requireUser("/applications");
  const db = getDatabase();
  const adoptions = userAdoptions(db, user.id);
  const volunteers = userVolunteerApplications(db, user.id);
  const submitted = (await searchParams).submitted;
  return (
    <main className="plain-page">
      <h1>Your applications</h1>
      {(submitted === "adoption" || submitted === "volunteer") && (
        <p role="status" className="form-success">
          Your application was submitted.
        </p>
      )}
      <h2>Adoption applications</h2>
      {adoptions.length === 0 ? (
        <p>
          No adoption applications yet.{" "}
          <Link className="text-link" href="/animals">
            Browse residents
          </Link>
          .
        </p>
      ) : (
        adoptions.map((a) => (
          <article className="application-item" key={a.id}>
            <h3>
              <Link href={`/animals/${a.animalId}`}>{a.animalName}</Link>
            </h3>
            <p>
              <strong>Status: {a.status}</strong> · Submitted{" "}
              {submittedDate(a.createdAt)}
            </p>
            <details>
              <summary>View submitted details</summary>
              <dl className="submitted-details">
                <dt>Name</dt>
                <dd>{a.applicantName}</dd>
                <dt>Email</dt>
                <dd>{a.email}</dd>
                <dt>Phone</dt>
                <dd>{a.phone}</dd>
                <dt>Address</dt>
                <dd>{a.address}</dd>
                <dt>Living situation</dt>
                <dd>{a.livingSituation}</dd>
                <dt>Pet experience</dt>
                <dd>{a.petExperience}</dd>
                <dt>Care plan</dt>
                <dd>{a.carePlan}</dd>
              </dl>
            </details>
            {["Submitted", "Under Review"].includes(a.status) && (
              <ActionForm
                action={withdrawAction}
                buttonLabel="Withdraw application"
                className="compact-form"
              >
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="kind" value="adoption" />
              </ActionForm>
            )}
          </article>
        ))
      )}
      <h2>Volunteer applications</h2>
      {volunteers.length === 0 ? (
        <p>
          No volunteer applications yet.{" "}
          <Link className="text-link" href="/volunteer">
            View opportunities
          </Link>
          .
        </p>
      ) : (
        volunteers.map((a) => (
          <article className="application-item" key={a.id}>
            <h3>{a.title}</h3>
            <p>
              <strong>Status: {a.status}</strong> · Submitted{" "}
              {submittedDate(a.createdAt)}
            </p>
            <details>
              <summary>View submitted details</summary>
              <dl className="submitted-details">
                <dt>Name</dt>
                <dd>{a.applicantName}</dd>
                <dt>Email</dt>
                <dd>{a.email}</dd>
                <dt>Phone</dt>
                <dd>{a.phone}</dd>
                <dt>Availability</dt>
                <dd>{a.availability}</dd>
                <dt>Experience</dt>
                <dd>{a.experience}</dd>
                <dt>Reason for volunteering</dt>
                <dd>{a.motivation}</dd>
              </dl>
            </details>
            {["Submitted", "Under Review"].includes(a.status) && (
              <ActionForm
                action={withdrawAction}
                buttonLabel="Withdraw application"
                className="compact-form"
              >
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="kind" value="volunteer" />
              </ActionForm>
            )}
          </article>
        ))
      )}
    </main>
  );
}

export default function ApplicationsPage(props: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading…</p>
        </main>
      }
    >
      <ApplicationsContent {...props} />
    </Suspense>
  );
}
