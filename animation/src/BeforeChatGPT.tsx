import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import narration from "../../public/lessons/before-chatgpt/narration.json";
import { Sarah } from "./Sarah";

// Lesson 3: AI Did Not Start with ChatGPT.
// Every picture is drawn here; dates and labels are real text so they stay
// sharp on phones and match the narration, captions and transcript.
const ink = "#17243c",
  teal = "#087f72",
  violet = "#7155d9",
  paper = "#fffdf8",
  mint = "#e3f3ee",
  lavender = "#efeafc",
  blush = "#fbe9e4",
  muted = "#55607a";
const font = "Arial, Helvetica, sans-serif";

const ramp = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
/** Start time of the nth sentence (0-based) within a scene. */
const at = (scene: string, n: number) =>
  narration.cues.filter((c) => c.scene === scene)[n]?.start ?? 0;
const enter = (a: number): React.CSSProperties => ({
  opacity: a,
  transform: `translateY(${(1 - a) * 24}px)`,
});
const pop = (t: number, start: number) => enter(ramp(t, start - 0.15, start + 0.45));

type P = { t: number; mobile: boolean };
/** Content area for the history scenes, enlarged so it reads well on phones. */
const stage = (mobile: boolean): React.CSSProperties => {
  const z = mobile ? 1.18 : 1.3;
  return {
    position: "absolute",
    zoom: z,
    left: (mobile ? 40 : 150) / z,
    right: (mobile ? 40 : 150) / z,
    top: (mobile ? 170 : 200) / z,
  };
};

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: paper,
        borderRadius: 30,
        boxShadow: "0 18px 45px #17243c22",
        padding: 34,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
function Kicker({ children, color = teal, size = 30 }: { children: React.ReactNode; color?: string; size?: number }) {
  return (
    <div
      style={{
        display: "inline-block",
        background: color,
        color: "#fff",
        fontWeight: 800,
        fontSize: size,
        padding: "10px 22px",
        borderRadius: 999,
      }}
    >
      {children}
    </div>
  );
}
function Year({ t, mobile, label, start }: P & { label: string; start: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: mobile ? 40 : 70,
        top: mobile ? 40 : 55,
        fontSize: mobile ? 60 : 84,
        fontWeight: 900,
        color: violet,
        letterSpacing: -2,
        ...pop(t, start),
      }}
    >
      {label}
    </div>
  );
}

/* ---------- Backdrops ---------- */
function Pharmacy() {
  const boxes = ["#7155d9", "#087f72", "#e2a64b", "#d46a5a", "#4b78c4", "#9bc7b8"];
  return (
    <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
      <rect width="1920" height="1080" fill="#eef6f3" />
      <rect y="760" width="1920" height="320" fill="#dcebe6" />
      {[150, 330, 510].map((y, row) => (
        <g key={y}>
          <rect x="560" y={y + 120} width="1320" height="16" rx="6" fill="#b9cfc7" />
          {Array.from({ length: 16 }, (_, i) => (
            <rect
              key={i}
              x={590 + i * 80}
              y={y + 120 - (60 + ((i * 7 + row * 3) % 4) * 12)}
              width="58"
              height={60 + ((i * 7 + row * 3) % 4) * 12}
              rx="6"
              fill={boxes[(i + row * 2) % boxes.length]}
              opacity=".4"
            />
          ))}
        </g>
      ))}
      <g transform="translate(1700 40)">
        <rect width="150" height="150" rx="24" fill="#fff" />
        <path d="M55 25h40v30h30v40H95v30H55V95H25V55h30Z" fill={teal} />
      </g>
      <rect x="0" y="780" width="1920" height="70" fill="#fff" opacity=".7" />
      <rect x="540" y="0" width="1380" height="760" fill="#f7fbf9" opacity=".55" />
    </svg>
  );
}
function SarahIn({ t, mobile, mood, phone = 0 }: P & { mood: "calm" | "surprised" | "smile"; phone?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: mobile ? 560 : 70,
        top: mobile ? 610 : 130,
        width: mobile ? 380 : 450,
        height: mobile ? 665 : 790,
      }}
    >
      <Sarah time={t} mood={mood} phone={phone} />
    </div>
  );
}
const content = (mobile: boolean): React.CSSProperties => {
  const z = mobile ? 1.15 : 1.12;
  return {
    position: "absolute",
    zoom: z,
    left: (mobile ? 40 : 600) / z,
    top: (mobile ? 50 : 110) / z,
    width: (mobile ? 880 : 1220) / z,
  };
};

/* ---------- Scene 1: The surprise ---------- */
function Surprise({ t, mobile }: P) {
  const s = "surprise";
  const surprised = t >= at(s, 3) && t < at(s, 5);
  const back = at(s, 6);
  const spin = ramp(t, back, back + 4.5);
  const year = Math.round(2026 - spin * (2026 - 1950));
  const f = mobile ? 0.86 : 1;
  return (
    <>
      <Pharmacy />
      {!(mobile && t >= back - 0.2) && (
        <SarahIn t={t} mobile={mobile} mood={surprised ? "surprised" : "calm"} phone={ramp(t, at(s, 5), at(s, 5) + 0.6) * (t < back ? 1 : 0)} />
      )}
      <div style={content(mobile)}>
        <div style={pop(t, 0.6)}>
          <Card style={{ display: "inline-block", padding: "20px 30px" }}>
            <span style={{ fontSize: 46 * f, fontWeight: 800 }}>Sarah</span>
            <span style={{ fontSize: 34 * f, color: teal, marginLeft: 18 }}>Pharmacist</span>
          </Card>
        </div>
        {t >= at(s, 2) - 0.2 && t < back && (
          <div style={{ marginTop: 34, ...pop(t, at(s, 2)) }}>
            <Card style={{ display: "inline-block", fontSize: 48 * f, fontWeight: 700, borderBottomLeftRadius: 6 }}>
              <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700, marginBottom: 8 }}>Team meeting · her manager says</div>
              “AI has been around for decades.”
            </Card>
          </div>
        )}
        {t >= at(s, 4) - 0.2 && t < back && (
          <div style={{ marginTop: 34, marginLeft: mobile ? 0 : 160, ...pop(t, at(s, 4)) }}>
            <Card style={{ display: "inline-block", background: lavender, fontSize: 44 * f, fontWeight: 700, borderBottomRightRadius: 6 }}>
              Didn’t all of this start with ChatGPT?
            </Card>
          </div>
        )}
        {t >= at(s, 5) - 0.2 && t < back && (
          <div style={{ marginTop: 34, ...pop(t, at(s, 5)) }}>
            <Card style={{ display: "inline-flex", gap: 26, alignItems: "center", padding: 26 }}>
              <div style={{ background: ink, color: "#fff", fontWeight: 900, fontSize: 26 * f, padding: "8px 14px", borderRadius: 8 }}>NEWS</div>
              <div style={{ fontSize: 36 * f, fontWeight: 700 }}>Chat tools are everywhere</div>
            </Card>
          </div>
        )}
        {t >= back - 0.2 && (
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: "center", gap: 50, marginTop: mobile ? 30 : 60, ...pop(t, back) }}>
            <svg width={mobile ? 300 : 360} height={mobile ? 300 : 360} viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="92" fill={paper} stroke={ink} strokeWidth="8" />
              {Array.from({ length: 12 }, (_, i) => (
                <rect key={i} x="97" y="16" width="6" height="16" rx="3" fill={ink} transform={`rotate(${i * 30} 100 100)`} />
              ))}
              <rect x="96" y="40" width="8" height="64" rx="4" fill={violet} transform={`rotate(${-spin * 1440} 100 100)`} />
              <rect x="96" y="60" width="8" height="44" rx="4" fill={ink} transform={`rotate(${-spin * 120} 100 100)`} />
              <circle cx="100" cy="100" r="8" fill={ink} />
              <path d="M38 52a76 76 0 0 1 40-30" fill="none" stroke={teal} strokeWidth="7" strokeLinecap="round" />
              <path d="M34 36l4 18 18-4" fill="none" stroke={teal} strokeWidth="7" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontSize: 34 * f, color: muted, fontWeight: 700 }}>Travelling back to</div>
              <div style={{ fontSize: 170 * f, fontWeight: 900, color: violet, letterSpacing: -4 }}>{year}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Scene 2: The early questions ---------- */
function RoomComputer({ t, w }: { t: number; w: number }) {
  return (
    <svg width={w} height={w * 0.5} viewBox="0 0 800 400" aria-hidden="true">
      <rect x="0" y="360" width="800" height="40" fill="#dcd6c8" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${20 + i * 156} 40)`}>
          <rect width="140" height="320" rx="10" fill="#c9cdd6" stroke={ink} strokeWidth="5" />
          {i % 2 === 0 ? (
            <>
              <circle cx="45" cy="80" r="32" fill="#fff" stroke={ink} strokeWidth="5" />
              <circle cx="95" cy="80" r="32" fill="#fff" stroke={ink} strokeWidth="5" />
              <circle cx="45" cy="80" r="8" fill={ink} transform={`rotate(${t * 90} 45 80)`} />
              <circle cx="95" cy="80" r="8" fill={ink} />
              <rect x="20" y="150" width="100" height="140" rx="6" fill="#aab0bc" />
            </>
          ) : (
            Array.from({ length: 24 }, (_, k) => (
              <circle
                key={k}
                cx={30 + (k % 4) * 27}
                cy={40 + Math.floor(k / 4) * 40}
                r="8"
                fill={Math.sin(t * 6 + k * 1.7 + i) > 0.2 ? "#f2b84b" : "#7a8190"}
              />
            ))
          )}
        </g>
      ))}
    </svg>
  );
}
function EarlyQuestions({ t, mobile }: P) {
  const s = "early-questions";
  const f = mobile ? 0.86 : 1;
  const phase = t < at(s, 2) ? 0 : t < at(s, 3) ? 1 : t < at(s, 5) ? 2 : 3;
  const box = stage(mobile);
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      <Year t={t} mobile={mobile} label={phase < 3 ? (phase < 2 ? "1950s" : "1950") : "1956"} start={at(s, 0)} />
      {phase === 0 && (
        <div style={box}>
          <div style={{ ...pop(t, at(s, 0)) }}>
            <RoomComputer t={t} w={mobile ? 730 : 850} />
          </div>
          <div style={{ fontSize: 46 * f, fontWeight: 800, marginTop: 20, ...pop(t, at(s, 0) + 1.6) }}>
            Computers filled whole rooms
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 22, flexWrap: "wrap", ...pop(t, at(s, 1)) }}>
            {["17 × 23 = 391", "1,250 + 875 = 2,125", "Mostly calculations"].map((x, i) => (
              <Card key={x} style={{ padding: "16px 24px", fontSize: 34 * f, fontWeight: i === 2 ? 800 : 400, color: i === 2 ? teal : ink }}>
                {x}
              </Card>
            ))}
          </div>
        </div>
      )}
      {phase === 1 && (
        <div style={box}>
          <Card style={{ background: lavender, ...pop(t, at(s, 2)) }}>
            <div style={{ fontSize: 34 * f, color: violet, fontWeight: 800 }}>A bigger question</div>
            <div style={{ fontSize: 64 * f, fontWeight: 800, lineHeight: 1.2, marginTop: 14 }}>
              Could a computer do things we link with human intelligence?
            </div>
          </Card>
          <div style={{ display: "flex", gap: 30, marginTop: 34 }}>
            {["Solving problems", "Using language"].map((x, i) => (
              <Card key={x} style={{ flex: 1, fontSize: 42 * f, fontWeight: 700, textAlign: "center", ...pop(t, at(s, 2) + 4 + i * 1.2) }}>
                {x}
              </Card>
            ))}
          </div>
        </div>
      )}
      {phase === 2 && (
        <div style={box}>
          <div style={pop(t, at(s, 3))}>
            <Kicker size={32 * f}>Alan Turing · mathematician</Kicker>
            <div style={{ fontSize: 60 * f, fontWeight: 800, marginTop: 20 }}>“Can machines think?”</div>
          </div>
          {t >= at(s, 4) - 0.2 && (
            <div style={{ display: "flex", alignItems: "center", gap: mobile ? 20 : 40, marginTop: 40, ...pop(t, at(s, 4)) }}>
              <Card style={{ flex: 1, padding: 26 }}>
                <div style={{ fontSize: 28 * f, color: muted, fontWeight: 700 }}>You chat with…</div>
                <div style={{ background: mint, borderRadius: 16, padding: 16, marginTop: 14, fontSize: 32 * f }}>What did you do today?</div>
                <div style={{ background: lavender, borderRadius: 16, padding: 16, marginTop: 12, fontSize: 32 * f, opacity: ramp(t, at(s, 4) + 2, at(s, 4) + 2.6) }}>
                  I went for a walk.
                </div>
              </Card>
              <div style={{ width: mobile ? 220 : 320, textAlign: "center" }}>
                <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
                  {["Person", "Machine"].map((x) => (
                    <div key={x} style={{ background: ink, color: "#fff", borderRadius: 18, width: mobile ? 100 : 140, height: mobile ? 120 : 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 * f, fontWeight: 900 }}>
                      ?
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 30 * f, fontWeight: 700, marginTop: 16, opacity: ramp(t, at(s, 4) + 4, at(s, 4) + 4.6) }}>
                  Can you tell which is which?
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {phase === 3 && (
        <div style={box}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 40, alignItems: mobile ? "flex-start" : "center", ...pop(t, at(s, 5)) }}>
            <svg width={mobile ? 420 : 460} height={mobile ? 260 : 290} viewBox="0 0 460 290" aria-hidden="true">
              <rect x="20" y="270" width="420" height="16" fill="#cfc6b2" />
              <rect x="60" y="120" width="340" height="150" fill="#fbf7ef" stroke={ink} strokeWidth="6" />
              <path d="M40 125L230 30L420 125Z" fill="#e6dccb" stroke={ink} strokeWidth="6" />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i} x={86 + i * 54} y="140" width="22" height="120" fill="#e6dccb" stroke={ink} strokeWidth="4" />
              ))}
              <circle cx="230" cy="88" r="20" fill="#fff" stroke={ink} strokeWidth="5" />
            </svg>
            <div>
              <div style={{ fontSize: 34 * f, color: muted, fontWeight: 700 }}>Summer workshop</div>
              <div style={{ fontSize: 56 * f, fontWeight: 800 }}>Dartmouth College, USA</div>
            </div>
          </div>
          {t >= at(s, 6) - 0.2 && (
            <Card style={{ marginTop: 40, background: lavender, ...pop(t, at(s, 6)) }}>
              <div style={{ fontSize: 30 * f, color: muted, fontWeight: 700 }}>The new field gets a name</div>
              <div style={{ fontSize: 76 * f, fontWeight: 900, color: violet, marginTop: 8 }}>Artificial intelligence</div>
            </Card>
          )}
          {t >= at(s, 7) - 0.2 && (
            <div style={{ marginTop: 30, ...pop(t, at(s, 7)) }}>
              <Kicker size={38 * f} color={teal}>About 70 years old</Kicker>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
}

/* ---------- Scene 3: Teaching computers rules ---------- */
function Printer({ w, blink }: { w: number; blink: boolean }) {
  return (
    <svg width={w} height={w * 0.8} viewBox="0 0 250 200" aria-hidden="true">
      <rect x="40" y="20" width="170" height="40" rx="6" fill="#fff" stroke={ink} strokeWidth="5" />
      <rect x="15" y="60" width="220" height="100" rx="16" fill="#c9cdd6" stroke={ink} strokeWidth="6" />
      <rect x="50" y="135" width="150" height="45" rx="4" fill="#fff" stroke={ink} strokeWidth="5" />
      <circle cx="200" cy="90" r="9" fill={blink ? "#e0533d" : "#7a8190"} />
    </svg>
  );
}
function Rules({ t, mobile }: P) {
  const s = "rules";
  const f = mobile ? 0.86 : 1;
  const phase = t < at(s, 3) ? 0 : t < at(s, 8) ? 1 : t < at(s, 11) ? 2 : 3;
  const box = stage(mobile);
  const step = (n: number) => t >= at(s, n) - 0.1;
  const node = (label: string, on: boolean, tone = paper): React.CSSProperties => ({
    background: on ? tone : "#ffffff99",
    border: `5px solid ${on ? ink : "#c9cdd6"}`,
    borderRadius: 22,
    padding: "18px 24px",
    fontSize: 36 * f,
    fontWeight: 700,
    opacity: on ? 1 : 0.35,
  });
  return (
    <AbsoluteFill style={{ background: "#eef1f7" }}>
      <Year t={t} mobile={mobile} label="1970s to 1980s" start={at(s, 0)} />
      {phase === 0 && (
        <div style={box}>
          <div style={{ fontSize: 58 * f, fontWeight: 800, ...pop(t, at(s, 0)) }}>Give computers rules</div>
          <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 40, flexDirection: mobile ? "column" : "row" }}>
            <Card style={{ flex: 1, ...pop(t, at(s, 1)) }}>
              <div style={{ fontSize: 30 * f, color: muted, fontWeight: 700 }}>Experts explain their decisions</div>
              <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
                {["Doctor", "Engineer"].map((x) => (
                  <Kicker key={x} size={30 * f} color={x === "Doctor" ? teal : violet}>
                    {x}
                  </Kicker>
                ))}
              </div>
            </Card>
            <svg width="90" height="70" viewBox="0 0 100 70" style={{ opacity: ramp(t, at(s, 2) - 0.5, at(s, 2)), transform: mobile ? "rotate(90deg)" : undefined }} aria-hidden="true">
              <path d="M4 35h75m-20-20 23 20-23 20" stroke={teal} strokeWidth="8" fill="none" />
            </svg>
            <Card style={{ flex: 1.2, fontFamily: "Menlo, monospace", ...pop(t, at(s, 2)) }}>
              {["IF this", "THEN that", "IF this", "THEN that"].map((x, i) => (
                <div key={i} style={{ fontSize: 36 * f, marginTop: i ? 10 : 0, color: i % 2 ? teal : ink, fontWeight: 700, opacity: ramp(t, at(s, 2) + i * 0.5, at(s, 2) + i * 0.5 + 0.4) }}>
                  {x}
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}
      {phase === 1 && (
        <div style={{ ...box, display: "flex", flexDirection: mobile ? "column" : "row", gap: 40, alignItems: mobile ? "stretch" : "center" }}>
          <Card style={{ textAlign: "center", ...pop(t, at(s, 3)) }}>
            <Printer w={mobile ? 260 : 320} blink={false} />
            <div style={{ fontSize: 32 * f, fontWeight: 800 }}>Printer help</div>
          </Card>
          <div style={{ flex: 1, display: "grid", gap: 18 }}>
            <div style={node("", step(4), lavender)}>Is the printer switched on?</div>
            <div style={{ display: "flex", gap: 18 }}>
              <div style={{ ...node("", step(5), mint), flex: 1 }}>No: switch it on</div>
              <div style={{ ...node("", step(6), lavender), flex: 1.4 }}>Yes: is there paper in the tray?</div>
            </div>
            <div style={{ ...node("", step(7), mint), marginLeft: mobile ? 120 : 260 }}>No: add paper</div>
          </div>
        </div>
      )}
      {phase === 2 && (
        <div style={box}>
          <div style={pop(t, at(s, 8))}>
            <Kicker size={34 * f}>Expert systems</Kicker>
            <div style={{ fontSize: 48 * f, fontWeight: 800, marginTop: 16 }}>Useful for narrow jobs</div>
          </div>
          {step(9) && (
            <div style={{ fontSize: 48 * f, fontWeight: 800, color: "#b2412f", marginTop: 26, ...pop(t, at(s, 9)) }}>…but fragile</div>
          )}
          {step(10) && (
            <div style={{ display: "flex", gap: 40, alignItems: "flex-end", marginTop: 34, flexDirection: mobile ? "column" : "row" }}>
              <div style={{ position: "relative", width: 300, height: 260, ...pop(t, at(s, 10)) }}>
                {Array.from({ length: 1 + Math.floor(ramp(t, at(s, 10), at(s, 10) + 5) * 9) }, (_, i) => (
                  <div key={i} style={{ position: "absolute", left: i * 8, top: 120 - i * 14, width: 220, height: 130, background: "#fff", border: `4px solid ${ink}`, borderRadius: 10, fontFamily: "Menlo, monospace", fontSize: 22, padding: 12 }}>
                    IF … THEN …
                  </div>
                ))}
              </div>
              <Card style={{ flex: 1, display: "flex", alignItems: "center", gap: 24, opacity: ramp(t, at(s, 10) + 5, at(s, 10) + 5.6) }}>
                <Printer w={mobile ? 180 : 210} blink={Math.sin(t * 8) > 0} />
                <div>
                  <div style={{ fontSize: 32 * f, color: muted, fontWeight: 700 }}>A strange new problem</div>
                  <div style={{ fontSize: 44 * f, fontWeight: 900, color: "#b2412f", marginTop: 8 }}>No rule for this</div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
      {phase === 3 && (
        <div style={box}>
          <Card style={{ ...pop(t, at(s, 11)) }}>
            <div style={{ fontSize: 32 * f, color: muted, fontWeight: 700 }}>Interest and funding</div>
            <svg width="100%" height={mobile ? 260 : 300} viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 260H800" stroke="#c9cdd6" strokeWidth="4" />
              <path
                d={`M0 120 C120 40 200 40 280 70 S 420 ${interpolate(ramp(t, at(s, 11), at(s, 11) + 3), [0, 1], [80, 240])} 520 ${interpolate(ramp(t, at(s, 11), at(s, 11) + 3), [0, 1], [90, 245])} S 700 ${interpolate(ramp(t, at(s, 13), at(s, 13) + 2), [0, 1], [240, 90])} 800 ${interpolate(ramp(t, at(s, 13), at(s, 13) + 2), [0, 1], [240, 60])}`}
                fill="none"
                stroke={violet}
                strokeWidth="10"
                strokeLinecap="round"
              />
              {t >= at(s, 12) - 0.2 &&
                Array.from({ length: 14 }, (_, i) => (
                  <text key={i} x={380 + ((i * 53) % 260)} y={((t * 40 + i * 37) % 240) + 20} fontSize="30" fill="#7fa3d9" opacity={t < at(s, 13) ? 1 : 0.2}>
                    ✻
                  </text>
                ))}
            </svg>
          </Card>
          <div style={{ display: "flex", gap: 24, marginTop: 30, flexWrap: "wrap" }}>
            {t >= at(s, 12) - 0.2 && (
              <div style={pop(t, at(s, 12))}>
                <Kicker size={40 * f} color="#4b78c4">“AI winters”</Kicker>
              </div>
            )}
            {t >= at(s, 13) - 0.2 && (
              <div style={pop(t, at(s, 13))}>
                <Kicker size={40 * f} color={teal}>The research carried on</Kicker>
              </div>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}

/* ---------- Scene 4: Machines take on new challenges ---------- */
function Chess({ w }: { w: number }) {
  const pieces: [number, number, string][] = [
    [1, 1, "♚"], [3, 2, "♛"], [5, 5, "♔"], [6, 3, "♞"], [2, 6, "♖"], [4, 4, "♙"], [0, 3, "♝"],
  ];
  return (
    <svg width={w} height={w} viewBox="0 0 8 8" aria-hidden="true">
      {Array.from({ length: 64 }, (_, i) => (
        <rect key={i} x={i % 8} y={Math.floor(i / 8)} width="1" height="1" fill={(i + Math.floor(i / 8)) % 2 ? "#7a6a58" : "#efe3cf"} />
      ))}
      {pieces.map(([x, y, p]) => (
        <text key={`${x}${y}`} x={x + 0.5} y={y + 0.82} fontSize="0.85" textAnchor="middle" fill={ink}>
          {p}
        </text>
      ))}
    </svg>
  );
}
function NewChallenges({ t, mobile }: P) {
  const s = "new-challenges";
  const f = mobile ? 0.86 : 1;
  const ml = t >= at(s, 3) - 0.1;
  const box = stage(mobile);
  return (
    <AbsoluteFill style={{ background: ml ? "#eef6f3" : "#f6f1e6" }}>
      <Year t={t} mobile={mobile} label={ml ? "2000s onwards" : "1997"} start={ml ? at(s, 3) : at(s, 0)} />
      {!ml && (
        <div style={{ ...box, display: "flex", gap: 50, flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center" }}>
          <div style={pop(t, at(s, 0))}>
            <Chess w={mobile ? 300 : 470} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={pop(t, at(s, 0) + 0.6)}>
              <Kicker size={32 * f} color={ink}>Deep Blue, built by IBM</Kicker>
              <div style={{ fontSize: 52 * f, fontWeight: 800, marginTop: 16, lineHeight: 1.2 }}>beats world chess champion Garry Kasparov</div>
            </div>
            {t >= at(s, 2) - 0.2 && (
              <Card style={{ marginTop: 30, ...pop(t, at(s, 2)) }}>
                <svg width="100%" height="150" viewBox="0 0 600 150" aria-hidden="true">
                  {Array.from({ length: 3 }, (_, a) =>
                    Array.from({ length: 4 }, (_, b) => (
                      <g key={`${a}${b}`} opacity={ramp(t, at(s, 2) + a * 0.4 + b * 0.15, at(s, 2) + a * 0.4 + b * 0.15 + 0.3)}>
                        <path d={`M300 12L${100 + a * 200} 70L${40 + a * 200 + b * 40} 138`} stroke={teal} strokeWidth="3" fill="none" />
                        <circle cx={40 + a * 200 + b * 40} cy="138" r="7" fill={teal} />
                      </g>
                    )),
                  )}
                  <circle cx="300" cy="12" r="10" fill={ink} />
                </svg>
                <div style={{ fontSize: 34 * f, fontWeight: 800 }}>Searched millions of moves every second</div>
                <div style={{ fontSize: 30 * f, color: muted, marginTop: 8 }}>using rules and scoring written by people</div>
              </Card>
            )}
          </div>
        </div>
      )}
      {ml && (
        <div style={box}>
          <div style={pop(t, at(s, 3))}>
            <Kicker size={36 * f} color={violet}>Machine learning</Kicker>
          </div>
          {t >= at(s, 4) - 0.2 && (
            <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 34, ...pop(t, at(s, 4)) }}>
              <Card style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: 22 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} style={{ width: mobile ? 70 : 80, height: mobile ? 70 : 80, borderRadius: 14, background: [mint, lavender, blush][i % 3], opacity: ramp(t, at(s, 4) + i * 0.15, at(s, 4) + i * 0.15 + 0.3) }} />
                ))}
              </Card>
              <svg width="90" height="70" viewBox="0 0 100 70" aria-hidden="true">
                <path d="M4 35h75m-20-20 23 20-23 20" stroke={teal} strokeWidth="8" fill="none" />
              </svg>
              <Card style={{ flex: 1, opacity: ramp(t, at(s, 4) + 3, at(s, 4) + 3.6) }}>
                <div style={{ fontSize: 30 * f, color: muted, fontWeight: 700 }}>Lots of examples</div>
                <div style={{ fontSize: 46 * f, fontWeight: 800, marginTop: 8 }}>The computer finds patterns</div>
              </Card>
            </div>
          )}
          {t >= at(s, 5) - 0.2 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22, marginTop: 34 }}>
              {["Recognising images", "Recognising speech", "Making predictions"].map((x, i) => (
                <Card key={x} style={{ textAlign: "center", fontSize: 36 * f, fontWeight: 800, padding: 26, ...pop(t, at(s, 5) + i * 1.3) }}>
                  {x}
                </Card>
              ))}
            </div>
          )}
          {t >= at(s, 6) - 0.2 && (
            <div style={{ marginTop: 28, ...pop(t, at(s, 6)) }}>
              <Kicker size={36 * f}>Into everyday tools</Kicker>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
}

/* ---------- Scene 5: Then came ChatGPT ---------- */
function ChatGPTScene({ t, mobile }: P) {
  const s = "chatgpt";
  const f = mobile ? 0.86 : 1;
  const chat = t >= at(s, 3) - 0.1;
  const q = "Help me write a friendly reminder to collect prescriptions.";
  const a = "Of course. Here’s a short reminder: Your prescription is ready to collect. Please bring your ID.";
  const typed = q.slice(0, Math.floor(ramp(t, at(s, 4), at(s, 4) + 3) * q.length));
  const replied = a.slice(0, Math.floor(ramp(t, at(s, 4) + 3.6, at(s, 4) + 6) * a.length));
  return (
    <>
      <Pharmacy />
      <SarahIn t={t} mobile={mobile} mood={t >= at(s, 6) ? "smile" : "calm"} phone={ramp(t, at(s, 3), at(s, 3) + 0.6)} />
      <div style={content(mobile)}>
        {!chat && (
          <>
            <div style={pop(t, at(s, 0))}>
              <Kicker size={40 * f} color={violet}>2010s · AI in daily life</Kicker>
            </div>
            {t >= at(s, 1) - 0.2 && (
              <Card style={{ display: "inline-block", marginTop: 26, padding: "18px 28px", fontSize: 36 * f, fontWeight: 700, ...pop(t, at(s, 1)) }}>
                Remember Maya’s day? <span style={{ color: teal }}>Lesson 2</span>
              </Card>
            )}
            {t >= at(s, 2) - 0.2 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 30 }}>
                {["Spam filters", "Photo search", "Route suggestions"].map((x, i) => (
                  <Card key={x} style={{ textAlign: "center", fontSize: 34 * f, fontWeight: 800, padding: 26, background: [blush, lavender, mint][i], ...pop(t, at(s, 2) + i * 0.9) }}>
                    {x}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        {chat && t < at(s, 6) - 0.1 && (
          <>
            <div style={pop(t, at(s, 3))}>
              <Kicker size={40 * f} color={violet}>November 2022</Kicker>
              <div style={{ fontSize: 46 * f, fontWeight: 800, marginTop: 14 }}>ChatGPT, then similar tools</div>
            </div>
            {t >= at(s, 4) - 0.2 && (
              <Card style={{ marginTop: 28, padding: 28, width: mobile ? 700 : 980, ...pop(t, at(s, 4)) }}>
                <div style={{ marginLeft: "auto", maxWidth: "80%", background: lavender, borderRadius: 20, padding: 20, fontSize: mobile ? 38 : 32, minHeight: 40 }}>
                  {typed}
                </div>
                {replied && (
                  <div style={{ maxWidth: "85%", background: mint, borderRadius: 20, padding: 20, fontSize: mobile ? 38 : 32, marginTop: 18 }}>
                    {replied}
                  </div>
                )}
              </Card>
            )}
            {t >= at(s, 5) - 0.2 && (
              <div style={{ marginTop: 26, ...pop(t, at(s, 5)) }}>
                <Kicker size={36 * f}>Anyone could talk to AI directly</Kicker>
              </div>
            )}
          </>
        )}
        {t >= at(s, 6) - 0.1 && (
          <div>
            <Card style={{ display: "inline-block", fontSize: 64 * f, fontWeight: 900, ...pop(t, at(s, 6)) }}>AI wasn’t new.</Card>
            {t >= at(s, 7) - 0.2 && (
              <Card style={{ marginTop: 26, background: lavender, fontSize: 48 * f, fontWeight: 800, lineHeight: 1.3, ...pop(t, at(s, 7)) }}>
                What changed: it became visible and easy to use.
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Scene 6: The bigger picture ---------- */
const milestones = [
  ["1950", "Turing asks if machines can think"],
  ["1956", "The field is named at Dartmouth"],
  ["1970s to 1980s", "Rule-based expert systems and AI winters"],
  ["1997", "Deep Blue beats Kasparov"],
  ["2010s", "Machine learning in everyday tools"],
  ["2022", "ChatGPT and similar chat tools"],
];
function BiggerPicture({ t, mobile }: P) {
  const s = "bigger-picture";
  const f = mobile ? 0.86 : 1;
  const back = t >= at(s, 4) - 0.1;
  if (back) {
    return (
      <>
        <Pharmacy />
        <SarahIn t={t} mobile={mobile} mood="smile" />
        <div style={content(mobile)}>
          <Card style={{ fontSize: 56 * f, fontWeight: 900, lineHeight: 1.25, ...pop(t, at(s, 5)) }}>
            AI has been around for decades.
            {t >= at(s, 6) - 0.2 && <div style={{ color: teal, ...pop(t, at(s, 6)) }}>It just became much easier to see.</div>}
          </Card>
          {t >= at(s, 7) - 0.2 && (
            <Card style={{ marginTop: 30, background: lavender, display: "inline-block", ...pop(t, at(s, 7)) }}>
              <div style={{ fontSize: 30 * f, color: muted, fontWeight: 700 }}>Next lesson</div>
              <div style={{ fontSize: 48 * f, fontWeight: 800, marginTop: 6 }}>AI or ordinary software?</div>
            </Card>
          )}
        </div>
      </>
    );
  }
  const reveal = (i: number) => ramp(t, at(s, 2) + i * 1.6, at(s, 2) + i * 1.6 + 0.5);
  const chapter = t >= at(s, 3) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      <div style={{ ...stage(mobile), top: (mobile ? 50 : 80) / (mobile ? 1.18 : 1.3) }}>
        <div style={{ fontSize: 56 * f, fontWeight: 800, ...pop(t, at(s, 0)) }}>
          Did AI start with ChatGPT?{" "}
          {t >= at(s, 1) - 0.1 && <span style={{ color: "#b2412f" }}>No.</span>}
        </div>
        <div
          style={{
            marginTop: mobile ? 40 : 70,
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(6, 1fr)",
            gap: mobile ? 26 : 18,
            position: "relative",
          }}
        >
          {!mobile && <div style={{ position: "absolute", left: 0, right: 0, top: 34, height: 8, background: "#d9cfbc", borderRadius: 4 }} />}
          {milestones.map(([year, text], i) => {
            const last = i === milestones.length - 1;
            const dim = chapter && !last;
            return (
              <div key={year} style={{ ...enter(reveal(i)), display: mobile ? "flex" : "block", gap: 24, alignItems: "center", opacity: reveal(i) * (dim ? 0.45 : 1) }}>
                <div style={{ width: 76, height: 76, borderRadius: 999, background: last ? violet : teal, border: `8px solid ${paper}`, position: "relative", flexShrink: 0 }} />
                <div style={{ marginTop: mobile ? 0 : 18 }}>
                  <div style={{ fontSize: mobile ? 44 : year.length > 6 ? 30 : 40, fontWeight: 900, color: last ? violet : ink }}>{year}</div>
                  <div style={{ fontSize: mobile ? 34 : 27, lineHeight: 1.3, marginTop: 6 }}>{text}</div>
                </div>
              </div>
            );
          })}
        </div>
        {chapter && (
          <div style={{ marginTop: mobile ? 34 : 60, ...pop(t, at(s, 3)) }}>
            <Kicker size={40 * f} color={violet}>One recent chapter in a much longer story</Kicker>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

export function BeforeChatGPT({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene =
    narration.scenes[Math.max(0, narration.scenes.findLastIndex((s) => s.start <= t))];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  const local = { t, mobile };
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink, overflow: "hidden" }}>
      <Html5Audio src={staticFile("lessons/before-chatgpt/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "surprise" && <Surprise {...local} />}
        {scene.id === "early-questions" && <EarlyQuestions {...local} />}
        {scene.id === "rules" && <Rules {...local} />}
        {scene.id === "new-challenges" && <NewChallenges {...local} />}
        {scene.id === "chatgpt" && <ChatGPTScene {...local} />}
        {scene.id === "bigger-picture" && <BiggerPicture {...local} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
