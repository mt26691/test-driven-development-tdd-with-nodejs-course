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

[View the lesson on dalabs.academy](<!-- dalabs:15-list-urls -->)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Apply the migration to the DEV database (creates the `urls` table)
npx prisma migrate deploy

# Fast unit tests — no database required
npm test

# Integration tests — apply migrations to the TEST database (automatic, via
# Jest globalSetup) and exercise the list endpoint against the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase. The new tests for `GET /urls`
> (`__tests__/list.test.ts` and `__tests__/integration/list-urls.test.ts`) are
> written first and **fail on purpose** — the list endpoint does not exist yet.
>
> The red is **behavioral, not a compile error** (`npm run typecheck` still
> passes): a request to `GET /urls` is swallowed by the `/:code` catch-all and
> returns `404` instead of a paginated list. With the Postgres container up, the
> integration failures are the *missing endpoint*, not a connectivity problem —
> the sibling integration suites still talk to the database happily.
>
> Unit suite (`npm test`, Docker-free): **1 failed, 7 passed of 8 suites** —
> **9 failed, 38 passed of 47 tests**. Integration suite
> (`npm run test:integration`, Docker): **1 failed, 6 passed of 7 suites** —
> **4 failed, 13 passed of 17 tests**.
>
> The finish branch implements `GET /urls` with limit/offset pagination, a
> `{ data, page, limit, total }` envelope, querystring validation, and the list
> route registered before the catch-all — turning every red test green.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the failing tests are
> behavioral (missing endpoint), not type errors.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
