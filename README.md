# Yevora

Yevora is a personal developer workspace built around one daily loop:

- keep GitHub work visible
- run focus sessions that connect to output
- capture searchable notes next to the work
- read momentum through streaks, summaries, and a Today queue

It is built with Next.js, NextAuth, Prisma, PostgreSQL, Tailwind CSS, and GitHub OAuth.

## What the app includes

- `Today`: a daily work queue for focus, repo, PR, and note signals
- `Dashboard`: weekly commits, focus time, notes, and repository snapshots
- `Focus`: Pomodoro flow with output summaries and automatic breaks
- `Repositories`: tracked GitHub repositories saved to the user account
- `Notes`: searchable notes with autosave and markdown preview
- `Stats`: commit, focus, and output trends

## Stack

- Next.js 16
- React 19
- NextAuth with GitHub provider
- Prisma + PostgreSQL
- Tailwind CSS 4
- shadcn/ui primitives

## Requirements

- Node.js 20+
- PostgreSQL
- A GitHub OAuth app

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
Copy-Item .env.example .env.local
```

Required variables:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=
```

Notes:

- `NEXTAUTH_URL` should match the exact URL you use locally or in production.
- `DATABASE_URL` should point to a PostgreSQL database.
- `NEXTAUTH_SECRET` can be any long random string.

## GitHub OAuth setup

Create a GitHub OAuth app and use:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Yevora requests this scope set:

- `read:user`
- `user:email`
- `repo`

The app uses the GitHub access token to load repositories, pull requests, and recent commit activity.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create and fill `.env.local`:

```bash
Copy-Item .env.example .env.local
```

3. Apply the database schema:

```bash
npx prisma migrate dev
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
npm run dev
npm run lint
npm run build
npx prisma migrate dev
npx prisma studio
```

## Database overview

The main persisted entities are:

- `User`
- `Note`
- `PomodoroSession`
- `TrackedRepo`
- NextAuth tables: `Account` and `Session`

Recent additions include:

- focus session output summaries
- repository selection persistence
- tracked output metadata on Pomodoro sessions

## Daily workflow

1. Sign in with GitHub
2. Land on `Today`
3. Check the queue for PRs, focus gaps, stale repos, or note follow-ups
4. Run a focus session and save the output summary
5. Review notes, repos, and weekly stats

## Deployment notes

Before deploying:

- set all environment variables in the target environment
- run `npx prisma migrate deploy`
- set `NEXTAUTH_URL` to the production domain
- update the GitHub OAuth app callback URL to the production callback

Production callback format:

```txt
https://your-domain.com/api/auth/callback/github
```

## Status

The project is feature-rich and still being polished. Small UX and presentation improvements are expected as the product evolves.
