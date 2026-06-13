# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 09-postgresql-docker-setup-start
```

## Finish Branch

```bash
git checkout 09-postgresql-docker-setup-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/adding-a-real-database/postgresql-docker-setup)

## Running Tests

```bash
npm install
cp .env.example .env       # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Fast unit tests — no database required
npm test

# Integration test — connects to the real test database
npm run test:integration

# When you are done, stop the database
docker compose down        # add -v to also delete the data volume
```

> **Note:** This is the **Green** phase. `docker compose up -d` stands up a pinned `postgres:16-alpine` instance hosting two databases — `urlshortener` (dev) and `urlshortener_test` (test, created by `docker/init/01-create-test-db.sql`). The new integration test (`__tests__/integration/db.test.ts`) connects via the `pg`-backed pool in `src/db/pool.ts`, reads `TEST_DATABASE_URL` from `.env`, and runs `SELECT 1` — proving real connectivity. A light `truncateAllTables` helper seeds the dedicated test-isolation chapter. The in-memory store is still the app's storage backend; the Prisma migration comes later. Unit tests stay fast and Docker-free.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the `pg` `Pool`, the typed query result in the integration test, and the truncate helper are all fully typed (`@types/pg`).

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
