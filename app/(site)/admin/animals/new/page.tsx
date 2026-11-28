// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import { requireAdmin } from "../../../../../lib/auth";
import AnimalEditor from "../../../../../components/AnimalEditor";
async function NewResident() {
  await requireAdmin();
  return (
    <section className="form-page">
      <h2>Add resident</h2>
      <AnimalEditor />
    </section>
  );
}
export default function NewResidentPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <NewResident />
    </Suspense>
  );
}
