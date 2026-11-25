import Link from "next/link";
import { LockIcon } from "@/components/LockIcon";
import type { EssentialsModule } from "@/server/certificates";

const stateText: Record<EssentialsModule["state"], string> = {
  complete: "Complete",
  inProgress: "In progress",
  notStarted: "Not started",
  beingMade: "Being made",
  skipped: "Skipped on this test site",
};

/** Every Essentials module, with what the learner has finished. */
export function EssentialsChecklist({ modules }: { modules: EssentialsModule[] }) {
  const counted = modules.filter((m) => m.state !== "skipped");
  const done = counted.filter((m) => m.state === "complete").length;
  return (
    <section aria-labelledby="essentials-list-title" className="rounded-[1.75rem] border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="essentials-list-title" className="text-lg font-bold">
          Your path to the certificate
        </h2>
        <p className="text-sm font-semibold text-muted">
          {done} of {counted.length} modules complete
        </p>
      </div>
      <ol className="mt-4 space-y-2">
        {modules.map((m) => (
          <li key={m.slug} className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2">
            <span
              aria-hidden="true"
              className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold ${
                m.state === "complete" ? "bg-teal text-white" : "border-2 border-line bg-white text-muted"
              }`}
            >
              {m.state === "complete" ? "✓" : m.state === "beingMade" ? <LockIcon /> : ""}
            </span>
            <span className="min-w-0 flex-1">
              <Link href={m.href} className="block font-semibold underline-offset-4 hover:underline">
                Module {m.order}: {m.title}
              </Link>
              <span className="block text-sm text-muted">
                {stateText[m.state]}
                {m.state !== "skipped" && m.total > 0 && ` · ${m.done} of ${m.total} steps passed`}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
