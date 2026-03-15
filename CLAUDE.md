# CLAUDE.md

## Project Description

This is the course repository for **Test Driven Development (TDD) with Node.js**. Each chapter builds on the previous one, introducing TDD concepts and practices using Node.js.

## Tech Stack

- **Node.js** v22+
- **TypeScript** 5.x (strict mode, `noEmit`)
- **tsx** — TypeScript runtime (no build step)
- **Fastify** 5.x
- **Jest** 30.x + **ts-jest** — test framework
- **Docker**
- **PostgreSQL**

## Branch Naming Convention

Each chapter has two branches:

- `{XX}-{chapter-name}-start` — starting point for the chapter
- `{XX}-{chapter-name}-finish` — completed state of the chapter

Where:
- `{XX}` is the zero-padded chapter number (e.g., `01`, `02`, `10`)
- `{chapter-name}` is in kebab-case (e.g., `what-is-tdd`, `setting-up-the-project`)

Examples:
```
git checkout -b 01-what-is-tdd-start
git checkout -b 01-what-is-tdd-finish
git checkout -b 02-setting-up-the-project-start
```

## Plan Mode Rules

When entering plan mode, **always** ask the user:

1. Do you need a new branch for this chapter?
2. If yes, ask for:
   - **Chapter number** (zero-padded, e.g., `01`, `02`)
   - **Chapter name** (kebab-case, e.g., `what-is-tdd`)
3. Create both `-start` and `-finish` branches as needed.

## README Update Rules

After creating chapter branches, update `README.md` on `main`:

1. Add a new row to the **Chapters** table in `README.md`
2. Use this row format:
   ```
   | {XX} | {Chapter Title} | [`start`](https://github.com/mt26691/test-driven-development-tdd-with-nodejs-course/tree/{XX}-{chapter-name}-start) · [`finish`](https://github.com/mt26691/test-driven-development-tdd-with-nodejs-course/tree/{XX}-{chapter-name}-finish) |
   ```
3. Replace `{XX}` with the zero-padded chapter number, `{chapter-name}` with kebab-case name, and `{Chapter Title}` with the human-readable title

## Chapter Branch README Template

When creating or updating `README.md` on chapter branches (`-start` and `-finish`), use this structure:

```md
# Test Driven Development (TDD) with Node.js

This repository contains the source code for the [Test Driven Development with Node.js](https://dalabs.academy/courses/test-driven-development-with-nodejs) course.

## Prerequisites

- [Node.js](https://nodejs.org/) (v22 or higher)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Start Branch

\```bash
git checkout {XX}-{chapter-name}-start
\```

## Finish Branch

\```bash
git checkout {XX}-{chapter-name}-finish
\```

## Lesson

[View the lesson on dalabs.academy](<!-- dalabs:{XX}-{chapter-name} -->)

## Running Tests

\```bash
{test command for this branch}
\```

> **Note:** {Appropriate note about test expectations for this branch/phase}

## Contact

If you have any questions, feedback, or just want to connect, feel free to reach out to me on LinkedIn:

https://www.linkedin.com/in/mt26691/
```

Replace `{XX}`, `{chapter-name}`, `{test command}`, and `{note}` with the appropriate values for each branch.
