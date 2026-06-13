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

[View the lesson on dalabs.academy](<!-- dalabs:18-error-handling -->)

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

> **Note:** This is the **Green** phase. Error handling is now centralized.
>
> **Custom error classes.** `src/errors.ts` defines a shared `AppError` base
> plus three subclasses — `NotFoundError` (404), `ValidationError` (400), and
> `ConflictError` (409). Each carries its own `statusCode` and a human-readable
> `error` label, so throwing one is enough to produce the right HTTP response.
>
> **One error handler.** `src/error-handler.ts` exports a single `errorHandler`
> registered with `app.setErrorHandler`. It maps an `AppError` subclass to its
> `statusCode` + `{ error, message }`; preserves the chapter-8 behavior of
> mapping Fastify's schema-validation errors to `400 { error, message }`; and
> maps anything unexpected to a generic `500 { error: "Internal Server Error",
> message: "An unexpected error occurred." }`. The 500 path logs the real error
> server-side via `request.log.error(error)` but never leaks the message or
> stack to the client.
>
> **Refactor under green tests.** The redirect, stats, and delete handlers used
> to build their own `404 { error, message }` bodies by hand. They now simply
> `throw new NotFoundError(...)` and let the central handler format the
> response. Because the resulting status code and body shape are identical, the
> existing endpoint tests stayed green — the error handler is the seam that let
> the refactor happen with no test changes.
>
> Unit suite (`npm test`, Docker-free): **11 suites / 62 tests** — a new
> `error-handling.test.ts` drives each error class through the handler and
> asserts the status + body, including the unexpected-error 500 that leaks no
> internals. Integration suite (`npm run test:integration`, Docker): **9 suites
> / 23 tests** — unchanged; the refactored 404s behave exactly as before.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
