// "From the forum" on module and lesson pages: the latest conversations about
// this module or lesson, and quick ways in and out of the forum.
import Link from "next/link";
import { getSection, listThreads } from "@/server/forum";
import { KindBadge, when } from "./ForumParts";

export async function ForumPeek({
  moduleSlug,
  lessonSlug,
  heading,
  intro,
}: {
  moduleSlug: string;
  lessonSlug?: string;
  heading: string;
  intro: string;
}) {
  const section = await getSection(moduleSlug).catch(() => null);
  const threads = section
    ? ((await listThreads({ sectionId: section.id, lessonSlug, pageSize: 3 }).catch(() => null))?.threads ?? [])
    : [];
  const query = new URLSearchParams({ ...(section ? { section: section.slug } : {}), ...(lessonSlug ? { lesson: lessonSlug } : {}) });
  const viewHref = section ? `/forum/${section.slug}${lessonSlug ? `?lesson=${lessonSlug}` : ""}` : "/forum";
  return (
    <section aria-labelledby={`forum-peek-${lessonSlug ?? moduleSlug}`} className="rounded-[1.75rem] border border-line/70 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-[56ch]">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-deep">From the forum</p>
          <h2 id={`forum-peek-${lessonSlug ?? moduleSlug}`} className="mt-1 text-lg font-bold">
            {heading}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{intro}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={viewHref} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white hover:bg-brand-deep">
            View forum <span aria-hidden="true">→</span>
          </Link>
          <Link href={`/forum/new?${query}`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender">
            Ask a question
          </Link>
        </div>
      </div>
      {threads.length > 0 && (
        <ul className="mt-4 grid gap-2">
          {threads.map((t) => (
            <li key={t.id}>
              <Link href={`/forum/t/${t.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-canvas px-3 py-2.5 hover:bg-lavender">
                <KindBadge kind={t.kind} answered={t.answered} />
                <span className="min-w-0 flex-1 font-semibold text-ink">{t.title}</span>
                <span className="text-xs text-muted">
                  {t.replies} {t.replies === 1 ? "reply" : "replies"} · {when(t.activity)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
