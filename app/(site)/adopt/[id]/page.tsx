// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "../../../../lib/auth";
import { getAnimalById } from "../../../../lib/animals";
import { getDatabase } from "../../../../lib/database";
import { userAdoptions } from "../../../../lib/application-repository";
import ActionForm from "../../../../components/ActionForm";
import FormField from "../../../../components/FormField";
import { adoptionAction } from "../../../actions/applications";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Adoption application",
};
async function AdoptContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/adopt/${id}`);
  const animal = await getAnimalById(id);
  if (!animal) notFound();
  const applied = userAdoptions(getDatabase(), user.id).some(
    (a) =>
      a.animalId === id &&
      ["Submitted", "Under Review", "Approved"].includes(a.status),
  );
  return (
    <main className="form-page">
      <Link className="back-link" href={`/animals/${id}`}>
        Back to {animal.name}
      </Link>
      <h1>Apply to adopt {animal.name}</h1>
      {applied ? (
        <p>
          You already have an active application.{" "}
          <Link className="text-link" href="/applications">
            View your applications
          </Link>
          .
        </p>
      ) : animal.adoptionStatus !== "Available" ? (
        <p>This resident is not currently accepting applications.</p>
      ) : (
        <>
          <p>
            Your application will be sent to shelter staff for review. Your
            contact email is {user.email}.
          </p>
          <ActionForm action={adoptionAction} buttonLabel="Submit application">
            <input type="hidden" name="animalId" value={id} />
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
              name="address"
              label="Address"
              defaultValue={user.address}
              multiline
              minLength={5}
              maxLength={500}
              autoComplete="street-address"
            />
            <FormField
              name="livingSituation"
              label="Living situation (home type, household, and permission to keep an animal)"
              multiline
              minLength={10}
            />
            <FormField
              name="petExperience"
              label="Pet ownership experience and any current animals"
              multiline
              minLength={10}
            />
            <FormField
              name="carePlan"
              label="How will you meet this resident's care and containment needs?"
              multiline
              minLength={10}
            />
          </ActionForm>
        </>
      )}
    </main>
  );
}

export default function AdoptPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading…</p>
        </main>
      }
    >
      <AdoptContent {...props} />
    </Suspense>
  );
}
