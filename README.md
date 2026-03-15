# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 03-project-setup-start
```

## Finish Branch

```bash
git checkout 03-project-setup-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/getting-started/project-setup)

## Running Tests

```bash
npm install
npm test
```

> **Note:** On this branch (Red phase), the test should **fail** because the health check handler has not been implemented yet.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking should **pass** on this branch — the code is well-typed, the test just expects a response that hasn't been implemented yet.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
