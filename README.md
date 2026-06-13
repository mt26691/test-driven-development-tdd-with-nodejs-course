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

[View the lesson on dalabs.academy](<!-- dalabs:14-tracking-clicks -->)

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
# Jest globalSetup). The new click-tracking test FAILS here on purpose.
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase. We add a failing integration test,
> `__tests__/integration/click-tracking.test.ts`, that POSTs a URL, GETs
> `/:code` five times, then reads `clicks` from the database and expects it to be
> `5`. The redirect handler does not count hits yet, so `clicks` stays at its
> default `0` → **Expected: 5, Received: 0**. With the Postgres container up that
> red is honest behaviour, not a connectivity problem — the sibling
> `redirect-persists.test.ts` still redirects against the same database.
>
> **What's still green:** every other test — the unit suite (`npm test`) stays at
> **7 suites / 35 tests** and `npm run typecheck` passes. Only the new
> click-tracking integration test is red.
>
> In the **finish** branch we make it green: add an `incrementClicks(shortCode)`
> method to the `UrlStore` seam, implement it as an **atomic** SQL increment in
> the Prisma repository (`UPDATE urls SET clicks = clicks + 1`, i.e. Prisma's
> `{ clicks: { increment: 1 } }`) and as a counter Map in the in-memory store,
> then call it from the redirect handler after a successful lookup.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the red is behavioural (the
> count stays 0), not a compile error.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
