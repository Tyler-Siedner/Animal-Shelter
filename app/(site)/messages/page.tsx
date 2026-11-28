// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "../../../lib/auth";
import { getDatabase } from "../../../lib/database";
import { myMessages } from "../../../lib/contact-repository";
export const metadata = {
  title: "Your messages",
  robots: { index: false, follow: false },
};
async function Messages() {
  const user = await requireUser("/messages");
  const messages = myMessages(getDatabase(), user.id);
  return (
    <main className="plain-page">
      <h1>Your messages</h1>
      <Link className="text-link" href="/contact">
        Send a new message
      </Link>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        messages.map((message) => (
          <article className="application-item" key={message.id}>
            <h2>{message.subject}</h2>
            <p>
              Status: {message.status}
              {message.animalName ? ` · About ${message.animalName}` : ""}
            </p>
            <p className="message-body">{message.message}</p>
            {message.reply ? (
              <div className="staff-response">
                <h3>Staff reply</h3>
                <p className="message-body">{message.reply}</p>
              </div>
            ) : (
              <p>No reply yet.</p>
            )}
          </article>
        ))
      )}
    </main>
  );
}
export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <main>
          <p>Loading messages…</p>
        </main>
      }
    >
      <Messages />
    </Suspense>
  );
}
