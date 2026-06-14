import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app";
import { PrismaUrlRepository } from "../../src/services/prisma-url.repository";
import { prisma } from "../../src/db/prisma";
import { pool } from "../../src/db/pool";

/**
 * Integration tests that prove the `urls` table is HASH-partitioned and that
 * the API behaves identically against it.
 *
 * Two things are checked: the catalog says `urls` is a partitioned table split
 * by HASH (short_code), and rows actually land in more than one partition. The
 * rest of the suite (shorten, redirect, stats, ...) already proves the endpoints
 * still work — this file adds the "it is really partitioned" proof.
 *
 * On the START branch the table is the plain, non-partitioned `urls`, so the
 * partition assertions fail honestly.
 */
describe("urls table partitioning", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({
      logger: false,
      urlStore: new PrismaUrlRepository(prisma),
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it("declares urls as a HASH-partitioned table", async () => {
    const { rows } = await pool.query<{ partition_key: string; relkind: string }>(
      `SELECT relkind, pg_get_partkeydef(oid) AS partition_key
         FROM pg_class
        WHERE relname = 'urls'`
    );

    expect(rows[0]?.relkind).toBe("p");
    expect(rows[0]?.partition_key).toBe("HASH (short_code)");
  });

  it("spreads rows across more than one partition", async () => {
    for (let i = 0; i < 40; i++) {
      await prisma.url.create({
        data: { shortCode: `part${i}`, originalUrl: `https://example.com/${i}` },
      });
    }

    const { rows } = await pool.query<{ partition: string; count: string }>(
      `SELECT tableoid::regclass::text AS partition, count(*) AS count
         FROM urls
        GROUP BY tableoid
        ORDER BY partition`
    );

    const total = rows.reduce((sum, row) => sum + Number(row.count), 0);
    expect(total).toBe(40);
    expect(rows.length).toBeGreaterThan(1);
  });

  it("still finds every url by its short code on the partitioned table", async () => {
    const codes = ["alpha1", "bravo2", "charl3", "delta4", "echo05"];

    for (const code of codes) {
      await prisma.url.create({
        data: { shortCode: code, originalUrl: `https://example.com/${code}` },
      });
    }

    for (const code of codes) {
      const response = await app.inject({
        method: "GET",
        url: `/urls/${code}/stats`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().originalUrl).toBe(`https://example.com/${code}`);
    }
  });
});
