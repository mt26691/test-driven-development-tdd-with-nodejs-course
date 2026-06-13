# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 20-config-start
```

## Finish Branch

```bash
git checkout 20-config-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/production-readiness/configuration-and-env-validation)

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
# Jest globalSetup)
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase. A new unit suite, `__tests__/config.test.ts`,
> describes a single typed, validated configuration module — `loadConfig(env)` — that
> reads environment variables, validates them against a schema, applies defaults, and
> returns a frozen, typed config object (or throws a clear error when a required var is
> missing or malformed).
>
> The module `src/config.ts` does not exist yet, so the config suite fails to load
> (`Cannot find module '../src/config'`) and `npm run typecheck` reports the same missing
> module. Every other suite stays green. The finish branch adds the module and refactors
> the app to read configuration only through it.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **fails** on this branch — `src/config.ts` does not exist yet,
> so the config test cannot resolve its import.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
