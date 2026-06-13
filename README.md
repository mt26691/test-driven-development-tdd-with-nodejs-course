# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 06-in-memory-storage-start
```

## Finish Branch

```bash
git checkout 06-in-memory-storage-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/building-the-core/in-memory-storage)

## Running Tests

```bash
npm install
npm test
```

> **Note:** On this branch (Red phase), the new `__tests__/url.service.test.ts` suite **fails** because the `UrlService` does not exist yet. The pre-existing `health` and `shorten` tests still pass. Your job in this chapter is to create the in-memory `UrlService` and wire it into the route.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **fails** on this branch — the test imports `../src/services/url.service`, which you have not created yet.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
