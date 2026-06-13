# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

```bash
git checkout 08-url-validation-start
```

## Finish Branch

```bash
git checkout 08-url-validation-finish
```

## Lesson

[View the lesson on dalabs.academy](https://dalabs.academy/courses/test-driven-development-with-nodejs/building-the-core/url-validation)

## Running Tests

```bash
npm install
npm test
```

> **Note:** This is the **Green/Refactor** phase — all tests **pass**. `POST /shorten` now validates input before anything is stored. The body JSON schema enforces `type: "string"`, `format: "uri"`, `minLength: 1`, and `maxLength: 2048`, and the handler runs an extra WHATWG-`URL` protocol allow-list check (`src/utils/validate-url.ts` → `isValidHttpUrl`) so that `ftp://` and `javascript:` are rejected — `format: "uri"` alone accepts those. Every rejection returns `400` with one consistent body: `{ error, message }`, normalised in `app.ts` via `setErrorHandler`. The extracted validator is unit-tested directly in `__tests__/validate-url.test.ts`, and the happy path stays green.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — `isValidHttpUrl` (a `value is string` type guard), the tightened route schema, and the typed `setErrorHandler` (`FastifyError`) are all fully typed.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
