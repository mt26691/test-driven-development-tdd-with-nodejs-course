# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 14-tracking-clicks-start
```

## Finish Branch

```bash
git checkout 14-tracking-clicks-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/expanding-the-api/tracking-clicks)

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
# Jest globalSetup) and exercise click tracking against the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. Every successful `GET /:code` redirect
> now increments the URL's `clicks` counter, so after N hits the stored `clicks`
> equals N.
>
> **Atomic increment, not read-modify-write.** We bump the counter with a single
> atomic SQL statement — `UPDATE urls SET clicks = clicks + 1 WHERE short_code = ...`
> (via Prisma's `{ clicks: { increment: 1 } }`). The naive alternative — read
> `clicks`, add 1 in JS, write it back — loses counts under concurrency: two
> redirects can read the same value and both write back the same `+1`, so one
> hit vanishes (a *lost update*). The atomic increment never loses a hit.
>
> **Awaited, not fire-and-forget.** The handler `await`s `incrementClicks` before
> redirecting. Awaiting adds a little latency but keeps the count correct and lets
> a failure surface instead of becoming a silent unhandled rejection. Returning
> the redirect first and incrementing in the background (fire-and-forget) is
> faster but risks losing the count on a crash or rejection — we favour
> correctness at this stage.
>
> The increment lives behind the chapter-6 `UrlStore` seam: a new
> `incrementClicks(shortCode)` method, implemented atomically in
> `PrismaUrlRepository` and on a counter Map in the in-memory `UrlService`. The
> route stays thin — `findByCode` then `incrementClicks`.
>
> Unit suite (`npm test`, Docker-free): **7 suites / 38 tests** — three new
> `UrlService` click cases (saved URL starts at 0; N increments → N clicks;
> unknown code ignored). Integration suite (`npm run test:integration`, Docker):
> **6 suites / 13 tests** — a new `click-tracking.test.ts` proves N redirects
> yield N clicks against the real database.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
