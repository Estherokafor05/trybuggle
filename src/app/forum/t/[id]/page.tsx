import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentSession } from "@/auth";
import { acceptAction, deleteAction, editAction, helpfulAction, replyAction, reportAction } from "@/app/forum/actions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  forumButton,
  forumInput,
  ForumNotice,
  forumNotices,
  forumOutline,
  ForumText,
  KindBadge,
  when,
} from "@/components/forum/ForumParts";
import { getThread, reportReasons, type ForumPost } from "@/server/forum";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string; error?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const thread = await getThread((await params).id, null).catch(() => null);
  return { title: thread ? `${thread.title} | Buggle Learn forum` : "Forum | Buggle Learn" };
}

const small = "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-navy hover:bg-lavender";

function Hidden(fields: Record<string, string>) {
  return (
    <>
      {Object.entries(fields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </>
  );
}

/** Helpful, accept, edit, delete and report, for one thread or post. */
function Tools({
  threadId,
  type,
  id,
  signedIn,
  mine,
  helpful,
  voted,
  accept,
  editFields,
  label,
}: {
  threadId: string;
  type: "thread" | "post";
  id: string;
  signedIn: boolean;
  mine: boolean;
  helpful: number;
  voted: boolean;
  accept?: { accepted: boolean };
  editFields?: { title?: string; body: string };
  label: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1">
      {signedIn && !mine ? (
        <form action={helpfulAction}>
          <Hidden thread={threadId} type={type} id={id} />
          <button type="submit" aria-pressed={voted} className={`${small} ${voted ? "bg-mint" : ""}`}>
            {voted ? "✓ " : ""}Helpful{helpful > 0 ? ` · ${helpful}` : ""}
            <span className="sr-only">: {label}</span>
          </button>
        </form>
      ) : (
        helpful > 0 && <span className="px-3 text-sm text-muted">{helpful} found this helpful</span>
      )}
      {accept && (
        <form action={acceptAction}>
          <Hidden thread={threadId} id={id} />
          <button type="submit" className={small}>
            {accept.accepted ? "Unmark as the answer" : "Mark as the answer that helped"}
            <span className="sr-only">: {label}</span>
          </button>
        </form>
      )}
      {mine && editFields && (
        <details className="w-full">
          <summary className={`${small} cursor-pointer list-none`}>
            Edit<span className="sr-only"> {label}</span>
          </summary>
          <form action={editAction} className="mt-2 grid gap-2">
            <Hidden thread={threadId} type={type} id={id} />
            {editFields.title !== undefined && (
              <label className="grid gap-1 text-sm font-semibold">
                Title
                <input name="title" defaultValue={editFields.title} required minLength={8} maxLength={140} className={forumInput} />
              </label>
            )}
            <label className="grid gap-1 text-sm font-semibold">
              Your words
              <textarea name="body" defaultValue={editFields.body} required rows={5} maxLength={10000} className={forumInput} />
            </label>
            <button type="submit" className={`${forumButton} justify-self-start`}>
              Save changes
            </button>
          </form>
        </details>
      )}
      {mine && (
        <details>
          <summary className={`${small} cursor-pointer list-none`}>
            Delete<span className="sr-only"> {label}</span>
          </summary>
          <form action={deleteAction} className="mt-2">
            <Hidden thread={threadId} type={type} id={id} />
            <button type="submit" className={forumOutline}>
              Yes, delete it
            </button>
          </form>
        </details>
      )}
      {signedIn && !mine && (
        <details className="w-full sm:w-auto">
          <summary className={`${small} cursor-pointer list-none text-muted`}>
            Report<span className="sr-only"> {label}</span>
          </summary>
          <form action={reportAction} className="mt-2 grid gap-2 rounded-2xl bg-canvas p-3">
            <Hidden thread={threadId} type={type} id={id} />
            <fieldset className="grid gap-1">
              <legend className="text-sm font-semibold">What&apos;s wrong?</legend>
              {Object.entries(reportReasons).map(([value, text]) => (
                <label key={value} className="flex min-h-10 items-center gap-2 text-sm">
                  <input type="radio" name="reason" value={value} required className="size-4 accent-brand" /> {text}
                </label>
              ))}
            </fieldset>
            <label className="grid gap-1 text-sm font-semibold">
              Anything else? (optional)
              <input name="note" maxLength={500} className={forumInput} />
            </label>
            <button type="submit" className={`${forumOutline} justify-self-start`}>
              Send report
            </button>
          </form>
        </details>
      )}
    </div>
  );
}

function Gone({ post }: { post: ForumPost }) {
  return (
    <p className="text-sm italic text-muted">
      {post.state === "hidden" ? "Hidden by the Buggle Learn team." : "Deleted by its author."}
    </p>
  );
}

export default async function ThreadPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { notice, error } = await searchParams;
  const session = await currentSession();
  const viewer = session?.user?.id ?? null;
  const thread = await getThread(id, viewer);
  if (!thread) notFound();
  const signedIn = Boolean(viewer);
  const isQuestion = thread.kind === "question";
  const back = `/forum/t/${thread.id}`;
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(back)}`;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[860px] px-4 pb-12 pt-3 sm:px-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm font-semibold text-navy">
          <Link href="/forum" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            Forum
          </Link>
          <span aria-hidden="true">›</span>
          <Link href={`/forum/${thread.section.slug}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
            {thread.section.title}
          </Link>
        </nav>
        <ForumNotice notice={notice ? forumNotices[notice] : null} error={error} />

        <article aria-labelledby="thread-title" className="rounded-[2rem] border border-line bg-white p-5 sm:p-8">
          <p className="flex flex-wrap items-center gap-2">
            <KindBadge kind={thread.kind} answered={Boolean(thread.acceptedPostId)} />
            {thread.pinned && <span className="rounded-full bg-lavender px-2.5 py-1 text-xs font-semibold text-navy">Pinned</span>}
            {thread.locked && <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-navy">Closed to new replies</span>}
          </p>
          <h1 id="thread-title" className="mt-3 text-[clamp(1.6rem,3.5vw,2.3rem)] font-bold leading-tight">
            {thread.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {thread.deleted ? "Deleted by its author" : <span className="ph-mask">{thread.author}</span>} · {when(thread.created)}
            {thread.edited && " · edited"}
          </p>
          {thread.lesson && (
            <p className="mt-3">
              <Link href={thread.lesson.href} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-lavender px-4 text-sm font-semibold text-navy">
                About {thread.lesson.label} <span aria-hidden="true">→</span>
              </Link>
            </p>
          )}
          <div className="mt-5">{thread.body ? <ForumText text={thread.body} /> : <p className="italic text-muted">The author deleted this post.</p>}</div>
          {!thread.deleted && (
            <Tools
              threadId={thread.id}
              type="thread"
              id={thread.id}
              signedIn={signedIn}
              mine={thread.mine}
              helpful={thread.helpful}
              voted={thread.votedHelpful}
              editFields={{ title: thread.title, body: thread.body ?? "" }}
              label={thread.title}
            />
          )}
        </article>

        <section aria-labelledby="answers-title" className="mt-8">
          <h2 id="answers-title" className="text-2xl font-bold">
            {thread.answers.length} {isQuestion ? (thread.answers.length === 1 ? "answer" : "answers") : thread.answers.length === 1 ? "reply" : "replies"}
          </h2>
          <ol className="mt-4 grid gap-4">
            {thread.answers.map((answer, n) => (
              <li
                key={answer.id}
                id={`post-${answer.id}`}
                className={`scroll-mt-24 rounded-3xl border p-5 sm:p-6 ${answer.accepted ? "border-teal bg-mint/60" : "border-line bg-white"}`}
              >
                {answer.accepted && <p className="mb-2 text-sm font-bold text-navy">✓ The answer that helped</p>}
                {answer.state === "visible" ? (
                  <>
                    <p className="text-sm text-muted">
                      <span className="ph-mask font-semibold text-ink">{answer.author}</span> · {when(answer.created)}
                      {answer.edited && " · edited"}
                    </p>
                    <div className="mt-2">
                      <ForumText text={answer.body!} />
                    </div>
                    <Tools
                      threadId={thread.id}
                      type="post"
                      id={answer.id}
                      signedIn={signedIn}
                      mine={answer.mine}
                      helpful={answer.helpful}
                      voted={answer.votedHelpful}
                      accept={thread.mine && isQuestion && !thread.deleted ? { accepted: answer.accepted } : undefined}
                      editFields={{ body: answer.body! }}
                      label={`${isQuestion ? "answer" : "reply"} ${n + 1}`}
                    />
                  </>
                ) : (
                  <Gone post={answer} />
                )}

                {(answer.comments.length > 0 || (signedIn && !thread.locked && answer.state === "visible")) && (
                  <div className="mt-4 border-t border-line/70 pt-3">
                    {answer.comments.length > 0 && (
                      <ul className="grid gap-3" aria-label={`Comments on ${isQuestion ? "answer" : "reply"} ${n + 1}`}>
                        {answer.comments.map((c) => (
                          <li key={c.id} id={`post-${c.id}`} className="scroll-mt-24 rounded-2xl bg-canvas p-3">
                            {c.state === "visible" ? (
                              <>
                                <p className="text-xs text-muted">
                                  <span className="ph-mask font-semibold text-ink">{c.author}</span> · {when(c.created)}
                                  {c.edited && " · edited"}
                                </p>
                                <div className="mt-1 text-sm">
                                  <ForumText text={c.body!} />
                                </div>
                                <Tools
                                  threadId={thread.id}
                                  type="post"
                                  id={c.id}
                                  signedIn={signedIn}
                                  mine={c.mine}
                                  helpful={c.helpful}
                                  voted={c.votedHelpful}
                                  editFields={{ body: c.body! }}
                                  label="comment"
                                />
                              </>
                            ) : (
                              <Gone post={c} />
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {signedIn && !thread.locked && answer.state === "visible" && (
                      <details className="mt-2">
                        <summary className={`${small} cursor-pointer list-none`}>
                          Add a comment<span className="sr-only"> on {isQuestion ? "answer" : "reply"} {n + 1}</span>
                        </summary>
                        <form action={replyAction} className="mt-2 grid gap-2">
                          <Hidden thread={thread.id} parent={answer.id} />
                          <label className="sr-only" htmlFor={`comment-${answer.id}`}>
                            Your comment
                          </label>
                          <textarea id={`comment-${answer.id}`} name="body" required maxLength={5000} rows={3} className={forumInput} />
                          <button type="submit" className={`${forumOutline} justify-self-start`}>
                            Post comment
                          </button>
                        </form>
                      </details>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="reply-title" className="mt-8 rounded-[2rem] bg-lavender p-5 sm:p-7">
          <h2 id="reply-title" className="text-xl font-bold">
            {isQuestion ? "Your answer" : "Your reply"}
          </h2>
          {thread.locked || thread.deleted ? (
            <p className="mt-2 leading-relaxed text-ink">This conversation is closed to new replies.</p>
          ) : signedIn ? (
            <form action={replyAction} className="mt-3 grid gap-3">
              <Hidden thread={thread.id} />
              <label className="sr-only" htmlFor="reply-body">
                {isQuestion ? "Your answer" : "Your reply"}
              </label>
              <textarea id="reply-body" name="body" required maxLength={5000} rows={5} className={forumInput} />
              <p className="text-sm text-muted">
                Be kind and keep personal details private.{" "}
                <Link href="/forum/guidelines" className="font-semibold text-navy underline underline-offset-4">
                  Guidelines
                </Link>
              </p>
              <button type="submit" className={`${forumButton} justify-self-start`}>
                {isQuestion ? "Post answer" : "Post reply"}
              </button>
            </form>
          ) : (
            <p className="mt-2 leading-relaxed text-ink">
              <Link href={signInHref} className="font-semibold text-navy underline underline-offset-4">
                Log in
              </Link>{" "}
              or{" "}
              <Link href={`/sign-up?callbackUrl=${encodeURIComponent(back)}`} className="font-semibold text-navy underline underline-offset-4">
                create a free account
              </Link>{" "}
              to join in.
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
