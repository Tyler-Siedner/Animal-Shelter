# Weyland-Yutani Animal Shelter

Authors: Tyler Siedner and Tyler Harris

A fictional Alien-universe animal shelter for CSC448 Programming Assignment 2.

## Current features — Stage 3

- Entrance screen and facehugger transition.
- Simple black/Orbitron/yellow design with responsive pages and navigation.
- Nine resident profiles, photos, care information, and search/filter controls.
- Registration, sign-in/sign-out, editable profile, and password changes.
- Private favorites, saved to SQLite.
- Adoption application forms and personal application tracking/withdrawal.
- Volunteer opportunities, schedules, applications, and tracking/withdrawal.
- Additive SQLite migration that preserves existing animal data.

**Remaining:** administrator management/review tools, working contact submissions and complete contact details, and final assignment verification/submission materials. Staff review is not automated: applications remain Submitted until management tools are implemented.

## Run locally

Use Node.js 20.x, 22.x, or 24.x. Open a terminal in the folder containing `package.json`:

```powershell
npm install
npm run db:seed
npm run db:check
npm run dev
```

Open the Local URL printed in the terminal. Visit `/home`, then Sign in → Create an account. No pre-made accounts or passwords are included.

A password must be 10–128 characters. Account emails are case-insensitive. Profile management allows changes to name, phone, address, and password; account email changes are not provided in this stage.

## Pages

| URL                   | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| `/`                   | Entrance                                                   |
| `/splash`             | Facehugger transition                                      |
| `/home`               | Introduction                                               |
| `/animals`            | Searchable directory                                       |
| `/animals/[id]`       | Resident profile, favorite control, adoption link          |
| `/register`, `/login` | Account access                                             |
| `/account`            | Edit profile/password, links to favorites and applications |
| `/favorites`          | Signed-in user's saved residents                           |
| `/adopt/[id]`         | Adoption application for an available resident             |
| `/applications`       | Signed-in user's adoption and volunteer applications       |
| `/volunteer`          | Public opportunities and schedules                         |
| `/volunteer/apply`    | Volunteer application                                      |
| `/about`, `/contact`  | Shelter information                                        |

To keep the navigation short, Favorites and Applications are linked from Account. The W/Y mark and the old decorative homepage panels/statistics have been removed.

## Application behavior

- An account is required to save favorites or submit applications.
- The server uses the signed-in identity; it never trusts a hidden user ID from the browser.
- Only residents marked Available accept adoption applications. Submitting an application does not automatically change the resident's adoption status.
- A user can have only one active adoption application per resident and one active volunteer application per opportunity.
- Application snapshots save the applicant's submitted details and their registered email.
- Users may withdraw their own Submitted or Under Review applications. They cannot withdraw someone else's application or a completed decision.
- Opportunities and schedules are stored in SQLite. The initial schedules use the fictional shelter's local time.
- Future administrator tools will review applications and update statuses.

## Database and migration

SQLite lives in `storage/shelter.sqlite`, with possible WAL/SHM sidecars while running. This folder is excluded from Git. It now contains account and applicant information: keep it private and back it up.

Run `npm run db:seed` after applying updates. Stage 3 upgrades schema version 1 to version 2 without deleting existing animals, replacing their values, or resetting the database. Running it again is safe.

`data/animals.ts` supplies the initial sample records only. Editing it does not overwrite an initialized database. Do not delete your database to apply an update. To make a simple backup, stop the app and copy the whole `storage` folder.

Public animal data is cached by Next.js. User sessions, favorites, profiles, and applications are read at request time and are not stored in the public cache. Session expiry checks explicitly run at request time to work with Cache Components.

## Code organization

- `app/(site)`: pages and shared layout.
- `app/actions`: server actions for account and application forms.
- `components/AnimalDirectory.tsx`: interactive search and filters.
- `components/ActionForm.tsx`: pending/error/success handling for server-action forms.
- `components/SiteNavigation.tsx`: request-time session read for navigation.
- `lib/database.ts`, `lib/account-schema.ts`: connection, schema, and migrations.
- `lib/animal-repository.ts`, `lib/account-repository.ts`, `lib/application-repository.ts`: parameterized SQL queries.
- `lib/auth.ts`, `lib/passwords.ts`: session cookies and password hashing.
- `lib/animals.ts`, `lib/volunteers.ts`: cached public reads.
- `lib/validation.ts`: server-side length/format checks and safe internal return URLs.
- `types`: shared TypeScript shapes.
- `app/site.css`: custom presentation. Orbitron comes from locally served font files.

## Account security implemented

Passwords are salted and hashed with Node's scrypt. Random session tokens are stored as hashes in SQLite and expire after seven days. Session cookies are HttpOnly, SameSite=Lax, and Secure in production. Sign-out revokes the current session; changing a password revokes other sessions. Persistent per-identity throttling limits repeated authentication attempts. Next.js Server Actions enforce their same-origin checks. Queries use bound parameters and application operations check ownership.

This is a local coursework implementation. Email verification, password-recovery email, MFA, and production monitoring are not implemented. Use test account details for your demonstration. This description is not a claim of a production security audit.

## Checks

```powershell
npm test
npm run lint
npm run build
```

Individual suites are available as `npm run test:db` and `npm run test:accounts`. Tests use isolated temporary databases and do not alter your real records. The current 17 tests cover seeds/persistence, migrations, hashing, sessions/expiry, rate limits, ownership, duplicate applications, invalid input, and transaction rollback.

The implementation was also exercised with two independent browser sessions: registration/login/profile changes, favorites, adoption and volunteer submissions, duplicate rejection, application withdrawal, cross-user isolation, password rotation, and mobile layouts. Checks ran on Linux/Node 24.22.3; install dependencies on your own Windows machine rather than copying another platform's `node_modules`.

## Hosting and troubleshooting

- This app needs a running Node.js server and persistent writable disk. GitHub hosts the source, not the SQLite database or running application.
- For serverless/ephemeral hosting, choose persistent storage or a hosted database first. Do not use a static HTML export.
- If dependencies are missing, stop the app and run `npm install` in the project root.
- If you change Node versions and encounter a native module mismatch, run `npm rebuild better-sqlite3`.
- If the database is locked, stop duplicate servers/database editors and restart.
- Development uses ordinary localhost cookies; production expects HTTPS (or a trusted localhost test environment).
- If navigation looks stale after an update, restart the server and hard-refresh. Sign out and sign in again if needed.
- If a password is forgotten, no recovery email is available yet. Use a separate test account; do not delete the entire database.
- Authentication throttling clears after 15 minutes. Avoid repeatedly guessing passwords.
- Unknown streamed routes may display the not-found page after the HTTP response has already started.

## Submission

The administrator stage, contact stage, and final accessibility/requirements review remain. Record a demonstration video and submit the source/documentation ZIP once the remaining features are complete. Do not include real personal data, `node_modules`, `.next`, or your private database in a public repository.
