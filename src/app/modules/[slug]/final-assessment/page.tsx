import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { KnowledgeCheck } from "@/components/assessment/KnowledgeCheck";
import { Requirements } from "@/components/certificate/Requirements";
import { JourneyProgress } from "@/components/JourneyProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getModule } from "@/content/modules";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { passMark } from "@/lib/assessment-scoring";
import { moduleAssessmentBank } from "@/server/assessment-bank";
import { hasFinalAssessment, moduleRequirements } from "@/server/certificates";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const mod = getModule((await params).slug);
  return { title: mod ? `Final assessment | ${mod.title}` : "Not found | Buggle Learn" };
}

export default async function FinalAssessmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod || !hasFinalAssessment(slug)) notFound();
  const returnTo = `/modules/${slug}/final-assessment`;
  const session = googleAuthConfigured ? await auth() : null;
  if (!session?.user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(returnTo)}`);
  const status = session.user.id ? await moduleRequirements(session.user.id, slug).catch(() => null) : null;
  const count = moduleAssessmentBank[slug].length;
  const lastLesson = mod.lessons.at(-1)!;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-4 pb-8 pt-3 sm:px-6 sm:py-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <li>
              <Link className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href="/curriculum">Learning path</Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href={`/modules/${slug}`}>Module {mod.order}</Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-semibold text-navy">Final assessment</li>
          </ol>
        </nav>
        <header className="mt-1 rounded-[1.75rem] bg-hero-lavender p-5 sm:mt-3 sm:rounded-[2rem] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">{mod.title}</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3.2rem)] font-bold leading-[1.08]">Final assessment</h1>
          <p className="mt-2 max-w-[62ch] leading-relaxed text-ink sm:text-lg">
            A short refresher on everything you have learned in Module {mod.order}.
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-navy">
            <span className="rounded-full bg-white/80 px-3 py-1.5">{count} questions</span>
            <span className="rounded-full bg-white/80 px-3 py-1.5">{passMark(count)} to pass</span>
            <span className="rounded-full bg-white/80 px-3 py-1.5">No time limit</span>
          </p>
        </header>
        {slug === "ai-foundations" && (
          <div className="mt-3 sm:mt-5">
            <JourneyProgress current="final-assessment" />
          </div>
        )}
        <KnowledgeCheck
          slug={slug}
          signedIn={Boolean(session.user.id)}
          endpoint={`/api/modules/${slug}/final-assessment`}
          kicker={`Module ${mod.order} · Final assessment`}
          title="Your refresher"
          intro={`${count} questions covering every lesson in this module. Get ${passMark(count)} or more right to pass. There is no time limit, and you can try again as many times as you need.`}
          noun="final assessment"
          returnTo={returnTo}
          afterPass={
            <Link
              href={`/modules/${slug}/certificate`}
              className="mt-3 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Go to your certificate <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          }
        />
        {status && (
          <div className="mt-7">
            <Requirements requirements={status.requirements} />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Your Certificate of Completion is ready once every item is ticked.{" "}
              <Link className="font-semibold text-navy underline underline-offset-4" href={`/modules/${slug}/certificate`}>
                View your certificate page
              </Link>
            </p>
          </div>
        )}
        <nav aria-label="Assessment navigation" className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/modules/${slug}/lessons/${lastLesson.slug}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender"
          >
            <span aria-hidden="true">←</span> Previous: Lesson {mod.lessons.length}
          </Link>
          <Link href={`/modules/${slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">
            All Module {mod.order} lessons
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
