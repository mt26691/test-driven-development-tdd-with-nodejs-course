# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 13-redirect-start
```

## Finish Branch

```bash
git checkout 13-redirect-finish
```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:13-redirect -->)

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
# Jest globalSetup) and exercise the redirect against the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. We add `GET /:code`, which looks up the
> original URL by its short code and **HTTP-redirects** to it (302), or returns
> **404** when the code is unknown.
>
> **Why 302, not 301?** A `301 Moved Permanently` is cached hard by browsers and
> proxies, so later requests would skip the server entirely — the click tracking
> we add in chapter 14 would never run, and we could never change the target. A
> `302 Found` is not cached by default, so every hit flows through the handler.
>
> **Route ordering / reserved paths:** `GET /:code` is a bare param route at the
> root, so it could match `/health`, `/shorten`, and `/documentation`. We
> register it **last** (`src/app.ts`), and Fastify's radix router prefers the
> more specific static paths — so the catch-all only handles real short codes. A
> unit test (`__tests__/redirect.test.ts`) proves `GET /health` still returns its
> JSON, not a redirect or 404.
>
> The lookup stays in the storage layer — the handler reuses the existing
> `UrlStore.findByCode` (chapter 6), so the route is thin and the same code works
> against the in-memory store (unit) and Prisma (integration).
>
> Unit suite (`npm test`, Docker-free): **7 suites / 35 tests** — three new
> redirect cases (known code → 302 + `Location`; unknown code → 404, no
> `Location`; `/health` still works). Integration suite
> (`npm run test:integration`, Docker): **5 suites / 10 tests** — a new
> `redirect-persists.test.ts` POSTs `/shorten`, then GETs `/:code` and confirms
> the real DB round-trip redirects.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
