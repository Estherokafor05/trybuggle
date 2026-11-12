import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getBuiltLesson } from "@/content/preview-lessons";
import { googleAuthConfigured } from "@/lib/auth-configured";
import { exploreGuides } from "@/content/explore-guides";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RouteMap } from "@/components/explore/Illustrations";
export default async function Reading({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const guide = exploreGuides[lessonSlug];
  if (slug !== "ai-foundations" || !guide) notFound();
  if (!getBuiltLesson(lessonSlug)?.preview) {
    const session = googleAuthConfigured ? await auth() : null;
    if (!session?.user) {
      redirect(
        `/sign-in?callbackUrl=${encodeURIComponent(`/modules/${slug}/lessons/${lessonSlug}/reading`)}`,
      );
    }
  }
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[800px] px-5 py-8 sm:py-12">
        <Link
          className="inline-flex min-h-11 items-center font-semibold underline"
          href={`/modules/${slug}/lessons/${lessonSlug}`}
        >
          ← Return to the lesson
        </Link>
        <h1 className="mt-5 text-4xl font-bold">{guide.title}</h1>
        <p className="mt-4 leading-relaxed text-muted">
          Everything from this lesson as plain text. You don&apos;t need to
          play the film or complete the interactive steps.
        </p>
        <nav
          aria-label="Reading contents"
          className="my-7 rounded-2xl bg-lavender p-5"
        >
          <ol className="list-decimal space-y-2 pl-5">
            {guide.steps.map((s) => (
              <li key={s.id}>
                <a
                  className="inline-flex min-h-10 items-center underline"
                  href={`#${s.id}`}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        {guide.steps.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-24 border-t border-line py-7"
          >
            <h2 className="text-2xl font-bold">
              {i + 1}. {s.title}
            </h2>
            {s.id === "journey" && (
              <div className="my-5">
                <RouteMap />
                <p className="mt-2 text-sm">
                  The usual route is estimated at 30 minutes. The alternative is
                  initially 20 minutes, then becomes 35 minutes after a traffic
                  update.
                </p>
              </div>
            )}
            {s.id === "meet" && (
              <figure className="my-5 rounded-xl bg-mint p-5">
                <div className="flex flex-wrap gap-3 font-semibold">
                  <span>Meeting recording</span>
                  <span aria-hidden="true">→</span>
                  <span>Speech-recognition tool</span>
                  <span aria-hidden="true">→</span>
                  <span>Written notes</span>
                </div>
                <figcaption className="mt-3">
                  A recording is the input. Written notes are the output. A
                  person checks names and important details.
                </figcaption>
              </figure>
            )}
            <div className="mt-4 space-y-4 leading-relaxed">
              {s.reading.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-4 font-semibold text-teal">{s.takeaway}</p>
          </section>
        ))}
        <section className="rounded-2xl bg-mint p-5">
          <h2 className="text-xl font-bold">Try it in your own words</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {guide.reflections.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mt-4">
            You can write your answers on paper or in your own notes. This is
            unscored. Leave out private information.
          </p>
        </section>
        <Link
          href={`/modules/${slug}/lessons/${lessonSlug}#knowledge-check`}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-3 font-semibold text-white"
        >
          Take the knowledge check
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
