import React from "react";
import { interpolate } from "remotion";

// Shared building blocks for the Lesson 4 and 5 films, in the same flat style
// as Lesson 3. Dates and labels are real text so they stay sharp on phones.
export const ink = "#17243c",
  teal = "#087f72",
  violet = "#7155d9",
  paper = "#fffdf8",
  mint = "#e3f3ee",
  lavender = "#efeafc",
  blush = "#fbe9e4",
  muted = "#55607a",
  red = "#b2412f";
export const font = "Arial, Helvetica, sans-serif";

export type Cue = { scene: string; start: number; end: number; text: string };
export type Narration = {
  duration: number;
  scenes: { id: string; start: number; end: number }[];
  cues: Cue[];
};
export type P = { t: number; mobile: boolean };

export const ramp = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const enter = (a: number): React.CSSProperties => ({
  opacity: a,
  transform: `translateY(${(1 - a) * 24}px)`,
});
export const pop = (t: number, start: number) => enter(ramp(t, start - 0.15, start + 0.45));
/** Start time of the nth sentence (0-based) within a scene. */
export const cueStart = (narration: Narration) => (scene: string, n: number) =>
  narration.cues.filter((c) => c.scene === scene)[n]?.start ?? 0;

/** Full-width content area, enlarged so it reads well on phones. */
export const stage = (mobile: boolean): React.CSSProperties => {
  const z = mobile ? 1.18 : 1.3;
  return {
    position: "absolute",
    zoom: z,
    left: (mobile ? 40 : 150) / z,
    right: (mobile ? 40 : 150) / z,
    top: (mobile ? 170 : 170) / z,
  };
};
/** Content beside the character. */
export const beside = (mobile: boolean): React.CSSProperties => {
  const z = mobile ? 1.15 : 1.12;
  return {
    position: "absolute",
    zoom: z,
    left: (mobile ? 40 : 600) / z,
    top: (mobile ? 50 : 110) / z,
    width: (mobile ? 880 : 1220) / z,
  };
};

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: paper, borderRadius: 30, boxShadow: "0 18px 45px #17243c22", padding: 34, ...style }}>
      {children}
    </div>
  );
}
export function Kicker({ children, color = teal, size = 30 }: { children: React.ReactNode; color?: string; size?: number }) {
  return (
    <div style={{ display: "inline-block", background: color, color: "#fff", fontWeight: 800, fontSize: size, padding: "10px 22px", borderRadius: 999 }}>
      {children}
    </div>
  );
}
export function Label({ t, mobile, text, start }: P & { text: string; start: number }) {
  return (
    <div style={{ position: "absolute", left: mobile ? 40 : 70, top: mobile ? 40 : 50, fontSize: mobile ? 54 : 70, fontWeight: 900, color: violet, letterSpacing: -1.5, ...pop(t, start) }}>
      {text}
    </div>
  );
}
export function Arrow({ down = false, opacity = 1 }: { down?: boolean; opacity?: number }) {
  return (
    <svg width="90" height="70" viewBox="0 0 100 70" style={{ opacity, transform: down ? "rotate(90deg)" : undefined, flexShrink: 0 }} aria-hidden="true">
      <path d="M4 35h75m-20-20 23 20-23 20" stroke={teal} strokeWidth="8" fill="none" />
    </svg>
  );
}
export function Check({ on, size = 44 }: { on: boolean; size?: number }) {
  return (
    <span style={{ display: "inline-grid", placeItems: "center", width: size, height: size, borderRadius: 999, background: on ? teal : "#d9dde6", color: "#fff", fontWeight: 900, fontSize: size * 0.55, flexShrink: 0 }}>
      {on ? "✓" : ""}
    </span>
  );
}

/** Office backdrop with a desk line, window and plant. Text sits on a soft panel. */
export function Office({ tone = "#eef2f8" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
      <rect width="1920" height="1080" fill={tone} />
      <rect y="770" width="1920" height="310" fill="#dfe5ef" />
      <g opacity=".55">
        <rect x="1280" y="90" width="520" height="360" rx="18" fill="#fff" />
        <path d="M1540 90v360M1280 270h520" stroke="#d3dbe8" strokeWidth="10" />
        <rect x="700" y="130" width="420" height="260" rx="14" fill="#e7ecf5" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={740} y={170 + i * 70} width={340 - i * 60} height="26" rx="10" fill="#cfd8e6" />
        ))}
      </g>
      <g transform="translate(1760 560)">
        <rect x="-40" y="120" width="80" height="90" rx="12" fill="#c9875e" />
        <path d="M0 120C-70 60-60-20 0 0C60-20 70 60 0 120Z" fill="#5fa58d" />
        <path d="M0 120C-30 40 30-10 0-40" stroke="#3f7f69" strokeWidth="6" fill="none" />
      </g>
      <rect x="0" y="780" width="1920" height="60" fill="#fff" opacity=".75" />
      <rect x="540" y="0" width="1380" height="760" fill="#f8fafc" opacity=".5" />
    </svg>
  );
}
export function Quote({ t, start, who, children, tone = paper, f }: { t: number; start: number; who: string; children: React.ReactNode; tone?: string; f: number }) {
  return (
    <div style={{ marginTop: 30, ...pop(t, start) }}>
      <Card style={{ display: "inline-block", background: tone, fontSize: 42 * f, fontWeight: 700, borderBottomLeftRadius: 6 }}>
        <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700, marginBottom: 8 }}>{who}</div>
        {children}
      </Card>
    </div>
  );
}
