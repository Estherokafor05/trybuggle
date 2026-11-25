import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { createThreadAction } from "@/app/forum/actions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { forumButton, forumInput, ForumNotice } from "@/components/forum/ForumParts";
import { lessonChoices, listSections } from "@/server/forum";

export const metadata: Metadata = { title: "Ask a question | Buggle Learn forum", robots: { index: false } };

type Query = { section?: string; kind?: string; lesson?: string; title?: string; body?: string; error?: string };

export default async function NewThreadPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const session = await currentSession();
  if (!session?.user?.id) {
    const back = `/forum/new?${new URLSearchParams(Object.entries({ section: query.section ?? "", lesson: query.lesson ?? "" }).filter(([, v]) => v))}`;
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(back)}`);
  }
  const sections = (await listSections()).filter((s) => !s.locked);
  const lessons = lessonChoices();
  const lessonModule = lessons.find((l) => l.slug === query.lesson)?.moduleSlug;
  const chosen = sections.find((s) => s.slug === query.section)?.slug ?? sections.find((s) => s.slug === lessonModule)?.slug ?? "";
  const discussion = query.kind === "discussion";
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pb-12 pt-3 sm:px-6 sm:pt-8">
        <Link href="/forum" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
          <span aria-hidden="true">←</span> Forum
        </Link>
        <section className="mt-2 rounded-3xl border border-line bg-white p-6 sm:p-9">
          <h1 className="text-3xl font-bold">Start a conversation</h1>
          <p className="mt-2 leading-relaxed text-muted">
            Your post is public. It shows your first name and the first letter of your last name. Please don&apos;t share
            personal details, and follow the{" "}
            <Link href="/forum/guidelines" className="font-semibold text-navy underline underline-offset-4">
              community guidelines
            </Link>
            .
          </p>
          <ForumNotice error={query.error} />
          <form action={createThreadAction} className="mt-6 grid gap-5">
            <fieldset>
              <legend className="font-semibold">What are you posting?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  { value: "question", title: "A question", hint: "You want an answer. You can mark the one that helped." },
                  { value: "discussion", title: "A discussion", hint: "Share an idea, a tip or something you tried." },
                ].map((k) => (
                  <label key={k.value} className="flex cursor-pointer gap-3 rounded-2xl border-2 border-line p-4 has-[:checked]:border-brand has-[:checked]:bg-lavender">
                    <input type="radio" name="kind" value={k.value} defaultChecked={(k.value === "discussion") === discussion} className="mt-1 size-4 accent-brand" />
                    <span>
                      <span className="block font-semibold">{k.title}</span>
                      <span className="block text-sm text-muted">{k.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-2 font-semibold">
              Section
              <select name="section" required defaultValue={chosen} className={forumInput}>
                <option value="" disabled>
                  Choose a section
                </option>
                {sections.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-semibold">
              <span>
                Is it about a lesson? <span className="font-normal text-muted">(optional)</span>
              </span>
              <select name="lesson" defaultValue={lessons.some((l) => l.slug === query.lesson) ? query.lesson : ""} className={forumInput}>
                <option value="">Not about one lesson</option>
                {lessons.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-semibold">
              <span>
                Title <span className="font-normal text-muted">(8 to 140 characters)</span>
              </span>
              <input name="title" required minLength={8} maxLength={140} defaultValue={query.title ?? ""} className={forumInput} />
            </label>
            <label className="grid gap-2 font-semibold">
              <span>
                Details <span className="font-normal text-muted">(at least 20 characters)</span>
              </span>
              <textarea name="body" required minLength={20} maxLength={10000} rows={8} defaultValue={query.body ?? ""} className={forumInput} />
            </label>
            <button type="submit" className={`${forumButton} justify-self-start`}>
              Post it
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
