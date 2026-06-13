# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 11-prisma-and-schema-start
```

## Finish Branch

```bash
git checkout 11-prisma-and-schema-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/adding-a-real-database/prisma-and-schema)

## Running Tests

```bash
npm install
cp .env.example .env       # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Fast unit tests — no database required (stay green)
npm test

# Integration tests — connect to the real test database
npm run test:integration

# When you are done, stop the database
docker compose down -v     # also delete the data volume
```

> **Note:** This is the **Red** phase for Prisma. A new integration test,
> `__tests__/integration/url-model.test.ts`, uses a typed Prisma client to
> create and read a `Url` row. On this branch it fails to even load —
> `Cannot find module '../../src/db/prisma'` — because Prisma is not installed,
> there is no schema, no generated client, and no `urls` table. With the
> Postgres container running, that red is honest: it is the missing
> schema/client/table, not a connectivity problem. The unit tests (`npm test`)
> stay green. The finish branch installs Prisma, models the `Url` table, runs
> the first migration, generates the client, and turns this test green.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **fails** on this branch — `url-model.test.ts` imports
> `../../src/db/prisma`, which does not exist yet. That is the same missing
> module that drives the failing test. The finish branch adds it.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
