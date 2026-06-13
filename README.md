# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 07-unique-short-codes-start
```

## Finish Branch

```bash
git checkout 07-unique-short-codes-finish
```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:07-unique-short-codes -->)

## Running Tests

```bash
npm install
npm test
```

> **Note:** On this branch (Red phase), the new `short-code.test.ts` suite **fails to run** because the generator module `src/utils/short-code.ts` does not exist yet, and the updated `shorten.test.ts` **fails** because the route still returns the hardcoded `"abc123"` instead of a generated code. The pre-existing `health` and `url.service` suites still pass.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **fails** on this branch — the test imports a module that doesn't exist yet and passes a `random` option to `buildApp` that `BuildAppOptions` doesn't declare. Both are fixed in the finish branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
