// Buggle, the Buggle Learn helper: a small, friendly robot drawn from simple
// shapes in the brand colours. Always decorative (the words beside Buggle say
// everything), and still for anyone who asks their device to reduce motion.

export type Mood = "happy" | "thinking" | "cheer" | "wave" | "sleepy";

const SIZES = { sm: "size-14", md: "size-20", lg: "size-28 sm:size-32" } as const;
const INK = "#17243c";

export function Buggle({ mood = "happy", size = "md", className = "" }: { mood?: Mood; size?: keyof typeof SIZES; className?: string }) {
  const arms = mood === "cheer" ? "up" : mood === "wave" ? "wave" : "down";
  return (
    <svg aria-hidden="true" focusable="false" viewBox="-46 -78 92 112" className={`wv-pop shrink-0 overflow-visible ${SIZES[size]} ${className}`}>
      {mood === "cheer" && (
        <g fill="#f6a0d6">
          <path className="wv-ring" d="M-40 -60l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />
          <path className="wv-ring" style={{ animationDelay: "0.8s" }} d="M38 -52l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#73d4c3" />
        </g>
      )}
      <g className={mood === "sleepy" ? "" : "wv-bob"}>
        {/* antenna */}
        <line x1="0" y1="-46" x2="0" y2="-58" stroke="#5a3fc3" strokeWidth="3" strokeLinecap="round" />
        <circle cy="-62" r="5" fill="#f6a0d6" className={mood === "thinking" ? "wv-ring" : ""} />
        {/* arms */}
        {arms === "down" && (
          <g stroke="#7155d9" strokeWidth="7" strokeLinecap="round" fill="none">
            <path d="M-29 -12Q-40 -2 -36 10" />
            <path d="M29 -12Q40 -2 36 10" />
          </g>
        )}
        {arms === "up" && (
          <g stroke="#7155d9" strokeWidth="7" strokeLinecap="round" fill="none">
            <path className="wv-wave" d="M-29 -30Q-42 -44 -38 -58" />
            <path className="wv-wave" style={{ animationDelay: "0.3s" }} d="M29 -30Q42 -44 38 -58" />
          </g>
        )}
        {arms === "wave" && (
          <g stroke="#7155d9" strokeWidth="7" strokeLinecap="round" fill="none">
            <path d="M-29 -12Q-40 -2 -36 10" />
            <path className="wv-wave" d="M29 -26Q44 -36 42 -54" />
          </g>
        )}
        {/* head and face */}
        <rect x="-30" y="-46" width="60" height="46" rx="16" fill="#7155d9" />
        <rect x="-22" y="-38" width="44" height="28" rx="10" fill="#ffffff" />
        {mood === "sleepy" ? (
          <>
            <path d="M-13 -25h8M5 -25h8" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M-4 -16h8" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
            <text x="30" y="-50" fontSize="13" fontWeight="700" fill="#5a3fc3" className="wv-bob">
              z
            </text>
          </>
        ) : mood === "thinking" ? (
          <>
            <circle cx="-9" cy="-26" r="3.5" fill={INK} />
            <circle cx="9" cy="-26" r="3.5" fill={INK} />
            <path d="M-6 -15h12" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="-9" cy="-25" r="4" fill={INK} />
            <circle cx="9" cy="-25" r="4" fill={INK} />
            <circle cx="-15" cy="-17" r="2.6" fill="#f6a0d6" opacity="0.8" />
            <circle cx="15" cy="-17" r="2.6" fill="#f6a0d6" opacity="0.8" />
            <path d={mood === "cheer" ? "M-8 -17Q0 -8 8 -17Z" : "M-7 -16Q0 -11 7 -16"} stroke={INK} strokeWidth="2.4" fill={mood === "cheer" ? INK : "none"} strokeLinecap="round" />
          </>
        )}
        {/* body */}
        <rect x="-20" y="4" width="40" height="22" rx="9" fill="#d5c9f7" />
        <circle cy="15" r="4" fill="#f6a0d6" />
      </g>
    </svg>
  );
}

/** Buggle with a speech bubble: for empty pages, results and greetings. */
export function BuggleSays({ mood = "happy", size = "sm", children }: { mood?: Mood; size?: keyof typeof SIZES; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Buggle mood={mood} size={size} />
      <div className="wv-pop relative min-w-0 flex-1 rounded-2xl rounded-bl-sm bg-white p-4 leading-relaxed text-ink shadow-sm ring-1 ring-line">{children}</div>
    </div>
  );
}
