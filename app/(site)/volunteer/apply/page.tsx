// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "../../../../lib/auth";
import { getOpportunities } from "../../../../lib/volunteers";
import { volunteerAction } from "../../../actions/applications";
import ActionForm from "../../../../components/ActionForm";
import FormField from "../../../../components/FormField";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Volunteer application",
};
async function VolunteerApplyContent({
  searchParams,
}: {
  searchParams: Promise<{ opportunity?: string }>;
}) {
  const selected = (await searchParams).opportunity;
  const next =
    selected && /^[a-z0-9-]+$/.test(selected)
      ? `/volunteer/apply?opportunity=${selected}`
      : "/volunteer/apply";
  const user = await requireUser(next);
  const roles = await getOpportunities();
  const defaultRole = roles.some((role) => role.id === selected)
    ? selected
    : roles[0]?.id;
  return (
    <main className="form-page">
      <Link className="back-link" href="/volunteer">
        Back to opportunities
      </Link>
      <h1>Volunteer application</h1>
      {roles.length === 0 ? (
        <p>No opportunities are currently open.</p>
      ) : (
        <>
          <p>
            Your contact email is {user.email}. You can track your application
            from your account.
          </p>
          <ActionForm
            action={volunteerAction}
            buttonLabel="Submit volunteer application"
          >
            <div className="form-field">
              <label htmlFor="opportunityId">Opportunity</label>
              <select
                id="opportunityId"
                name="opportunityId"
                defaultValue={defaultRole}
                required
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} — {role.schedule}
                  </option>
                ))}
              </select>
            </div>
            <FormField
              name="applicantName"
              label="Full name"
              defaultValue={user.name}
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />
            <FormField
              name="phone"
              label="Phone"
              type="tel"
              defaultValue={user.phone}
              minLength={7}
              maxLength={40}
              autoComplete="tel"
            />
            <FormField
              name="availability"
              label="Your available days and times"
              multiline
              minLength={5}
              maxLength={1000}
            />
            <FormField
              name="experience"
              label="Relevant experience (or tell us if you are new to volunteering)"
              multiline
              minLength={10}
            />
            <FormField
              name="motivation"
              label="Why would you like to volunteer?"
              multiline
              minLength={10}
            />
          </ActionForm>
        </>
      )}
    </main>
  );
}

export default function VolunteerApplyPage(props: {
  searchParams: Promise<{ opportunity?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading…</p>
        </main>
      }
    >
      <VolunteerApplyContent {...props} />
    </Suspense>
  );
}
