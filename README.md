# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 15-list-urls-start
```

## Finish Branch

```bash
git checkout 15-list-urls-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/expanding-the-api/list-all-urls)

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
# Jest globalSetup) and exercise the paginated list against the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. `GET /urls` returns a paginated list of
> URLs, newest first.
>
> **Response envelope.** The endpoint returns
> `{ data: Url[], page, limit, total }`, locked with a Fastify response schema.
> Each item exposes `shortCode`, `originalUrl`, `clicks`, `createdAt`, and a
> derived `shortUrl`. `total` is the count of ALL rows so the client can compute
> the page count.
>
> **Limit/offset pagination.** `skip = (page - 1) * limit`, `take = limit`. We
> chose limit/offset over cursor pagination because the UI is page-numbered and
> the dataset is small — `?page=3` is trivial to express. Cursor pagination is
> better for very large or real-time datasets (stable under inserts, no deep
> `OFFSET` scan), but it cannot jump to an arbitrary page number, which we want
> here.
>
> **Stable ordering.** Rows come back `createdAt DESC, id DESC`. The `id`
> tiebreaker makes ordering deterministic even when two rows share a timestamp,
> so page boundaries never duplicate or drop a row.
>
> **Param validation.** The querystring JSON schema sets `page` (default 1,
> minimum 1) and `limit` (default 20, minimum 1, maximum 100). Out-of-range
> values are rejected with a `400 { error, message }` before the handler runs.
>
> **Route ordering.** `/urls` is a static path registered BEFORE the `/:code`
> catch-all, so Fastify's radix router serves the list rather than treating
> `urls` as a short code. A test asserts `GET /urls` returns the list (200, no
> `Location` header), not a redirect or 404.
>
> The list method lives behind the chapter-6 `UrlStore` seam: a new
> `list({ page, limit })` returning `{ items, total }`, implemented with
> `findMany`/`count` in `PrismaUrlRepository` and a sorted slice in the in-memory
> `UrlService`. The route stays thin.
>
> Unit suite (`npm test`, Docker-free): **8 suites / 47 tests** — a new
> `list.test.ts` covers default page size, page boundaries, ordering, total
> count, validation, and the route-ordering proof. Integration suite
> (`npm run test:integration`, Docker): **7 suites / 17 tests** — a new
> `list-urls.test.ts` proves real pagination and ordering against Postgres.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
