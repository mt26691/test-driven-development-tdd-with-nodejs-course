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

# Fast unit tests — no database required (stay green, Docker-free)
npm test

# Integration tests — apply migrations to the TEST database (automatic, via
# Jest globalSetup)
npm run test:integration

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase. Configuration is now centralized and
> validated at startup.
>
> **One typed, validated config module.** `src/config.ts` reads the environment,
> validates it against a TypeBox schema compiled with **Ajv** (the same validation
> stack Fastify already uses for route schemas — no new framework, zero extra
> top-level dependencies), applies defaults, and returns a **frozen, typed**
> object. `loadConfig(env = process.env)` takes the environment as an argument so
> tests can pass a fixture without ever touching the real `process.env`.
>
> **Validated variables.** `DATABASE_URL` (required, must be a URI), `PORT`
> (integer, default `3000`), `BASE_URL` (the public base used to build `shortUrl`,
> default `http://localhost:3000`), and `NODE_ENV` (`development` | `test` |
> `production`, default `development`).
>
> **Fail fast.** The server entry (`src/server.ts`) calls the config loader before
> it starts listening. A missing or malformed variable throws a clear, multi-line
> message naming every problem and the process exits non-zero — the service never
> boots in a half-configured state.
>
> **Typed access everywhere.** The `shortUrl` returned by `/shorten`, `/urls`, and
> `/urls/:code/stats` is now built from `config.BASE_URL` instead of a hardcoded
> `http://localhost:3000`, so it is configurable per environment. `BASE_URL`
> defaults to `http://localhost:3000`, so every existing test stays green.
>
> Unit suite (`npm test`, Docker-free): **14 suites / 78 tests**. Integration
> suite (`npm run test:integration`, Docker): **10 suites / 28 tests**.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
