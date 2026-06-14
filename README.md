# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 21-logging-shutdown-start
```

## Finish Branch

```bash
git checkout 21-logging-shutdown-finish
```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:21-logging-shutdown -->)

## Running Tests

```bash
npm install                 # installs deps and runs `prisma generate` (postinstall)

# Fast unit tests — no database required
npm test
```

> **Note:** This is the **Red** phase. Two new suites describe behaviour that
> does not exist yet:
>
> - `__tests__/logging.test.ts` fails to compile — it imports `src/logger`,
>   which has not been written, and configures `buildApp` with a `nodeEnv`
>   option that does not exist on `BuildAppOptions`.
> - `__tests__/shutdown.test.ts` fails its assertions — `buildApp` does not yet
>   register an `onClose` hook that runs the injected resource closers, so the
>   spies are never called.
>
> Everything else stays green: **2 failed, 14 passed (16 suites)** /
> **2 failed, 78 passed (80 tests)**. Type checking also fails on this branch
> (missing `src/logger`, unknown `nodeEnv`/`closers` options) — that is the
> honest red we make green in the finish branch.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
