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

[View the lesson on dalabs.academy](<!-- dalabs:06-in-memory-storage -->)

## Running Tests

```bash
npm install
npm test
```

> **Note:** On this branch (Green/Refactor phase), all tests **pass**. The in-memory `UrlService` is implemented and wired into the `POST /shorten` route, so the new `url.service.test.ts` suite passes and the pre-existing `shorten` test still passes — the route contract is unchanged.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the service, its `UrlStore` interface, and the route options are all fully typed.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
