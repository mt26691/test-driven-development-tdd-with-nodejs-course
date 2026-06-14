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

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/testing-infrastructure/advanced-test-isolation)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Fast unit tests — no database required (stay green, Docker-free)
npm test

# Integration tests — SERIAL (one worker). Green because nothing runs in parallel.
npm run test:integration

# The same suite WITHOUT the serial guard, against the shared test database —
# this is the failing demo: workers clobber each other's rows.
npm run test:integration:parallel

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase for parallel safety.
>
> The integration suite shares ONE test database (`urlshortener_test`) and is
> kept correct only by running **serially** — `jest.integration.config.ts` pins
> `maxWorkers: 1`. `npm run test:integration` is green (10 suites / 28 tests),
> but it leaves the extra CPU cores idle.
>
> `npm run test:integration:parallel` removes the serial guard (`maxWorkers: 4`)
> and runs the whole suite — including two contention drivers
> (`*.paralleltest.ts`) — against the shared database. Whenever Jest actually
> spreads the suites across workers, they truncate and rewrite the same `urls`
> table at once and **clobber each other's rows**: worker A's table count comes
> back as someone else's, `collisions`/`list-urls`/`shorten-persists` all fail.
> The run is **flaky** — it fails on roughly half of the runs and "passes" on the
> rest only because Jest falls back to a single worker under load (serial =
> accidentally safe). That non-determinism is exactly the problem the finish
> branch fixes by giving every Jest worker its own database.
>
> Unit suite (`npm test`, Docker-free): **16 suites / 88 tests**. Integration
> suite, serial (`npm run test:integration`, Docker): **10 suites / 28 tests**.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
