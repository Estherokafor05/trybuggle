import Link from "next/link";
import { journey, journeyPosition } from "@/content/journey";

// Shows the learner where they are on the path from the welcome through
// Module 1, and lets them jump to any step that is ready.
export function JourneyProgress({ current }: { current?: string }) {
  const { index } = current ? journeyPosition(current) : { index: -1 };

  return (
    <nav
      aria-label="Your path through Module 1"
      className="rounded-3xl border border-line/80 bg-white px-4 py-4 sm:px-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-semibold text-navy">
          Your path through Module 1
        </p>
        {index >= 0 && (
          <p className="text-xs text-muted">
            Step {index + 1} of {journey.length}
          </p>
        )}
      </div>
      <ol className="mt-3 flex items-start">
        {journey.map((step, i) => {
          const isCurrent = i === index;
          const isBefore = index >= 0 && i < index;
          const dot = `relative z-10 grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums transition-colors ${
            isCurrent
              ? "bg-navy text-white ring-4 ring-hero-lavender"
              : isBefore
                ? "bg-brand text-white"
                : step.available
                  ? "border-2 border-brand bg-white text-navy"
                  : "border-2 border-dashed border-line bg-white text-muted"
          }`;
          const symbol = i === 0 ? "★" : String(i);
          const label = (
            <span
              className={`mt-1.5 block text-center text-[11px] leading-tight sm:text-xs ${
                isCurrent ? "font-semibold text-navy" : "text-muted"
              } ${isCurrent ? "" : "max-sm:sr-only"}`}
            >
              {step.label}
              {!step.available && (
                <span className="block text-[10px] sm:text-[11px]">Coming soon</span>
              )}
            </span>
          );
          const description = `${step.label}: ${step.title}${
            step.available ? "" : " (coming soon)"
          }`;

          return (
            <li
              key={step.id}
              className="relative flex min-w-0 flex-1 flex-col items-center"
            >
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-[1.125rem] h-0.5 w-full -translate-y-1/2 ${
                    index >= 0 && i <= index ? "bg-brand" : "bg-line"
                  }`}
                />
              )}
              {step.available && !isCurrent ? (
                <Link
                  href={step.href}
                  title={description}
                  className="flex min-h-11 flex-col items-center rounded-xl px-1 hover:bg-lavender/60"
                >
                  <span className={dot} aria-hidden="true">
                    {symbol}
                  </span>
                  <span className="sr-only">{description}</span>
                  <span aria-hidden="true">{label}</span>
                </Link>
              ) : (
                <span
                  className="flex flex-col items-center px-1"
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span className={dot} aria-hidden="true">
                    {symbol}
                  </span>
                  <span className="sr-only">
                    {description}
                    {isCurrent ? " (you are here)" : ""}
                  </span>
                  <span aria-hidden="true">{label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
