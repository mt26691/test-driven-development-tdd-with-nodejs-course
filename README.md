# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 23-ci-pipeline-start
```

## Finish Branch

```bash
git checkout 23-ci-pipeline-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/testing-infrastructure/ci-pipeline-github-actions)

## What's on this branch

This is the **start** (Red) state for the CI chapter. It adds a GitHub Actions
workflow at `.github/workflows/ci.yml`, but the workflow is **incomplete on
purpose**: it has **no PostgreSQL service container** and no `DATABASE_URL` /
`TEST_DATABASE_URL` pointing at one. The type-check and unit steps pass (they are
Docker-free), but the integration step has no database to connect to, so it fails
— exactly what this workflow would do in CI.

The finish branch adds the missing `services:` block (a `postgres:16-alpine`
service container with a health check) and the DB env, turning the pipeline green.

## Running Tests Locally

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Fast unit tests — no database required (stay green, Docker-free)
npm test

# Type checking — passes (Docker-free)
npm run typecheck

# Integration tests — REQUIRE a database. With no Postgres reachable, this fails
# to connect, which is the failure the incomplete CI workflow hits.
npm run test:integration
```

> **Note:** This is the **Red** phase for the CI chapter.
>
> The workflow `.github/workflows/ci.yml` checks out the repo, sets up Node with
> npm caching, installs dependencies, generates the Prisma client, type-checks,
> and runs the unit and integration tests. What it is **missing** is a database:
> there is no `services:` container and no `DATABASE_URL` / `TEST_DATABASE_URL`,
> so the integration job step cannot reach Postgres and fails with a connection
> error.
>
> Unit suite (`npm test`, Docker-free): **16 suites / 88 tests** — green.
> Type check (`npm run typecheck`): green. The integration step is the one that
> fails without a database.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
