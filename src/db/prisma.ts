import { PrismaClient } from "@prisma/client";

/**
 * A single, shared Prisma client for the whole process.
 *
 * The generated `PrismaClient` manages its own connection pool, so — exactly
 * like the `pg` Pool — we create one instance and export it rather than
 * `new`-ing a client per query. Importing it from one place also gives later
 * chapters a single seam to swap the in-memory store for a Prisma-backed one.
 *
 * Which database it talks to is driven by `DATABASE_URL`, read from the
 * environment via the `datasource` block in `prisma/schema.prisma`. Under Jest
 * the integration setup points `DATABASE_URL` at the dedicated test database
 * before this module is imported, so the same client targets dev normally and
 * the test database during integration tests — no code change required.
 *
 * NOTE: the application routes still serve requests from the in-memory Map.
 * This client exists so we can prove the schema, migration, and typed client
 * are real; wiring it into the request path is the next chapter.
 */
export const prisma = new PrismaClient();
