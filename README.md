# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 21-logging-shutdown-start
```

## Finish Branch

```bash
git checkout 21-logging-shutdown-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/production-readiness/structured-logging-and-graceful-shutdown)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Apply the migration to the DEV database (creates the `urls` table)
npx prisma migrate deploy

# Fast unit tests — no database required (stay green, Docker-free)
npm test

# Integration tests — apply migrations to the TEST database (automatic, via
# Jest globalSetup)
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. The service now has production-grade
> observability and lifecycle handling.
>
> **Structured logging.** Fastify's built-in logger is **Pino**, which already
> emits structured JSON. `src/logger.ts` derives the log **level** from
> `NODE_ENV` — `production` → `info`, `development` → `debug`, `test` →
> `silent` — and `buildApp` wires those options through (the bare `logger: true`
> is gone). Fastify tags every log line with a request id (`reqId`), so all the
> lines for one request can be correlated.
>
> **Graceful shutdown.** `buildApp` registers an `onClose` hook that awaits a
> list of injected resource closers, isolating each so one failure cannot strand
> the others. `src/server.ts` injects the real closers (`prisma.$disconnect()`,
> `pool.end()`) and installs `SIGTERM`/`SIGINT` handlers that call `app.close()`
> — which stops accepting new connections, drains in-flight requests, runs the
> hook, then exits 0 — guarded against double-invocation. This is what lets the
> service shut down cleanly under containers/k8s rolling deploys instead of
> dropping requests and leaking DB connections.
>
> Unit suite (`npm test`, Docker-free): **16 suites / 88 tests**. Integration
> suite (`npm run test:integration`, Docker): **10 suites / 28 tests**.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
