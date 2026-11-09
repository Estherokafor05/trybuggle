/**
 * The two diagrams that carry the central distinction of the course.
 * Both sit on the dark green band, so their colours come from the deep tokens.
 */

const NODE = {
  fill: "#07301f",
  stroke: "var(--color-deep-line)",
};

const NODE_ACCENT = {
  fill: "#0a3c27",
  stroke: "var(--color-gold)",
};

const LABEL = {
  fill: "var(--color-deep-ink)",
  fontSize: 11.5,
  fontWeight: 600,
};

const SUB = {
  fill: "var(--color-deep-muted)",
  fontSize: 9.5,
  fontFamily: "var(--font-mono)",
};

const ARROW = {
  stroke: "var(--color-deep-muted)",
  strokeWidth: 1.4,
  fill: "none",
};

/** Track A: the app behaves the same every time; AI sits on the tester's side. */
export function UsingAiDiagram() {
  return (
    <svg
      viewBox="0 0 320 128"
      className="block h-auto w-full"
      role="img"
      aria-label="You and an agent on one side, sending tests into an application that returns the same output for the same input."
    >
      <rect x="4" y="38" width="112" height="52" rx="9" {...NODE_ACCENT} />
      <text x="20" y="60" {...LABEL}>
        You + agent
      </text>
      <text x="20" y="76" {...SUB}>
        the tester&apos;s side
      </text>

      <path d="M116 64 L188 64" {...ARROW} />
      <path d="M196 64 l-9 -4.5 v9 Z" fill="var(--color-deep-muted)" />
      <text x="128" y="56" {...SUB}>
        tests
      </text>

      <rect x="198" y="30" width="118" height="68" rx="9" {...NODE} />
      <text x="214" y="56" {...LABEL}>
        The app
      </text>
      <text x="214" y="72" {...SUB}>
        same input,
      </text>
      <text x="214" y="84" {...SUB}>
        same output
      </text>
    </svg>
  );
}

/** Track B: output varies, so it is graded against an eval set rather than asserted. */
export function TestingAiDiagram() {
  return (
    <svg
      viewBox="0 0 320 128"
      className="block h-auto w-full"
      role="img"
      aria-label="An AI feature producing three different outputs for the same input, graded against an eval set rather than asserted."
    >
      <rect x="4" y="30" width="112" height="68" rx="9" {...NODE} />
      <text x="20" y="56" {...LABEL}>
        The AI feature
      </text>
      <text x="20" y="72" {...SUB}>
        same input,
      </text>
      <text x="20" y="84" {...SUB}>
        different output
      </text>

      <path d="M116 52 L188 42" {...ARROW} />
      <path d="M116 64 L188 64" {...ARROW} />
      <path d="M116 76 L188 86" {...ARROW} />
      <path d="M196 64 l-9 -4.5 v9 Z" fill="var(--color-deep-muted)" />

      <rect x="198" y="38" width="118" height="52" rx="9" {...NODE_ACCENT} />
      <text x="214" y="60" {...LABEL}>
        Eval set
      </text>
      <text x="214" y="76" {...SUB}>
        graded, not asserted
      </text>
    </svg>
  );
}
