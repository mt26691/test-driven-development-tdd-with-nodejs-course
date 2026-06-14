import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";
import { truncateAllTables } from "./helpers/truncate";

/**
 * Cross-worker contamination driver (worker A).
 *
 * This file and its sibling `parallel-safety-b.paralleltest.ts` each clear the
 * table, insert their own batch, then assert the table still holds exactly that
 * batch — repeating for a fixed window. A small on-disk barrier makes both files
 * wait for each other before they start, so when Jest runs them on two workers
 * they overlap in time and the race actually shows. On a shared test database
 * the sibling's
 * truncate/insert lands between this worker's insert and its read, so the rows
 * no longer match the batch this worker wrote — the real cross-worker failure
 * the start branch demonstrates under parallel workers.
 *
 * With a per-worker database (the finish branch) each worker owns its own DB, so
 * the same test passes under parallel workers.
 */
const BATCH = 25;
const DURATION_MS = 2000;

const barrierDir = join(tmpdir(), "url-shortener-parallel-safety");
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForBoth = async (self: string, other: string) => {
  mkdirSync(barrierDir, { recursive: true });
  writeFileSync(join(barrierDir, self), "ready");
  const deadline = Date.now() + 5000;
  while (!existsSync(join(barrierDir, other)) && Date.now() < deadline) {
    await sleep(25);
  }
};

describe("parallel safety — worker A", () => {
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it("only ever sees its own rows for the whole window", async () => {
    await waitForBoth("a-ready", "b-ready");

    const deadline = Date.now() + DURATION_MS;

    while (Date.now() < deadline) {
      await truncateAllTables();

      for (let i = 0; i < BATCH; i++) {
        await prisma.url.create({
          data: { shortCode: `a-${i}`, originalUrl: `https://a.example/${i}` },
        });
      }

      const codes = await prisma.url.findMany({ select: { shortCode: true } });
      const foreign = codes.filter((row) => !row.shortCode.startsWith("a-"));

      expect(foreign).toEqual([]);
      expect(codes.length).toBe(BATCH);
    }
  }, 20000);
});
