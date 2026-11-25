// The lesson builder: courses made without code, from modules, lessons and
// blocks (text, tips, images, videos, links and reflection questions), each
// lesson with an optional knowledge check. Buggle Learn admins build courses for
// everyone; organisations on a Platform plan build courses for their members.
import { randomBytes } from "node:crypto";
import { db } from "./database";

/** Who is building: a Buggle Learn admin, or an organisation's owner or manager. */
export type Builder = { kind: "admin"; email: string } | { kind: "org"; orgId: string; userId: string };
type Fail = { error: string };

export const BLOCK_KINDS = {
  text: "Text",
  tip: "Tip or note",
  image: "Image",
  video: "Video",
  link: "Link or download",
  reflection: "Reflection question",
} as const;
export type BlockKind = keyof typeof BLOCK_KINDS;
const TYPE_FOR: Record<BlockKind, string> = { text: "text", tip: "text", image: "image", video: "video", link: "download", reflection: "reflection" };

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[\p{Cc}]/gu, (c) => (c === "\n" ? c : "")).trim().slice(0, max) : "";
const oneLine = (v: unknown, max: number) => clean(v, max).replace(/\s+/g, " ");

export function slugify(text: string) {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50).replace(/-+$/g, "") || "course";
}
const ownerOf = (b: Builder) => (b.kind === "org" ? b.orgId : null);

/** The course, if this builder may change it. Never the AI Literacy course from the files. */
async function ownCourse(b: Builder, courseId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(courseId)) return null;
  const [row] = await db()`SELECT id, slug FROM courses WHERE id = ${courseId} AND source = 'builder'
    AND organization_id IS NOT DISTINCT FROM ${ownerOf(b)}`;
  return row ? { id: row.id as string, slug: row.slug as string } : null;
}
async function courseOfItem(b: Builder, itemId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(itemId)) return null;
  const [row] = await db()`SELECT course_id FROM course_items WHERE id = ${itemId}`;
  return row ? ownCourse(b, row.course_id as string) : null;
}
async function courseOfSection(b: Builder, sectionId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(sectionId)) return null;
  const [row] = await db()`SELECT course_id FROM course_sections WHERE id = ${sectionId}`;
  return row ? ownCourse(b, row.course_id as string) : null;
}
async function itemOfBlock(b: Builder, blockId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(blockId)) return null;
  const [row] = await db()`SELECT item_id FROM content_blocks WHERE id = ${blockId}`;
  return row && (await courseOfItem(b, row.item_id as string)) ? (row.item_id as string) : null;
}

// ---------------------------------------------------------------------------
// Courses

export async function listBuilderCourses(b: Builder) {
  const rows = await db()`SELECT c.id, c.slug, c.title, c.status, c.updated_at,
      (SELECT count(*) FROM course_sections s WHERE s.course_id = c.id)::int AS modules,
      (SELECT count(*) FROM course_items i WHERE i.course_id = c.id)::int AS lessons
    FROM courses c WHERE c.source = 'builder' AND c.organization_id IS NOT DISTINCT FROM ${ownerOf(b)}
    ORDER BY c.updated_at DESC`;
  return rows.map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    status: r.status as string,
    modules: r.modules as number,
    lessons: r.lessons as number,
    updated: new Date(r.updated_at as Date).toISOString(),
  }));
}

export async function createCourse(b: Builder, rawTitle: unknown): Promise<Fail | { id: string }> {
  const title = oneLine(rawTitle, 200);
  if (title.length < 3) return { error: "Give the course a title of at least 3 characters." };
  const sql = db();
  const base = slugify(title);
  for (let i = 0; i < 10; i++) {
    const slug = i === 0 ? base : `${base}-${randomBytes(2).toString("hex")}`;
    const [row] = await sql`INSERT INTO courses(slug, title, organization_id, source, status)
      VALUES(${slug}, ${title}, ${ownerOf(b)}, 'builder', 'draft') ON CONFLICT (slug) DO NOTHING RETURNING id`;
    if (row) {
      await addSection(b, row.id as string, "Module 1");
      return { id: row.id as string };
    }
  }
  return { error: "Please try a slightly different title." };
}

export async function updateCourse(b: Builder, courseId: string, input: { title: unknown; summary: unknown; status: unknown }): Promise<Fail | { ok: true }> {
  const course = await ownCourse(b, courseId);
  if (!course) return { error: "That course no longer exists." };
  const title = oneLine(input.title, 200);
  const summary = clean(input.summary, 600);
  const status = input.status === "published" ? "published" : "draft";
  if (title.length < 3) return { error: "Give the course a title of at least 3 characters." };
  if (status === "published") {
    const [{ n }] = await db()`SELECT count(*)::int AS n FROM course_items i WHERE i.course_id = ${courseId}
      AND EXISTS (SELECT 1 FROM content_blocks k WHERE k.item_id = i.id)`;
    if (!n) return { error: "Add at least one lesson with something in it before publishing." };
  }
  await db()`UPDATE courses SET title = ${title}, summary = ${summary}, status = ${status} WHERE id = ${courseId}`;
  return { ok: true };
}

export async function deleteCourse(b: Builder, courseId: string) {
  const course = await ownCourse(b, courseId);
  if (!course) return false;
  await db()`DELETE FROM courses WHERE id = ${courseId}`;
  return true;
}

/** Everything about a course for the builder: modules, lessons and checks. */
export async function courseOutlineFor(b: Builder, courseId: string) {
  const course = await ownCourse(b, courseId);
  if (!course) return null;
  const sql = db();
  const [c] = await sql`SELECT id, slug, title, summary, status FROM courses WHERE id = ${courseId}`;
  const [sections, items] = await Promise.all([
    sql`SELECT id, title, position FROM course_sections WHERE course_id = ${courseId} ORDER BY position`,
    sql`SELECT i.id, i.section_id, i.slug, i.title, i.position, i.estimated_minutes,
          (SELECT count(*) FROM content_blocks k WHERE k.item_id = i.id)::int AS blocks,
          (SELECT a.question_count FROM assessments a WHERE a.item_id = i.id LIMIT 1) AS questions
        FROM course_items i WHERE i.course_id = ${courseId} ORDER BY i.position`,
  ]);
  return {
    id: c.id as string,
    slug: c.slug as string,
    title: c.title as string,
    summary: c.summary as string,
    status: c.status as string,
    sections: sections.map((s) => ({
      id: s.id as string,
      title: s.title as string,
      items: items
        .filter((i) => i.section_id === s.id)
        .map((i) => ({
          id: i.id as string,
          slug: i.slug as string,
          title: i.title as string,
          minutes: i.estimated_minutes as number,
          blocks: i.blocks as number,
          questions: (i.questions as number | null) ?? 0,
        })),
    })),
  };
}

// ---------------------------------------------------------------------------
// Modules and lessons

export async function addSection(b: Builder, courseId: string, rawTitle: unknown): Promise<Fail | { id: string }> {
  if (!(await ownCourse(b, courseId))) return { error: "That course no longer exists." };
  const title = oneLine(rawTitle, 200) || "New module";
  const sql = db();
  const [{ next }] = await sql`SELECT coalesce(max(position), 0) + 1 AS next FROM course_sections WHERE course_id = ${courseId}`;
  const [row] = await sql`INSERT INTO course_sections(course_id, level, position, slug, title, status)
    VALUES(${courseId}, 'essentials', ${next}, ${`module-${randomBytes(3).toString("hex")}`}, ${title}, 'published') RETURNING id`;
  return { id: row.id as string };
}

export async function renameSection(b: Builder, sectionId: string, rawTitle: unknown): Promise<Fail | { ok: true }> {
  if (!(await courseOfSection(b, sectionId))) return { error: "That module no longer exists." };
  const title = oneLine(rawTitle, 200);
  if (!title) return { error: "Give the module a title." };
  await db()`UPDATE course_sections SET title = ${title} WHERE id = ${sectionId}`;
  return { ok: true };
}

export async function deleteSection(b: Builder, sectionId: string): Promise<Fail | { ok: true }> {
  const course = await courseOfSection(b, sectionId);
  if (!course) return { error: "That module no longer exists." };
  const [{ n }] = await db()`SELECT count(*)::int AS n FROM course_sections WHERE course_id = ${course.id}`;
  if (n <= 1) return { error: "A course needs at least one module." };
  await db()`DELETE FROM course_sections WHERE id = ${sectionId}`;
  return { ok: true };
}

/** Swaps a module or lesson with its neighbour. */
async function move(table: "course_sections" | "course_items", id: string, groupColumn: "course_id" | "section_id", direction: "up" | "down") {
  const sql = db();
  await sql.begin(async (tx) => {
    const [row] = await tx`SELECT ${tx(groupColumn)} AS g, position FROM ${tx(table)} WHERE id = ${id} FOR UPDATE`;
    if (!row) return;
    const [other] =
      direction === "up"
        ? await tx`SELECT id, position FROM ${tx(table)} WHERE ${tx(groupColumn)} = ${row.g} AND position < ${row.position} ORDER BY position DESC LIMIT 1`
        : await tx`SELECT id, position FROM ${tx(table)} WHERE ${tx(groupColumn)} = ${row.g} AND position > ${row.position} ORDER BY position LIMIT 1`;
    if (!other) return;
    await tx`UPDATE ${tx(table)} SET position = ${other.position} WHERE id = ${id}`;
    await tx`UPDATE ${tx(table)} SET position = ${row.position} WHERE id = ${other.id}`;
  });
}
export async function moveSection(b: Builder, id: string, direction: "up" | "down") {
  if (await courseOfSection(b, id)) await move("course_sections", id, "course_id", direction);
}
export async function moveItem(b: Builder, id: string, direction: "up" | "down") {
  if (await courseOfItem(b, id)) await move("course_items", id, "section_id", direction);
}

export async function addItem(b: Builder, sectionId: string, rawTitle: unknown): Promise<Fail | { id: string }> {
  const course = await courseOfSection(b, sectionId);
  if (!course) return { error: "That module no longer exists." };
  const title = oneLine(rawTitle, 200);
  if (title.length < 3) return { error: "Give the lesson a title of at least 3 characters." };
  const sql = db();
  const [{ next }] = await sql`SELECT coalesce(max(position), 0) + 1 AS next FROM course_items WHERE section_id = ${sectionId}`;
  const slug = `${slugify(title)}-${randomBytes(2).toString("hex")}`;
  const [row] = await sql`INSERT INTO course_items(course_id, section_id, position, slug, title, status)
    VALUES(${course.id}, ${sectionId}, ${next}, ${slug}, ${title}, 'published') RETURNING id`;
  return { id: row.id as string };
}

export async function updateItem(b: Builder, itemId: string, input: { title: unknown; summary: unknown; minutes: unknown }): Promise<Fail | { ok: true }> {
  if (!(await courseOfItem(b, itemId))) return { error: "That lesson no longer exists." };
  const title = oneLine(input.title, 200);
  const minutes = Number(input.minutes);
  if (title.length < 3) return { error: "Give the lesson a title of at least 3 characters." };
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 120) return { error: "Time to complete must be 0 to 120 minutes." };
  await db()`UPDATE course_items SET title = ${title}, summary = ${clean(input.summary, 600)}, estimated_minutes = ${minutes} WHERE id = ${itemId}`;
  return { ok: true };
}

export async function deleteItem(b: Builder, itemId: string) {
  if (!(await courseOfItem(b, itemId))) return false;
  await db()`DELETE FROM course_items WHERE id = ${itemId}`;
  return true;
}

// ---------------------------------------------------------------------------
// Blocks

export type Block = { id: string; kind: BlockKind; data: Record<string, string> };

const kindOf = (type: string, data: Record<string, unknown>): BlockKind =>
  type === "text" ? (data.tone ? "tip" : "text") : type === "download" ? "link" : (type as BlockKind);

export async function lessonFor(b: Builder, itemId: string) {
  const course = await courseOfItem(b, itemId);
  if (!course) return null;
  const sql = db();
  const [item] = await sql`SELECT i.id, i.slug, i.title, i.summary, i.estimated_minutes, s.title AS section_title
    FROM course_items i JOIN course_sections s ON s.id = i.section_id WHERE i.id = ${itemId}`;
  const [blocks, [assessment]] = await Promise.all([
    sql`SELECT id, type, data FROM content_blocks WHERE item_id = ${itemId} ORDER BY position`,
    sql`SELECT id, pass_percent FROM assessments WHERE item_id = ${itemId} LIMIT 1`,
  ]);
  return {
    course,
    id: item.id as string,
    slug: item.slug as string,
    title: item.title as string,
    summary: item.summary as string,
    minutes: item.estimated_minutes as number,
    section: item.section_title as string,
    blocks: blocks.map((k) => ({ id: k.id as string, kind: kindOf(k.type as string, k.data as Record<string, unknown>), data: k.data as Record<string, string> })),
    assessmentId: (assessment?.id as string) ?? null,
  };
}

export async function addBlock(b: Builder, itemId: string, kind: unknown): Promise<Fail | { id: string }> {
  if (!(await courseOfItem(b, itemId))) return { error: "That lesson no longer exists." };
  if (typeof kind !== "string" || !(kind in BLOCK_KINDS)) return { error: "Choose what to add." };
  const sql = db();
  const [{ next, n }] = await sql`SELECT coalesce(max(position), 0) + 1 AS next, count(*)::int AS n FROM content_blocks WHERE item_id = ${itemId}`;
  if (n >= 60) return { error: "A lesson can have up to 60 blocks. Split it into two lessons." };
  const data = kind === "tip" ? { tone: "tip", body: "" } : {};
  const [row] = await sql`INSERT INTO content_blocks(item_id, position, type, data) VALUES(${itemId}, ${next}, ${TYPE_FOR[kind as BlockKind]}, ${sql.json(data)}) RETURNING id`;
  return { id: row.id as string };
}

/** Turns a YouTube or Vimeo address into its privacy-friendly embed address. */
export function videoEmbed(raw: string) {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host === "youtube.com") id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ?? "";
    if (/^[A-Za-z0-9_-]{6,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const v = url.pathname.match(/(\d{6,12})/)?.[1];
      if (v) return `https://player.vimeo.com/video/${v}`;
    }
  } catch {}
  return null;
}

const LIMIT_IMAGE = 1_500_000;
const IMAGE_MAGIC: [string, number[]][] = [
  ["image/png", [0x89, 0x50, 0x4e, 0x47]],
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/gif", [0x47, 0x49, 0x46, 0x38]],
  ["image/webp", [0x52, 0x49, 0x46, 0x46]],
];

export async function updateBlock(b: Builder, blockId: string, form: FormData): Promise<Fail | { ok: true }> {
  const itemId = await itemOfBlock(b, blockId);
  if (!itemId) return { error: "That block no longer exists." };
  const sql = db();
  const [block] = await sql`SELECT type, data FROM content_blocks WHERE id = ${blockId}`;
  const kind = kindOf(block.type as string, block.data as Record<string, unknown>);
  let data: Record<string, string> = {};
  if (kind === "text") {
    data = { heading: oneLine(form.get("heading"), 160), body: clean(form.get("body"), 8000) };
    if (!data.body && !data.heading) return { error: "Write some text, or remove this block." };
  } else if (kind === "tip") {
    data = { tone: form.get("tone") === "warning" ? "warning" : "tip", body: clean(form.get("body"), 1000) };
    if (!data.body) return { error: "Write the tip, or remove this block." };
  } else if (kind === "video") {
    const embed = videoEmbed(oneLine(form.get("url"), 400));
    if (!embed) return { error: "Use a YouTube or Vimeo link." };
    data = { url: oneLine(form.get("url"), 400), embed, title: oneLine(form.get("title"), 160) || "Video", caption: oneLine(form.get("caption"), 300) };
  } else if (kind === "link") {
    const url = oneLine(form.get("url"), 600);
    if (!/^https:\/\/[^\s]+$/.test(url)) return { error: "Links must start with https://" };
    data = { url, label: oneLine(form.get("label"), 120) || "Open the link" };
  } else if (kind === "reflection") {
    data = { prompt: clean(form.get("prompt"), 500) };
    if (data.prompt.length < 5) return { error: "Write a question for learners to think about." };
  } else if (kind === "image") {
    const alt = oneLine(form.get("alt"), 300);
    if (!alt) return { error: "Describe the image for people who can't see it (alt text)." };
    const existing = block.data as Record<string, string>;
    let mediaId = existing.mediaId ?? "";
    const file = form.get("file");
    if (file instanceof File && file.size > 0) {
      if (file.size > LIMIT_IMAGE) return { error: "Use an image smaller than 1.5 MB." };
      const bytes = new Uint8Array(await file.arrayBuffer());
      const type = IMAGE_MAGIC.find(([, m]) => m.every((x, i) => bytes[i] === x))?.[0];
      if (!type) return { error: "Use a PNG, JPEG, GIF or WebP image." };
      const [{ course_id }] = await sql`SELECT course_id FROM course_items WHERE id = ${itemId}`;
      const [media] = await sql`INSERT INTO course_media(course_id, bytes, type) VALUES(${course_id}, ${bytes}, ${type}) RETURNING id`;
      if (mediaId) await sql`DELETE FROM course_media WHERE id = ${mediaId}`;
      mediaId = media.id as string;
    }
    if (!mediaId) return { error: "Choose an image to upload." };
    data = { mediaId, alt, caption: oneLine(form.get("caption"), 300) };
  }
  await sql`UPDATE content_blocks SET data = ${sql.json(data)} WHERE id = ${blockId}`;
  return { ok: true };
}

export async function moveBlock(b: Builder, blockId: string, direction: "up" | "down") {
  const itemId = await itemOfBlock(b, blockId);
  if (!itemId) return;
  await db().begin(async (tx) => {
    const [row] = await tx`SELECT position FROM content_blocks WHERE id = ${blockId} FOR UPDATE`;
    const [other] =
      direction === "up"
        ? await tx`SELECT id, position FROM content_blocks WHERE item_id = ${itemId} AND position < ${row.position} ORDER BY position DESC LIMIT 1`
        : await tx`SELECT id, position FROM content_blocks WHERE item_id = ${itemId} AND position > ${row.position} ORDER BY position LIMIT 1`;
    if (!other) return;
    await tx`UPDATE content_blocks SET position = ${other.position} WHERE id = ${blockId}`;
    await tx`UPDATE content_blocks SET position = ${row.position} WHERE id = ${other.id}`;
  });
}

export async function deleteBlock(b: Builder, blockId: string) {
  const itemId = await itemOfBlock(b, blockId);
  if (!itemId) return;
  const [block] = await db()`DELETE FROM content_blocks WHERE id = ${blockId} RETURNING data`;
  const mediaId = (block?.data as Record<string, string> | undefined)?.mediaId;
  if (mediaId) await db()`DELETE FROM course_media WHERE id = ${mediaId}`;
}

/** The lesson's knowledge check, made the first time questions are saved. */
export async function ensureCheck(b: Builder, itemId: string, questionCount: number) {
  const course = await courseOfItem(b, itemId);
  if (!course) return null;
  const sql = db();
  const [existing] = await sql`SELECT id FROM assessments WHERE item_id = ${itemId} LIMIT 1`;
  if (existing) return existing.id as string;
  const [row] = await sql`INSERT INTO assessments(course_id, scope, item_id, question_count, pass_percent, shuffle_options, status)
    VALUES(${course.id}, 'item', ${itemId}, ${Math.max(1, questionCount)}, 70, false, 'published') RETURNING id`;
  return row.id as string;
}

export async function removeCheck(b: Builder, itemId: string) {
  if (!(await courseOfItem(b, itemId))) return;
  await db()`DELETE FROM assessments WHERE item_id = ${itemId}`;
}

export async function media(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db()`SELECT bytes, type FROM course_media WHERE id = ${id}`;
  return row ? { bytes: row.bytes as Uint8Array, type: row.type as string } : null;
}
