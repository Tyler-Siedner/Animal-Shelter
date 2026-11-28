// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";
import type { Animal } from "../types/animal";
import { getCurrentUser } from "../lib/auth";
import { getDatabase } from "../lib/database";
import { favoriteIds, userAdoptions } from "../lib/application-repository";
import { favoriteAction } from "../app/actions/applications";
import ActionForm from "./ActionForm";
export default async function ResidentActions({ animal }: { animal: Animal }) {
  const user = await getCurrentUser();
  const saved = user
    ? favoriteIds(getDatabase(), user.id).includes(animal.id)
    : false;
  const applied = user
    ? userAdoptions(getDatabase(), user.id).some(
        (a) =>
          a.animalId === animal.id &&
          ["Submitted", "Under Review", "Approved"].includes(a.status),
      )
    : false;
  return (
    <div className="resident-actions">
      {user ? (
        <ActionForm
          action={favoriteAction}
          buttonLabel={saved ? "Remove from favorites" : "Save to favorites"}
          className="compact-form"
        >
          <input type="hidden" name="animalId" value={animal.id} />
          <input type="hidden" name="saved" value={String(!saved)} />
          <input type="hidden" name="next" value={`/animals/${animal.id}`} />
        </ActionForm>
      ) : (
        <Link
          className="text-link"
          href={`/login?next=${encodeURIComponent(`/animals/${animal.id}`)}`}
        >
          Sign in to save this resident
        </Link>
      )}
      {applied ? (
        <Link className="text-link" href="/applications">
          View your application
        </Link>
      ) : animal.adoptionStatus === "Available" ? (
        <Link className="button" href={`/adopt/${animal.id}`}>
          Apply to adopt
        </Link>
      ) : (
        <p>Not currently accepting adoption applications.</p>
      )}
    </div>
  );
}
