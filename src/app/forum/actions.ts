"use server";
// Posting in the forum. Reading is open to everyone; posting needs an account.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import {
  acceptAnswer,
  createPost,
  createThread,
  deleteOwn,
  editPost,
  editThread,
  report,
  toggleHelpful,
  type ForumUser,
} from "@/server/forum";

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};
const kindOf = (form: FormData) => (text(form, "type") === "thread" ? "thread" : "post");
/**
 * Where to go after an action. The page is refreshed first, so a reply shows
 * even when only the #anchor changes.
 */
function threadUrl(id: string, extra = "", anchor = "") {
  revalidatePath(`/forum/t/${id}`);
  return `/forum/t/${id}${extra ? `?${extra}` : ""}${anchor ? `#${anchor}` : ""}`;
}
const withError = (path: string, error: string) =>
  `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(error)}`;

/** The signed-in learner, or a trip to log in that comes back here. */
async function learner(back: string): Promise<ForumUser> {
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(back)}`);
  return { id: session.user.id, name: session.user.name ?? "" };
}

export async function createThreadAction(form: FormData) {
  const section = text(form, "section");
  const back = `/forum/new?section=${encodeURIComponent(section)}`;
  const user = await learner(back);
  const result = await createThread(user, {
    sectionSlug: section,
    kind: text(form, "kind"),
    title: form.get("title"),
    body: form.get("body"),
    lesson: form.get("lesson"),
  });
  if ("error" in result) {
    // Keep what they typed so nothing is lost.
    const keep = new URLSearchParams({
      section,
      kind: text(form, "kind"),
      lesson: text(form, "lesson"),
      title: text(form, "title").slice(0, 200),
      body: text(form, "body").slice(0, 3000),
      error: result.error,
    });
    redirect(`/forum/new?${keep}`);
  }
  redirect(threadUrl(result.id, "notice=posted"));
}

export async function replyAction(form: FormData) {
  const threadId = text(form, "thread");
  const user = await learner(threadUrl(threadId));
  const result = await createPost(user, threadId, { body: form.get("body"), parentId: form.get("parent") });
  if ("error" in result) redirect(withError(threadUrl(threadId), result.error));
  redirect(threadUrl(threadId, "", `post-${result.id}`));
}

export async function editAction(form: FormData) {
  const threadId = text(form, "thread");
  const id = text(form, "id");
  const user = await learner(threadUrl(threadId));
  const result =
    kindOf(form) === "thread"
      ? await editThread(user, id, { title: form.get("title"), body: form.get("body") })
      : await editPost(user, id, form.get("body"));
  if ("error" in result) redirect(withError(threadUrl(threadId), result.error));
  redirect(threadUrl(threadId, "notice=edited", kindOf(form) === "post" ? `post-${id}` : ""));
}

export async function deleteAction(form: FormData) {
  const threadId = text(form, "thread");
  const user = await learner(threadUrl(threadId));
  await deleteOwn(user, kindOf(form), text(form, "id"));
  redirect(threadUrl(threadId, "notice=deleted"));
}

export async function helpfulAction(form: FormData) {
  const threadId = text(form, "thread");
  const id = text(form, "id");
  const user = await learner(threadUrl(threadId));
  const result = await toggleHelpful(user, kindOf(form), id);
  if ("error" in result) redirect(withError(threadUrl(threadId), result.error!));
  redirect(threadUrl(threadId, "", kindOf(form) === "post" ? `post-${id}` : ""));
}

export async function acceptAction(form: FormData) {
  const threadId = text(form, "thread");
  const id = text(form, "id");
  const user = await learner(threadUrl(threadId));
  const result = await acceptAnswer(user, threadId, id);
  if ("error" in result) redirect(withError(threadUrl(threadId), result.error!));
  redirect(threadUrl(threadId, "", `post-${id}`));
}

export async function reportAction(form: FormData) {
  const threadId = text(form, "thread");
  const user = await learner(threadUrl(threadId));
  const result = await report(user, kindOf(form), text(form, "id"), text(form, "reason"), form.get("note"));
  if ("error" in result) redirect(withError(threadUrl(threadId), result.error!));
  redirect(threadUrl(threadId, "notice=reported"));
}
