"use server";
// Finishing a builder lesson that has no knowledge check.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { courseForLearner, markDone } from "@/server/builder-learn";

export async function markDoneAction(form: FormData) {
  const slug = String(form.get("course") ?? "");
  const item = String(form.get("item") ?? "");
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) redirect("/courses");
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/learn/${slug}`)}`);
  await markDone(slug, item, session.user.id);
  const course = await courseForLearner(slug, session.user.id);
  revalidatePath(`/learn/${slug}`);
  const next = course && !("signInNeeded" in course) ? course.lessons.find((l) => l.state === "open") : null;
  redirect(next ? `/learn/${slug}/${next.slug}` : `/learn/${slug}`);
}
