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

[View the lesson on dalabs.academy](<!-- dalabs:09-postgresql-docker-setup -->)

## Running Tests

```bash
npm install

# Fast unit tests — no database required
npm test

# Integration test — needs a real Postgres (FAILS on this branch)
npm run test:integration
```

> **Note:** This is the **Red** phase. The fast unit tests (`npm test`) still pass — they never touch a database. The new integration test (`__tests__/integration/db.test.ts`) tries to `SELECT 1` against a real PostgreSQL, but on this branch it **fails to even compile**: there is no connection module (`src/db/pool`), the `pg` driver is not installed, and there is no `docker-compose.yml` to start a database. Expect `Cannot find module '../../src/db/pool'`. The finish branch adds Docker Compose, the `pg`-backed pool, and the env config that turns this red green.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **fails** on this branch — the integration test imports `src/db/pool`, which does not exist yet (`error TS2307: Cannot find module '../../src/db/pool'`). The finish branch adds the module.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
