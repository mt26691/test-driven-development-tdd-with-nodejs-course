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

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/expanding-the-api/delete-a-url)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Apply the migration to the DEV database (creates the `urls` table)
npx prisma migrate deploy

# Fast unit tests — no database required (stay green, Docker-free)
npm test

# Integration tests — apply migrations to the TEST database (automatic, via
# Jest globalSetup) and confirm the row is really gone in the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. `DELETE /urls/:code` removes a single
> short URL.
>
> **Status codes.** Deleting an existing code returns `204 No Content` with an
> empty body, and a later `GET /:code` or `GET /urls/:code/stats` then returns
> `404`. Deleting a missing or already-deleted code returns `404 { error,
> message }` — chosen over an idempotent `204` so the response is *informative*
> (the client learns the resource was not there) and consistent with the 404s
> the redirect and stats endpoints already return for unknown codes.
>
> **The seam.** A new `delete(shortCode)` method is added to the chapter-6
> `UrlStore` interface, returning a `boolean`: `true` when a row was actually
> removed, `false` when the code did not exist. The thin handler maps `true → 204`
> and `false → 404` with no extra lookup. It is implemented in both
> `PrismaUrlRepository` (`deleteMany` + a `count > 0` check, which never throws on
> a miss) and the in-memory `UrlService` (`Map.delete` already returns that
> boolean).
>
> **Hard delete.** This is a *hard* delete — the row is gone. A *soft* delete
> would add a `deletedAt` column and keep the history, but then every read
> (redirect, list, stats) would have to filter it out. Hard delete keeps the
> queries simple; soft delete is the right call when you need audit trails,
> undo, or to preserve historical stats.
>
> **Confirming deletion.** The integration test does not trust the status code
> alone: after the `204` it queries the database directly with
> `prisma.url.findUnique` and asserts the row is `null`, proving the data is
> actually gone.
>
> Unit suite (`npm test`, Docker-free): **10 suites / 57 tests** — a new
> `delete.test.ts` covers the 204 + empty body, the follow-up 404s, the
> missing-code 404, the already-deleted 404, and that only the targeted code is
> removed. Integration suite (`npm run test:integration`, Docker): **9 suites /
> 23 tests** — a new `delete.test.ts` confirms the row is gone in Postgres.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
