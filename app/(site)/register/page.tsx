// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "../../../components/ActionForm";
import FormField from "../../../components/FormField";
import { registerAction } from "../../actions/account";
import { getCurrentUser } from "../../../lib/auth";
import { safeNext } from "../../../lib/validation";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Create account",
};
async function RegisterContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <main className="form-page">
      <h1>Create an account</h1>
      <p>Save residents and keep track of your applications.</p>
      <ActionForm action={registerAction} buttonLabel="Create account">
        <input type="hidden" name="next" value={next} />
        <FormField
          name="name"
          label="Name"
          minLength={2}
          maxLength={100}
          autoComplete="name"
        />
        <FormField
          name="email"
          label="Email"
          type="email"
          maxLength={254}
          autoComplete="email"
        />
        <FormField
          name="password"
          label="Password (at least 10 characters)"
          type="password"
          minLength={10}
          maxLength={128}
          autoComplete="new-password"
        />
        <FormField
          name="confirmPassword"
          label="Confirm password"
          type="password"
          minLength={10}
          maxLength={128}
          autoComplete="new-password"
        />
      </ActionForm>
      <p className="form-after">
        Already registered?{" "}
        <Link
          className="text-link"
          href={`/login?next=${encodeURIComponent(next)}`}
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}

export default function RegisterPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading…</p>
        </main>
      }
    >
      <RegisterContent {...props} />
    </Suspense>
  );
}
