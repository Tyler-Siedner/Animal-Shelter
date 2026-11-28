// Authors: Tyler Siedner and Tyler Harris
import type {
  AdoptionApplication,
  VolunteerApplication,
} from "../types/account";
import ActionForm from "./ActionForm";
import FormField from "./FormField";
import { reviewApplicationAction } from "../app/actions/admin";
export default function AdminApplication({
  application,
  kind,
}: {
  application: AdoptionApplication | VolunteerApplication;
  kind: "adoption" | "volunteer";
}) {
  const adoption =
    kind === "adoption" ? (application as AdoptionApplication) : null;
  const volunteer =
    kind === "volunteer" ? (application as VolunteerApplication) : null;
  const fields = adoption
    ? [
        ["Name", adoption.applicantName],
        ["Email", adoption.email],
        ["Phone", adoption.phone],
        ["Address", adoption.address],
        ["Living situation", adoption.livingSituation],
        ["Pet experience", adoption.petExperience],
        ["Care plan", adoption.carePlan],
      ]
    : [
        ["Name", application.applicantName],
        ["Email", application.email],
        ["Phone", application.phone],
        ["Availability", volunteer!.availability],
        ["Experience", volunteer!.experience],
        ["Reason for volunteering", volunteer!.motivation],
      ];
  const options = adoption
    ? ["Submitted", "Under Review", "Approved", "Rejected"]
    : ["Submitted", "Under Review", "Accepted", "Declined"];
  return (
    <section className="form-page">
      <h2>
        {adoption
          ? `Adoption: ${adoption.animalName}`
          : `Volunteer: ${volunteer!.title}`}
      </h2>
      <p>
        Current status: <strong>{application.status}</strong>
      </p>
      <dl className="submitted-details">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {application.status === "Withdrawn" ? (
        <p>This application was withdrawn by the applicant.</p>
      ) : (
        <ActionForm action={reviewApplicationAction} buttonLabel="Save review">
          <input type="hidden" name="id" value={application.id} />
          <input type="hidden" name="kind" value={kind} />
          <div className="form-field">
            <label htmlFor="status">Decision / status</label>
            <select
              id="status"
              name="status"
              defaultValue={application.status}
              required
            >
              {options.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <FormField
            name="staffNotes"
            label="Notes for the applicant"
            defaultValue={application.staffNotes}
            multiline
            required={false}
          />
          {adoption && (
            <p className="form-help">
              Approved marks the resident Adopted and rejects other open applications. Under Review marks them Pending.
            </p>
          )}
        </ActionForm>
      )}
    </section>
  );
}
