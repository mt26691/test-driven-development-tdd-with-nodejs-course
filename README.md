# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 17-delete-url-start
```

## Finish Branch

```bash
git checkout 17-delete-url-finish
```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:17-delete-url -->)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Apply the migration to the DEV database (creates the `urls` table)
npx prisma migrate deploy

# Fast unit tests — no database required (the new delete suite fails here)
npm test

# Integration tests — apply migrations to the TEST database (automatic, via
# Jest globalSetup) and run the delete tests against the real DB (also red)
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase. The new `delete.test.ts` suites are
> present but `DELETE /urls/:code` is not implemented yet, so they fail.
>
> **What is red.** The unit suite fails with **4 failed of 57** — the DELETE
> route does not exist, so the request 404s instead of returning 204, the row is
> never removed (a later redirect still 302s), and the targeted code is still
> found. The integration suite fails with **2 failed of 23** — deleting a known
> code returns 404 instead of 204, and a later stats lookup still returns 200
> because the row was never deleted.
>
> **Your task.** Add `DELETE /urls/:code`: a new `delete.ts` route, a
> `delete(shortCode)` method on the `UrlStore` interface (returning a boolean —
> was a row removed?) implemented in both `PrismaUrlRepository` and the in-memory
> `UrlService`, and the route registration in `app.ts`. Map a real deletion to
> `204` and a miss to `404`.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the red is behavioral
> (the endpoint is missing), not a compile error.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
