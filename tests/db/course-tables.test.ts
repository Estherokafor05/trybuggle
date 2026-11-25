// Runs every migration and the course import against a real, in-memory Postgres
// (PGlite), so the course tables are checked without touching any real database.
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { beforeEach, describe, test } from "node:test";
import { PGlite, type Transaction } from "@electric-sql/pglite";
import { minutesFrom, planCourse, writeCourse, type SqlRunner } from "../../src/server/course-import";

const migrations = new URL("../../migrations/", import.meta.url);

async function migrate(db: PGlite) {
  const files = (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort();
  await db.transaction(async (tx) => {
    for (const file of files) await tx.exec(await readFile(new URL(file, migrations), "utf8"));
  });
}

const runner = (tx: PGlite | Transaction): SqlRunner => ({
  query: async (text, params) => (await tx.query<Record<string, unknown>>(text, params)).rows,
});

async function importCourse(db: PGlite) {
  return db.transaction((tx) => writeCourse(runner(tx), planCourse()));
}

async function count(db: PGlite, sql: string, params: unknown[] = []) {
  const { rows } = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM (${sql}) x`, params);
  return rows[0].n;
}

let db: PGlite;
beforeEach(async () => {
  db = new PGlite();
  await migrate(db);
});

describe("migrations", () => {
  test("run again without errors or changes", async () => {
    await migrate(db);
    await migrate(db);
    assert.equal(await count(db, "SELECT 1 FROM learning_lessons"), 10);
  });
});

describe("course import", () => {
  test("loads the whole AI Literacy course", async () => {
    const summary = await importCourse(db);
    assert.equal(summary.sections, 4);
    assert.equal(summary.items, 19);
    assert.equal(summary.blocks, 30, "film, activity and reflection for each of the 10 built lessons");
    assert.equal(summary.assessments, 12, "10 lesson checks and 2 module final assessments");
    assert.equal(summary.questions, 10 * 5 + 8 + 6);
    assert.equal(await count(db, "SELECT 1 FROM course_items WHERE status = 'published'"), 10);
    assert.equal(await count(db, "SELECT 1 FROM course_sections WHERE status = 'published'"), 2);
  });

  test("is safe to run more than once", async () => {
    await importCourse(db);
    const ids = await db.query("SELECT id, slug FROM course_items ORDER BY slug");
    const second = await importCourse(db);
    const again = await db.query("SELECT id, slug FROM course_items ORDER BY slug");
    assert.deepEqual(again.rows, ids.rows, "items keep their ids");
    assert.equal(second.items, 19);
    assert.equal(await count(db, "SELECT 1 FROM courses"), 1);
    assert.equal(await count(db, "SELECT 1 FROM content_blocks"), 30);
    assert.equal(await count(db, "SELECT 1 FROM assessment_questions"), 64);
  });

  test("keeps the course order and lesson details", async () => {
    await importCourse(db);
    const { rows } = await db.query<{ slug: string; position: number; minutes: number }>(
      `SELECT i.slug, i.position, i.estimated_minutes AS minutes FROM course_items i
       JOIN course_sections s ON s.id = i.section_id WHERE s.slug = 'ai-foundations' ORDER BY i.position`,
    );
    assert.deepEqual(
      rows.map((r) => r.slug),
      ["what-counts-as-ai", "ai-in-your-day", "before-chatgpt", "ai-or-software", "what-ai-can-do"],
    );
    assert.ok(rows.every((r) => r.minutes > 0 && r.minutes <= 8), "every Module 1 lesson has a time under 8 minutes");
  });

  test("matches the question banks and final assessment sizes", async () => {
    await importCourse(db);
    const { rows } = await db.query<{ legacy_key: string; question_count: number; scope: string }>(
      "SELECT legacy_key, question_count, scope FROM assessments WHERE scope = 'section' ORDER BY legacy_key",
    );
    assert.deepEqual(rows, [
      { legacy_key: "ai-foundations", question_count: 8, scope: "section" },
      { legacy_key: "talking-to-ai", question_count: 6, scope: "section" },
    ]);
  });

  test("archives lessons removed from the course files instead of deleting them", async () => {
    await importCourse(db);
    const plan = planCourse();
    plan.sections[0].items.pop();
    await db.transaction((tx) => writeCourse(runner(tx), plan));
    const { rows } = await db.query<{ status: string }>(
      "SELECT status FROM course_items WHERE slug = 'what-ai-can-do'",
    );
    assert.equal(rows[0].status, "archived");
  });
});

describe("table rules", () => {
  test("a correct answer must be one of the options", async () => {
    await importCourse(db);
    const { rows } = await db.query<{ id: string }>("SELECT id FROM assessments LIMIT 1");
    await assert.rejects(
      db.query(
        `INSERT INTO assessment_questions(assessment_id, key, position, prompt, options, correct_option)
         VALUES($1, 'bad', 99, 'Q?', '[{"id":"0","text":"A"},{"id":"1","text":"B"}]', '7')`,
        [rows[0].id],
      ),
      /assessment_questions_correct_is_an_option/,
    );
  });

  test("an assessment belongs to exactly one lesson, section or level", async () => {
    await importCourse(db);
    const { rows } = await db.query<{ id: string }>("SELECT id FROM courses");
    await assert.rejects(
      db.query(
        "INSERT INTO assessments(course_id, scope, question_count) VALUES($1, 'item', 5)",
        [rows[0].id],
      ),
      /assessments_scope/,
    );
  });

  test("sections can swap places inside one save", async () => {
    await importCourse(db);
    await db.transaction(async (tx) => {
      await tx.query("UPDATE course_sections SET position = 2 WHERE slug = 'ai-foundations'");
      await tx.query("UPDATE course_sections SET position = 1 WHERE slug = 'talking-to-ai'");
    });
    const { rows } = await db.query<{ slug: string }>(
      "SELECT slug FROM course_sections ORDER BY position LIMIT 1",
    );
    assert.equal(rows[0].slug, "talking-to-ai");
  });

  test("two sections cannot end up in the same place", async () => {
    await importCourse(db);
    await assert.rejects(
      db.transaction(async (tx) => {
        await tx.query("UPDATE course_sections SET position = 1 WHERE slug = 'talking-to-ai'");
      }),
      /course_sections_order/,
    );
  });

  test("updated_at changes when a row is edited", async () => {
    await importCourse(db);
    await db.query("UPDATE courses SET updated_at = now() - interval '1 day'");
    await db.query("UPDATE courses SET title = 'AI Literacy (edited)'");
    const { rows } = await db.query<{ fresh: boolean }>(
      "SELECT updated_at > now() - interval '1 minute' AS fresh FROM courses",
    );
    assert.equal(rows[0].fresh, true);
  });
});

test("reads lesson times like '4 minutes to watch'", () => {
  assert.equal(minutesFrom("4 minutes to watch"), 4);
  assert.equal(minutesFrom("About 12 min"), 12);
  assert.equal(minutesFrom("soon"), 0);
});

describe("check settings migration (007)", () => {
  test("keeps every earlier result and turns answer shuffling off once", async () => {
    const old = new PGlite();
    const files = (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort();
    // Every other migration, so today's importer can run; then 007 on its own.
    const before007 = files.filter((f) => !f.startsWith("007"));
    for (const file of before007) await old.exec(await readFile(new URL(file, migrations), "utf8"));
    await old.transaction((tx) => writeCourse(runner(tx), planCourse()));
    // Step 2's import left the schema default: shuffled.
    await old.exec("UPDATE assessments SET shuffle_options = true");
    await old.exec(`
      INSERT INTO learners(id) VALUES ('old');
      INSERT INTO assessment_attempts(id,learner_id,lesson_slug,assessment_version,submission_key,answers,question_count,correct_count,feedback)
      VALUES (gen_random_uuid(),'old','what-counts-as-ai',1,gen_random_uuid(),'{}',5,4,'[]'),
             (gen_random_uuid(),'old','what-counts-as-ai',1,gen_random_uuid(),'{}',5,3,'[]');
      INSERT INTO module_assessment_attempts(id,learner_id,module_slug,assessment_version,submission_key,answers,question_count,correct_count,feedback)
      VALUES (gen_random_uuid(),'old','ai-foundations',1,gen_random_uuid(),'{}',8,6,'[]');`);
    const passes = async () =>
      (await old.query<{ correct_count: number; passed: boolean }>(
        "SELECT correct_count, passed FROM assessment_attempts UNION ALL SELECT correct_count, passed FROM module_assessment_attempts ORDER BY 1",
      )).rows.map((r) => [r.correct_count, r.passed]);
    const earlier = await passes();
    assert.equal(await count(old, "SELECT 1 FROM assessments WHERE shuffle_options"), 12, "step 2 rows shuffled by default");
    for (const file of files) await old.exec(await readFile(new URL(file, migrations), "utf8"));
    assert.deepEqual(await passes(), earlier);
    assert.deepEqual(earlier, [[3, false], [4, true], [6, true]]);
    assert.equal(await count(old, "SELECT 1 FROM assessments WHERE shuffle_options"), 0);
    // Running again later never undoes an admin's choice.
    await old.exec("UPDATE assessments SET shuffle_options = true WHERE legacy_key = 'before-chatgpt'");
    for (const file of files) await old.exec(await readFile(new URL(file, migrations), "utf8"));
    assert.equal(await count(old, "SELECT 1 FROM assessments WHERE shuffle_options"), 1);
    await old.close();
  });
});
