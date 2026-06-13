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

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/building-the-core/unique-short-codes)

## Running Tests

```bash
npm install
npm test
```

> **Note:** On this branch (Green/Refactor phase), all tests **pass**. The pure base62 generator in `src/utils/short-code.ts` takes its randomness through an injected `random` source, so its unit tests are deterministic. The `POST /shorten` route now calls `generateUniqueShortCode` (regenerating on collision against the in-memory store) instead of returning the hardcoded `"abc123"`, and the route tests inject a deterministic RNG via `buildApp({ random })`.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the generator, its `RandomSource` type, the route options, and the new `random` field on `BuildAppOptions` are all fully typed.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
