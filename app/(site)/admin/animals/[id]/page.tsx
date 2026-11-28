// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "../../../../../lib/auth";
import { getDatabase } from "../../../../../lib/database";
import { managedAnimal } from "../../../../../lib/admin-repository";
import AnimalEditor from "../../../../../components/AnimalEditor";
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};
async function Edit({ params, searchParams }: Props) {
  const user = await requireAdmin();
  const animal = managedAnimal(getDatabase(), user.id, (await params).id);
  if (!animal) notFound();
  return (
    <section className="form-page">
      <h2>Edit {animal.name}</h2>
      {(await searchParams).saved === "1" && (
        <p className="form-success" role="status">
          Resident saved.
        </p>
      )}
      {animal.archived ? (
        <p>This resident is removed from the public directory.</p>
      ) : (
        <Link className="text-link" href={`/animals/${animal.id}`}>
          View public profile
        </Link>
      )}
      <AnimalEditor animal={animal} />
    </section>
  );
}
export default function EditResidentPage(props: Props) {
  return (
    <Suspense fallback={<p>Loading resident…</p>}>
      <Edit {...props} />
    </Suspense>
  );
}
