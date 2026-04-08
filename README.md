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

<!-- dalabs:06-in-memory-storage -->
[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/building-the-core/in-memory-url-storage)

## Running Tests

```bash
npm install
npm test
```

> **Note:** On this branch (Red phase), some tests should **fail** because the `shortenUrl` service function and the updated shorten endpoint have not been implemented yet.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking should **pass** on this branch — the code is well-typed, the tests just expect functionality that has not been implemented yet.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
