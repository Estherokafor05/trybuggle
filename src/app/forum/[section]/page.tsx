import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getModule } from "@course";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { forumButton, ThreadList } from "@/components/forum/ForumParts";
import { getSection, lessonInfo, listThreads, type ThreadFilter } from "@/server/forum";

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ filter?: string; page?: string; lesson?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = await getSection((await params).section).catch(() => null);
  return { title: section ? `${section.title} | Buggle Learn forum` : "Forum | Buggle Learn" };
}

const FILTERS: { id: ThreadFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "questions", label: "Questions" },
  { id: "unanswered", label: "No answers yet" },
  { id: "discussions", label: "Discussions" },
];

export default async function ForumSectionPage({ params, searchParams }: Props) {
  const slug = (await params).section;
  const section = await getSection(slug);
  // A module without its own section yet goes to the forum home.
  if (!section) {
    if (getModule(slug)) redirect("/forum");
    notFound();
  }
  const query = await searchParams;
  const lesson = lessonInfo(query.lesson ?? null);
  const filter = FILTERS.some((f) => f.id === query.filter) ? (query.filter as ThreadFilter) : "all";
  const page = Math.max(1, Math.min(1000, Number(query.page) || 1));
  const { threads, more } = await listThreads({ sectionId: section.id, lessonSlug: lesson?.slug, filter, page });
  const link = (f: ThreadFilter, p = 1, withLesson = true) => {
    const q = new URLSearchParams({
      ...(f !== "all" ? { filter: f } : {}),
      ...(p > 1 ? { page: String(p) } : {}),
      ...(withLesson && lesson ? { lesson: lesson.slug } : {}),
    });
    return `/forum/${section.slug}${q.size ? `?${q}` : ""}`;
  };
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 pb-12 pt-3 sm:px-6 sm:pt-8">
        <Link href="/forum" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
          <span aria-hidden="true">←</span> Forum
        </Link>
        <header className="mt-2 flex flex-wrap items-end justify-between gap-4 rounded-[2rem] bg-hero-lavender p-6 sm:p-8">
          <div className="max-w-[58ch]">
            <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight">{section.title}</h1>
            <p className="mt-2 leading-relaxed text-ink">{section.description}</p>
          </div>
          {section.locked ? (
            <p className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-navy">Read only</p>
          ) : (
            <Link
              href={`/forum/new?${new URLSearchParams({ section: section.slug, ...(lesson ? { lesson: lesson.slug } : {}) })}`}
              className={forumButton}
            >
              {lesson ? "Ask about this lesson" : "Post in this section"}
            </Link>
          )}
        </header>
        {lesson && (
          <p className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-line/70">
            <span>
              Showing posts about <b>{lesson.label}</b>
            </span>
            <Link href={lesson.href} className="font-semibold text-navy underline underline-offset-4">
              Back to the lesson
            </Link>
            <Link href={link(filter, 1, false)} className="font-semibold text-navy underline underline-offset-4">
              Show everything in this section
            </Link>
          </p>
        )}
        <nav aria-label="Show" className="mt-6 overflow-x-auto">
          <ul className="flex w-max gap-1 rounded-full border border-line/70 bg-white/80 p-1 text-sm font-medium">
            {FILTERS.map((f) => (
              <li key={f.id}>
                <Link
                  href={link(f.id)}
                  aria-current={filter === f.id ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full px-4 ${filter === f.id ? "bg-navy text-white" : "text-muted hover:bg-lavender hover:text-navy"}`}
                >
                  {f.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-5">
          <ThreadList threads={threads} empty={filter === "unanswered" ? "Every question here has an answer." : "Nothing here yet. Start the conversation!"} />
        </div>
        {(page > 1 || more) && (
          <nav aria-label="Pages" className="mt-5 flex justify-between gap-3">
            {page > 1 ? (
              <Link href={link(filter, page - 1)} className="inline-flex min-h-11 items-center font-semibold text-navy underline underline-offset-4">
                ← Newer
              </Link>
            ) : (
              <span />
            )}
            {more && (
              <Link href={link(filter, page + 1)} className="inline-flex min-h-11 items-center font-semibold text-navy underline underline-offset-4">
                Older →
              </Link>
            )}
          </nav>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
