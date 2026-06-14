# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 24-table-partitioning-start
```

## Finish Branch

```bash
git checkout 24-table-partitioning-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/bonus/table-partitioning)

## What's on this branch

This is the **start** (Red) state for the table-partitioning chapter. A new
integration suite (`__tests__/integration/partitioning.test.ts`) asserts that the
`urls` table is HASH-partitioned and that rows distribute across more than one
partition — but the table is still the plain, non-partitioned `urls` from the
previous chapter, so those two assertions fail honestly.

Your job in this chapter is to migrate `urls` to a PostgreSQL declaratively
partitioned table (`PARTITION BY HASH (short_code)`) so the partition assertions
turn green, while every existing endpoint and test keeps passing.

## Running Tests Locally

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

npm run typecheck           # type-check (Docker-free)
npm test                    # unit tests (Docker-free)
npm run test:integration    # integration tests (Docker)

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Red** phase for the table-partitioning chapter.
>
> Unit suite (`npm test`, Docker-free): **16 suites / 88 tests**, all passing —
> the unit tests never touch the database. Integration suite
> (`npm run test:integration`, Docker): **2 tests fail** in
> `partitioning.test.ts` because the `urls` table is not partitioned yet
> (`relkind` is `r`, not `p`, and rows land in one table). You make them pass in
> this chapter.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
