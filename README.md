# Weyland-Yutani Animal Shelter

Tyler Siedner and Tyler Harris — CSC448, Programming Assignment 2.

An Alien-themed shelter site built with Next.js, React, TypeScript, Tailwind, and SQLite.

## Run it

Use Node.js 20, 22, or 24. In the project folder, run:

```powershell
npm install
npm run db:seed
npm run db:check
npm run dev
```

Open the address shown in the terminal. Register an account to save favorites and apply for adoption or volunteer work.

## Admin access

Register first, then run this with your account email:

```powershell
npm run admin:grant -- "your-email"
```

Refresh and open Admin to edit residents, review applications, and reply to messages.

## A few notes

- SQLite is saved in `storage/shelter.sqlite`. Keep it out of Git. Stop the server before backing up the `storage` folder.
- `data/animals.ts` is starter data. Edit saved residents through Admin.
- Contact messages and replies stay on the website; automated email is not set up.
- `data/site.ts` holds the homepage image and demo contact details. Put images in `public/images`; resident photos go in `public/images/creatures`.
- Passwords need at least 10 characters. There are no default accounts.

## Check it

```powershell
npm test
npm run lint
npm run build
```

After a build, `npm start` runs the production server.
