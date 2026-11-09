/**
 * The acceptance-criteria agent, drawn as a flow.
 * The dashed return line is the point of the diagram: what you cut during
 * review is what sharpens the next prompt.
 */
export function AgentFlow() {
  return (
    <figure className="m-0 rounded-[14px] border border-line bg-surface p-5">
      <svg
        viewBox="0 0 360 268"
        className="block h-auto w-full max-w-full"
        role="img"
        aria-label="Flow diagram: a ticket with acceptance criteria goes to your agent, which flags ambiguity and drafts cases; you review, keeping, cutting and rewriting, before cases reach your test suite. A dashed line returns from the review step, showing that what you cut shapes the next prompt."
      >
        <rect
          x="8"
          y="6"
          width="150"
          height="40"
          rx="9"
          fill="var(--color-brand-soft)"
          stroke="var(--color-brand)"
        />
        <text x="24" y="24" fill="var(--color-ink)" fontSize="11.5" fontWeight="600">
          Ticket + AC
        </text>
        <text x="24" y="38" fill="var(--color-muted)" fontSize="9.5" fontFamily="var(--font-mono)">
          from Jira / Linear
        </text>

        <path d="M83 46 L83 72" stroke="var(--color-muted)" strokeWidth="1.4" fill="none" />
        <path d="M83 80 l-4.5 -9 h9 Z" fill="var(--color-muted)" />

        <rect
          x="8"
          y="82"
          width="344"
          height="58"
          rx="9"
          fill="var(--color-surface)"
          stroke="var(--color-line)"
        />
        <text x="24" y="104" fill="var(--color-ink)" fontSize="11.5" fontWeight="600">
          Your agent
        </text>
        <text x="24" y="121" fill="var(--color-muted)" fontSize="9.5" fontFamily="var(--font-mono)">
          reads the criteria · flags what is ambiguous · drafts cases
        </text>

        <path d="M83 140 L83 166" stroke="var(--color-muted)" strokeWidth="1.4" fill="none" />
        <path d="M83 174 l-4.5 -9 h9 Z" fill="var(--color-muted)" />

        <rect
          x="8"
          y="176"
          width="150"
          height="40"
          rx="9"
          fill="var(--color-brand-soft)"
          stroke="var(--color-brand)"
        />
        <text x="24" y="194" fill="var(--color-ink)" fontSize="11.5" fontWeight="600">
          You review
        </text>
        <text x="24" y="208" fill="var(--color-muted)" fontSize="9.5" fontFamily="var(--font-mono)">
          keep · cut · rewrite
        </text>

        <path d="M158 196 L252 196" stroke="var(--color-muted)" strokeWidth="1.4" fill="none" />
        <path d="M260 196 l-9 -4.5 v9 Z" fill="var(--color-muted)" />

        <rect
          x="262"
          y="176"
          width="90"
          height="40"
          rx="9"
          fill="var(--color-surface)"
          stroke="var(--color-line)"
        />
        <text x="276" y="194" fill="var(--color-ink)" fontSize="11.5" fontWeight="600">
          Test suite
        </text>
        <text x="276" y="208" fill="var(--color-muted)" fontSize="9.5" fontFamily="var(--font-mono)">
          yours
        </text>

        <path
          d="M196 216 L196 240 L83 240 L83 222"
          stroke="var(--color-gold)"
          strokeWidth="1.4"
          strokeDasharray="4 4"
          fill="none"
        />
        <path d="M83 214 l-4.5 9 h9 Z" fill="var(--color-gold)" />
        <text x="200" y="254" fill="var(--color-muted)" fontSize="9.5" fontFamily="var(--font-mono)">
          what you cut teaches the next prompt
        </text>
      </svg>
      <figcaption className="mt-3 font-mono text-[0.71rem] uppercase tracking-[0.06em] text-muted">
        Module 4 · acceptance criteria agent
      </figcaption>
    </figure>
  );
}
