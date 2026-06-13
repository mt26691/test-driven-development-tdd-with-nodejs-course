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

# Fast unit tests — no database required (stay green)
npm test

# Integration tests — Docker required (RED on this branch, see note)
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase of the database-migration chapter. Two new
> integration tests describe a Prisma-backed `UrlStore` implementation that does
> not exist yet:
> `__tests__/integration/prisma-url.repository.test.ts` exercises the repository
> directly (`save` then `findByCode`, unknown code → `undefined`, `clicks = 0`),
> and `__tests__/integration/shorten-persists.test.ts` POSTs `/shorten` through
> `buildApp` wired with the Prisma store and asserts the row lands in the `urls`
> table. Both fail to compile with `Cannot find module
> '../../src/services/prisma-url.repository'` — an **honest missing-module red**,
> not a connectivity error (the existing `db.test.ts` and `url-model.test.ts`
> still pass against the same live database). The fast unit suite stays **green**
> (6 suites / 32 tests) because the route is still exercised with the in-memory
> `UrlService`. The finish branch implements the Prisma repository and swaps it
> into `buildApp` as the default store.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **fails** on this branch — the new integration tests
> import a module (`src/services/prisma-url.repository`) and a `buildApp` option
> (`urlStore`) that do not exist yet. That is the Red state the finish branch
> resolves.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
