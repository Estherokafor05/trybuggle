// Shared pieces for the forum pages, in the Buggle Learn style.
import Link from "next/link";
import type { ReactNode } from "react";

export const forumButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep";
export const forumOutline =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender";
export const forumInput =
  "w-full rounded-xl border-2 border-navy/30 bg-white px-3 py-2.5 text-base text-ink focus-visible:outline-2 focus-visible:outline-brand-deep";

/** "3 days ago", "25 Nov 2026" for older dates. */
export function when(iso: string, now = Date.now()) {
  const seconds = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units: [number, string][] = [
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  if (seconds > 60 * 60 * 24 * 28)
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  for (const [size, unit] of units)
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
    }
  return "just now";
}

const urlPattern = /(https?:\/\/[^\s<>"')\]]+[^\s<>"')\].,;:!?])/g;

/** Plain text as written: paragraphs, line breaks and links. Never HTML. */
export function ForumText({ text }: { text: string }) {
  return (
    <div className="space-y-3 break-words leading-relaxed text-ink">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="whitespace-pre-line">
          {para.split(urlPattern).map((part, j) =>
            j % 2 === 1 ? (
              <a key={j} href={part} rel="nofollow ugc noopener noreferrer" target="_blank" className="font-semibold text-navy underline underline-offset-4">
                {part}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              part
            ),
          )}
        </p>
      ))}
    </div>
  );
}

export function KindBadge({ kind, answered }: { kind: "question" | "discussion"; answered?: boolean }) {
  if (kind === "discussion") return <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-navy">Discussion</span>;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${answered ? "bg-teal text-white" : "bg-peach text-navy"}`}>
      {answered ? "✓ Answered" : "Question"}
    </span>
  );
}

export type ThreadSummary = {
  id: string;
  kind: "question" | "discussion";
  title: string;
  pinned: boolean;
  locked: boolean;
  replies: number;
  helpful: number;
  answered: boolean;
  author: string;
  activity: string;
  lesson: { label: string } | null;
  section: { slug: string; title: string };
};

export function ThreadList({ threads, showSection = false, empty }: { threads: ThreadSummary[]; showSection?: boolean; empty: ReactNode }) {
  if (!threads.length) return <p className="rounded-2xl bg-white p-5 text-muted ring-1 ring-line/70">{empty}</p>;
  return (
    <ul className="divide-y divide-line/70 overflow-hidden rounded-3xl border border-line/70 bg-white">
      {threads.map((t) => (
        <li key={t.id}>
          <Link href={`/forum/t/${t.id}`} className="block px-4 py-4 hover:bg-canvas sm:px-5">
            <span className="flex flex-wrap items-center gap-2">
              <KindBadge kind={t.kind} answered={t.answered} />
              {t.pinned && <span className="rounded-full bg-lavender px-2.5 py-1 text-xs font-semibold text-navy">Pinned</span>}
              {t.locked && <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-navy">Closed</span>}
              {showSection && <span className="text-xs font-semibold text-brand-deep">{t.section.title}</span>}
            </span>
            <span className="mt-2 block text-lg font-bold leading-snug text-ink">{t.title}</span>
            {t.lesson && <span className="mt-1 block text-sm text-muted">About {t.lesson.label}</span>}
            <span className="mt-1.5 block text-sm text-muted">
              <span className="ph-mask">{t.author}</span> · {t.replies} {t.kind === "question" ? (t.replies === 1 ? "answer" : "answers") : t.replies === 1 ? "reply" : "replies"}
              {t.helpful > 0 && ` · ${t.helpful} ${t.helpful === 1 ? "like" : "likes"}`} · active {when(t.activity)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ForumNotice({ notice, error }: { notice?: string | null; error?: string | null }) {
  if (!notice && !error) return null;
  return (
    <p role={error ? "alert" : "status"} className={`mb-5 rounded-2xl p-4 text-sm leading-relaxed ${error ? "bg-peach" : "bg-mint"}`}>
      {error ?? notice}
    </p>
  );
}

export const forumNotices: Record<string, string> = {
  posted: "Posted. Thanks for starting the conversation.",
  edited: "Saved.",
  deleted: "Deleted.",
  reported: "Thanks for telling us. Our team will look at it.",
};

/** For signed-in learners who haven't taken a check yet. */
export function JoinInCard({ checkHref }: { checkHref: string }) {
  return (
    <div className="rounded-2xl bg-peach p-4 text-sm leading-relaxed text-ink">
      <p className="font-bold">Take your first knowledge check to join in</p>
      <p className="mt-1">
        You can read everything now. Once you&apos;ve submitted any knowledge check (right or wrong), you can ask,
        answer, comment and like.
      </p>
      <Link href={checkHref} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-4 font-semibold text-white hover:bg-brand-deep">
        Go to the knowledge check <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
