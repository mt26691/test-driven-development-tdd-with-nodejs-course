# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 18-error-handling-start
```

## Finish Branch

```bash
git checkout 18-error-handling-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/hardening-and-edge-cases/centralized-error-handling)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Apply the migration to the DEV database (creates the `urls` table)
npx prisma migrate deploy

# Fast unit tests — no database required (Docker-free)
npm test

# Integration tests — apply migrations to the TEST database (automatic, via
# Jest globalSetup)
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase. A new `__tests__/error-handling.test.ts`
> describes the centralized error handler we are about to build: throwing a
> `NotFoundError`, `ValidationError`, or `ConflictError` should produce the
> matching status code and a clean `{ error, message }` body, and an
> *unexpected* error should become a generic `500` that leaks no internals.
>
> The starter `src/errors.ts` already defines the error classes, and
> `src/error-handler.ts` is a **placeholder** that just forwards the error to
> Fastify's default handling. That placeholder is enough to compile (typecheck
> passes), but it does not map the errors correctly: the AppError responses
> carry an extra `statusCode` field, and the unexpected error **leaks its real
> message** (`"DB password is hunter2 at line 42"`) instead of a safe generic
> body — so **4 of the 5** new tests fail honestly.
>
> Unit suite (`npm test`, Docker-free): **1 suite fails / 11 total — 4 tests
> fail / 62 total**. Every other suite stays green. Integration suite (`npm run
> test:integration`, Docker): **9 suites / 23 tests** all green — the routes are
> untouched on this branch. Your job in the finish branch is to write the real
> `errorHandler` and refactor the routes to throw these errors.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the failure is behavioral,
> not a compile error. The placeholder handler and the error classes both
> typecheck cleanly.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
