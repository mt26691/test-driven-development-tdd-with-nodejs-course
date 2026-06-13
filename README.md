# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 10-test-isolation-foundations-start
```

## Finish Branch

```bash
git checkout 10-test-isolation-foundations-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/adding-a-real-database/test-isolation-foundations)

## Running Tests

```bash
npm install
cp .env.example .env       # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Fast unit tests — no database required
npm test

# Integration tests — connect to the real test database (now isolated)
npm run test:integration

# When you are done, stop the database
docker compose down -v     # also delete the data volume
```

> **Note:** This is the **Green** phase. The two leaky integration tests from the start branch now pass in any order — and they pass **unchanged**. The fix is centralized in `__tests__/integration/setup-isolation.ts`, wired into `jest.integration.config.ts` via `setupFilesAfterEnv`: it registers a single `beforeEach` that calls `truncateAllTables()`, so every integration test starts from an empty database. No test has to remember to clean up after itself. The `urls_demo` table is a throwaway teaching table created by the suite itself (`helpers/urls-demo.ts`) — distinct from the Prisma-managed `Url` table introduced later. Unit tests stay fast and Docker-free.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
