# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 22-test-isolation-start
```

## Finish Branch

```bash
git checkout 22-test-isolation-finish
```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:22-test-isolation -->)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Fast unit tests — no database required (stay green, Docker-free)
npm test

# Integration tests — now run in PARALLEL across workers, each on its own DB
npm run test:integration

# The contention drivers, proving parallel workers no longer collide
npm run test:integration:parallel

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase for parallel safety.
>
> Every Jest worker now gets its OWN database, named `urlshortener_test_<id>`
> (keyed on `JEST_WORKER_ID`). `setup-env.ts` rewrites the connection strings to
> point the `pg` pool and Prisma at that per-worker database before they are
> imported; `setup-isolation.ts` creates and migrates it once per worker
> (`helpers/worker-database.ts` — `CREATE DATABASE` guarded by a `pg_database`
> catalog check, then `prisma migrate deploy`), and still truncates it before
> each test. Because the databases are private, no worker can see or wipe
> another's rows.
>
> With that isolation in place, `jest.integration.config.ts` drops the serial
> guard (`maxWorkers: 4`), so the suite runs in parallel and **faster**. On this
> machine the same 10-suite suite runs in **~7.6 s serially** vs **~3.8 s in
> parallel** — about a **2× speedup**, and the gap grows with the suite.
>
> Chapter 10 made the tests *correct* (clean state between tests); this chapter
> keeps them correct **and** makes them *fast* (parallel workers, each isolated).
>
> Unit suite (`npm test`, Docker-free): **16 suites / 88 tests**. Integration
> suite (`npm run test:integration`, Docker, parallel): **10 suites / 28 tests**.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
