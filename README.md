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

> **Note:** This is the **Red** phase. `__tests__/shorten.validation.test.ts` adds the unhappy-path tests for `POST /shorten` first, and they **fail** — the route currently accepts any string as a URL, so malformed input (`ftp://`, `javascript:`, `"not a url"`, an empty string, a non-string value, and an over-length URL) is wrongly accepted with `201` instead of being rejected with `400`. The pre-existing tests still pass; the validation logic arrives on the finish branch.

## Type Checking

```bash
npm run typecheck
```

> **Note:** Type checking **passes** on this branch — the new test file is fully typed (it uses `light-my-request`'s `Response` type for the inject helper). Only the runtime validation behaviour is missing, which is exactly what TDD's Red phase looks like.

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
