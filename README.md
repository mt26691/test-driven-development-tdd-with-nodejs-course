# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 16-url-stats-start
```

## Finish Branch

```bash
git checkout 16-url-stats-finish
```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:16-url-stats -->)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Apply the migration to the DEV database (creates the `urls` table)
npx prisma migrate deploy

# Fast unit tests — no database required
npm test

# Integration tests — apply migrations to the TEST database (automatic, via
# Jest globalSetup) and exercise the endpoints against the real DB
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase. The new `stats.test.ts` suites (one unit,
> one integration) describe `GET /urls/:code/stats` — the happy path that returns
> `{ shortCode, originalUrl, clicks, createdAt, shortUrl }` for a known code, and
> a `404` for an unknown one. The endpoint does not exist yet, so requests fall
> through to the `/:code` catch-all and the happy-path assertions fail with `404`.
>
> Your task in this chapter is to add the endpoint: a new `findRecordByCode`
> method on the chapter-6 `UrlStore` seam (implemented in both stores) and a thin
> `statsRoute` registered before the `/:code` catch-all. Implement them and the
> tests go green.
>
> - **Unit** (`npm test`, Docker-free): the stats happy-path tests fail (`404`);
>   every other suite stays green.
> - **Integration** (`npm run test:integration`, Docker): the stats happy-path
>   tests fail (`404`); every other suite stays green.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the tests only call the
> HTTP endpoint and existing store methods, so the start branch compiles cleanly
> even though the endpoint is not implemented yet.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
