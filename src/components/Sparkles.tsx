// Small floating shapes for the corner of a page's coloured header. Purely
// decorative, kept clear of the text, and still when motion is reduced.
// The header needs "relative overflow-hidden".
export function Sparkles() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 160 120" className="pointer-events-none absolute -right-4 -top-3 w-36 opacity-80 sm:w-44">
      <circle cx="132" cy="22" r="10" fill="#f6a0d6" className="wv-bob" />
      <path className="wv-bob" style={{ animationDelay: "0.6s" }} d="M96 14l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill="#fff" opacity="0.9" />
      <rect x="120" y="58" width="16" height="16" rx="5" fill="#73d4c3" transform="rotate(18 128 66)" className="wv-bob" style={{ animationDelay: "1.2s" }} />
      <path className="wv-bob" style={{ animationDelay: "1.8s" }} d="M70 44q8-10 16 0t16 0" stroke="#7155d9" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="150" cy="96" r="5" fill="#f4a65d" className="wv-bob" style={{ animationDelay: "0.9s" }} />
    </svg>
  );
}
