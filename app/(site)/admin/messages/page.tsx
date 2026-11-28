// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "../../../../lib/auth";
import { getDatabase } from "../../../../lib/database";
import { adminMessages } from "../../../../lib/contact-repository";
async function Inbox() {
  const user = await requireAdmin();
  const messages = adminMessages(getDatabase(), user.id);
  return (
    <section>
      <h2>Contact messages</h2>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <div className="admin-list">
          {messages.map((message) => (
            <article className="admin-list-item" key={message.id}>
              <div>
                <h3>{message.subject}</h3>
                <p>
                  {message.name} · {message.email}
                </p>
                <p>
                  Status: {message.status}
                  {message.animalName ? ` · About ${message.animalName}` : ""}
                </p>
              </div>
              <Link
                className="text-link"
                href={`/admin/messages/${message.id}`}
              >
                Open message
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
export default function InboxPage() {
  return (
    <Suspense fallback={<p>Loading messages…</p>}>
      <Inbox />
    </Suspense>
  );
}
