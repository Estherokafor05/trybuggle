// Editing a knowledge check's questions in the admin area. Once saved, the
// site uses these questions and re-importing the course files leaves them
// alone (migration 013). Earlier results never change.
import { randomBytes } from "node:crypto";
import { db } from "./database";

export const MAX_QUESTIONS = 30;
export const MAX_OPTIONS = 6;

export type EditableQuestion = {
  key: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
};

export async function checkForEditing(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = db();
  const [a] = await sql`SELECT a.id, a.legacy_key, a.scope, a.questions_edited_at, a.questions_edited_by, a.pass_percent,
      i.title AS item_title, s.title AS section_title
    FROM assessments a
    LEFT JOIN course_items i ON i.id = a.item_id
    LEFT JOIN course_sections s ON s.id = coalesce(a.section_id, i.section_id)
    WHERE a.id = ${id}`;
  if (!a) return null;
  const rows = await sql`SELECT key, prompt, options, correct_option, explanation FROM assessment_questions WHERE assessment_id = ${id} ORDER BY position`;
  return {
    id: a.id as string,
    key: a.legacy_key as string,
    title: a.scope === "section" ? `${a.section_title}: final assessment` : `${a.item_title}: knowledge check`,
    editedAt: a.questions_edited_at ? new Date(a.questions_edited_at as Date).toISOString() : null,
    editedBy: (a.questions_edited_by as string) ?? null,
    questions: rows.map((r) => ({
      key: r.key as string,
      prompt: r.prompt as string,
      options: r.options as EditableQuestion["options"],
      correct: r.correct_option as string,
      explanation: r.explanation as string,
    })),
  };
}

const field = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim() : "";
};

/**
 * Reads the editor form. Blank new questions and blank options are skipped.
 * Existing questions and options keep their ids, so earlier answers still line up.
 */
export function parseQuestionForm(form: FormData): { questions: EditableQuestion[] } | { error: string } {
  const count = Math.min(Number(form.get("count")) || 0, MAX_QUESTIONS + 1);
  const rows: (EditableQuestion & { order: number; index: number })[] = [];
  const usedKeys = new Set<string>();
  for (let i = 0; i < count; i++) {
    const p = `q${i}`;
    if (form.get(`${p}.remove`) === "on") continue;
    const prompt = field(form, `${p}.prompt`);
    const existingKey = field(form, `${p}.key`);
    const options: { id: string; text: string }[] = [];
    let correct = "";
    const chosen = field(form, `${p}.correct`);
    for (let j = 0; j < MAX_OPTIONS; j++) {
      const text = field(form, `${p}.o${j}.text`);
      if (!text) continue;
      const id = field(form, `${p}.o${j}.id`) || `o${j}-${randomBytes(2).toString("hex")}`;
      options.push({ id, text });
      if (chosen === String(j)) correct = id;
    }
    const explanation = field(form, `${p}.explanation`);
    if (!existingKey && !prompt && !options.length && !explanation) continue; // an untouched blank question
    const n = rows.length + 1;
    if (prompt.length < 5 || prompt.length > 500) return { error: `Question ${n}: write a question of 5 to 500 characters.` };
    if (options.length < 2) return { error: `Question ${n}: give at least 2 answers.` };
    if (options.some((o) => o.text.length > 200)) return { error: `Question ${n}: keep each answer to 200 characters or fewer.` };
    if (new Set(options.map((o) => o.text.toLowerCase())).size !== options.length) return { error: `Question ${n}: two answers are the same.` };
    if (!correct) return { error: `Question ${n}: choose the right answer (and make sure it isn't blank).` };
    if (explanation.length < 10 || explanation.length > 1000)
      return { error: `Question ${n}: write an explanation of 10 to 1000 characters. Learners see it when they ask Buggle.` };
    const key = existingKey && /^[a-z0-9-]{1,80}$/i.test(existingKey) && !usedKeys.has(existingKey) ? existingKey : `q-${randomBytes(4).toString("hex")}`;
    usedKeys.add(key);
    const order = Number(form.get(`${p}.order`));
    rows.push({ key, prompt, options, correct, explanation, order: Number.isFinite(order) ? order : i + 1, index: i });
  }
  if (!rows.length) return { error: "A check needs at least one question." };
  if (rows.length > MAX_QUESTIONS) return { error: `A check can have up to ${MAX_QUESTIONS} questions.` };
  rows.sort((a, b) => a.order - b.order || a.index - b.index);
  return { questions: rows.map(({ key, prompt, options, correct, explanation }) => ({ key, prompt, options, correct, explanation })) };
}

/** Saves every question at once. Returns how the check changed, for the activity log. */
export async function saveQuestions(id: string, adminEmail: string, questions: EditableQuestion[]) {
  const sql = db();
  return sql.begin(async (tx) => {
    const [a] = await tx`SELECT id FROM assessments WHERE id = ${id} FOR UPDATE`;
    if (!a) return null;
    const before = await tx`SELECT count(*)::int AS n FROM assessment_questions WHERE assessment_id = ${id}`;
    await tx`DELETE FROM assessment_questions WHERE assessment_id = ${id} AND key <> ALL(${questions.map((q) => q.key)})`;
    for (const [index, q] of questions.entries()) {
      await tx`INSERT INTO assessment_questions(assessment_id, key, position, prompt, options, correct_option, explanation)
        VALUES(${id}, ${q.key}, ${index + 1}, ${q.prompt}, ${tx.json(q.options)}, ${q.correct}, ${q.explanation})
        ON CONFLICT (assessment_id, key) DO UPDATE SET position = EXCLUDED.position, prompt = EXCLUDED.prompt,
          options = EXCLUDED.options, correct_option = EXCLUDED.correct_option, explanation = EXCLUDED.explanation, updated_at = now()`;
    }
    await tx`UPDATE assessments SET question_count = ${questions.length}, questions_edited_at = now(), questions_edited_by = ${adminEmail} WHERE id = ${id}`;
    return { before: before[0].n as number, after: questions.length };
  });
}
