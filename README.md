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

[View the lesson on dalabs.academy](<!-- dalabs:11-prisma-and-schema -->)

## Running Tests

```bash
npm install                 # installs Prisma and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Apply the migration to the DEV database (creates the `urls` table)
npx prisma migrate deploy

# Fast unit tests — no database required (stay green)
npm test

# Integration tests — apply migrations to the TEST database (automatic, via
# Jest globalSetup) and talk to the real `urls` table through Prisma
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. We install Prisma, model the `Url` table
> in `prisma/schema.prisma`, run the first migration (`prisma/migrations/`), and
> generate a typed client (`src/db/prisma.ts`). The integration test
> `__tests__/integration/url-model.test.ts` now creates and reads a `Url` row
> through Prisma — proving the unique `shortCode`, the `clicks` default of 0, and
> the generated `createdAt`. Migrations are applied to the test database
> automatically by `__tests__/integration/global-setup.ts` (`prisma migrate
> deploy`). The centralized `truncateAllTables()` cleanup now skips Prisma's
> `_prisma_migrations` bookkeeping table so migration history survives between
> tests. **The application still serves requests from the in-memory Map** —
> swapping the store for a Prisma-backed repository is the next chapter.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch (the generated Prisma client
> provides the `Url` types used by the integration test).

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
