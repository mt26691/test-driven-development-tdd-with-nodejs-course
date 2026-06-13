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

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/hardening-and-edge-cases/collisions-and-advisory-locks)

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
# Jest globalSetup)
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase. The new collision and concurrency tests
> are present and **fail honestly** — the short-code generator is still naive.
>
> `saveWithUniqueCode` generates one code and inserts it with **no retry**, and
> the store does **not** reject duplicate codes. So a forced collision either
> overwrites a row (in-memory) or surfaces a raw Prisma unique-constraint error,
> `P2002` (Postgres), instead of recovering with a fresh code or returning a
> clean `409`. The concurrency test that forces two requests onto the same first
> code also fails.
>
> Unit suite (`npm test`, Docker-free): **2 suites fail / 5 tests fail** of
> 13 suites / 68 tests. Integration suite (`npm run test:integration`, Docker):
> **1 suite fails / 3 tests fail** of 10 suites / 28 tests. Your job in this
> chapter is to make them pass with retry-on-conflict (and to add the advisory-
> lock alternative).

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the red is behavioral, not
> a compile error.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
