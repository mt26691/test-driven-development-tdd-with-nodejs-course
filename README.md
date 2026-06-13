# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 13-redirect-start
```

## Finish Branch

```bash
git checkout 13-redirect-finish
```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:13-redirect -->)

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
# Jest globalSetup) and exercise the route against the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase. We write the failing tests for the
> redirect endpoint **first**:
>
> - `__tests__/redirect.test.ts` (unit, Docker-free, in-memory store) — a known
>   code must redirect with **302** and a `Location` header; an unknown code must
>   return **404** with no `Location`; and `GET /health` must still return its
>   JSON (proving the param route won't swallow reserved paths).
> - `__tests__/integration/redirect-persists.test.ts` (Docker-required) — POST
>   `/shorten`, then GET `/:code` must redirect to the persisted original URL.
>
> There is no `GET /:code` route yet, so the redirect assertions fail honestly:
> Fastify returns its default **404** where the tests expect **302**. The code
> still **type-checks** — the failures are behavioural, not compile errors.
>
> Unit: **1 failed, 34 passed (7 suites / 35 tests)**. Integration: **1 failed,
> 9 passed (5 suites / 10 tests)**. We turn them green in the **finish** branch.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the new tests reference
> only modules that already exist, so the red is at runtime, not compile time.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
