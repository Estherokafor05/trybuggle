// The Essentials certificate and public verification (step 6), against a real
// in-memory Postgres served over a socket, using the same code as the site.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { planCourse, writeCourse } from "../../src/server/course-import";
import type * as Checks from "../../src/server/checks";
import type * as Progression from "../../src/server/progression";
import type * as Certificates from "../../src/server/certificates";
import type * as Identity from "../../src/server/identity";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 58000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let checks: typeof Checks;
let progression: typeof Progression;
let certificates: typeof Certificates;
let identity: typeof Identity;

before(async () => {
  db = await PGlite.create();
  const files = (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) await db.exec(await readFile(new URL(file, migrations), "utf8"));
  await db.transaction((tx) =>
    writeCourse({ query: async (text, params) => (await tx.query<Record<string, unknown>>(text, params)).rows }, planCourse()),
  );
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  checks = await import("../../src/server/checks");
  progression = await import("../../src/server/progression");
  certificates = await import("../../src/server/certificates");
  identity = await import("../../src/server/identity");
});

after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

const correctAnswers = (questions: { id: string; correct: string }[]) =>
  Object.fromEntries(questions.map((q) => [q.id, q.correct]));
const wrongAnswers = (questions: { id: string; correct: string; options: { id: string }[] }[]) =>
  Object.fromEntries(questions.map((q) => [q.id, q.options.find((o) => o.id !== q.correct)!.id]));
const submission = (answers: Record<string, string>) => ({ version: 1, submissionKey: randomUUID(), answers });

async function newLearner() {
  const id = `test:${randomUUID()}`;
  await db.query("INSERT INTO learners(id) VALUES($1)", [id]);
  return id;
}

/** Passes every step before (not including) the given step, through the real marking code. */
async function passUpTo(learner: string, moduleSlug: string, id: string) {
  for (const step of progression.coursePath()) {
    if (step.moduleSlug === moduleSlug && step.id === id) return;
    const ref = step.kind === "final" ? checks.finalCheck(step.moduleSlug)! : checks.lessonCheck(step.id)!;
    const out = await checks.submitCheck(ref, learner, submission(correctAnswers(ref.questions)));
    assert.equal(out.failure, undefined, `passing ${step.key}`);
  }
}

const passAll = (learner: string) => passUpTo(learner, "no-such-module", "none");

describe("Essentials certificate", () => {
  test("a new learner sees every module and can't get it yet", async () => {
    const learner = await newLearner();
    const status = await certificates.essentialsStatus(learner);
    assert.equal(status.eligible, false);
    assert.equal(status.skipUnbuilt, true, "tests are not the live site");
    assert.deepEqual(status.modules.map((m) => m.state), ["notStarted", "notStarted", "skipped", "skipped"]);
    const refused = await certificates.issueEssentialsCertificate(learner, "Ada Obi");
    assert.ok("error" in refused);
  });

  test("passing one module is not enough", async () => {
    const learner = await newLearner();
    await passUpTo(learner, "talking-to-ai", "a-new-helper");
    const status = await certificates.essentialsStatus(learner);
    assert.deepEqual(status.modules.slice(0, 2).map((m) => m.state), ["complete", "notStarted"]);
    assert.equal(status.eligible, false);
  });

  test("every open module complete: issued once, with an ID anyone can check", async () => {
    const learner = await newLearner();
    await passAll(learner);
    const status = await certificates.essentialsStatus(learner);
    assert.equal(status.eligible, true);
    const first = await certificates.issueEssentialsCertificate(learner, "Ada Obi");
    const issued = first.certificate;
    if (!issued) throw new Error("not issued");
    assert.match(issued.code, /^BL-E-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    assert.equal(issued.completedOn, status.completedAt!.slice(0, 10));
    const again = await certificates.issueEssentialsCertificate(learner, "Someone Else");
    const repeat = again.certificate;
    if (!repeat) throw new Error("not issued");
    assert.equal(repeat.code, issued.code, "one per learner");
    assert.equal(repeat.learnerName, "Ada Obi");

    const renamed = await certificates.renameEssentialsCertificate(learner, "Ada N. Obi");
    assert.equal(renamed?.code, issued.code);

    const check = await certificates.verifyCertificate(issued.code.toLowerCase().replaceAll("-", " "));
    assert.deepEqual(check && Object.keys(check).sort(), ["code", "completedOn", "issuedAt", "learnerName", "status", "title"]);
    assert.equal(check?.learnerName, "Ada N. Obi");
    assert.equal(check?.title, "AI Literacy Essentials");
    assert.equal(check?.status, "valid");

    await db.query("UPDATE certificates SET revoked_at = now(), revoked_reason = 'test' WHERE code = $1", [issued.code]);
    assert.equal((await certificates.verifyCertificate(issued.code))?.status, "revoked");
  });

  test("unknown and badly shaped IDs find nothing", async () => {
    assert.equal(await certificates.verifyCertificate("BL-E-AAAA-AAAA"), null);
    assert.equal(await certificates.verifyCertificate("' OR 1=1 --"), null);
    assert.equal(certificates.normaliseCode("bl–e–7kq2–m9xd"), "BL-E-7KQ2-M9XD");
    assert.equal(certificates.normaliseCode("BL-E-7KQ2-M9X0"), null, "0 is never used in IDs");
  });

  test("the live site needs every planned module, including ones still being made", async () => {
    const learner = await newLearner();
    await passAll(learner);
    process.env.ESSENTIALS_REQUIRE_ALL = "on";
    try {
      const status = await certificates.essentialsStatus(learner);
      assert.equal(status.skipUnbuilt, false);
      assert.deepEqual(status.modules.map((m) => m.state), ["complete", "complete", "beingMade", "beingMade"]);
      assert.equal(status.modules[2].total, 6, "five episodes and a final assessment");
      assert.equal(status.eligible, false);
      assert.ok("error" in (await certificates.issueEssentialsCertificate(learner, "Ada Obi")));
    } finally {
      delete process.env.ESSENTIALS_REQUIRE_ALL;
    }
  });

  test("module certificates issued before step 6 still verify", async () => {
    const learner = await newLearner();
    await db.query(
      `INSERT INTO certificates(id,code,learner_id,module_slug,learner_name,completed_on,requirements)
       VALUES(gen_random_uuid(),'BL-M1-ABCD-EFGH',$1,'ai-foundations','Old Learner','2026-11-01','[]')`,
      [learner],
    );
    const check = await certificates.verifyCertificate("BL-M1-ABCD-EFGH");
    assert.equal(check?.title, "Foundations of Artificial Intelligence");
    assert.equal(check?.status, "valid");
    assert.equal((await certificates.getCertificate(learner, "ai-foundations"))?.code, "BL-M1-ABCD-EFGH");
  });

  test("the database allows only one Essentials certificate per learner", async () => {
    const learner = await newLearner();
    const insert = (code: string) =>
      db.query(
        `INSERT INTO certificates(id,code,learner_id,kind,module_slug,learner_name,completed_on,requirements)
         VALUES(gen_random_uuid(),$2,$1,'essentials',NULL,'A','2026-11-01','[]')`,
        [learner, code],
      );
    await insert("BL-E-AAAA-BBBB");
    await assert.rejects(insert("BL-E-AAAA-CCCC"));
    await assert.rejects(
      db.query(
        `INSERT INTO certificates(id,code,learner_id,kind,module_slug,learner_name,completed_on,requirements)
         VALUES(gen_random_uuid(),'BL-E-AAAA-DDDD',$1,'essentials','ai-foundations','A','2026-11-01','[]')`,
        [learner],
      ),
      "an Essentials certificate never names a module",
    );
  });

  test("joining two learner records keeps the receiving learner's own Essentials certificate", async () => {
    const from = await newLearner();
    const to = await newLearner();
    for (const [learner, code] of [[from, "BL-E-FROM-2222"], [to, "BL-E-KEEP-3333"]])
      await db.query(
        `INSERT INTO certificates(id,code,learner_id,kind,module_slug,learner_name,completed_on,requirements)
         VALUES(gen_random_uuid(),$2,$1,'essentials',NULL,'A','2026-11-01','[]')`,
        [learner, code],
      );
    await db.query(
      `INSERT INTO certificates(id,code,learner_id,module_slug,learner_name,completed_on,requirements)
       VALUES(gen_random_uuid(),'BL-M2-MOVE-4444',$1,'talking-to-ai','A','2026-11-01','[]')`,
      [from],
    );
    await db.transaction((tx) => identity.moveLearnerData({ query: (text: string, params?: unknown[]) => tx.query(text, params) } as never, from, to));
    const { rows } = await db.query<{ code: string }>("SELECT code FROM certificates WHERE learner_id=$1 ORDER BY code", [to]);
    assert.deepEqual(rows.map((r) => r.code), ["BL-E-KEEP-3333", "BL-M2-MOVE-4444"]);
  });
});
