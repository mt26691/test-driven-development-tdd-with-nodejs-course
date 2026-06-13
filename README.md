# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 19-collisions-and-locks-start
```

## Finish Branch

```bash
git checkout 19-collisions-and-locks-finish
```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:19-collisions-and-locks -->)

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
# Jest globalSetup)
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. Short-code generation is now safe under
> collisions and concurrency.
>
> **The race.** The old generator pre-checked `findByCode` before inserting. That
> is a TOCTOU race: under concurrency two requests can both see a code as free,
> then both insert it — one hits the database unique constraint (Prisma P2002),
> surfacing as a 500. We drop the pre-check and make the `urls.short_code` unique
> index the single source of truth.
>
> **Shipped strategy — retry on conflict.** `PrismaUrlRepository.saveWithUniqueCode`
> draws a fresh code, tries to insert, and on P2002 retries with a new code up to
> `DEFAULT_MAX_ATTEMPTS` (5). If every attempt collides it throws `ConflictError`
> (the class seeded in chapter 18) → a clean 409. The route now calls
> `urlStore.saveWithUniqueCode` instead of generate-then-save.
>
> **Alternative — advisory locks.** `saveWithAdvisoryLock` wraps generate+insert
> in a transaction that takes `pg_advisory_xact_lock` on a global generation key,
> so only one request generates at a time. It is shown as the pessimistic
> alternative; the app ships the optimistic retry by default.
>
> **Tested for real.** Unit tests drive the retry loop with the in-memory store
> (which now models the unique constraint). Integration tests force a real
> collision against Postgres and fire 50 concurrent `Promise.all` inserts,
> asserting every code is distinct and no write is lost.
>
> Unit suite (`npm test`, Docker-free): **13 suites / 68 tests**. Integration
> suite (`npm run test:integration`, Docker): **10 suites / 28 tests**.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
