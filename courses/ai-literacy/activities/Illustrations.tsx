export function Animal({
  cat = false,
  covered = false,
  novel = false,
}: {
  cat?: boolean;
  covered?: boolean;
  novel?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 180"
      role="img"
      aria-label={
        covered
          ? "A cat partly hidden by a box"
          : cat
            ? "A grey cat"
            : novel
              ? "A different dog with a dark patch and teal collar"
              : "A brown dog"
      }
      className="h-full w-full"
    >
      <rect
        width="200"
        height="180"
        rx="18"
        fill={cat ? "#eae5fa" : "#d8f4ec"}
      />
      <ellipse cx="100" cy="155" rx="57" ry="12" fill="#17243c15" />
      <path
        d={
          cat
            ? "M54 75 50 23 85 52M146 75 150 23 115 52"
            : "M53 91Q20 35 57 29L85 60M146 91Q180 35 143 29L115 60"
        }
        fill={cat ? "#9297a5" : "#94634a"}
      />
      <ellipse
        cx="100"
        cy="120"
        rx="49"
        ry="38"
        fill={cat ? "#a9adba" : "#c69565"}
      />
      <ellipse
        cx="100"
        cy="81"
        rx="48"
        ry="43"
        fill={cat ? "#bdc2cd" : "#d9ac79"}
      />
      {novel && (
        <>
          <ellipse cx="121" cy="72" rx="17" ry="23" fill="#94634a" />
          <path
            d="M61 112q39 22 78 0"
            fill="none"
            stroke="#087f72"
            strokeWidth="10"
          />
        </>
      )}
      <circle cx="81" cy="78" r="5" fill="#17243c" />
      <circle cx="120" cy="78" r="5" fill="#17243c" />
      <path d="M92 94q8-8 16 0l-8 7Z" fill="#17243c" />
      <path
        d="M100 100v8m-12-1q12 12 24 0"
        fill="none"
        stroke="#17243c"
        strokeWidth="3"
      />
      {cat && (
        <path
          d="M70 99 37 92m33 15-33 4m93-12 33-7m-33 15 33 4"
          stroke="#17243c"
          strokeWidth="2"
        />
      )}
      {covered && (
        <>
          <rect y="105" width="200" height="75" fill="#bd9e7e" />
          <path d="M0 113h200m-200 30h200" stroke="#92775c" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}
export function TaskIcon({
  kind,
}: {
  kind: "speech" | "draft" | "predict" | "timer" | "bag" | "mail" | "photo";
}) {
  return (
    <svg viewBox="0 0 160 140" className="h-24 w-28" aria-hidden="true">
      {kind === "timer" ? (
        <>
          <circle
            cx="80"
            cy="74"
            r="51"
            fill="#d8f4ec"
            stroke="#17243c"
            strokeWidth="5"
          />
          <path
            d="M80 42v35l24 15M60 12h40"
            stroke="#17243c"
            strokeWidth="7"
            fill="none"
          />
        </>
      ) : kind === "bag" ? (
        <>
          <path
            d="M50 43V26q30-24 60 0v17"
            stroke="#17243c"
            strokeWidth="6"
            fill="none"
          />
          <rect x="24" y="40" width="112" height="88" rx="18" fill="#7155d9" />
          <rect x="48" y="72" width="64" height="42" rx="10" fill="#eae5fa" />
          <path d="M25 63h109" stroke="#17243c" strokeWidth="5" />
        </>
      ) : kind === "speech" ? (
        <>
          <rect x="15" y="22" width="130" height="87" rx="25" fill="#d8f4ec" />
          <path d="m40 103-6 26 34-24" fill="#d8f4ec" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect
              key={i}
              x={38 + i * 13}
              y={45 + (i % 3) * 6}
              width="6"
              height={46 - (i % 3) * 12}
              rx="3"
              fill="#087f72"
            />
          ))}
        </>
      ) : kind === "mail" ? (
        <>
          <rect
            x="15"
            y="30"
            width="130"
            height="85"
            rx="10"
            fill="#eae5fa"
            stroke="#17243c"
            strokeWidth="4"
          />
          <path
            d="m20 36 60 43 60-43"
            fill="none"
            stroke="#7155d9"
            strokeWidth="5"
          />
        </>
      ) : kind === "photo" ? (
        <>
          <rect x="17" y="15" width="126" height="111" rx="14" fill="#eae5fa" />
          <circle cx="110" cy="44" r="14" fill="#ffd1a8" />
          <path d="m25 110 42-52 25 28 18-21 30 45" fill="#087f72" />
        </>
      ) : kind === "predict" ? (
        <>
          <path
            d="M25 20v100h115"
            stroke="#17243c"
            strokeWidth="5"
            fill="none"
          />
          <path
            d="m30 101 28-26 26 10 20-41 33-20"
            stroke="#087f72"
            strokeWidth="7"
            fill="none"
            strokeDasharray="8 5"
          />
          {[
            [30, 101],
            [58, 75],
            [84, 85],
            [104, 44],
          ].map(([cx, cy]) => (
            <circle key={cx} cx={cx} cy={cy} r="7" fill="#7155d9" />
          ))}
        </>
      ) : (
        <>
          <path
            d="M37 10h66l28 28v92H37Z"
            fill="#fffdf8"
            stroke="#17243c"
            strokeWidth="4"
          />
          <path
            d="M102 10v30h29M53 61h61M53 79h61M53 97h43"
            stroke="#7155d9"
            strokeWidth="5"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
export function RouteMap({
  updated = false,
  route = "",
}: {
  updated?: boolean;
  route?: string;
}) {
  return (
    <svg
      viewBox="0 0 600 330"
      role="img"
      aria-label={`Two routes from home to the centre. Usual route: 30 minutes. Alternative: ${updated ? 35 : 20} minutes.`}
      className="w-full rounded-2xl bg-[#e5eee5]"
    >
      <path
        d="M0 92h600M0 242h600M145 0v330M410 0v330"
        stroke="#c5d6c7"
        strokeWidth="14"
      />
      <path
        d="M65 255 170 255 170 90 520 90"
        stroke={route === "usual" ? "#7155d9" : "#8e6d60"}
        strokeWidth="13"
        fill="none"
      />
      <path
        d="M65 255 320 255 320 175 520 175 520 90"
        stroke={route === "alternative" ? "#7155d9" : "#087f72"}
        strokeWidth="13"
        fill="none"
        strokeDasharray="18 7"
      />
      <circle cx="65" cy="255" r="15" fill="#17243c" />
      <circle cx="520" cy="90" r="15" fill="#17243c" />
      <g fontSize="22" fontFamily="inherit" fontWeight="700" fill="#17243c">
        <text x="30" y="300">
          Home
        </text>
        <text x="425" y="50">
          The centre
        </text>
        <rect x="195" y="50" width="130" height="45" rx="10" fill="white" />
        <text x="210" y="80">
          30 minutes
        </text>
        <rect x="327" y="205" width="137" height="45" rx="10" fill="white" />
        <text x="339" y="235">
          {updated ? 35 : 20} minutes
        </text>
      </g>
      {updated && (
        <g>
          <circle
            cx="445"
            cy="175"
            r="23"
            fill="#ffe1c3"
            stroke="#a13c24"
            strokeWidth="3"
          />
          <text
            x="445"
            y="184"
            textAnchor="middle"
            fontSize="29"
            fontWeight="bold"
            fill="#a13c24"
          >
            !
          </text>
        </g>
      )}
    </svg>
  );
}
