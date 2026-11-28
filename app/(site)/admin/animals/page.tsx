// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "../../../../lib/auth";
import { getDatabase } from "../../../../lib/database";
import { managedAnimals } from "../../../../lib/admin-repository";
import { archiveAnimalAction } from "../../../actions/admin";
import ActionForm from "../../../../components/ActionForm";
async function List() {
  const user = await requireAdmin();
  const animals = managedAnimals(getDatabase(), user.id);
  return (
    <section>
      <div className="section-heading">
        <h2>Residents</h2>
        <Link className="button" href="/admin/animals/new">
          Add resident
        </Link>
      </div>
      <p className="form-help">
        Removed listings can be restored. Application history stays saved.
      </p>
      <div className="admin-list">
        {animals.map((animal) => (
          <article className="admin-list-item" key={animal.id}>
            <div>
              <h3>
                <Link href={`/admin/animals/${animal.id}`}>{animal.name}</Link>
              </h3>
              <p>
                {animal.type} · {animal.adoptionStatus}
                {animal.archived ? " · Removed from directory" : ""}
              </p>
              <Link className="text-link" href={`/admin/animals/${animal.id}`}>
                Edit resident
              </Link>
            </div>
            <ActionForm
              action={archiveAnimalAction}
              className="compact-form"
              buttonLabel={
                animal.archived ? "Restore listing" : "Remove from directory"
              }
            >
              <input type="hidden" name="id" value={animal.id} />
              <input
                type="hidden"
                name="archived"
                value={String(!animal.archived)}
              />
            </ActionForm>
          </article>
        ))}
      </div>
    </section>
  );
}
export default function ResidentsPage() {
  return (
    <Suspense fallback={<p>Loading residents…</p>}>
      <List />
    </Suspense>
  );
}
