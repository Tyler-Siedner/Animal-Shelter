// Authors: Tyler Siedner and Tyler Harris
// Local setup only; there is no public web action that grants administrator roles.
import { getDatabasePath, openShelterDatabase } from "../lib/database";
import { findCredentials } from "../lib/account-repository";
import { emailAddress } from "../lib/validation";
const db = openShelterDatabase(getDatabasePath());
try {
  const email = emailAddress(process.argv[2]);
  const user = findCredentials(db, email);
  if (!user)
    throw new Error(
      "No account has that email. Register on the website first, then run this command again.",
    );
  db.prepare("UPDATE users SET role='admin' WHERE id=?").run(user.id);
  console.log(
    `Administrator access granted to ${user.email}. Refresh the website to see the Admin link.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Could not update account.",
  );
  console.error('Usage: npm run admin:grant -- "your-account-email"');
  process.exitCode = 1;
} finally {
  db.close();
}
