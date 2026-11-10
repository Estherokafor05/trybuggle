import Link from "next/link";
import type { Module, Track } from "@/content/modules";

const STATUS_LABEL: Record<Module["status"], string> = {
  open: "Out first",
  next: "Up next",
  planned: "Planned",
};

const CARD_COLOURS = ["bg-lavender", "bg-peach", "bg-mint", "bg-blush"];

const TRACK_ICON: Record<Track, string> = {
  foundations:
    "M12 21a7 7 0 0 0-5-2H3V4h4a7 7 0 0 1 5 2 7 7 0 0 1 5-2h4v15h-4a7 7 0 0 0-5 2Zm0-15v15",
  systems:
    "M6 4h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 9h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM8 7.5h.01M8 16.5h.01M12 7.5h5M12 16.5h5",
  practice:
    "M5 3h5v5H5zM15 9h5v5h-5zM5 16h5v5H5zM10 5.5h5a2 2 0 0 1 2 2V9m0 5v2a2 2 0 0 1-2 2h-5",
};

export function ModuleCard({ module: mod }: { module: Module }) {
  const colour = CARD_COLOURS[(mod.order - 1) % CARD_COLOURS.length];
  const lessonCount = mod.lessons.length;

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col rounded-3xl border border-navy/10 p-5 text-navy transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand-deep focus-within:ring-offset-2 sm:p-6 ${colour}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full bg-surface"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              focusable="false"
            >
              <path d={TRACK_ICON[mod.track]} />
            </svg>
          </span>
          <span className="text-sm font-semibold tabular-nums">
            Module {String(mod.order).padStart(2, "0")}
          </span>
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            mod.status === "open" ? "bg-navy text-white" : "bg-surface/75 text-navy"
          }`}
        >
          {STATUS_LABEL[mod.status]}
        </span>
      </div>

      <h3 className="mt-4 text-xl leading-snug font-bold sm:text-[1.375rem]">
        <Link
          href={`/modules/${mod.slug}`}
          className="after:absolute after:inset-0 after:rounded-3xl group-hover:underline group-hover:decoration-navy/40 group-hover:underline-offset-4 focus-visible:underline"
        >
          {mod.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed">{mod.summary}</p>
      <p className="mt-3 mb-5 text-sm leading-relaxed">
        <strong className="font-semibold">You leave with</strong> {mod.outcome}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-navy/15 pt-3">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
          <span>
            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </span>
          <span aria-hidden="true">·</span>
          <span>{mod.handsOn ? "Hands on" : "No code"}</span>
        </span>
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full bg-surface transition-colors group-hover:bg-navy group-hover:text-white group-focus-within:bg-navy group-focus-within:text-white"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </article>
  );
}
