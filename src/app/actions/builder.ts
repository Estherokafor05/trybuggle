"use server";
// Every change made in the lesson builder. Each one checks who is building:
// a Buggle Learn admin (actor "admin"), or an owner or manager of an
// organisation whose plan includes its own courses (actor = the org's slug).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { audit, requireAdmin } from "@/server/admin";
import {
  addBlock,
  addItem,
  addSection,
  createCourse,
  deleteBlock,
  deleteCourse,
  deleteItem,
  deleteSection,
  ensureCheck,
  moveBlock,
  moveItem,
  moveSection,
  removeCheck,
  renameSection,
  updateBlock,
  updateCourse,
  updateCourseType,
  updateItem,
  type Builder,
} from "@/server/builder";
import { canManage, isActive, orgForMember, planIncludes } from "@/server/organisations";
import { parseQuestionForm, saveQuestions } from "@/server/question-editor";

export type BuilderState = { error?: string };

const text = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
};
const id = (form: FormData, name: string) => {
  const v = text(form, name);
  return /^[0-9a-f-]{36}$/i.test(v) ? v : "";
};
const direction = (form: FormData) => (text(form, "direction") === "up" ? "up" : "down");

type Actor = { builder: Builder; base: string; label: string; log: (action: string, target: string | null, details?: object) => Promise<void> };

async function actorFrom(form: FormData): Promise<Actor | { error: string }> {
  const who = text(form, "actor");
  if (who === "admin") {
    const admin = await requireAdmin();
    return {
      builder: { kind: "admin", email: admin.user.email },
      base: "/admin/builder",
      label: admin.user.email,
      log: (action, target, details = {}) => audit(admin, action, target, details),
    };
  }
  if (!/^[a-z0-9-]{1,60}$/.test(who)) return { error: "Reload the page and try again." };
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/org/${who}/courses`)}`);
  const found = await orgForMember(who, session.user.id);
  if (!found || !canManage(found.role)) redirect(`/org/${who}`);
  if (!planIncludes(found.org.plan).ownCourses || !isActive(found.org))
    return { error: "Your organisation's plan doesn't include building your own courses. Choose a Platform plan to start." };
  return {
    builder: { kind: "org", orgId: found.org.id, userId: session.user.id },
    base: `/org/${who}/courses`,
    label: session.user.email,
    log: async () => {},
  };
}

/** Goes back to a builder page, refreshed, and to the right place on it. */
function go(path: string, notice?: string, hash?: string): never {
  revalidatePath(path);
  redirect(`${path}${notice ? `?notice=${notice}` : ""}${hash ? `#${hash}` : ""}`);
}

export async function builderAction(_state: BuilderState, form: FormData): Promise<BuilderState> {
  const actor = await actorFrom(form);
  if ("error" in actor) return actor;
  const b = actor.builder;
  const course = id(form, "course");
  const item = id(form, "item");
  const block = id(form, "block");
  const section = id(form, "section");
  const coursePage = `${actor.base}/${course}`;
  const lessonPage = `${coursePage}/lessons/${item}`;

  switch (text(form, "op")) {
    case "course.create": {
      const out = await createCourse(b, form.get("title"));
      if ("error" in out) return out;
      await actor.log("builder.course_created", out.id, { title: text(form, "title") });
      go(`${actor.base}/${out.id}`, "course-created");
    }
    case "course.save": {
      const status = text(form, "status");
      const out = await updateCourse(b, course, { title: form.get("title"), summary: form.get("summary"), status });
      if ("error" in out) return out;
      await actor.log("builder.course_saved", course, { status });
      go(coursePage, status === "published" ? "course-published" : "course-saved");
    }
    case "course.type": {
      const out = await updateCourseType(b, course, {
        kind: text(form, "kind"),
        foundation: form.get("foundation") === "on",
        freeChapters: text(form, "freeChapters") || "0",
        position: text(form, "position") || "100",
      });
      if ("error" in out) return out;
      await actor.log("builder.course_type", course, { kind: text(form, "kind"), foundation: form.get("foundation") === "on" });
      go(coursePage, "course-type-saved");
    }
    case "course.delete": {
      if (text(form, "confirm") !== "on") return { error: "Tick the box to confirm you want to delete this course." };
      if (!(await deleteCourse(b, course))) return { error: "That course no longer exists." };
      await actor.log("builder.course_deleted", course);
      go(actor.base, "course-deleted");
    }
    case "section.add": {
      const out = await addSection(b, course, form.get("title"));
      if ("error" in out) return out;
      go(coursePage, "module-added", `module-${out.id}`);
    }
    case "section.rename": {
      const out = await renameSection(b, section, form.get("title"));
      if ("error" in out) return out;
      go(coursePage, "module-saved", `module-${section}`);
    }
    case "section.delete": {
      const out = await deleteSection(b, section);
      if ("error" in out) return out;
      go(coursePage, "module-deleted");
    }
    case "section.move":
      await moveSection(b, section, direction(form));
      go(coursePage, undefined, `module-${section}`);
    case "item.add": {
      const out = await addItem(b, section, form.get("title"));
      if ("error" in out) return out;
      go(`${coursePage}/lessons/${out.id}`, "lesson-added");
    }
    case "item.move":
      await moveItem(b, item, direction(form));
      go(coursePage, undefined, `lesson-${item}`);
    case "item.delete":
      if (text(form, "confirm") !== "on") return { error: "Tick the box to confirm you want to delete this lesson." };
      await deleteItem(b, item);
      go(coursePage, "lesson-deleted");
    case "item.save": {
      const out = await updateItem(b, item, { title: form.get("title"), summary: form.get("summary"), minutes: form.get("minutes") });
      if ("error" in out) return out;
      go(lessonPage, "lesson-saved");
    }
    case "block.add": {
      const out = await addBlock(b, item, text(form, "kind"));
      if ("error" in out) return out;
      go(lessonPage, "block-added", `block-${out.id}`);
    }
    case "block.save": {
      const out = await updateBlock(b, block, form);
      if ("error" in out) return out;
      go(lessonPage, "block-saved", `block-${block}`);
    }
    case "block.move":
      await moveBlock(b, block, direction(form));
      go(lessonPage, undefined, `block-${block}`);
    case "block.delete":
      await deleteBlock(b, block);
      go(lessonPage, "block-deleted", "blocks");
    case "check.save": {
      const parsed = parseQuestionForm(form);
      if ("error" in parsed) return { error: parsed.error };
      const check = await ensureCheck(b, item, parsed.questions.length);
      if (!check) return { error: "That lesson no longer exists." };
      await saveQuestions(check, actor.label, parsed.questions);
      await actor.log("builder.check_saved", check, { questions: parsed.questions.length });
      go(lessonPage, "check-saved", "check");
    }
    case "check.remove":
      if (text(form, "confirm") !== "on") return { error: "Tick the box to confirm you want to remove the knowledge check." };
      await removeCheck(b, item);
      go(lessonPage, "check-removed", "check");
  }
  return { error: "Reload the page and try again." };
}
