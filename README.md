# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 12-migrate-to-database-start
```

## Finish Branch

```bash
git checkout 12-migrate-to-database-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/adding-a-real-database/migrate-to-database)

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
# Jest globalSetup) and exercise the Prisma-backed store against the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. We retire the in-memory `Map` from the
> request path and serve from PostgreSQL. A new `PrismaUrlRepository`
> (`src/services/prisma-url.repository.ts`) implements the **same `UrlStore`
> interface** introduced in chapter 6 — `save(shortCode, url)` /
> `findByCode(shortCode)` — mapping `url` to the `originalUrl` column and letting
> the database fill `clicks` (0), `createdAt`, and the serial `id`. `buildApp`
> now defaults to this Prisma store, so the real app persists to Postgres; tests
> inject whichever backend they need.
>
> **The seam from chapter 6 pays off:** the route file
> (`src/routes/shorten.ts`) changes by **just 2 lines** — adding `await` to the
> two store calls, because `UrlStore` became async. Its logic, schema,
> validation, and response are otherwise byte-for-byte identical.
>
> Two integration tests drive the swap (Docker-required):
> `prisma-url.repository.test.ts` exercises the repository directly, and
> `shorten-persists.test.ts` POSTs `/shorten` through `buildApp` and confirms the
> row actually lands in the `urls` table. Integration: **4 suites / 8 tests**.
>
> The fast unit suite stays **green and Docker-free** (6 suites / 32 tests): the
> route's unit tests inject the in-memory `UrlService`, so they never reach for a
> database — run them with Postgres stopped and they still pass.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
