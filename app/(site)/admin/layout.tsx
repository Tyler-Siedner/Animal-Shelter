// Authors: Tyler Siedner and Tyler Harris
import Link from "next/link";
export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="admin-shell">
      <h1>Admin dashboard</h1>
      <nav className="admin-nav" aria-label="Admin navigation">
        <Link href="/admin">Overview</Link>
        <Link href="/admin/animals">Residents</Link>
        <Link href="/admin/adoptions">Adoptions</Link>
        <Link href="/admin/volunteers">Volunteers</Link>
        <Link href="/admin/messages">Messages</Link>
      </nav>
      {children}
    </main>
  );
}
