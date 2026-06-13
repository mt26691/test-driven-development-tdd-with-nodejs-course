# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 16-url-stats-start
```

## Finish Branch

```bash
git checkout 16-url-stats-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/expanding-the-api/url-stats)

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
# Jest globalSetup) and exercise the stats endpoint against the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. `GET /urls/:code/stats` returns the
> metadata and click stats for a single short code.
>
> **Response shape.** The endpoint returns
> `{ shortCode, originalUrl, clicks, createdAt, shortUrl }`, locked with a
> Fastify response schema. `createdAt` is serialized as an ISO 8601 string
> (`Date.prototype.toISOString()`), so the JSON shape is deterministic. An
> unknown code returns `404 { error, message }`.
>
> **The seam.** Stats needs the *whole* record, not just the original URL, so a
> new `findRecordByCode(shortCode)` is added to the chapter-6 `UrlStore`
> interface — returning the full `UrlRecord` (`shortCode`, `originalUrl`,
> `clicks`, `createdAt`) or `undefined` for an unknown code. It is implemented in
> both `PrismaUrlRepository` (a projected `findUnique`) and the in-memory
> `UrlService` (which already tracks the full record). The handler stays thin.
>
> **Route ordering.** `/urls/:code/stats` has its own static prefix and segment
> count, so Fastify's radix router never confuses it with the bare `/:code`
> catch-all or the `/urls` list. It is registered before the catch-all alongside
> the list route. A test asserts the path returns the stats object (200, no
> `Location` header, not the list envelope), not a redirect or the list.
>
> **Richer stats later.** Fields like `lastAccessedAt`, referrers, or per-day
> click rollups would need a richer data model (e.g. a separate click-events
> table) — foreshadowing the table-partitioning bonus chapter.
>
> Unit suite (`npm test`, Docker-free): **9 suites / 52 tests** — a new
> `stats.test.ts` covers the happy path, ISO date serialization, click counts,
> the 404, and the route-ordering proof. Integration suite
> (`npm run test:integration`, Docker): **8 suites / 20 tests** — a new
> `stats.test.ts` proves stats against Postgres, including clicks after redirects.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
