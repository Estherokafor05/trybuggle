import { Sparkles } from "@/components/Sparkles";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { forumButton, forumInput, forumOutline, ThreadList, when } from "@/components/forum/ForumParts";
import { currentSession } from "@/auth";
import { JoinInCard } from "@/components/forum/ForumParts";
import { canPost, listSections, listThreads } from "@/server/forum";
import { coursePath } from "@/server/progression";

export const metadata: Metadata = {
  title: "Community forum | Buggle Learn",
  description: "Ask questions about AI and your lessons, share what worked, and help other learners.",
};
export const dynamic = "force-dynamic";

const tones = ["bg-lavender", "bg-mint", "bg-peach", "bg-blush"];

export default async function ForumHome({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const session = await currentSession();
  const newcomer = Boolean(session?.user?.id) && !(await canPost(session?.user?.id).catch(() => true));
  const [sections, latest] = await Promise.all([
    listSections().catch(() => null),
    listThreads({ search: q }).catch(() => null),
  ]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="relative grid gap-5 overflow-hidden rounded-[2rem] bg-hero-lavender p-6 sm:p-9 md:grid-cols-[1.4fr_1fr] md:items-end">
          <Sparkles />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Community</p>
            <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Community forum</h1>
            <p className="mt-3 max-w-[56ch] leading-relaxed text-ink">
              Ask questions about AI and your lessons, share what worked for you, and help other learners. Anyone can
              read. You need a free account to post. There are no private messages.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/forum/new" className={forumButton}>
              Ask a question
            </Link>
            <Link href="/forum/guidelines" className={forumOutline}>
              Community guidelines
            </Link>
            <Link href="/leaderboard" className={forumOutline}>
              <span aria-hidden="true">🏆</span> Leaderboard
            </Link>
          </div>
        </header>

        {newcomer && (
          <div className="mt-6">
            <JoinInCard checkHref={`${coursePath()[0]?.href ?? "/modules/ai-foundations"}#knowledge-check`} />
          </div>
        )}
        <form role="search" className="mt-6 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="q" className="sr-only">
            Search the forum
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Search questions and discussions" className={forumInput} />
          <button type="submit" className={forumOutline}>
            Search
          </button>
        </form>

        {!sections || !latest ? (
          <p role="alert" className="mt-6 rounded-2xl bg-peach p-4">
            The forum can&apos;t load right now. Please try again in a moment.
          </p>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.25fr]">
            {!q && (
              <section aria-labelledby="sections-title">
                <h2 id="sections-title" className="mb-4 text-2xl font-bold">
                  Sections
                </h2>
                <ul className="grid gap-3">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <Link href={`/forum/${s.slug}`} className={`block rounded-3xl p-5 transition-shadow hover:shadow-md ${tones[i % tones.length]}`}>
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-lg font-bold text-ink">{s.title}</span>
                          <span className="text-sm font-semibold text-navy">
                            {s.threads} {s.threads === 1 ? "post" : "posts"}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-ink/85">{s.description}</span>
                        <span className="mt-2 block text-xs font-semibold text-navy">
                          {s.locked ? "Read only" : s.latest ? `Last active ${when(s.latest)}` : "Be the first to post"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section aria-labelledby="latest-title" className={q ? "lg:col-span-2" : ""}>
              <h2 id="latest-title" className="mb-4 text-2xl font-bold">
                {q ? `Results for "${q}"` : "Latest"}
              </h2>
              <ThreadList
                threads={latest.threads}
                showSection
                empty={q ? "Nothing matches that search yet. Try other words, or ask it as a new question." : "No posts yet. Ask the first question!"}
              />
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
