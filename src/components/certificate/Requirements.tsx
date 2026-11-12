import Link from "next/link";
import type { Requirement } from "@/server/certificates";

/** What a learner needs for the Module certificate, with what is already done. */
export function Requirements({ requirements }: { requirements: Requirement[] }) {
  const done = requirements.filter((r) => r.passedAt).length;
  return (
    <section aria-labelledby="requirements-title" className="rounded-[1.75rem] border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="requirements-title" className="text-lg font-bold">
          Your path to the certificate
        </h2>
        <p className="text-sm font-semibold text-muted">
          {done} of {requirements.length} done
        </p>
      </div>
      <ol className="mt-4 space-y-2">
        {requirements.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-2">
            <span
              aria-hidden="true"
              className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold ${r.passedAt ? "bg-teal text-white" : "border-2 border-line bg-white text-muted"}`}
            >
              {r.passedAt ? "✓" : ""}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{r.label}</span>
              <span className="block truncate text-sm text-muted">{r.title}</span>
            </span>
            {r.passedAt ? (
              <span className="text-sm font-semibold text-teal">Passed</span>
            ) : (
              <Link href={r.href} className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">
                Take it<span className="sr-only">: {r.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
