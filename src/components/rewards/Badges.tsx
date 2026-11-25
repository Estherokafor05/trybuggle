// A learner's badges: earned ones in colour, the rest greyed with how to get them.
import type { Badge } from "@/server/rewards";

export function Badges({ badges, compact = false }: { badges: Badge[]; compact?: boolean }) {
  const shown = compact ? badges.filter((b) => b.earned) : badges;
  if (compact && !shown.length) return <p className="text-sm text-muted">No badges yet. Pass a check or ask a question to earn your first.</p>;
  return (
    <ul className={`grid gap-2 ${compact ? "grid-cols-4 sm:grid-cols-8" : "grid-cols-2 sm:grid-cols-4"}`}>
      {shown.map((b) => (
        <li
          key={b.id}
          className={`flex flex-col items-center rounded-2xl p-3 text-center ${b.earned ? "bg-lavender" : "border-2 border-dashed border-line bg-white"}`}
          title={compact ? `${b.name}: ${b.how}` : undefined}
        >
          <span aria-hidden="true" className={`text-3xl ${b.earned ? "motion-safe:animate-[badge-pop_0.5s_ease-out]" : "opacity-40 grayscale"}`}>
            {b.emoji}
          </span>
          <span className={`mt-1 text-sm font-semibold ${b.earned ? "text-navy" : "text-muted"} ${compact ? "sr-only" : ""}`}>
            {b.name}
            <span className="sr-only">{b.earned ? " (earned)" : " (not yet)"}</span>
          </span>
          {!compact && <span className="mt-0.5 text-xs leading-snug text-muted">{b.how}</span>}
        </li>
      ))}
    </ul>
  );
}
