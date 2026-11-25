// The community forum: sections, questions and discussions, answers, comments
// on answers, "helpful" votes, accepted answers and reports. All rules run on
// the server. There are no private messages.
import { getModule, modules, stepLabel } from "@course";
import type { TransactionSql } from "postgres";
import { db } from "./database";

export const PAGE_SIZE = 20;
const LIMITS = {
  title: { min: 8, max: 140 },
  threadBody: { min: 20, max: 10000 },
  postBody: { min: 2, max: 5000 },
  threadsPerHour: 5,
  postsPerTenMinutes: 20,
};

export type ForumUser = { id: string; name: string };
type Fail = { error: string };

/** Public names show the first name and the first letter of the last: "Ada O." */
export function displayName(name: string | null | undefined) {
  if (!name?.trim()) return "Deleted account";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts.at(-1)![0].toUpperCase()}.` : parts[0];
}

const clean = (text: unknown) =>
  typeof text === "string"
    ? text
        .normalize("NFC")
        .replace(/\r\n?/g, "\n")
        .replace(/[\p{Cc}\p{Cf}]/gu, (c) => (c === "\n" || c === "\t" ? c : ""))
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : "";

function checkLength(text: string, { min, max }: { min: number; max: number }, what: string): Fail | null {
  if ([...text].length < min) return { error: `Write a ${what} of at least ${min} characters.` };
  if ([...text].length > max) return { error: `Keep the ${what} to ${max} characters or fewer.` };
  return null;
}

/** Lessons a question can be about, with readable labels. */
export function lessonChoices() {
  return [...modules]
    .sort((a, b) => a.order - b.order)
    .flatMap((mod) =>
      mod.lessons.map((lesson, i) => ({
        slug: lesson.slug,
        moduleSlug: mod.slug,
        label: `Module ${mod.order}, ${stepLabel(mod.order, i)}: ${lesson.title}`,
        href: `/modules/${mod.slug}/lessons/${lesson.slug}`,
      })),
    );
}
export const lessonInfo = (slug: string | null) => (slug ? (lessonChoices().find((l) => l.slug === slug) ?? null) : null);

// ---------------------------------------------------------------------------
// Reading

export async function listSections() {
  const rows = await db()`
    SELECT s.id, s.slug, s.title, s.description, s.locked, s.position,
      count(t.id)::int AS threads,
      max(t.last_activity_at) AS latest
    FROM forum_sections s
    LEFT JOIN forum_threads t ON t.section_id = s.id AND t.hidden_at IS NULL AND t.deleted_at IS NULL
    GROUP BY s.id ORDER BY s.position, s.title`;
  return rows.map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    description: r.description as string,
    locked: Boolean(r.locked),
    position: r.position as number,
    threads: r.threads as number,
    latest: r.latest ? new Date(r.latest as Date).toISOString() : null,
  }));
}

export async function getSection(slug: string) {
  const [row] = await db()`SELECT id, slug, title, description, locked FROM forum_sections WHERE slug = ${slug}`;
  return row
    ? { id: row.id as string, slug: row.slug as string, title: row.title as string, description: row.description as string, locked: Boolean(row.locked) }
    : null;
}

export type ThreadFilter = "all" | "questions" | "unanswered" | "discussions";

export async function listThreads({
  sectionId,
  lessonSlug,
  filter = "all",
  search = "",
  page = 1,
  pageSize = PAGE_SIZE,
}: {
  sectionId?: string;
  lessonSlug?: string;
  filter?: ThreadFilter;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const sql = db();
  const term = `%${search.trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const offset = (Math.max(1, Math.floor(page)) - 1) * pageSize;
  const rows = await sql`
    SELECT t.id, t.kind, t.title, t.pinned, t.locked, t.reply_count, t.helpful_count, t.accepted_post_id,
      t.created_at, t.last_activity_at, t.lesson_slug, s.slug AS section_slug, s.title AS section_title, u.name AS author
    FROM forum_threads t
    JOIN forum_sections s ON s.id = t.section_id
    LEFT JOIN auth_user u ON u.id = t.author_id
    WHERE t.hidden_at IS NULL AND t.deleted_at IS NULL
      ${sectionId ? sql`AND t.section_id = ${sectionId}` : sql``}
      ${lessonSlug ? sql`AND t.lesson_slug = ${lessonSlug}` : sql``}
      ${filter === "questions" ? sql`AND t.kind = 'question'` : sql``}
      ${filter === "discussions" ? sql`AND t.kind = 'discussion'` : sql``}
      ${filter === "unanswered" ? sql`AND t.kind = 'question' AND t.reply_count = 0` : sql``}
      ${search.trim() ? sql`AND (lower(t.title) LIKE ${term} OR lower(t.body) LIKE ${term})` : sql``}
    ORDER BY ${sectionId ? sql`t.pinned DESC,` : sql``} t.last_activity_at DESC
    LIMIT ${pageSize + 1} OFFSET ${offset}`;
  return {
    more: rows.length > pageSize,
    threads: rows.slice(0, pageSize).map((r) => ({
      id: r.id as string,
      kind: r.kind as "question" | "discussion",
      title: r.title as string,
      pinned: Boolean(r.pinned),
      locked: Boolean(r.locked),
      replies: r.reply_count as number,
      helpful: r.helpful_count as number,
      answered: Boolean(r.accepted_post_id),
      author: displayName(r.author as string | null),
      created: new Date(r.created_at as Date).toISOString(),
      activity: new Date(r.last_activity_at as Date).toISOString(),
      lesson: lessonInfo(r.lesson_slug as string | null),
      section: { slug: r.section_slug as string, title: r.section_title as string },
    })),
  };
}

export type ForumPost = {
  id: string;
  parentId: string | null;
  author: string;
  mine: boolean;
  body: string | null;
  state: "visible" | "hidden" | "deleted";
  helpful: number;
  votedHelpful: boolean;
  accepted: boolean;
  created: string;
  edited: string | null;
  comments: ForumPost[];
};

/** A thread with its answers and comments. Null if it doesn't exist or is hidden. */
export async function getThread(id: string, viewer: string | null) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = db();
  const [t] = await sql`
    SELECT t.*, s.slug AS section_slug, s.title AS section_title, s.locked AS section_locked, u.name AS author
    FROM forum_threads t JOIN forum_sections s ON s.id = t.section_id
    LEFT JOIN auth_user u ON u.id = t.author_id
    WHERE t.id = ${id} AND t.hidden_at IS NULL`;
  if (!t) return null;
  const [posts, votes] = await Promise.all([
    sql`SELECT p.*, u.name AS author FROM forum_posts p LEFT JOIN auth_user u ON u.id = p.author_id
        WHERE p.thread_id = ${id} ORDER BY p.created_at`,
    viewer
      ? sql`SELECT target_type, target_id FROM forum_votes WHERE user_id = ${viewer}
            AND ((target_type = 'thread' AND target_id = ${id}) OR (target_type = 'post' AND target_id IN (SELECT id FROM forum_posts WHERE thread_id = ${id})))`
      : Promise.resolve([] as Record<string, unknown>[]),
  ]);
  const voted = new Set(votes.map((v) => `${v.target_type}:${v.target_id}`));
  const toPost = (p: Record<string, unknown>): ForumPost => {
    const state = p.hidden_at ? "hidden" : p.deleted_at ? "deleted" : "visible";
    return {
      id: p.id as string,
      parentId: (p.parent_id as string) ?? null,
      author: state === "visible" ? displayName(p.author as string | null) : "",
      mine: Boolean(viewer && p.author_id === viewer),
      body: state === "visible" ? (p.body as string) : null,
      state,
      helpful: p.helpful_count as number,
      votedHelpful: voted.has(`post:${p.id}`),
      accepted: t.accepted_post_id === p.id,
      created: new Date(p.created_at as Date).toISOString(),
      edited: p.edited_at ? new Date(p.edited_at as Date).toISOString() : null,
      comments: [],
    };
  };
  const all = posts.map(toPost);
  const answers = all.filter((p) => !p.parentId);
  for (const comment of all.filter((p) => p.parentId)) answers.find((a) => a.id === comment.parentId)?.comments.push(comment);
  // Accepted answer first, then the most helpful, then the oldest.
  answers.sort((a, b) => Number(b.accepted) - Number(a.accepted) || b.helpful - a.helpful || a.created.localeCompare(b.created));
  const deleted = Boolean(t.deleted_at);
  return {
    id: t.id as string,
    kind: t.kind as "question" | "discussion",
    title: t.title as string,
    body: deleted ? null : (t.body as string),
    deleted,
    author: deleted ? "" : displayName(t.author as string | null),
    mine: Boolean(viewer && t.author_id === viewer),
    pinned: Boolean(t.pinned),
    locked: Boolean(t.locked) || Boolean(t.section_locked),
    helpful: t.helpful_count as number,
    votedHelpful: voted.has(`thread:${id}`),
    acceptedPostId: (t.accepted_post_id as string) ?? null,
    lesson: lessonInfo(t.lesson_slug as string | null),
    section: { slug: t.section_slug as string, title: t.section_title as string },
    created: new Date(t.created_at as Date).toISOString(),
    edited: t.edited_at ? new Date(t.edited_at as Date).toISOString() : null,
    answers,
  };
}

// ---------------------------------------------------------------------------
// Writing

/**
 * Anyone can read. Asking, answering, commenting and liking open once the
 * learner has submitted any knowledge check or final assessment, right or wrong.
 */
export async function canPost(user: string | null | undefined) {
  if (!user) return false;
  const [row] = await db()`SELECT EXISTS (SELECT 1 FROM assessment_attempts WHERE learner_id = ${user})
    OR EXISTS (SELECT 1 FROM module_assessment_attempts WHERE learner_id = ${user}) AS ok`;
  return Boolean(row?.ok);
}
export const NOT_YET = "Take your first knowledge check to join in. Right or wrong, it unlocks asking, answering, commenting and liking.";

async function tooFast(user: string, kind: "thread" | "post"): Promise<Fail | null> {
  const sql = db();
  if (kind === "thread") {
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM forum_threads WHERE author_id = ${user} AND created_at > now() - interval '1 hour'`;
    if (n >= LIMITS.threadsPerHour) return { error: "You've started a lot of conversations in the last hour. Please wait a little before starting another." };
  } else {
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM forum_posts WHERE author_id = ${user} AND created_at > now() - interval '10 minutes'`;
    if (n >= LIMITS.postsPerTenMinutes) return { error: "You're posting very quickly. Please wait a few minutes, then try again." };
  }
  return null;
}

export async function createThread(
  user: ForumUser,
  input: { sectionSlug: string; kind: string; title: unknown; body: unknown; lesson?: unknown },
): Promise<Fail | { id: string }> {
  if (!(await canPost(user.id))) return { error: NOT_YET };
  const section = await getSection(input.sectionSlug);
  if (!section) return { error: "Choose a section." };
  if (section.locked) return { error: "This section isn't taking new posts right now." };
  const kind = input.kind === "discussion" ? "discussion" : "question";
  const title = clean(input.title).replace(/\s+/g, " ");
  const body = clean(input.body);
  const problem = checkLength(title, LIMITS.title, "title") ?? checkLength(body, LIMITS.threadBody, kind === "question" ? "question" : "post");
  if (problem) return problem;
  const lesson = typeof input.lesson === "string" && lessonInfo(input.lesson) ? input.lesson : null;
  const slow = await tooFast(user.id, "thread");
  if (slow) return slow;
  const [row] = await db()`
    INSERT INTO forum_threads(section_id, author_id, kind, title, body, lesson_slug)
    VALUES(${section.id}, ${user.id}, ${kind}, ${title}, ${body}, ${lesson}) RETURNING id`;
  return { id: row.id as string };
}

/** An answer (or reply) to a thread, or a comment on an answer. */
export async function createPost(
  user: ForumUser,
  threadId: string,
  input: { body: unknown; parentId?: unknown },
): Promise<Fail | { id: string }> {
  const body = clean(input.body);
  const problem = checkLength(body, LIMITS.postBody, "reply");
  if (problem) return problem;
  if (!(await canPost(user.id))) return { error: NOT_YET };
  const sql = db();
  const thread = await getThread(threadId, user.id);
  if (!thread || thread.deleted) return { error: "This conversation is no longer available." };
  if (thread.locked) return { error: "This conversation is closed to new replies." };
  let parentId: string | null = null;
  if (typeof input.parentId === "string" && input.parentId) {
    const parent = thread.answers.find((a) => a.id === input.parentId);
    if (!parent || parent.state !== "visible") return { error: "That answer is no longer available." };
    parentId = parent.id;
  }
  const slow = await tooFast(user.id, "post");
  if (slow) return slow;
  return sql.begin(async (tx) => {
    const [row] = await tx`INSERT INTO forum_posts(thread_id, parent_id, author_id, body) VALUES(${threadId}, ${parentId}, ${user.id}, ${body}) RETURNING id`;
    await tx`UPDATE forum_threads SET last_activity_at = now(), reply_count = reply_count + ${parentId ? 0 : 1} WHERE id = ${threadId}`;
    return { id: row.id as string };
  });
}

export async function editThread(user: ForumUser, id: string, input: { title: unknown; body: unknown }): Promise<Fail | { id: string }> {
  const title = clean(input.title).replace(/\s+/g, " ");
  const body = clean(input.body);
  const problem = checkLength(title, LIMITS.title, "title") ?? checkLength(body, LIMITS.threadBody, "post");
  if (problem) return problem;
  const rows = await db()`UPDATE forum_threads SET title = ${title}, body = ${body}, edited_at = now()
    WHERE id = ${id} AND author_id = ${user.id} AND hidden_at IS NULL AND deleted_at IS NULL RETURNING id`;
  return rows[0] ? { id } : { error: "You can only edit your own posts." };
}

export async function editPost(user: ForumUser, id: string, body: unknown): Promise<Fail | { threadId: string }> {
  const text = clean(body);
  const problem = checkLength(text, LIMITS.postBody, "reply");
  if (problem) return problem;
  const rows = await db()`UPDATE forum_posts SET body = ${text}, edited_at = now()
    WHERE id = ${id} AND author_id = ${user.id} AND hidden_at IS NULL AND deleted_at IS NULL RETURNING thread_id`;
  return rows[0] ? { threadId: rows[0].thread_id as string } : { error: "You can only edit your own posts." };
}

/** Authors can delete their own posts. The words go; replies from others stay. */
export async function deleteOwn(user: ForumUser, type: "thread" | "post", id: string) {
  const sql = db();
  const rows =
    type === "thread"
      ? await sql`UPDATE forum_threads SET deleted_at = now(), body = '' WHERE id = ${id} AND author_id = ${user.id} AND deleted_at IS NULL RETURNING id AS thread_id`
      : await sql`UPDATE forum_posts SET deleted_at = now(), body = '' WHERE id = ${id} AND author_id = ${user.id} AND deleted_at IS NULL RETURNING thread_id`;
  return (rows[0]?.thread_id as string) ?? null;
}

/** Marks or unmarks something as helpful. Never your own. */
export async function toggleHelpful(user: ForumUser, type: "thread" | "post", id: string) {
  if (!(await canPost(user.id))) return { error: NOT_YET, threadId: undefined, helpful: undefined };
  const sql = db();
  return sql.begin(async (tx) => {
    const [target] =
      type === "thread"
        ? await tx`SELECT id AS thread_id, author_id FROM forum_threads WHERE id = ${id} AND hidden_at IS NULL AND deleted_at IS NULL`
        : await tx`SELECT thread_id, author_id FROM forum_posts WHERE id = ${id} AND hidden_at IS NULL AND deleted_at IS NULL`;
    if (!target) return { error: "That post is no longer available." } as const;
    if (target.author_id === user.id) return { error: "You can't like your own post." } as const;
    const removed = await tx`DELETE FROM forum_votes WHERE target_type = ${type} AND target_id = ${id} AND user_id = ${user.id} RETURNING 1`;
    if (!removed.length) await tx`INSERT INTO forum_votes(target_type, target_id, user_id) VALUES(${type}, ${id}, ${user.id})`;
    const change = removed.length ? -1 : 1;
    if (type === "thread") await tx`UPDATE forum_threads SET helpful_count = helpful_count + ${change} WHERE id = ${id}`;
    else await tx`UPDATE forum_posts SET helpful_count = helpful_count + ${change} WHERE id = ${id}`;
    return { threadId: target.thread_id as string, helpful: !removed.length } as const;
  });
}

/** The person who asked a question can mark one answer as the one that helped. */
export async function acceptAnswer(user: ForumUser, threadId: string, postId: string) {
  const rows = await db()`
    UPDATE forum_threads t SET accepted_post_id = CASE WHEN t.accepted_post_id = ${postId} THEN NULL ELSE ${postId}::uuid END
    WHERE t.id = ${threadId} AND t.author_id = ${user.id} AND t.kind = 'question' AND t.deleted_at IS NULL
      AND EXISTS (SELECT 1 FROM forum_posts p WHERE p.id = ${postId} AND p.thread_id = t.id AND p.parent_id IS NULL AND p.hidden_at IS NULL AND p.deleted_at IS NULL)
    RETURNING accepted_post_id`;
  return rows[0] ? { accepted: Boolean(rows[0].accepted_post_id) } : { error: "Only the person who asked can choose the answer." };
}

export const reportReasons = {
  unkind: "Unkind or rude",
  spam: "Spam or advertising",
  "personal-info": "Shares someone's personal information",
  unsafe: "Unsafe or harmful",
  other: "Something else",
} as const;

export async function report(user: ForumUser, type: "thread" | "post", id: string, reason: string, note: unknown) {
  if (!(reason in reportReasons)) return { error: "Choose a reason." } as const;
  const text = clean(note).slice(0, 500) || null;
  const sql = db();
  const [target] =
    type === "thread"
      ? await sql`SELECT id AS thread_id FROM forum_threads WHERE id = ${id}`
      : await sql`SELECT thread_id FROM forum_posts WHERE id = ${id}`;
  if (!target) return { error: "That post is no longer available." } as const;
  await sql`INSERT INTO forum_reports(target_type, target_id, reporter_id, reason, note)
    VALUES(${type}, ${id}, ${user.id}, ${reason}, ${text}) ON CONFLICT DO NOTHING`;
  return { threadId: target.thread_id as string } as const;
}

/** When a learner deletes their account, their name and words leave the forum. Others' replies stay. */
export async function forgetForumAuthor(tx: ReturnType<typeof db> | TransactionSql, user: string) {
  await tx`UPDATE forum_threads SET author_id = NULL, body = '', deleted_at = coalesce(deleted_at, now()) WHERE author_id = ${user}`;
  await tx`UPDATE forum_posts SET author_id = NULL, body = '', deleted_at = coalesce(deleted_at, now()) WHERE author_id = ${user}`;
  await tx`DELETE FROM forum_votes WHERE user_id = ${user}`;
  await tx`UPDATE forum_reports SET reporter_id = NULL WHERE reporter_id = ${user}`;
}

// ---------------------------------------------------------------------------
// Moderation (admin area)

export async function openReports() {
  const rows = await db()`
    SELECT r.id, r.target_type, r.target_id, r.reason, r.note, r.created_at,
      coalesce(t.id, p.thread_id) AS thread_id,
      coalesce(t.title, pt.title) AS thread_title,
      coalesce(t.body, p.body) AS body,
      coalesce(t.hidden_at, p.hidden_at) AS hidden_at,
      u.name AS author
    FROM forum_reports r
    LEFT JOIN forum_threads t ON r.target_type = 'thread' AND t.id = r.target_id
    LEFT JOIN forum_posts p ON r.target_type = 'post' AND p.id = r.target_id
    LEFT JOIN forum_threads pt ON pt.id = p.thread_id
    LEFT JOIN auth_user u ON u.id = coalesce(t.author_id, p.author_id)
    WHERE r.resolved_at IS NULL ORDER BY r.created_at LIMIT 100`;
  return rows.map((r) => ({
    id: r.id as string,
    type: r.target_type as "thread" | "post",
    targetId: r.target_id as string,
    reason: reportReasons[r.reason as keyof typeof reportReasons] ?? (r.reason as string),
    note: (r.note as string) ?? null,
    threadId: (r.thread_id as string) ?? null,
    threadTitle: (r.thread_title as string) ?? "(removed)",
    body: (r.body as string) ?? "",
    author: (r.author as string) ?? "Deleted account",
    hidden: Boolean(r.hidden_at),
    created: new Date(r.created_at as Date).toISOString(),
  }));
}

/** Hides (with a reason) or shows a thread or post again. */
export async function setForumHidden(type: "thread" | "post", id: string, reason: string | null) {
  const sql = db();
  const rows =
    type === "thread"
      ? await sql`UPDATE forum_threads SET hidden_at = ${reason ? sql`now()` : null}, hidden_reason = ${reason} WHERE id = ${id} RETURNING id`
      : await sql`UPDATE forum_posts SET hidden_at = ${reason ? sql`now()` : null}, hidden_reason = ${reason} WHERE id = ${id} RETURNING id`;
  return Boolean(rows[0]);
}

export async function resolveReports(type: "thread" | "post", id: string, admin: string, outcome: "hidden" | "kept") {
  await db()`UPDATE forum_reports SET resolved_at = now(), resolved_by = ${admin}, outcome = ${outcome}
    WHERE target_type = ${type} AND target_id = ${id} AND resolved_at IS NULL`;
}

export async function setThreadFlags(id: string, flags: { pinned?: boolean; locked?: boolean }) {
  const sql = db();
  const rows = await sql`UPDATE forum_threads SET
    pinned = ${flags.pinned ?? sql`pinned`}, locked = ${flags.locked ?? sql`locked`}
    WHERE id = ${id} RETURNING title`;
  return (rows[0]?.title as string) ?? null;
}

export async function adminThreads(search: string) {
  const term = `%${search.trim().toLowerCase().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const sql = db();
  const rows = await sql`
    SELECT t.id, t.title, t.kind, t.pinned, t.locked, t.hidden_at, t.reply_count, t.last_activity_at, s.title AS section
    FROM forum_threads t JOIN forum_sections s ON s.id = t.section_id
    WHERE t.deleted_at IS NULL ${search.trim() ? sql`AND lower(t.title) LIKE ${term}` : sql``}
    ORDER BY t.last_activity_at DESC LIMIT 50`;
  return rows.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    kind: r.kind as string,
    pinned: Boolean(r.pinned),
    locked: Boolean(r.locked),
    hidden: Boolean(r.hidden_at),
    replies: r.reply_count as number,
    section: r.section as string,
    activity: new Date(r.last_activity_at as Date).toISOString(),
  }));
}

export async function saveSection(input: { id?: string; slug: unknown; title: unknown; description: unknown; position: unknown; locked: boolean }) {
  const slug = clean(input.slug).toLowerCase();
  const title = clean(input.title).replace(/\s+/g, " ");
  const description = clean(input.description).replace(/\s+/g, " ");
  const position = Number(input.position);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 60) return { error: "The web address must use lowercase letters, numbers and dashes." } as const;
  if (title.length < 2 || title.length > 80) return { error: "The title must be 2 to 80 characters." } as const;
  if (description.length > 300) return { error: "Keep the description to 300 characters or fewer." } as const;
  if (!Number.isInteger(position) || position < 0 || position > 10000) return { error: "The order must be a whole number from 0 to 10000." } as const;
  const sql = db();
  try {
    const [row] = input.id
      ? await sql`UPDATE forum_sections SET slug = ${slug}, title = ${title}, description = ${description}, position = ${position}, locked = ${input.locked} WHERE id = ${input.id} RETURNING slug`
      : await sql`INSERT INTO forum_sections(slug, title, description, position, locked) VALUES(${slug}, ${title}, ${description}, ${position}, ${input.locked}) RETURNING slug`;
    return row ? ({ slug: row.slug as string } as const) : ({ error: "That section no longer exists." } as const);
  } catch (error) {
    if (error instanceof Error && /forum_sections_slug_key/.test(error.message)) return { error: "Another section already uses that web address." } as const;
    throw error;
  }
}

export const moduleSectionFor = (moduleSlug: string) => (getModule(moduleSlug) ? moduleSlug : "introductions");
