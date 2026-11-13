import React from "react";
import { AbsoluteFill } from "remotion";
import { Maya } from "./Maya";
import { Kicker, ink, lavender, muted, paper, pop, ramp, stage, violet, type P } from "./kit";

// Shared pieces for Module 2 films: Maya, speech bubbles, a generic
// "AI chat tool" window and the "Your choice" pause screen.
export function MayaIn({ t, mobile, checking = 0 }: P & { checking?: number }) {
  return (
    <div style={{ position: "absolute", left: mobile ? 560 : 70, top: mobile ? 610 : 130, width: mobile ? 380 : 450, height: mobile ? 665 : 790 }}>
      <Maya time={t} checking={checking} />
    </div>
  );
}
export function Avatar({ name, colour }: { name: string; colour: string }) {
  return (
    <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: 999, background: colour, color: "#fff", fontWeight: 900, fontSize: 26, flexShrink: 0 }}>
      {name[0]}
    </span>
  );
}
export function Bubble({ t, start, who, colour, children, f, right = false }: { t: number; start: number; who: string; colour: string; children: React.ReactNode; f: number; right?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginTop: 18, flexDirection: right ? "row-reverse" : "row", ...pop(t, start) }}>
      <Avatar name={who} colour={colour} />
      <div style={{ background: right ? lavender : paper, borderRadius: 24, padding: "16px 22px", boxShadow: "0 12px 30px #17243c1c", maxWidth: "80%" }}>
        <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>{who}</div>
        <div style={{ fontSize: 36 * f, fontWeight: 700, marginTop: 4 }}>{children}</div>
      </div>
    </div>
  );
}
/** A generic AI chat tool window. */
export function ChatWindow({ children, f }: { children: React.ReactNode; f: number }) {
  return (
    <div style={{ background: "#fff", border: `4px solid ${ink}`, borderRadius: 30, overflow: "hidden", boxShadow: "0 20px 50px #17243c26" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 22px", background: "#f3f1fb", borderBottom: "2px solid #e2ddf5" }}>
        <span style={{ display: "inline-grid", placeItems: "center", width: 40, height: 40, borderRadius: 999, background: violet, color: "#fff", fontWeight: 900, fontSize: 18 }}>AI</span>
        <span style={{ fontSize: 28 * f, fontWeight: 800 }}>AI chat tool</span>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}
export function Msg({ you, children, f, style }: { you?: boolean; children: React.ReactNode; f: number; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", justifyContent: you ? "flex-end" : "flex-start", marginTop: 14, ...style }}>
      <div style={{ maxWidth: "88%", background: you ? ink : lavender, color: you ? "#fff" : ink, borderRadius: 22, padding: "14px 20px", fontSize: 30 * f, lineHeight: 1.4 }}>
        {children}
      </div>
    </div>
  );
}
export const typed = (text: string, t: number, a: number, b: number) => text.slice(0, Math.round(ramp(t, a, b) * text.length));

/** A pause screen asking the learner to decide before the reveal. */
export function ChoiceScreen({ t, mobile, start, question }: P & { start: number; question: string }) {
  const f = mobile ? 0.86 : 1;
  return (
    <AbsoluteFill style={{ background: ink }}>
      <div style={{ ...stage(mobile), top: (mobile ? 330 : 260) / (mobile ? 1.18 : 1.3) }}>
        <div style={pop(t, start)}>
          <Kicker size={30 * f} color={violet}>Your choice</Kicker>
        </div>
        <div style={{ color: "#fff", fontSize: 60 * f, fontWeight: 900, lineHeight: 1.2, marginTop: 24, ...pop(t, start + 1) }}>{question}</div>
        <div style={{ color: "#c9c3e8", fontSize: 32 * f, marginTop: 24, ...pop(t, start + 2.5) }}>Pause the film and decide before you carry on.</div>
      </div>
    </AbsoluteFill>
  );
}
