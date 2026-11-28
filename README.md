# Weyland-Yutani Animal Shelter

Authors: Tyler Siedner and Tyler Harris

A fictional Alien-universe animal shelter for CSC448 Programming Assignment 2.

## Current implementation (Stage 2)

- Entrance screen and facehugger transition.
- Responsive home, directory, profile, About, and Contact pages.
- Nine fictional residents with photos, medical notes, and containment requirements.
- Name/type search; type, breed, size, gender, and minimum/maximum age filters.
- Persistent SQLite animal storage with a one-time, non-destructive sample import.
- Locally bundled Orbitron typography, pure black page backgrounds, yellow accents.

Accounts, favorites, adoption submissions/tracking, volunteer features, admin tools, and contact-form submission are not implemented yet. They are planned as later stages.

## Requirements

Node.js 20.x, 22.x, or 24.x and npm. The project has previously been run with Node 20.20.0 on Windows; this stage was verified on Node 24.22.3 on Linux. Install dependencies on your own machine rather than copying another machine's `node_modules` folder.

## Run locally

Open a terminal in the folder containing `package.json`:

```powershell
npm install
npm run db:seed
npm run dev
```

Open the Local URL printed by Next.js and visit `/home` or `/animals`.

The database is created automatically if missing, including during the first build or first server read. Running `db:seed` explicitly makes the setup easy to verify.

## Check the project

```powershell
npm run db:check
npm run test:db
npm run lint
npm run build
```

For a production server, after building:

```powershell
npm start
```

`db:check` reports database integrity, saved residents, and missing local images. The six database tests use temporary files isolated from your real shelter database.

## How storage works

SQLite stores the records in `storage/shelter.sqlite`. The WAL and SHM sidecar files may also appear while the application is running. The entire `storage` folder is excluded from Git.

- `data/animals.ts`: initial sample records, not the live source after initialization.
- `types/animal.ts`: TypeScript shape of an animal record.
- `lib/database.ts`: creates the schema, seeds once, and opens connections.
- `lib/animal-repository.ts`: parameterized SQL read queries.
- `lib/animals.ts`: server-only reads cached by Next.js and tagged `animals` for future admin invalidation.
- `components/AnimalDirectory.tsx`: interactive browser-side search and filter UI. It receives records from the server; it never opens the database.
- `app/(site)/animals/page.tsx`: loads records from SQLite and passes them to the directory component.
- `app/(site)/animals/[id]/page.tsx`: loads the requested individual record from SQLite.

The initial import uses a marker and a transaction. Re-running `npm run db:seed` does not duplicate residents, overwrite changed values, or recreate residents that were deliberately removed.

**Editing `data/animals.ts` after initialization does not update SQLite.** Admin editing will be added in a later stage. Do not delete your database just to apply a source-code update. No database reset command is included.

Public resident reads are cached: revalidation begins after approximately a minute, and a cached page may be served while it refreshes. Future admin mutations must invalidate the `animals` cache tag. Offline database edits are not an immediate live-edit interface.

## Backups and hosting

To make a simple file backup, stop the app and copy the entire `storage` folder to a safe location. Keep it separate from your public images and Git repository. Do not share real personal data in a submission or public repository.

This stage targets a local Node.js server with a writable, persistent disk. GitHub stores the source, not the running database. Deploying this SQLite file to an ephemeral/serverless filesystem without persistent storage will not preserve changes; choose persistent hosting or move to a hosted database before such deployment. Do not run the application as a static HTML export.

## Styling

- `app/globals.css`: Tailwind import.
- `app/site.css`: shared design rules and pure-black theme variables.
- `app/layout.tsx`: imports local Orbitron font CSS and both stylesheets.
- `components/Navbar.tsx`: shared navigation and active-section indicator.

Orbitron is served locally through `@fontsource/orbitron`; no Google Fonts network request is required. Creature photos and the entrance background remain your existing files in `public/images`.

## Troubleshooting

- **Cannot find `better-sqlite3`, `tsx`, or `@fontsource/orbitron`:** stop the server and run `npm install` from the project root.
- **Native module / NODE_MODULE_VERSION error:** run `npm rebuild better-sqlite3` after changing Node versions. Do not copy Linux dependencies onto Windows or vice versa.
- **An npm version asks to approve install scripts:** `better-sqlite3` requires its installation step to obtain its platform-specific binary. Follow the specific npm message for this package; Node 20 with npm 10 normally runs this step during installation.
- **Locked database:** stop duplicate development servers or SQLite editors, then restart. The app uses a 10-second busy timeout and WAL mode for normal concurrent reads.
- **Old design:** stop the server, save files, restart, and hard-refresh the browser. Ensure `app/layout.tsx` imports `./site.css`.
- **Unknown ID:** profiles display the not-found page. With streaming/Suspense, Next.js can send an initial HTTP 200 before the not-found result renders.

## Submission still required

Complete the remaining assignment features; keep both authors in source comments; record a demonstration video; and submit code/documentation in the required ZIP. This README describes the current stage, not a completed submission.
