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

> **Note:** On this branch (Green phase), all tests should **pass** because the `shortenUrl` service function is implemented and the shorten route now uses it to generate unique short codes.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking should **pass** on this branch — the store, service, and route are fully typed.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
