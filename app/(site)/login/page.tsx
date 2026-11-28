// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActionForm from "../../../components/ActionForm";
import FormField from "../../../components/FormField";
import { loginAction } from "../../actions/account";
import { getCurrentUser } from "../../../lib/auth";
import { safeNext } from "../../../lib/validation";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Sign in",
};
async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <main className="form-page">
      <h1>Sign in</h1>
      <ActionForm action={loginAction} buttonLabel="Sign in">
        <input type="hidden" name="next" value={next} />
        <FormField
          name="email"
          label="Email"
          type="email"
          maxLength={254}
          autoComplete="email"
        />
        <FormField
          name="password"
          label="Password"
          type="password"
          minLength={10}
          maxLength={128}
          autoComplete="current-password"
        />
      </ActionForm>
      <p className="form-after">
        New here?{" "}
        <Link
          className="text-link"
          href={`/register?next=${encodeURIComponent(next)}`}
        >
          Create an account
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage(props: {
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
      <LoginContent {...props} />
    </Suspense>
  );
}
