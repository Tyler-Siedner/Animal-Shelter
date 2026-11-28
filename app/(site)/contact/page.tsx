// Authors: Tyler Siedner and Tyler Harris
import { Suspense } from "react";
import Link from "next/link";
import { site } from "../../../data/site";
import { getAnimals } from "../../../lib/animals";
import { getCurrentUser } from "../../../lib/auth";
import { contactAction } from "../../actions/contact";
import ActionForm from "../../../components/ActionForm";
import FormField from "../../../components/FormField";
export const metadata = { title: "Contact" };
type Props = { searchParams: Promise<{ animal?: string }> };
async function ContactForm({ searchParams }: Props) {
  const user = await getCurrentUser();
  const animals = await getAnimals();
  const selected = (await searchParams).animal;
  return (
    <section className="form-page">
      <h2>Send a message</h2>
      {user ? (
        <p>
          You can read staff replies in{" "}
          <Link className="text-link" href="/messages">
            Your messages
          </Link>
          .
        </p>
      ) : (
        <p>
          <Link className="text-link" href="/login">
            Sign in
          </Link>{" "}
          to read replies here, or send a guest message below.
        </p>
      )}
      <ActionForm action={contactAction} buttonLabel="Send message">
        <FormField
          name="name"
          label="Name"
          defaultValue={user?.name}
          minLength={2}
          maxLength={100}
          autoComplete="name"
        />
        <FormField
          name="email"
          label="Email"
          type="email"
          defaultValue={user?.email}
          maxLength={254}
          autoComplete="email"
        />
        <FormField
          name="phone"
          label="Phone"
          type="tel"
          defaultValue={user?.phone}
          required={false}
          maxLength={40}
          autoComplete="tel"
        />
        <div className="form-field">
          <label htmlFor="animalId">Resident (optional)</label>
          <select
            id="animalId"
            name="animalId"
            defaultValue={
              animals.some((a) => a.id === selected) ? selected : ""
            }
          >
            <option value="">General inquiry</option>
            {animals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} — {animal.type}
              </option>
            ))}
          </select>
        </div>
        <FormField
          name="subject"
          label="Subject"
          minLength={3}
          maxLength={150}
        />
        <FormField
          name="message"
          label="Message"
          multiline
          minLength={10}
          maxLength={5000}
        />
      </ActionForm>
    </section>
  );
}
export default function ContactPage(props: Props) {
  return (
    <main>
      <h1>Contact the shelter</h1>
      <div className="contact-grid">
        <section>
          <h2>Contact details</h2>
          <p>
            <a className="text-link" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p>
            <a className="text-link" href={`tel:${site.phoneLink}`}>
              {site.phone}
            </a>
          </p>
          <h2>Location</h2>
          <address>
            {site.location.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </address>
          <h2>Hours</h2>
          <ul>
            {site.hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="form-help">
            Shelter local time. Visits by appointment.
          </p>
          <h2>Social platforms</h2>
          <div className="account-links">
            {site.socialLinks.map((link) => (
              <a
                className="text-link"
                href={link.href}
                key={link.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="form-help">
            Contact details are fictional for this project.
          </p>
        </section>
        <Suspense fallback={<p>Loading contact form…</p>}>
          <ContactForm {...props} />
        </Suspense>
      </div>
    </main>
  );
}
