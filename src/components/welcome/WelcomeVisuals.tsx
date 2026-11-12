import Image from "next/image";
import type { ReactNode } from "react";

// Original illustrations for each part of the narrated welcome. Brand colours
// only. Items listed in a scene appear as the narration mentions them.

const C = {
  navy: "#17243c",
  brand: "#7155d9",
  brandSoft: "#d5c9f7",
  lavender: "#eae5fa",
  peach: "#ffe1c3",
  orange: "#f4a65d",
  blush: "#f9d6ee",
  pink: "#f6a0d6",
  mint: "#d8f4ec",
  teal: "#087f72",
  tealLight: "#73d4c3",
  white: "#ffffff",
  ivory: "#f7f5ef",
};

const SKIN = ["#8d5a3b", "#e8b48f", "#c68863", "#5a3825", "#f1c9a5"];
const HAIR = ["#21160f", "#4a2e1b", "#17243c", "#8a5a2b", "#2b1d14"];

function Pop({
  show = true,
  delay = 0,
  children,
}: {
  show?: boolean;
  delay?: number;
  children: ReactNode;
}) {
  if (!show) return null;
  return (
    <g className="wv-pop" style={{ animationDelay: `${delay}s` }}>
      {children}
    </g>
  );
}

function Person({
  x,
  y,
  s = 1,
  skin = SKIN[0],
  hair = HAIR[0],
  shirt = C.teal,
  long = false,
  children,
}: {
  x: number;
  y: number;
  s?: number;
  skin?: string;
  hair?: string;
  shirt?: string;
  long?: boolean;
  children?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {long && (
        <path d="M-20 -46Q-24 -10 -16 -4H16Q24 -10 20 -46Z" fill={hair} />
      )}
      <path d="M-27 2Q-27 -23 0 -23Q27 -23 27 2V26H-27Z" fill={shirt} />
      <circle cy="-42" r="17" fill={skin} />
      <path
        d="M-18 -42Q-19 -63 0 -63Q19 -63 18 -42Q13 -54 0 -53Q-13 -54 -18 -42Z"
        fill={hair}
      />
      <circle cx="-6" cy="-41" r="1.9" fill={C.navy} />
      <circle cx="6" cy="-41" r="1.9" fill={C.navy} />
      <path
        d="M-5 -34Q0 -30 5 -34"
        stroke={C.navy}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {children}
    </g>
  );
}

function Svg({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 320"
      role="img"
      aria-label={label}
      className="h-auto w-full"
    >
      {children}
    </svg>
  );
}

function Backdrop() {
  return (
    <>
      <circle cx="200" cy="165" r="140" fill={C.lavender} opacity=".55" />
      <circle
        cx="200"
        cy="165"
        r="150"
        fill="none"
        stroke={C.navy}
        strokeOpacity=".12"
      />
    </>
  );
}

function Card({
  x,
  y,
  w,
  h,
  fill = C.white,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  children?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="3" y="5" width={w} height={h} rx="14" fill={C.navy} opacity=".12" />
      <rect
        width={w}
        height={h}
        rx="14"
        fill={fill}
        stroke={C.navy}
        strokeWidth="2.5"
      />
      {children}
    </g>
  );
}

function Hello() {
  return (
    <Svg label="The Buggle Learn logo, a book opening.">
      <Backdrop />
      {[0, 1.2].map((d) => (
        <circle key={d} className="wv-ring" style={{ animationDelay: `${d + 0.8}s`, animationDuration: "3s" }} cx="200" cy="140" r="80" fill="none" stroke={C.brand} strokeWidth="3" />
      ))}
      <g className="wv-pop">
        <rect x="120" y="60" width="160" height="160" rx="52" fill={C.navy} />
      </g>
      <g className="wv-open-left" style={{ animationDelay: ".35s" }}>
        <path d="M156 106c16.9-4 30.2 0 44.4 9.3v53.3c-14.2-9.3-27.5-13.3-44.4-9.3V106Z" fill={C.brandSoft} />
      </g>
      <g className="wv-open-right" style={{ animationDelay: ".35s" }}>
        <path d="M244 106c-16.9-4-30.2 0-44.4 9.3v53.3c14.2-9.3 27.5-13.3 44.4-9.3V106Z" fill={C.pink} />
      </g>
      <Pop delay={0.9}>
        <path d="M200 115.3v53.3" stroke={C.navy} strokeWidth="5" strokeLinecap="round" />
      </Pop>
      {[
        [110, 70, 1.1, C.orange],
        [298, 92, 1.3, C.tealLight],
        [292, 206, 1.5, C.pink],
        [104, 190, 1.7, C.brand],
      ].map(([x, y, d, f]) => (
        <Pop key={String(d)} delay={Number(d)}>
          <path
            transform={`translate(${x} ${y})`}
            d="M0 -12L3 -3L12 0L3 3L0 12L-3 3L-12 0L-3 -3Z"
            fill={String(f)}
            stroke={C.navy}
            strokeWidth="1.5"
          />
        </Pop>
      ))}
      <Pop delay={1.1}>
        <text x="200" y="282" textAnchor="middle" fontSize="34" fontWeight="700" fill={C.navy} fontFamily="var(--font-display)" letterSpacing="-0.5">
          Buggle Learn
        </text>
      </Pop>
    </Svg>
  );
}

function Heard({ shown }: { shown: boolean[] }) {
  return (
    <Svg label="AI at the centre of work, the news and chat apps.">
      <Backdrop />
      {[
        [110, 95, shown[0]],
        [290, 85, shown[1]],
        [320, 235, shown[2]],
      ].map(([x, y, on], i) =>
        on ? (
          <path
            key={i}
            className="wv-draw"
            d={`M200 165L${x} ${y}`}
            stroke={C.brand}
            strokeWidth="3"
            strokeDasharray="6 8"
            fill="none"
          />
        ) : null,
      )}
      {[0, 0.8, 1.6].map((d) => (
        <circle
          key={d}
          className="wv-ring"
          style={{ animationDelay: `${d}s` }}
          cx="200"
          cy="165"
          r="46"
          fill="none"
          stroke={C.brand}
          strokeWidth="3"
        />
      ))}
      <circle cx="200" cy="165" r="46" fill={C.brand} />
      <text
        x="200"
        y="177"
        textAnchor="middle"
        fontSize="34"
        fontWeight="700"
        fill={C.white}
        fontFamily="var(--font-display)"
      >
        AI
      </text>
      <Pop show={shown[0]}>
        <g className="wv-bob">
          <Card x={40} y={190} w={120} h={76}>
            <rect x="12" y="12" width="56" height="8" rx="4" fill={C.brandSoft} />
            <rect x="12" y="28" width="96" height="6" rx="3" fill={C.lavender} />
            <rect x="12" y="40" width="80" height="6" rx="3" fill={C.lavender} />
            <rect x="12" y="52" width="40" height="12" rx="6" fill={C.tealLight} />
          </Card>
          <path d="M28 272H172L160 284H40Z" fill={C.navy} />
        </g>
      </Pop>
      <Pop show={shown[1]}>
        <g className="wv-bob" style={{ animationDelay: ".6s" }}>
          <path d="M290 30L305 44M330 30L315 44" stroke={C.navy} strokeWidth="3" strokeLinecap="round" />
          <Card x={245} y={44} w={130} h={84}>
            <rect x="10" y="10" width="110" height="64" rx="8" fill={C.peach} />
            <rect x="18" y="18" width="34" height="13" rx="4" fill="#e5484d" />
            <text x="35" y="28.5" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.white}>
              LIVE
            </text>
            <text x="20" y="52" fontSize="15" fontWeight="700" fill={C.navy} fontFamily="var(--font-display)">
              AI in the news
            </text>
            <rect x="20" y="60" width="70" height="5" rx="2.5" fill={C.orange} />
          </Card>
        </g>
      </Pop>
      <Pop show={shown[2]}>
        <g className="wv-bob" style={{ animationDelay: "1.2s" }}>
          <Card x={300} y={160} w={70} h={128} fill={C.navy}>
            <rect x="7" y="12" width="56" height="102" rx="7" fill={C.white} />
            <rect x="13" y="22" width="38" height="14" rx="7" fill={C.brandSoft} />
            <rect x="21" y="42" width="36" height="14" rx="7" fill={C.tealLight} />
            <rect x="13" y="62" width="42" height="24" rx="7" fill={C.brandSoft} />
            <circle cx="22" cy="100" r="2.5" fill={C.brand} />
            <circle cx="31" cy="100" r="2.5" fill={C.brand} />
            <circle cx="40" cy="100" r="2.5" fill={C.brand} />
          </Card>
        </g>
      </Pop>
    </Svg>
  );
}

function Where() {
  const cards = [
    [40, 40, -12, 0],
    [150, 20, 8, 0.15],
    [270, 46, -6, 0.3],
    [70, 130, 10, 0.45],
    [290, 140, 14, 0.6],
    [20, 220, -4, 0.75],
    [300, 235, -10, 0.9],
    [180, 70, -16, 1.05],
  ];
  return (
    <Svg label="A learner surrounded by a pile of information cards, wondering where to start.">
      <Backdrop />
      {cards.map(([x, y, r, d], i) => (
        <g
          key={i}
          className="wv-drift"
          style={
            {
              animationDelay: `${d}s`,
              "--r": `${r}deg`,
              "--dx": `${(i % 2 ? 1 : -1) * 20}px`,
            } as React.CSSProperties
          }
        >
          <Card x={x} y={y} w={86} h={56} fill={[C.white, C.peach, C.mint, C.blush][i % 4]}>
            <rect x="10" y="12" width="44" height="7" rx="3.5" fill={C.navy} opacity=".7" />
            <rect x="10" y="26" width="64" height="5" rx="2.5" fill={C.navy} opacity=".2" />
            <rect x="10" y="36" width="52" height="5" rx="2.5" fill={C.navy} opacity=".2" />
          </Card>
        </g>
      ))}
      <Person x={200} y={268} s={1.25} skin={SKIN[0]} hair={HAIR[0]} shirt={C.pink} long />
      <Pop delay={1.3}>
        <g className="wv-bob">
          <circle cx="248" cy="160" r="26" fill={C.white} stroke={C.navy} strokeWidth="2.5" />
          <circle cx="226" cy="190" r="6" fill={C.white} stroke={C.navy} strokeWidth="2" />
          <text x="248" y="172" textAnchor="middle" fontSize="34" fontWeight="700" fill={C.brand} fontFamily="var(--font-display)">
            ?
          </text>
        </g>
      </Pop>
    </Svg>
  );
}

function Why({ shown }: { shown: boolean[] }) {
  const crowd = [
    [70, 280, 1, 2, C.orange, true],
    [130, 270, 2, 1, C.brand, false],
    [270, 270, 4, 3, C.pink, true],
    [330, 280, 3, 0, C.tealLight, false],
    [100, 200, 1, 4, C.mint, false],
    [300, 200, 0, 1, C.peach, true],
  ] as const;
  return (
    <Svg label="An idea that starts with one tech worker and opens up to everyone.">
      <Backdrop />
      <g className="wv-bob">
        <circle cx="200" cy="80" r="34" fill={C.peach} stroke={C.navy} strokeWidth="2.5" />
        <path d="M188 112H212V124H188Z" fill={C.navy} />
        <path d="M200 60V92M188 76L200 92L212 76" stroke={C.orange} strokeWidth="4" fill="none" strokeLinecap="round" />
        {[0, 45, 90, 135, 180].map((a) => (
          <path
            key={a}
            d="M200 30V18"
            transform={`rotate(${a - 90} 200 80)`}
            stroke={C.orange}
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </g>
      <Person x={200} y={250} s={1.15} skin={SKIN[1]} hair={HAIR[3]} shirt={C.navy}>
        <rect x="-22" y="0" width="44" height="26" rx="4" fill={C.brandSoft} stroke={C.white} strokeWidth="2" />
        <text x="0" y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.navy}>
          {"</>"}
        </text>
      </Person>
      {shown[0] &&
        crowd.map(([x, y, sk, hr, shirt, long], i) => (
          <Pop key={i} delay={i * 0.12}>
            <Person x={x} y={y} s={0.95} skin={SKIN[sk]} hair={HAIR[hr]} shirt={shirt} long={long} />
          </Pop>
        ))}
    </Svg>
  );
}

function ForYou({ shown }: { shown: boolean[] }) {
  return (
    <Svg label="A teacher, a nurse, a student, a business owner and a curious learner.">
      <Backdrop />
      <Pop show={shown[0]}>
        <rect x="20" y="40" width="96" height="64" rx="6" fill={C.teal} stroke={C.navy} strokeWidth="2.5" />
        <text x="68" y="80" textAnchor="middle" fontSize="20" fontWeight="700" fill={C.white} fontFamily="var(--font-display)">
          A B C
        </text>
        <Person x={68} y={150} skin={SKIN[0]} hair={HAIR[0]} shirt={C.orange} long />
      </Pop>
      <Pop show={shown[1]}>
        <Person x={200} y={112} skin={SKIN[1]} hair={HAIR[3]} shirt={C.tealLight}>
          <rect x="-16" y="-68" width="32" height="12" rx="3" fill={C.white} stroke={C.navy} strokeWidth="1.5" />
          <path d="M0 -66V-58M-4 -62H4" stroke="#e5484d" strokeWidth="2.5" />
          <path d="M-14 -16Q-16 6 -4 8" stroke={C.navy} strokeWidth="2" fill="none" />
          <circle cx="-4" cy="10" r="4" fill={C.navy} />
        </Person>
      </Pop>
      <Pop show={shown[2]}>
        <Person x={332} y={150} skin={SKIN[2]} hair={HAIR[1]} shirt={C.brand}>
          <path d="M-22 -60L0 -70L22 -60L0 -50Z" fill={C.navy} />
          <path d="M16 -58V-46" stroke={C.orange} strokeWidth="2" />
          <rect x="-12" y="2" width="24" height="18" rx="2" fill={C.peach} stroke={C.navy} strokeWidth="1.5" />
        </Person>
      </Pop>
      <Pop show={shown[3]}>
        <path d="M70 212H190L180 232H80Z" fill={C.pink} stroke={C.navy} strokeWidth="2" />
        <path d="M90 212V232M110 212V232M130 212V232M150 212V232M170 212V232" stroke={C.white} strokeWidth="5" />
        <Person x={130} y={290} skin={SKIN[3]} hair={HAIR[2]} shirt={C.navy}>
          <rect x="16" y="-2" width="20" height="16" rx="3" fill={C.orange} stroke={C.navy} strokeWidth="1.5" />
        </Person>
      </Pop>
      <Pop show={shown[4]}>
        <Person x={280} y={290} skin={SKIN[4]} hair={HAIR[4]} shirt={C.mint} long>
          <g className="wv-bob">
            <circle cx="34" cy="-50" r="14" fill={C.white} fillOpacity=".7" stroke={C.navy} strokeWidth="4" />
            <path d="M24 -40L12 -22" stroke={C.navy} strokeWidth="5" strokeLinecap="round" />
          </g>
        </Person>
      </Pop>
    </Svg>
  );
}

function Basics({ shown }: { shown: boolean[] }) {
  const icons: ReactNode[] = [
    <text key="q" x="40" y="58" textAnchor="middle" fontSize="44" fontWeight="700" fill={C.brand} fontFamily="var(--font-display)">
      ?
    </text>,
    <g key="g" transform="translate(40 42)">
      <g className="wv-bob">
        <circle r="16" fill="none" stroke={C.teal} strokeWidth="7" strokeDasharray="6 4.5" />
        <circle r="7" fill={C.teal} />
      </g>
    </g>,
    <g key="p" transform="translate(40 40)">
      <path d="M0 22Q-18 2 -18 -6A18 18 0 0 1 18 -6Q18 2 0 22Z" fill="#e5484d" />
      <circle cy="-6" r="7" fill={C.white} />
    </g>,
    <g key="s" transform="translate(40 40)">
      <path d="M0 -22L18 -15V0Q18 14 0 22Q-18 14 -18 0V-15Z" fill={C.tealLight} stroke={C.navy} strokeWidth="2" />
      <path d="M-8 0L-2 6L9 -6" stroke={C.navy} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>,
  ];
  const fills = [C.lavender, C.mint, C.blush, C.peach];
  const labels = ["What is it?", "How does it work?", "Where is it?", "Use it well"];
  return (
    <Svg label="Four question cards: what AI is, how it works, where it appears and how to use it well.">
      <Backdrop />
      {[0, 1, 2, 3].map((i) => (
        <Pop key={i} show={shown[i]}>
          <Card x={i % 2 ? 210 : 40} y={i < 2 ? 40 : 172} w={150} h={112} fill={fills[i]}>
            <g transform="translate(35 0)">{icons[i]}</g>
            <text x="75" y="96" textAnchor="middle" fontSize="15" fontWeight="700" fill={C.navy} fontFamily="var(--font-display)">
              {labels[i]}
            </text>
            <circle cx="18" cy="18" r="11" fill={C.navy} />
            <text x="18" y="22.5" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.white}>
              {i + 1}
            </text>
          </Card>
        </Pop>
      ))}
    </Svg>
  );
}

function How({ shown }: { shown: boolean[] }) {
  const options = shown[3];
  if (options)
    return (
      <Svg label="The two ways to learn: Watch and Listen with narrated films, or Read and Explore with interactive guides.">
        <Backdrop />
        <Pop>
          <Card x={14} y={40} w={180} h={220}>
            <clipPath id="wv-film">
              <rect x="10" y="10" width="160" height="100" rx="10" />
            </clipPath>
            <image href="/lessons/maya-day/poster.jpg" x="10" y="10" width="160" height="100" preserveAspectRatio="xMidYMid slice" clipPath="url(#wv-film)" />
            <circle cx="90" cy="60" r="20" fill={C.navy} opacity=".85" />
            <path d="M84 50V70L100 60Z" fill={C.white} />
            <rect x="10" y="118" width="160" height="5" rx="2.5" fill={C.lavender} />
            <rect className="wv-open-right" style={{ animationDuration: "4s" }} x="10" y="118" width="90" height="5" rx="2.5" fill={C.brand} />
            <rect x="18" y="134" width="144" height="26" rx="8" fill={C.navy} />
            <rect x="28" y="144" width="96" height="6" rx="3" fill={C.white} opacity=".7" />
            <text x="90" y="184" textAnchor="middle" fontSize="18" fontWeight="700" fill={C.navy} fontFamily="var(--font-display)">
              Watch &amp; Listen
            </text>
            <text x="90" y="204" textAnchor="middle" fontSize="12" fill={C.navy} opacity=".7">
              Narrated films
            </text>
          </Card>
        </Pop>
        <Pop show={shown[4]}>
          <Card x={206} y={40} w={180} h={220}>
            <rect x="10" y="10" width="160" height="100" rx="10" fill={C.mint} />
            <text x="22" y="34" fontSize="11" fontWeight="700" fill={C.teal}>
              TRY IT
            </text>
            <text x="22" y="52" fontSize="13" fontWeight="700" fill={C.navy}>
              Is this AI?
            </text>
            <rect className="wv-pop" style={{ animationDelay: ".6s" }} x="22" y="64" width="62" height="30" rx="15" fill={C.white} stroke={C.teal} strokeWidth="2.5" />
            <text x="53" y="83.5" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.teal}>
              Yes ✓
            </text>
            <rect x="94" y="64" width="62" height="30" rx="15" fill={C.white} stroke={C.navy} strokeOpacity=".3" strokeWidth="2" />
            <text x="125" y="83.5" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.navy} opacity=".6">
              No
            </text>
            <rect x="18" y="126" width="120" height="7" rx="3.5" fill={C.navy} opacity=".55" />
            <rect x="18" y="141" width="144" height="5" rx="2.5" fill={C.navy} opacity=".2" />
            <rect x="18" y="152" width="110" height="5" rx="2.5" fill={C.navy} opacity=".2" />
            <text x="90" y="184" textAnchor="middle" fontSize="18" fontWeight="700" fill={C.navy} fontFamily="var(--font-display)">
              Read &amp; Explore
            </text>
            <text x="90" y="204" textAnchor="middle" fontSize="12" fill={C.navy} opacity=".7">
              Interactive guides
            </text>
          </Card>
        </Pop>
      </Svg>
    );
  return (
    <Svg label="Animated stories, real-life situations and simple activities.">
      <Backdrop />
      <Pop show={shown[0]}>
        <g className="wv-bob">
          <Card x={30} y={60} w={150} h={110} fill={C.navy}>
            <circle cx="75" cy="50" r="24" fill={C.brand} />
            <path d="M68 38V62L88 50Z" fill={C.white} />
            <rect x="12" y="88" width="126" height="6" rx="3" fill={C.white} opacity=".3" />
            <rect x="12" y="88" width="56" height="6" rx="3" fill={C.tealLight} />
          </Card>
        </g>
      </Pop>
      <Pop show={shown[1]}>
        <g className="wv-bob" style={{ animationDelay: ".5s" }}>
          <Card x={220} y={40} w={150} h={120} fill={C.peach}>
            <path d="M24 96V58L54 36L84 58V96Z" fill={C.white} stroke={C.navy} strokeWidth="2" />
            <rect x="46" y="70" width="16" height="26" fill={C.teal} />
            <Person x={116} y={100} s={0.7} skin={SKIN[2]} hair={HAIR[0]} shirt={C.brand} long />
          </Card>
        </g>
      </Pop>
      <Pop show={shown[2]}>
        <g className="wv-bob" style={{ animationDelay: "1s" }}>
          <Card x={120} y={190} w={160} h={100} fill={C.mint}>
            {[0, 1, 2].map((r) => (
              <g key={r} transform={`translate(18 ${18 + r * 24})`}>
                <rect width="16" height="16" rx="4" fill={C.white} stroke={C.navy} strokeWidth="2" />
                {r < 2 && <path d="M4 8L7 11L12 5" stroke={C.teal} strokeWidth="2.5" fill="none" />}
                <rect x="26" y="5" width={90 - r * 16} height="6" rx="3" fill={C.navy} opacity=".35" />
              </g>
            ))}
          </Card>
        </g>
      </Pop>
    </Svg>
  );
}

function Pace() {
  return (
    <Svg label="A learner walking at their own pace along a winding path, with a clock and a go-back arrow.">
      <Backdrop />
      <path
        className="wv-draw"
        d="M30 260Q110 200 180 240T370 200"
        stroke={C.white}
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
      />
      {[60, 130, 200, 270, 340].map((x, i) => (
        <Pop key={x} delay={0.3 + i * 0.25}>
          <circle cx={x} cy={[245, 222, 238, 226, 205][i]} r="7" fill={C.brand} />
        </Pop>
      ))}
      <g className="wv-walk" style={{ "--walk": "190px" } as React.CSSProperties}>
        <Person x={70} y={210} s={0.95} skin={SKIN[0]} hair={HAIR[0]} shirt={C.teal} long />
      </g>
      <g transform="translate(110 90)">
        <circle r="44" fill={C.white} stroke={C.navy} strokeWidth="3" />
        <path d="M0 0V-28" stroke={C.navy} strokeWidth="4" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite" />
        </path>
        <path d="M0 0H20" stroke={C.brand} strokeWidth="4" strokeLinecap="round" />
        <circle r="4" fill={C.navy} />
      </g>
      <Pop delay={1}>
        <g transform="translate(295 95)" className="wv-bob">
          <circle r="38" fill={C.mint} stroke={C.navy} strokeWidth="2.5" />
          <path d="M16 -14A22 22 0 1 0 20 10" stroke={C.teal} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M8 -22L18 -14L8 -4" stroke={C.teal} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </Pop>
    </Svg>
  );
}

function ByTheEnd({ shown }: { shown: boolean[] }) {
  const steps = [
    [50, 220, 70, C.lavender],
    [150, 170, 120, C.mint],
    [250, 120, 170, C.peach],
  ] as const;
  const all = shown.every(Boolean);
  return (
    <Svg label="Three rising steps of confidence, with a learner reaching the top.">
      <Backdrop />
      {steps.map(([x, y, h, fill], i) =>
        shown[i] ? (
          <g key={i}>
            <rect className="wv-grow" x={x} y={y} width="100" height={h} rx="10" fill={fill} stroke={C.navy} strokeWidth="2.5" />
            <Pop delay={0.6}>
              <circle cx={x + 50} cy={y + 30} r="16" fill={C.teal} />
              <path d={`M${x + 42} ${y + 30}l6 6l11 -12`} stroke={C.white} strokeWidth="4" fill="none" strokeLinecap="round" />
            </Pop>
          </g>
        ) : null,
      )}
      {shown.map((on, i) =>
        on && (i === shown.lastIndexOf(true)) ? (
          <g key={`p${i}`} className="wv-pop" style={{ animationDelay: ".4s" }}>
            <Person x={steps[i][0] + 50} y={steps[i][1] - 26} s={0.85} skin={SKIN[2]} hair={HAIR[0]} shirt={C.brand} long />
          </g>
        ) : null,
      )}
      {all && (
        <Pop delay={1}>
          <path d="M340 30V112" stroke={C.navy} strokeWidth="4" strokeLinecap="round" />
          <path d="M342 32H380L370 46L380 60H342Z" fill={C.orange} stroke={C.navy} strokeWidth="2" />
        </Pop>
      )}
    </Svg>
  );
}

function Ready() {
  return (
    <Svg label="A paper plane ready to take off.">
      <Backdrop />
      {[0, 0.8, 1.6].map((d) => (
        <circle key={d} className="wv-ring" style={{ animationDelay: `${d}s` }} cx="200" cy="165" r="70" fill="none" stroke={C.brand} strokeWidth="3" />
      ))}
      <path className="wv-draw" d="M40 280Q120 250 160 200" stroke={C.navy} strokeOpacity=".35" strokeWidth="3" strokeDasharray="8 8" fill="none" />
      <g className="wv-bob">
        <path d="M130 200L290 110L230 240L200 190Z" fill={C.white} stroke={C.navy} strokeWidth="3" strokeLinejoin="round" />
        <path d="M200 190L290 110L210 230Z" fill={C.brandSoft} stroke={C.navy} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <Pop delay={0.6}>
        <text x="200" y="300" textAnchor="middle" fontSize="22" fontWeight="700" fill={C.navy} fontFamily="var(--font-display)">
          Let&apos;s go!
        </text>
      </Pop>
    </Svg>
  );
}

function Question() {
  return (
    <div className="relative px-2">
      <div className="welcome-rise overflow-hidden rounded-[1.5rem] border-[3px] border-navy bg-white shadow-[6px_8px_0_rgba(23,36,60,0.15)]">
        <Image
          src="/lessons/what-is-ai/poster.jpg"
          alt="A still from Lesson 1, What is AI?, showing Maya."
          width={1280}
          height={720}
          sizes="(min-width: 768px) 38vw, 80vw"
          className="h-auto w-full"
        />
        <p className="flex items-center justify-between gap-3 px-4 py-3 font-display text-sm font-bold text-navy">
          Lesson 1: What is AI?
          <span className="rounded-full bg-mint px-2.5 py-1 text-xs">Up next</span>
        </p>
      </div>
      <svg viewBox="0 0 60 60" aria-hidden="true" className="absolute -right-1 -top-5 w-[22%]">
        <g className="wv-pop" style={{ animationDelay: ".5s" }}>
          <g className="wv-bob">
            <circle cx="30" cy="30" r="26" fill={C.brand} stroke={C.navy} strokeWidth="2.5" />
            <text x="30" y="42" textAnchor="middle" fontSize="34" fontWeight="700" fill={C.white} fontFamily="var(--font-display)">
              ?
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function WelcomeVisual({
  sceneId,
  shown,
}: {
  sceneId: string;
  shown: boolean[];
}) {
  switch (sceneId) {
    case "heard":
      return <Heard shown={shown} />;
    case "where":
      return <Where />;
    case "why":
      return <Why shown={shown} />;
    case "for-you":
      return <ForYou shown={shown} />;
    case "basics":
      return <Basics shown={shown} />;
    case "how":
      return <How shown={shown} />;
    case "pace":
      return <Pace />;
    case "by-the-end":
      return <ByTheEnd shown={shown} />;
    case "ready":
      return <Ready />;
    case "question":
      return <Question />;
    default:
      return <Hello />;
  }
}
