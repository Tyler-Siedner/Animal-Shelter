// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import ActionForm from "../../../components/ActionForm";
import FormField from "../../../components/FormField";
import { requireUser } from "../../../lib/auth";
import { profileAction, passwordAction } from "../../actions/account";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Your account",
};
async function AccountContent() {
  const user = await requireUser();
  return (
    <main className="form-page">
      <h1>Your account</h1>
      <p>{user.email}</p>
      <div className="account-links">
        <Link className="text-link" href="/favorites">
          Your favorites
        </Link>
        <Link className="text-link" href="/applications">
          Your applications
        </Link>
      </div>
      <h2>Profile</h2>
      <ActionForm action={profileAction} buttonLabel="Save profile">
        <FormField
          name="name"
          label="Name"
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
          required={false}
          maxLength={40}
          autoComplete="tel"
        />
        <FormField
          name="address"
          label="Address"
          defaultValue={user.address}
          multiline
          required={false}
          maxLength={500}
          autoComplete="street-address"
        />
      </ActionForm>
      <h2>Change password</h2>
      <ActionForm action={passwordAction} buttonLabel="Change password">
        <FormField
          name="currentPassword"
          label="Current password"
          type="password"
          minLength={10}
          maxLength={128}
          autoComplete="current-password"
        />
        <FormField
          name="password"
          label="New password (at least 10 characters)"
          type="password"
          minLength={10}
          maxLength={128}
          autoComplete="new-password"
        />
        <FormField
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          minLength={10}
          maxLength={128}
          autoComplete="new-password"
        />
      </ActionForm>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading…</p>
        </main>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
