// Original cartoon scenes for the home page, in the same flat style and brand
// colours as the welcome film. Decorative only: every scene sits next to text
// that says the same thing. Motion is gentle and stops for anyone who has
// asked their device to reduce motion (globals.css).
import type { ReactNode } from "react";

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
};
const SKIN = ["#8d5a3b", "#e8b48f", "#c68863", "#5a3825", "#f1c9a5"];
const HAIR = ["#21160f", "#4a2e1b", "#17243c", "#8a5a2b", "#2b1d14"];

function Scene({ viewBox = "0 0 360 260", children, className = "" }: { viewBox?: string; children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox={viewBox} className={`h-auto w-full ${className}`}>
      {children}
    </svg>
  );
}

const delay = (s: number) => ({ animationDelay: `${s}s` });

/** A friendly person, drawn from simple shapes. */
function Person({
  x,
  y,
  s = 1,
  skin = SKIN[0],
  hair = HAIR[0],
  shirt = C.teal,
  long = false,
  wave = false,
}: {
  x: number;
  y: number;
  s?: number;
  skin?: string;
  hair?: string;
  shirt?: string;
  long?: boolean;
  wave?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {long && <path d="M-20 -46Q-24 -10 -16 -4H16Q24 -10 20 -46Z" fill={hair} />}
      <path d="M-27 2Q-27 -23 0 -23Q27 -23 27 2V30H-27Z" fill={shirt} />
      {wave ? (
        <g className="wv-wave">
          <path d="M22 -12Q38 -26 40 -48" stroke={shirt} strokeWidth="10" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="-52" r="6" fill={skin} />
        </g>
      ) : (
        <path d="M24 -8Q34 6 26 22" stroke={shirt} strokeWidth="10" strokeLinecap="round" fill="none" />
      )}
      <circle cy="-42" r="17" fill={skin} />
      <path d="M-18 -42Q-19 -63 0 -63Q19 -63 18 -42Q13 -54 0 -53Q-13 -54 -18 -42Z" fill={hair} />
      <circle cx="-6" cy="-41" r="1.9" fill={C.navy} />
      <circle cx="6" cy="-41" r="1.9" fill={C.navy} />
      <path d="M-5 -34Q0 -30 5 -34" stroke={C.navy} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Buggle, the friendly AI helper who appears across the home page. */
function Helper({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="wv-bob">
        <line x1="0" y1="-46" x2="0" y2="-58" stroke={C.navy} strokeWidth="3" strokeLinecap="round" />
        <circle cy="-62" r="5" fill={C.pink} />
        <rect x="-30" y="-46" width="60" height="46" rx="16" fill={C.brand} />
        <rect x="-22" y="-38" width="44" height="28" rx="10" fill={C.white} />
        <circle cx="-9" cy="-25" r="4" fill={C.navy} />
        <circle cx="9" cy="-25" r="4" fill={C.navy} />
        <path d="M-7 -16Q0 -11 7 -16" stroke={C.navy} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <rect x="-20" y="4" width="40" height="22" rx="9" fill={C.brandSoft} />
        <circle cy="15" r="4" fill={C.pink} />
      </g>
    </g>
  );
}

function Bubble({ x, y, w, tone, lines = 2, d = 0 }: { x: number; y: number; w: number; tone: string; lines?: number; d?: number }) {
  return (
    <g className="wv-pop" style={delay(d)}>
      <rect x={x} y={y} width={w} height={14 + lines * 10} rx="12" fill={tone} />
      {Array.from({ length: lines }, (_, i) => (
        <rect key={i} x={x + 10} y={y + 10 + i * 10} width={i === lines - 1 ? w * 0.45 : w - 20} height="5" rx="2.5" fill={C.navy} opacity="0.35" />
      ))}
    </g>
  );
}

function Sparkle({ x, y, r = 6, fill = C.orange, d = 0 }: { x: number; y: number; r?: number; fill?: string; d?: number }) {
  return (
    // The position sits on an outer group: the animation's transform would replace it otherwise.
    <g transform={`translate(${x} ${y})`}>
      <path
        className="wv-pop"
        style={delay(d)}
        d={`M0 ${-r}Q${r * 0.2} ${-r * 0.2} ${r} 0Q${r * 0.2} ${r * 0.2} 0 ${r}Q${-r * 0.2} ${r * 0.2} ${-r} 0Q${-r * 0.2} ${-r * 0.2} 0 ${-r}Z`}
        fill={fill}
      />
    </g>
  );
}

/** What we do: a learner chatting with Buggle on a laptop. */
export function WhatWeDoScene() {
  return (
    <Scene>
      <circle cx="180" cy="140" r="108" fill={C.white} opacity="0.7" />
      <circle className="wv-ring" cx="180" cy="140" r="90" fill="none" stroke={C.brand} strokeWidth="2" />
      <rect x="60" y="196" width="240" height="12" rx="6" fill={C.navy} opacity="0.12" />
      {/* laptop */}
      <rect x="112" y="118" width="136" height="80" rx="10" fill={C.navy} />
      <rect x="120" y="126" width="120" height="64" rx="6" fill={C.white} />
      <rect x="98" y="196" width="164" height="10" rx="5" fill={C.navy} />
      <Bubble x={128} y={134} w={70} tone={C.lavender} lines={1} d={0.2} />
      <Bubble x={160} y={156} w={72} tone={C.mint} lines={2} d={0.6} />
      <Person x={70} y={180} s={1} skin={SKIN[0]} hair={HAIR[0]} shirt={C.teal} long wave />
      <Helper x={292} y={176} s={0.95} />
      <Bubble x={238} y={64} w={84} tone={C.peach} lines={2} d={1} />
      <Sparkle x={110} y={70} d={1.2} />
      <Sparkle x={320} y={40} r={5} fill={C.pink} d={1.4} />
    </Scene>
  );
}

/** Our initiative: people from different walks of life sharing one idea. */
export function InitiativeScene() {
  return (
    <Scene>
      <circle cx="180" cy="128" r="104" fill={C.white} opacity="0.6" />
      {/* the idea */}
      <g className="wv-bob" style={delay(0.3)}>
        <circle cx="180" cy="62" r="30" fill={C.peach} />
        <circle cx="180" cy="62" r="20" fill={C.orange} />
        <rect x="170" y="90" width="20" height="12" rx="4" fill={C.navy} />
        <path d="M172 56Q180 44 188 56" stroke={C.white} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {[[-1, -1], [1, -1], [-1.3, 0.1], [1.3, 0.1]].map(([dx, dy], i) => (
        <line key={i} x1={180 + dx * 40} y1={62 + dy * 30} x2={180 + dx * 54} y2={62 + dy * 42} stroke={C.orange} strokeWidth="3" strokeLinecap="round" className="wv-pop" style={delay(0.8 + i * 0.1)} />
      ))}
      <Person x={92} y={206} s={0.95} skin={SKIN[1]} hair={HAIR[3]} shirt={C.brand} long />
      <Person x={180} y={214} s={1.05} skin={SKIN[3]} hair={HAIR[0]} shirt={C.teal} wave />
      <Person x={268} y={206} s={0.95} skin={SKIN[2]} hair={HAIR[2]} shirt={C.pink} />
      <rect x="40" y="232" width="280" height="10" rx="5" fill={C.navy} opacity="0.12" />
      <Sparkle x={60} y={90} d={1.1} fill={C.brand} />
      <Sparkle x={300} y={100} r={5} d={1.3} />
    </Scene>
  );
}

/** How you learn: a path from your account to your certificate. */
export function JourneyScene() {
  const stops = [
    { x: 40, y: 170, fill: C.lavender, label: "1" },
    { x: 130, y: 120, fill: C.peach, label: "2" },
    { x: 220, y: 150, fill: C.mint, label: "3" },
    { x: 310, y: 92, fill: C.blush, label: "4" },
  ];
  return (
    <Scene viewBox="0 0 360 230">
      <path
        className="wv-draw"
        d="M40 170C80 120 100 116 130 120S190 160 220 150 290 96 310 92"
        stroke={C.navy}
        strokeOpacity="0.35"
        strokeWidth="4"
        strokeDasharray="2 10"
        strokeLinecap="round"
        fill="none"
      />
      {stops.map((stop, i) => (
        <g key={stop.label} className="wv-pop" style={delay(0.3 + i * 0.35)}>
          <circle cx={stop.x} cy={stop.y} r="22" fill={stop.fill} stroke={C.navy} strokeWidth="2.5" />
          <text x={stop.x} y={stop.y + 6} textAnchor="middle" fontSize="17" fontWeight="700" fill={C.navy} fontFamily="inherit">
            {stop.label}
          </text>
        </g>
      ))}
      {/* the certificate at the end */}
      <g className="wv-bob" style={delay(1.6)}>
        <rect x="282" y="22" width="56" height="40" rx="6" fill={C.white} stroke={C.brand} strokeWidth="3" />
        <rect x="292" y="32" width="36" height="4" rx="2" fill={C.navy} opacity="0.5" />
        <rect x="296" y="42" width="28" height="4" rx="2" fill={C.navy} opacity="0.3" />
        <circle cx="328" cy="60" r="8" fill={C.orange} />
      </g>
      <Person x={84} y={210} s={0.8} skin={SKIN[4]} hair={HAIR[1]} shirt={C.brand} long wave />
      <Helper x={262} y={214} s={0.7} />
      <Sparkle x={196} y={70} d={2} fill={C.pink} />
    </Scene>
  );
}

/** The free Essentials certificate, ready to share. */
export function CertificateScene() {
  return (
    <Scene viewBox="0 0 360 240">
      <circle cx="180" cy="124" r="100" fill={C.white} opacity="0.65" />
      <g className="wv-pop" style={delay(0.2)}>
        <rect x="74" y="54" width="212" height="140" rx="14" fill={C.white} stroke={C.brand} strokeWidth="4" />
        <rect x="84" y="64" width="192" height="120" rx="9" fill="none" stroke={C.lavender} strokeWidth="2" />
        <rect x="140" y="80" width="80" height="7" rx="3.5" fill={C.brand} opacity="0.6" />
        <rect x="112" y="98" width="136" height="12" rx="6" fill={C.navy} />
        <rect x="132" y="118" width="96" height="6" rx="3" fill={C.teal} />
        <rect x="104" y="150" width="50" height="5" rx="2.5" fill={C.navy} opacity="0.35" />
        <rect x="206" y="150" width="50" height="5" rx="2.5" fill={C.navy} opacity="0.35" />
      </g>
      <g className="wv-bob" style={delay(0.9)}>
        <path d="M262 176l-10 34 16-8 10 14 4-36z" fill={C.teal} />
        <circle cx="270" cy="176" r="20" fill={C.orange} />
        <path d="M262 176l6 6 11-12" stroke={C.white} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* share arrows */}
      <g className="wv-pop" style={delay(1.3)}>
        <circle cx="64" cy="70" r="18" fill={C.mint} />
        <path d="M56 74Q60 62 72 62M72 62l-5-5M72 62l-5 5" stroke={C.navy} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Sparkle x={300} y={46} d={1.5} fill={C.pink} />
      <Sparkle x={52} y={176} r={5} d={1.7} />
    </Scene>
  );
}

/** Small cartoon badges for the three parts of every lesson. */
export function LessonBadge({ kind }: { kind: "learn" | "check" | "next" }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 64 64" className="size-14 shrink-0">
      {kind === "learn" && (
        <g className="wv-bob">
          <rect x="6" y="12" width="52" height="36" rx="8" fill={C.lavender} stroke={C.navy} strokeWidth="2.5" />
          <path d="M27 22v16l13-8z" fill={C.brand} />
          <rect x="20" y="50" width="24" height="5" rx="2.5" fill={C.navy} />
        </g>
      )}
      {kind === "check" && (
        <g className="wv-bob" style={delay(0.4)}>
          <rect x="12" y="6" width="40" height="52" rx="8" fill={C.peach} stroke={C.navy} strokeWidth="2.5" />
          {[18, 30, 42].map((y, i) => (
            <g key={y}>
              <circle cx="22" cy={y} r="4" fill={i < 2 ? C.teal : C.white} stroke={C.navy} strokeWidth="1.8" />
              <rect x="30" y={y - 2} width="16" height="4" rx="2" fill={C.navy} opacity="0.45" />
            </g>
          ))}
        </g>
      )}
      {kind === "next" && (
        <g className="wv-bob" style={delay(0.8)}>
          <circle cx="32" cy="32" r="26" fill={C.mint} stroke={C.navy} strokeWidth="2.5" />
          <path d="M20 32h22m-8-9 9 9-9 9" stroke={C.teal} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

/** A small round portrait for "Who it's for". */
export function Portrait({ i, shirt }: { i: number; shirt: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="-40 -80 80 92" className="size-14 shrink-0 rounded-full bg-white">
      <Person x={0} y={0} s={1} skin={SKIN[i % SKIN.length]} hair={HAIR[(i + 2) % HAIR.length]} shirt={shirt} long={i % 2 === 0} />
    </svg>
  );
}

export const portraitShirts = [C.teal, C.brand, C.pink, C.orange, C.navy, C.tealLight];
