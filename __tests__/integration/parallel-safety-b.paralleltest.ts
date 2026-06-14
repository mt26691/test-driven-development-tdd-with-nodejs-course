import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";
import { truncateAllTables } from "./helpers/truncate";

/**
 * Cross-worker contamination driver (worker B) — the sibling of
 * `parallel-safety-a.paralleltest.ts`. See that file for the full explanation.
 * The two run on different Jest workers; on a shared database they contaminate
 * each other's rows, on per-worker databases they do not.
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

describe("parallel safety — worker B", () => {
  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it("only ever sees its own rows for the whole window", async () => {
    await waitForBoth("b-ready", "a-ready");

    const deadline = Date.now() + DURATION_MS;

    while (Date.now() < deadline) {
      await truncateAllTables();

      for (let i = 0; i < BATCH; i++) {
        await prisma.url.create({
          data: { shortCode: `b-${i}`, originalUrl: `https://b.example/${i}` },
        });
      }

      const codes = await prisma.url.findMany({ select: { shortCode: true } });
      const foreign = codes.filter((row) => !row.shortCode.startsWith("b-"));

      expect(foreign).toEqual([]);
      expect(codes.length).toBe(BATCH);
    }
  }, 20000);
});
