// The lesson builder's pages, shared by the admin area (/admin/builder) and
// organisations (/org/[slug]/courses). Each form says who is building (actor);
// the server checks that again before changing anything.
import Link from "next/link";
import type { ReactNode } from "react";
import { builderAction } from "@/app/actions/builder";
import { QuestionEditor } from "@/components/admin/QuestionEditor";
import { button, card, input, outline } from "@/components/admin/styles";
import { BLOCK_KINDS, type BlockKind } from "@/server/builder";
import { ActionForm } from "./ActionForm";
import { LessonBlocks } from "./LessonBlocks";

export const builderNotices: Record<string, string> = {
  "course-created": "Course created. Add lessons to its first module, then publish it when it's ready.",
  "course-saved": "Course saved.",
  "course-published": "Course published. Learners can see it now.",
  "course-deleted": "Course deleted.",
  "module-added": "Module added.",
  "module-saved": "Module saved.",
  "module-deleted": "Module deleted.",
  "lesson-added": "Lesson added. Now add blocks to it.",
  "lesson-saved": "Lesson saved.",
  "lesson-deleted": "Lesson deleted.",
  "block-added": "Block added. Fill it in and save it.",
  "block-saved": "Block saved.",
  "block-deleted": "Block removed.",
  "check-saved": "Knowledge check saved.",
  "check-removed": "Knowledge check removed.",
};

export function BuilderNotice({ notice }: { notice?: string }) {
  const text = notice ? builderNotices[notice] : null;
  if (!text) return null;
  return (
    <p role="status" className="mb-6 rounded-2xl bg-mint p-4 text-sm leading-relaxed text-ink">
      {text}
    </p>
  );
}

const label = "grid gap-1 text-sm font-semibold";
const small = "inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-3 text-sm font-semibold text-navy hover:bg-lavender";
const pill = (published: boolean) =>
  `rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-mint text-navy" : "bg-lavender text-navy"}`;

// ---------------------------------------------------------------------------
// Course list

type CourseRow = { id: string; title: string; status: string; modules: number; lessons: number };

export function CourseListView({ actor, base, courses, intro }: { actor: string; base: string; courses: CourseRow[]; intro?: ReactNode }) {
  return (
    <div className="grid gap-6">
      {intro}
      <section aria-labelledby="new-course" className={card}>
        <h2 id="new-course" className="text-lg font-bold">
          Start a new course
        </h2>
        <ActionForm fields={{ actor, op: "course.create" }} className="mt-3 flex flex-wrap items-end gap-3">
          <label className={`${label} min-w-0 flex-1`}>
            Course title
            <input name="title" required minLength={3} maxLength={200} className={input} />
          </label>
          <button type="submit" className={button}>
            Create course
          </button>
        </ActionForm>
      </section>
      <section aria-labelledby="your-courses">
        <h2 id="your-courses" className="text-lg font-bold">
          Courses
        </h2>
        {courses.length ? (
          <ul className="mt-3 grid gap-3">
            {courses.map((c) => (
              <li key={c.id} className={`${card} flex flex-wrap items-center justify-between gap-3`}>
                <div className="min-w-0">
                  <Link href={`${base}/${c.id}`} className="break-words text-lg font-bold underline-offset-4 hover:underline">
                    {c.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {c.modules} {c.modules === 1 ? "module" : "modules"} · {c.lessons} {c.lessons === 1 ? "lesson" : "lessons"}
                  </p>
                </div>
                <span className={pill(c.status === "published")}>{c.status === "published" ? "Published" : "Draft"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted">No courses yet. Give your first one a title above.</p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// One course: details, modules and lessons

type Outline = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: string;
  sections: { id: string; title: string; items: { id: string; title: string; minutes: number; blocks: number; questions: number }[] }[];
};

function Move({ fields, what }: { fields: Record<string, string>; what: string }) {
  return (
    <div className="flex gap-1">
      <ActionForm fields={{ ...fields, direction: "up" }}>
        <button type="submit" className={small} aria-label={`Move ${what} up`}>
          ↑
        </button>
      </ActionForm>
      <ActionForm fields={{ ...fields, direction: "down" }}>
        <button type="submit" className={small} aria-label={`Move ${what} down`}>
          ↓
        </button>
      </ActionForm>
    </div>
  );
}

function Confirmed({ summary, fields, children, action }: { summary: string; fields: Record<string, string>; children: ReactNode; action: string }) {
  return (
    <details className="rounded-2xl border border-line bg-white p-4">
      <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-navy">{summary}</summary>
      <ActionForm fields={fields} className="mt-2 grid gap-3">
        <p className="text-sm leading-relaxed text-ink">{children}</p>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="confirm" className="size-5 accent-brand" /> Yes, I&apos;m sure
        </label>
        <button type="submit" className={`${outline} justify-self-start`}>
          {action}
        </button>
      </ActionForm>
    </details>
  );
}

export function CourseEditorView({ actor, base, course }: { actor: string; base: string; course: Outline }) {
  const c = { actor, course: course.id };
  const published = course.status === "published";
  return (
    <div className="grid gap-6">
      <p>
        <Link href={base} className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline">
          ← All courses
        </Link>
      </p>
      <section aria-labelledby="course-details" className={card}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="course-details" className="text-lg font-bold">
            Course details
          </h2>
          <span className={pill(published)}>{published ? "Published" : "Draft"}</span>
        </div>
        <ActionForm fields={{ ...c, op: "course.save" }} className="mt-4 grid gap-4">
          <label className={label}>
            Course title
            <input name="title" required minLength={3} maxLength={200} defaultValue={course.title} className={input} />
          </label>
          <label className={label}>
            What learners will get from it
            <textarea name="summary" rows={3} maxLength={600} defaultValue={course.summary} className={input} />
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold">Who can see it</legend>
            <label className="flex min-h-11 items-center gap-2">
              <input type="radio" name="status" value="draft" defaultChecked={!published} className="size-5 accent-brand" />
              Draft: only course builders can see it
            </label>
            <label className="flex min-h-11 items-center gap-2">
              <input type="radio" name="status" value="published" defaultChecked={published} className="size-5 accent-brand" />
              Published: learners can see it
            </label>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={button}>
              Save course
            </button>
            {published && (
              <Link href={`/learn/${course.slug}`} className={outline}>
                Open as a learner
              </Link>
            )}
          </div>
        </ActionForm>
      </section>

      <section aria-labelledby="modules-title" className="grid gap-4">
        <h2 id="modules-title" className="text-lg font-bold">
          Modules and lessons
        </h2>
        <p className="-mt-2 text-sm text-muted">Learners take the lessons in this order, one at a time.</p>
        {course.sections.map((s, si) => (
          <article key={s.id} id={`module-${s.id}`} aria-label={`Module ${si + 1}: ${s.title}`} className={`${card} grid gap-4`}>
            <div className="flex flex-wrap items-end gap-3">
              <ActionForm fields={{ ...c, op: "section.rename", section: s.id }} className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
                <label className={`${label} min-w-0 flex-1`}>
                  Module {si + 1} title
                  <input name="title" required maxLength={200} defaultValue={s.title} className={input} />
                </label>
                <button type="submit" className={outline}>
                  Save
                </button>
              </ActionForm>
              <Move fields={{ ...c, op: "section.move", section: s.id }} what={`module ${si + 1}`} />
            </div>
            {s.items.length ? (
              <ol className="grid gap-2">
                {s.items.map((i, ii) => (
                  <li key={i.id} id={`lesson-${i.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-3">
                    <div className="min-w-0">
                      <Link href={`${base}/${course.id}/lessons/${i.id}`} className="break-words font-semibold underline-offset-4 hover:underline">
                        {ii + 1}. {i.title}
                      </Link>
                      <p className="text-sm text-muted">
                        {i.blocks} {i.blocks === 1 ? "block" : "blocks"} · {i.questions ? `check with ${i.questions} ${i.questions === 1 ? "question" : "questions"}` : "no check"}
                        {i.minutes ? ` · ${i.minutes} min` : ""}
                      </p>
                    </div>
                    <Move fields={{ ...c, op: "item.move", item: i.id }} what={`lesson ${i.title}`} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No lessons in this module yet.</p>
            )}
            <ActionForm fields={{ ...c, op: "item.add", section: s.id }} className="flex flex-wrap items-end gap-3">
              <label className={`${label} min-w-0 flex-1`}>
                New lesson title
                <input name="title" required minLength={3} maxLength={200} className={input} />
              </label>
              <button type="submit" className={outline}>
                + Add lesson
              </button>
            </ActionForm>
            {course.sections.length > 1 && (
              <Confirmed summary="Delete this module" fields={{ ...c, op: "section.delete", section: s.id }} action="Delete module">
                This deletes the module and every lesson in it, including learners&apos; progress on them.
              </Confirmed>
            )}
          </article>
        ))}
        <ActionForm fields={{ ...c, op: "section.add" }} className={`${card} flex flex-wrap items-end gap-3`}>
          <label className={`${label} min-w-0 flex-1`}>
            New module title
            <input name="title" required maxLength={200} className={input} />
          </label>
          <button type="submit" className={outline}>
            + Add module
          </button>
        </ActionForm>
      </section>

      <Confirmed summary="Delete this course" fields={{ ...c, op: "course.delete" }} action="Delete course">
        This deletes the course, its lessons and images, and learners&apos; progress. It can&apos;t be undone.
      </Confirmed>
    </div>
  );
}

// ---------------------------------------------------------------------------
// One lesson: details, blocks and the knowledge check

type Lesson = {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  section: string;
  blocks: { id: string; kind: BlockKind; data: Record<string, string> }[];
};
type Question = { key: string; prompt: string; options: { id: string; text: string }[]; correct: string; explanation: string };

export function LessonEditorView({
  actor,
  base,
  courseId,
  lesson,
  questions,
}: {
  actor: string;
  base: string;
  courseId: string;
  lesson: Lesson;
  questions: Question[];
}) {
  const f = { actor, course: courseId, item: lesson.id };
  const lessonBase = `${base}/${courseId}/lessons/${lesson.id}`;
  return (
    <div className="grid gap-6">
      <p className="flex flex-wrap gap-3">
        <Link href={`${base}/${courseId}`} className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline">
          ← Back to the course
        </Link>
        <Link href={`${lessonBase}/preview`} className={outline}>
          Preview this lesson
        </Link>
      </p>
      <section aria-labelledby="lesson-details" className={card}>
        <h2 id="lesson-details" className="text-lg font-bold">
          Lesson details
        </h2>
        <p className="mt-1 text-sm text-muted">In {lesson.section}</p>
        <ActionForm fields={{ ...f, op: "item.save" }} className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <label className={label}>
              Lesson title
              <input name="title" required minLength={3} maxLength={200} defaultValue={lesson.title} className={input} />
            </label>
            <label className={label}>
              Minutes to complete
              <input name="minutes" type="number" min={0} max={120} defaultValue={lesson.minutes} className={input} />
            </label>
          </div>
          <label className={label}>
            Short summary
            <textarea name="summary" rows={2} maxLength={600} defaultValue={lesson.summary} className={input} />
          </label>
          <button type="submit" className={`${button} justify-self-start`}>
            Save lesson details
          </button>
        </ActionForm>
      </section>

      <section id="blocks" aria-labelledby="blocks-title" className="grid gap-4">
        <h2 id="blocks-title" className="text-lg font-bold">
          What&apos;s in the lesson
        </h2>
        <p className="-mt-2 text-sm text-muted">Learners see these blocks from top to bottom. Save each block after changing it.</p>
        {lesson.blocks.length ? (
          <ol className="grid gap-4">
            {lesson.blocks.map((b, i) => (
              <li key={b.id} id={`block-${b.id}`} aria-label={`Block ${i + 1}: ${BLOCK_KINDS[b.kind]}`} className={`${card} grid gap-3`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold">
                    {i + 1}. {BLOCK_KINDS[b.kind]}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    <Move fields={{ ...f, op: "block.move", block: b.id }} what={`block ${i + 1}`} />
                    <ActionForm fields={{ ...f, op: "block.delete", block: b.id }}>
                      <button type="submit" className={small}>
                        Remove
                      </button>
                    </ActionForm>
                  </div>
                </div>
                <ActionForm fields={{ ...f, op: "block.save", block: b.id }} className="grid gap-3">
                  <BlockFields kind={b.kind} data={b.data} />
                  <button type="submit" className={`${button} justify-self-start`}>
                    Save block
                  </button>
                </ActionForm>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted">Nothing yet. Add your first block below.</p>
        )}
        <ActionForm fields={{ ...f, op: "block.add" }} className={`${card} flex flex-wrap items-end gap-3`}>
          <label className={`${label} min-w-0 flex-1`}>
            Add a block
            <select name="kind" className={input} defaultValue="text">
              {Object.entries(BLOCK_KINDS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={outline}>
            + Add block
          </button>
        </ActionForm>
      </section>

      <section id="check" aria-labelledby="check-title" className="grid gap-4">
        <h2 id="check-title" className="text-lg font-bold">
          Knowledge check
        </h2>
        <p className="-mt-2 max-w-[70ch] text-sm leading-relaxed text-muted">
          Optional. With a check, learners must get 70% or more right to finish the lesson, and they can ask Buggle why an answer is right or wrong.
          Without one, they press &quot;Mark as done&quot;. Leave the boxes empty if this lesson doesn&apos;t need a check.
        </p>
        <QuestionEditor
          id={lesson.id}
          checkKey=""
          questions={questions}
          action={builderAction}
          fields={{ ...f, op: "check.save" }}
        />
        {questions.length > 0 && (
          <Confirmed summary="Remove the knowledge check" fields={{ ...f, op: "check.remove" }} action="Remove check">
            Learners will finish this lesson by pressing &quot;Mark as done&quot; instead. Their past results are deleted.
          </Confirmed>
        )}
      </section>

      <Confirmed summary="Delete this lesson" fields={{ ...f, op: "item.delete" }} action="Delete lesson">
        This deletes the lesson, its blocks and knowledge check, and learners&apos; progress on it.
      </Confirmed>
    </div>
  );
}

function BlockFields({ kind, data }: { kind: BlockKind; data: Record<string, string> }) {
  if (kind === "text")
    return (
      <>
        <label className={label}>
          Heading (optional)
          <input name="heading" maxLength={160} defaultValue={data.heading ?? ""} className={input} />
        </label>
        <label className={label}>
          Text <span className="font-normal text-muted">Leave an empty line between paragraphs.</span>
          <textarea name="body" rows={7} maxLength={8000} defaultValue={data.body ?? ""} className={input} />
        </label>
      </>
    );
  if (kind === "tip")
    return (
      <>
        <label className={label}>
          Kind of note
          <select name="tone" defaultValue={data.tone ?? "tip"} className={input}>
            <option value="tip">Tip (green)</option>
            <option value="warning">Watch out (peach)</option>
          </select>
        </label>
        <label className={label}>
          Note
          <textarea name="body" rows={3} maxLength={1000} defaultValue={data.body ?? ""} className={input} />
        </label>
      </>
    );
  if (kind === "image")
    return (
      <>
        {data.mediaId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/course-media/${data.mediaId}`} alt={data.alt} className="max-h-64 w-auto rounded-2xl border border-line object-contain" />
        )}
        <label className={label}>
          {data.mediaId ? "Replace the image (optional)" : "Image"} <span className="font-normal text-muted">PNG, JPEG, GIF or WebP, up to 1.5 MB</span>
          <input name="file" type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="text-sm" />
        </label>
        <label className={label}>
          Describe the image (alt text) <span className="font-normal text-muted">For people who can&apos;t see it.</span>
          <input name="alt" required maxLength={300} defaultValue={data.alt ?? ""} className={input} />
        </label>
        <label className={label}>
          Caption (optional)
          <input name="caption" maxLength={300} defaultValue={data.caption ?? ""} className={input} />
        </label>
      </>
    );
  if (kind === "video")
    return (
      <>
        <label className={label}>
          YouTube or Vimeo link <span className="font-normal text-muted">Shorts links work too.</span>
          <input name="url" type="url" required maxLength={400} defaultValue={data.url ?? ""} className={input} />
        </label>
        <label className={label}>
          Video title <span className="font-normal text-muted">Read out by screen readers.</span>
          <input name="title" maxLength={160} defaultValue={data.title ?? ""} className={input} />
        </label>
        <label className={label}>
          Caption (optional)
          <input name="caption" maxLength={300} defaultValue={data.caption ?? ""} className={input} />
        </label>
      </>
    );
  if (kind === "link")
    return (
      <>
        <label className={label}>
          Button text
          <input name="label" maxLength={120} defaultValue={data.label ?? ""} className={input} />
        </label>
        <label className={label}>
          Link (starting with https://)
          <input name="url" type="url" required maxLength={600} defaultValue={data.url ?? ""} className={input} />
        </label>
      </>
    );
  return (
    <label className={label}>
      Question for learners to think about
      <textarea name="prompt" rows={2} maxLength={500} defaultValue={data.prompt ?? ""} className={input} />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Preview

export function LessonPreviewView({
  backHref,
  title,
  summary,
  minutes,
  blocks,
  questions,
  heading: Heading = "h1",
}: {
  heading?: "h1" | "h2";
  backHref: string;
  title: string;
  summary: string;
  minutes: number;
  blocks: { id: string; type: string; data: Record<string, string> }[];
  questions: number;
}) {
  return (
    <div className="grid gap-6">
      <p className="rounded-2xl bg-blush p-4 text-sm font-semibold text-navy" role="note">
        Preview: this is how learners see the lesson. <Link href={backHref} className="underline underline-offset-4">Back to editing</Link>
      </p>
      <header className="rounded-[2rem] bg-hero-lavender p-6 sm:p-8">
        <Heading className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight">{title}</Heading>
        {summary && <p className="mt-3 max-w-[65ch] leading-relaxed text-ink">{summary}</p>}
        {minutes > 0 && <p className="mt-3 text-sm font-semibold text-navy">About {minutes} minutes</p>}
      </header>
      <LessonBlocks blocks={blocks} />
      <p className="rounded-3xl border border-line bg-white p-5 text-ink">
        {questions
          ? `Then a knowledge check with ${questions} ${questions === 1 ? "question" : "questions"}. Learners need 70% to finish the lesson.`
          : "Then learners press \"Mark as done\" to finish the lesson."}
      </p>
    </div>
  );
}
