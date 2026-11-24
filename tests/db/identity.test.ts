// Moving progress between learner IDs: old Google sign-ins and guests.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { beforeEach, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { moveLearnerData, type Sql } from "../../src/server/identity";

const migrations = new URL("../../migrations/", import.meta.url);
let db: PGlite;
const sql = (): Sql => ({ query: (text, params) => db.query(text, params) });

beforeEach(async () => {
  db = new PGlite();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  await db.query("INSERT INTO learners(id) VALUES('old'), ('new')");
});

async function place(learner: string, step: number, updated: string) {
  await db.query(
    `INSERT INTO learning_checkpoints(learner_id, lesson_slug, checkpoint, updated_at)
     VALUES($1, 'what-counts-as-ai', $2::text::jsonb, $3::timestamptz)`,
    [learner, JSON.stringify({ step }), updated],
  );
}
async function stepFor(learner: string) {
  const { rows } = await db.query<{ step: number }>(
    "SELECT (checkpoint->>'step')::int AS step FROM learning_checkpoints WHERE learner_id = $1",
    [learner],
  );
  return rows[0]?.step;
}

test("the more recent saved place wins", async () => {
  await place("old", 5, "2026-11-20");
  await place("new", 2, "2026-11-01");
  await moveLearnerData(sql(), "old", "new");
  assert.equal(await stepFor("new"), 5);
});

test("an older saved place does not overwrite a newer one", async () => {
  await place("old", 1, "2026-10-01");
  await place("new", 4, "2026-11-20");
  await moveLearnerData(sql(), "old", "new");
  assert.equal(await stepFor("new"), 4);
});

test("the account keeps its own certificate if both have one", async () => {
  for (const [learner, code] of [["old", "OLD-CODE"], ["new", "NEW-CODE"]])
    await db.query(
      `INSERT INTO certificates(id, code, learner_id, module_slug, learner_name, completed_on, requirements)
       VALUES($1, $2, $3, 'ai-foundations', 'Name', current_date, '{}')`,
      [randomUUID(), code, learner],
    );
  await moveLearnerData(sql(), "old", "new");
  const { rows } = await db.query<{ code: string }>("SELECT code FROM certificates ORDER BY code");
  assert.deepEqual(rows.map((r) => r.code), ["NEW-CODE"]);
});

test("running it twice changes nothing more", async () => {
  await place("old", 3, "2026-11-20");
  await moveLearnerData(sql(), "old", "new");
  await moveLearnerData(sql(), "old", "new");
  assert.equal(await stepFor("new"), 3);
  const { rows } = await db.query("SELECT id FROM learners ORDER BY id");
  assert.deepEqual(rows, [{ id: "new" }]);
});
