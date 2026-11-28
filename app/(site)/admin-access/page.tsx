// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";
export const metadata = {
  title: "Admin access",
  robots: { index: false, follow: false },
};
export default function AccessPage() {
  return (
    <main className="plain-page">
      <h1>Administrator access required</h1>
      <p>Your account does not have permission to open the dashboard.</p>
      <Link className="text-link" href="/account">
        Back to your account
      </Link>
    </main>
  );
}
