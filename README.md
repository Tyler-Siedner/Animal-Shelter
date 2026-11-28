# Weyland-Yutani Animal Shelter

Authors: Tyler Siedner and Tyler Harris

A fictional Alien-universe animal shelter for CSC448 Programming Assignment 2.

## Current features — Stage 4

- Entrance screen and facehugger transition.
- Simple black/Orbitron/yellow design with responsive pages and navigation.
- Nine resident profiles, photos, care information, and search/filter controls.
- Registration, sign-in/sign-out, editable profile, and password changes.
- Private favorites, saved to SQLite.
- Adoption application forms and personal application tracking/withdrawal.
- Volunteer opportunities, schedules, applications, and tracking/withdrawal.
- Protected admin dashboard: resident editing/removal/restoration and application decisions.
- Contact form, private staff inbox, and replies inside registered users' accounts.
- Editable fictional contact settings and an optional custom homepage image.
- Additive SQLite migration that preserves existing animal/account/application data.

**Remaining:** final requirements/accessibility review, demonstration video, and submission ZIP preparation. This stage completes the planned feature implementation; it is not the final submission package.

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

To keep the navigation short, Favorites, Applications, and Messages are linked from Account. Administrators also see an Admin link. The W/Y mark and the old decorative homepage panels/statistics have been removed.

## Application behavior

- An account is required to save favorites or submit applications.
- The server uses the signed-in identity; it never trusts a hidden user ID from the browser.
- Only residents marked Available accept adoption applications. Submitting an application does not automatically change the resident's adoption status.
- A user can have only one active adoption application per resident and one active volunteer application per opportunity.
- Application snapshots save the applicant's submitted details and their registered email.
- Users may withdraw their own Submitted or Under Review applications. They cannot withdraw someone else's application or a completed decision.
- Opportunities and schedules are stored in SQLite. The initial schedules use the fictional shelter's local time.
- Administrators can review applications and leave applicant-visible notes. Under Review marks an available resident Pending. Approval marks it Adopted and rejects other open applications for that resident.
- Only one application can be approved per resident. To reverse an approval, staff change that application to Rejected first. Removing a resident hides the listing and preserves its history; restoring it makes it visible again.

## Database and migration

SQLite lives in `storage/shelter.sqlite`, with possible WAL/SHM sidecars while running. This folder is excluded from Git. It now contains account and applicant information: keep it private and back it up.

Run `npm run db:seed` after applying updates. Stage 4 upgrades earlier schemas to version 3 without deleting existing animals, replacing their values, or resetting the database. Running it again is safe.

`data/animals.ts` supplies the initial sample records only. Editing it does not overwrite an initialized database. Do not delete your database to apply an update. To make a simple backup, stop the app and copy the whole `storage` folder.

Resident queries now read directly from SQLite at request time, so staff edits and decisions do not wait on an older public cache entry. User sessions, favorites, messages, profiles, and applications are also request-time reads. Static volunteer opportunities still use the public cache. Local Suspense boundaries support Cache Components without caching private data.

## Code organization

- `app/(site)`: pages and shared layout.
- `app/actions`: server actions for account and application forms.
- `components/AnimalDirectory.tsx`: interactive search and filters.
- `components/ActionForm.tsx`: pending/error/success handling for server-action forms.
- `components/SiteNavigation.tsx`: request-time session read for navigation.
- `lib/database.ts`, `lib/account-schema.ts`: connection, schema, and migrations.
- `lib/animal-repository.ts`, `lib/account-repository.ts`, `lib/application-repository.ts`: parameterized SQL queries.
- `lib/auth.ts`, `lib/passwords.ts`: session cookies and password hashing.
- `lib/animals.ts`: live resident reads; `lib/volunteers.ts`: cached public opportunities.
- `lib/admin-schema.ts`, `lib/admin-repository.ts`: additive schema migration and role-checked staff operations.
- `lib/contact-repository.ts`: contact submission, ownership-filtered messages, and staff replies.
- `data/site.ts`: homepage image and fictional contact settings.
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

Individual suites are available as `npm run test:db`, `npm run test:accounts`, and `npm run test:admin`. Tests use isolated temporary databases and do not alter your real records. The current 26 tests cover seeds/persistence, migrations, hashing, sessions/expiry, rate limits, ownership, duplicate applications, invalid input, and transaction rollback.

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

The final accessibility/requirements review remains. Record a demonstration video and submit the source/documentation ZIP once the remaining features are complete. Do not include real personal data, `node_modules`, `.next`, or your private database in a public repository.

## Granting administrator access

Register your own account on the website first. Stop the dev server, then run this local command using the same account email:

```powershell
npm run admin:grant -- "your-account-email"
```

Start the website again and refresh. Open Admin to edit residents, review adoption and volunteer applications, or handle messages. The command grants a role to an existing account; it does not create a default password or a new account. There is no public web endpoint for granting roles. Server actions and private reads check the current database role, not a browser-supplied value.

## Contact behavior

Contact forms save to SQLite and the staff inbox. Registered senders can read staff replies at Account → Your messages. Guests can submit inquiries without an account; staff can use the supplied email/phone for a manual follow-up. Guest internal notes do not appear in another account.

**This stage does not send automated emails.** The staff email link opens the administrator's own mail client. The email address ending in `.example`, phone, station address, hours, and social-platform links in `data/site.ts` are fictional/demo values; replace them with intended details if desired. The Instagram/Facebook links currently go to platform homepages, not invented shelter accounts.

## Change a resident's name or photo

After granting your account access, use Admin → Residents → Edit resident. Save changes there instead of editing `data/animals.ts`. IDs stay fixed to preserve application and favorite links. Removing a listing is reversible and does not delete its application history.

The Photo dropdown lists existing files from `public/images/creatures`. To use a new picture, put it in that folder, restart the server if necessary, and select it in the editor. This stage does not include browser-based file uploads. Rebuild/restart a production server after adding new public files.

## Add your own homepage image

The Jonesy image has been removed from `/home`; his resident profile/photo remain unchanged. The homepage stays text-only until you choose an image.

1. Place the file inside `public/images`, for example `public/images/home.png`.
2. Open `data/site.ts` and change:

```ts
homeImage: "/images/home.png",
homeImageAlt: "A description of your image",
```

Save and refresh. This displays an ordinary image beside the introduction, without a card or a cropped background. Use the exact filename/extension. Leave `homeImage` as an empty string to hide it.
