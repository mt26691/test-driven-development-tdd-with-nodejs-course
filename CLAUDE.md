# CLAUDE.md

## Project Description

This is the course repository for **Test Driven Development (TDD) with Node.js**. Each chapter builds on the previous one, introducing TDD concepts and practices using Node.js.

## Tech Stack

- **Node.js** v22+
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
