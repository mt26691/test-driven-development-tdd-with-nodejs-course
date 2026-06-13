# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 10-test-isolation-foundations-start
```

## Finish Branch

```bash
git checkout 10-test-isolation-foundations-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/adding-a-real-database/test-isolation-foundations)

## Running Tests

```bash
npm install
cp .env.example .env       # local dev/test connection config

# Start PostgreSQL and wait until it is healthy
docker compose up -d --wait

# Fast unit tests — no database required (stay green)
npm test

# Integration tests — connect to the real test database
npm run test:integration

# When you are done, stop the database
docker compose down -v     # also delete the data volume
```

> **Note:** This is the **Red** phase for test isolation. Two integration tests in `__tests__/integration/urls-isolation.test.ts` each insert one row into a real `urls_demo` table and assert the table holds exactly one row. With **no cleanup between tests**, the second test sees the first test's leftover row and fails (`Expected: 1, Received: 2`). The suite is order-dependent — each test passes when run alone, but they fail together. The unit tests (`npm test`) stay green. The finish branch wires a centralized `beforeEach` that truncates the database before every integration test.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the failure is a runtime data-leak assertion, not a type error.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
