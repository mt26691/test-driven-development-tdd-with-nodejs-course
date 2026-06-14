# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

[![CI](https://github.com/mt26691/test-driven-development-tdd-with-nodejs-course/actions/workflows/ci.yml/badge.svg?branch=23-ci-pipeline-finish)](https://github.com/mt26691/test-driven-development-tdd-with-nodejs-course/actions/workflows/ci.yml)

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

This is the **finish** (Green) state for the CI chapter. The GitHub Actions
workflow at `.github/workflows/ci.yml` is now complete: it spins up a
`postgres:16-alpine` **service container** (health-gated), points the same
`DATABASE_URL` / `TEST_DATABASE_URL` the local setup uses at it, applies the
Prisma migrations, creates the test database, and runs the full check suite
(type-check + unit + integration) on every push and pull request.

The only difference from the start branch is the missing piece that made the
integration step fail there: the Postgres `services:` block plus the DB env.

## Running Tests Locally

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# The same checks CI runs:
npm run typecheck           # type-check (Docker-free)
npm test                    # unit tests (Docker-free)
npm run test:integration    # integration tests (parallel, per-worker DBs)

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase for the CI chapter.
>
> The workflow runs one job on `ubuntu-latest`. It defines a `postgres:16-alpine`
> **service container** with a `pg_isready` health check, so no step ever races a
> database that is still starting. Job-level `env` sets `DATABASE_URL` and
> `TEST_DATABASE_URL` to point at that service on `localhost:5432`, using the same
> database names and credentials as the local docker-compose setup.
>
> The steps mirror the local workflow exactly: `actions/checkout`, then
> `actions/setup-node` with **npm dependency caching**, `npm ci`,
> `npx prisma generate`, `npx prisma migrate deploy` (dev DB), `createdb` for the
> test database, then `npm run typecheck`, `npm test`, and `npm run test:integration`.
> The integration suite still creates and migrates a private database per Jest
> worker (`urlshortener_test_<id>`); the service container's `postgres` superuser
> can `CREATE DATABASE`, so that per-worker bootstrap works unchanged in CI.
>
> There is no `lint` script in this project, so the workflow runs type-check and
> tests only. If a linter were added, its step would slot in alongside the
> type-check step.
>
> Unit suite (`npm test`, Docker-free): **16 suites / 88 tests**. Integration
> suite (`npm run test:integration`, Docker, parallel): **10 suites / 28 tests**.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Gating Merges (Branch Protection)

The workflow makes the suite *run* on every push and pull request. To make a
green run *required* before code can merge, enable branch protection on GitHub:
**Settings → Branches → Add rule** for `main`, tick **Require status checks to
pass before merging**, and select the **Type-check & test** check. After that, a
pull request can only merge once CI is green.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
