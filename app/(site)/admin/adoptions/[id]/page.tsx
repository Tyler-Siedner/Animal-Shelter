// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../../lib/auth";
import { getDatabase } from "../../../../../lib/database";
import { adminAdoptions } from "../../../../../lib/admin-repository";
import AdminApplication from "../../../../../components/AdminApplication";
type Props = { params: Promise<{ id: string }> };
async function Detail({ params }: Props) {
  const user = await requireAdmin();
  const id = (await params).id;
  const application = adminAdoptions(getDatabase(), user.id).find(
    (app) => app.id === id,
  );
  if (!application) notFound();
  return <AdminApplication kind="adoption" application={application} />;
}
export default function ApplicationPage(props: Props) {
  return (
    <Suspense fallback={<p>Loading application…</p>}>
      <Detail {...props} />
    </Suspense>
  );
}
