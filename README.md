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

[View the lesson on dalabs.academy](<!-- dalabs:24-table-partitioning -->)

## What's on this branch

This is the **finish** (Green) state for the table-partitioning chapter. The
`urls` table is now a PostgreSQL **declaratively partitioned** table —
`PARTITION BY HASH (short_code)` split into four partitions (`urls_p0`..`urls_p3`).

The migration `prisma/migrations/20260614092740_partition_urls_by_hash` rebuilds
`urls` as a partitioned table and copies the existing rows across. Because Prisma
cannot express partitioning, that migration's SQL is hand-edited. The Prisma
model's primary key changes from `id` to the composite `@@id([id, shortCode])`,
because Postgres requires the partition key (`short_code`) in every unique/PK on
a partitioned table. `shortCode` stays `@unique`, so the repository, every
endpoint, and the whole existing test suite behave exactly as before.

A new integration suite (`__tests__/integration/partitioning.test.ts`) proves the
table is HASH-partitioned and that rows distribute across more than one partition.

## Running Tests Locally

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)
cp .env.example .env        # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

npm run typecheck           # type-check (Docker-free)
npm test                    # unit tests (Docker-free)
npm run test:integration    # integration tests (parallel, per-worker DBs)

# When you are done, stop the database
docker compose down -v      # also delete the data volume
```

> **Note:** This is the **Green** phase for the table-partitioning chapter.
>
> Unit suite (`npm test`, Docker-free): **16 suites / 88 tests**. Integration
> suite (`npm run test:integration`, Docker): **11 suites / 31 tests** — the new
> `partitioning.test.ts` (3 tests) confirms the partitioned table and that rows
> spread across the hash partitions.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
