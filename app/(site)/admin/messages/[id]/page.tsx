// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "../../../../../lib/auth";
import { getDatabase } from "../../../../../lib/database";
import { adminMessages } from "../../../../../lib/contact-repository";
import { replyAction } from "../../../../actions/admin";
import ActionForm from "../../../../../components/ActionForm";
import FormField from "../../../../../components/FormField";
type Props = { params: Promise<{ id: string }> };
async function Message({ params }: Props) {
  const user = await requireAdmin();
  const id = (await params).id;
  const message = adminMessages(getDatabase(), user.id).find(
    (m) => m.id === id,
  );
  if (!message) notFound();
  return (
    <section className="form-page">
      <h2>{message.subject}</h2>
      <p>
        From {message.name} ·{" "}
        <a className="text-link" href={`mailto:${message.email}`}>
          {message.email}
        </a>
      </p>
      {message.phone && <p>Phone: {message.phone}</p>}
      {message.animalName && <p>About: {message.animalName}</p>}
      <p className="message-body">{message.message}</p>
      <ActionForm action={replyAction} buttonLabel="Save response">
        <input type="hidden" name="id" value={message.id} />
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={message.status}>
            {["New", "In Progress", "Resolved"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <FormField
          name="reply"
          label={
            message.userId
              ? "Reply (visible in the sender's account)"
              : "Internal note (guest message)"
          }
          defaultValue={message.reply}
          multiline
          required={false}
          maxLength={5000}
        />
        {!message.userId && (
          <p className="form-help">
            This guest has no account thread. Use their email or phone to follow
            up; this form does not send email.
          </p>
        )}
      </ActionForm>
    </section>
  );
}
export default function MessagePage(props: Props) {
  return (
    <Suspense fallback={<p>Loading message…</p>}>
      <Message {...props} />
    </Suspense>
  );
}
