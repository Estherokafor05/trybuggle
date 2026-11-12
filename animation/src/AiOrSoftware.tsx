import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import narration from "../../public/lessons/ai-or-software/narration.json";
import { Person, daniel } from "./Person";
import {
  Arrow, Card, Check, Kicker, Label, Office, Quote, beside, blush, cueStart, enter, font, ink,
  lavender, mint, muted, paper, pop, ramp, red, stage, teal, violet, type P,
} from "./kit";

// Lesson 4: AI or Ordinary Software? Daniel, a receptionist.
const at = cueStart(narration);

function DanielIn({ t, mobile, hold = 0, mood = "calm" }: P & { hold?: number; mood?: "calm" | "thinking" | "smile" }) {
  return (
    <div style={{ position: "absolute", left: mobile ? 560 : 70, top: mobile ? 610 : 130, width: mobile ? 380 : 450, height: mobile ? 665 : 790 }}>
      <Person look={daniel} time={t} hold={hold} mood={mood} />
    </div>
  );
}
const tools = [
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "tablet", label: "Check-in tablet", icon: "📲" },
  { id: "inbox", label: "Shared inbox", icon: "📥" },
  { id: "badge", label: "Badge printer", icon: "🪪" },
];

/* 1. Is everything AI now? */
function Intro({ t, mobile }: P) {
  const s = "is-everything-ai";
  const f = mobile ? 0.86 : 1;
  const wondering = t >= at(s, 4) && t < at(s, 6);
  return (
    <>
      <Office />
      <DanielIn t={t} mobile={mobile} mood={wondering ? "thinking" : "calm"} />
      <div style={beside(mobile)}>
        <div style={pop(t, 0.4)}>
          <Card style={{ display: "inline-block", padding: "20px 30px" }}>
            <span style={{ fontSize: 46 * f, fontWeight: 800 }}>Daniel</span>
            <span style={{ fontSize: 34 * f, color: teal, marginLeft: 18 }}>Receptionist</span>
          </Card>
        </div>
        {t < at(s, 3) - 0.2 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 30 }}>
            {["Welcomes visitors", "Answers questions", "Books appointments"].map((x, i) => (
              <Card key={x} style={{ padding: "16px 24px", fontSize: 32 * f, fontWeight: 700, ...pop(t, at(s, 1) + i * 1.2) }}>
                {x}
              </Card>
            ))}
          </div>
        )}
        {t >= at(s, 3) - 0.2 && t < at(s, 6) - 0.2 && (
          <>
            <Quote t={t} start={at(s, 3)} who="A colleague says" f={f}>
              “We’ve got AI helping with almost everything now!”
            </Quote>
            {t >= at(s, 4) - 0.2 && (
              <div style={{ marginTop: 26, marginLeft: mobile ? 0 : 140, ...pop(t, at(s, 4)) }}>
                <Card style={{ display: "inline-block", background: lavender, fontSize: 42 * f, fontWeight: 700, borderBottomRightRadius: 6 }}>
                  Is everything on here AI?
                </Card>
              </div>
            )}
            {t >= at(s, 5) - 0.2 && (
              <div style={{ marginTop: 26, ...pop(t, at(s, 5)) }}>
                <Kicker size={36 * f} color={red}>Not quite</Kicker>
              </div>
            )}
          </>
        )}
        {t >= at(s, 6) - 0.2 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 34 }}>
            {tools.map((x, i) => (
              <Card key={x.id} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36 * f, fontWeight: 800, padding: 26, ...pop(t, at(s, 6) + i * 0.7) }}>
                <span style={{ fontSize: 52 * f }}>{x.icon}</span>
                {x.label}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* 2. The appointment reminder */
function Clock({ minutes, size }: { minutes: number; size: number }) {
  const h = (minutes / 60) * 30 + 30 * 13;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill={paper} stroke={ink} strokeWidth="8" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="97" y="16" width="6" height="16" rx="3" fill={ink} transform={`rotate(${i * 30} 100 100)`} />
      ))}
      <rect x="96" y="60" width="8" height="44" rx="4" fill={ink} transform={`rotate(${h} 100 100)`} />
      <rect x="96" y="36" width="8" height="68" rx="4" fill={violet} transform={`rotate(${(minutes % 60) * 6} 100 100)`} />
      <circle cx="100" cy="100" r="8" fill={ink} />
    </svg>
  );
}
function Reminder({ t, mobile }: P) {
  const s = "reminder";
  const f = mobile ? 0.86 : 1;
  const mins = 30 + ramp(t, at(s, 1) + 2, at(s, 2)) * 15;
  const popped = t >= at(s, 2) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#eef6f3" }}>
      <Label t={t} mobile={mobile} text="Tool 1: the calendar" start={at(s, 0)} />
      <div style={stage(mobile)}>
        <div style={{ display: "flex", gap: 40, alignItems: "center", flexDirection: mobile ? "column" : "row" }}>
          <Card style={{ flex: 1, width: mobile ? "100%" : undefined, ...pop(t, at(s, 0)) }}>
            <div style={{ fontSize: 28 * f, color: muted, fontWeight: 700 }}>Today</div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, background: lavender, borderRadius: 18, padding: 18 }}>
              <span style={{ fontSize: 38 * f, fontWeight: 900, color: violet }}>2:00 pm</span>
              <span style={{ fontSize: 32 * f, fontWeight: 700 }}>Visitor meeting</span>
            </div>
            {t >= at(s, 1) - 0.2 && (
              <div style={{ fontSize: 30 * f, marginTop: 16, ...pop(t, at(s, 1) + 1) }}>🔔 Reminder: 15 minutes before</div>
            )}
          </Card>
          <div style={{ textAlign: "center", ...pop(t, at(s, 1)) }}>
            <Clock minutes={mins} size={mobile ? 220 : 260} />
            <div style={{ fontSize: 40 * f, fontWeight: 900, marginTop: 8 }}>1:{String(Math.round(mins)).padStart(2, "0")} pm</div>
          </div>
        </div>
        {popped && t < at(s, 6) - 0.2 && (
          <Card style={{ marginTop: 30, background: mint, display: "flex", alignItems: "center", gap: 20, ...pop(t, at(s, 2)) }}>
            <span style={{ fontSize: 50 * f }}>🔔</span>
            <span style={{ fontSize: 40 * f, fontWeight: 800 }}>Reminder: visitor meeting at 2:00 pm</span>
          </Card>
        )}
        {t >= at(s, 6) - 0.2 && (
          <Card style={{ marginTop: 30, fontFamily: "Menlo, monospace", ...pop(t, at(s, 6)) }}>
            <div style={{ fontSize: 26 * f, color: muted, fontFamily: font, fontWeight: 700 }}>The instruction someone wrote</div>
            <div style={{ fontSize: 38 * f, fontWeight: 700, marginTop: 10 }}>
              WHEN an appointment is 15 minutes away
              <br />
              <span style={{ color: teal }}>THEN show a reminder</span>
            </div>
          </Card>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 26, alignItems: "center" }}>
          {t >= at(s, 5) - 0.2 && t < at(s, 6) - 0.2 && (
            <div style={pop(t, at(s, 5))}>
              <Kicker size={36 * f}>No AI needed</Kicker>
            </div>
          )}
          {t >= at(s, 8) - 0.2 &&
            ["Learn", "Guess", "Predict"].map((x, i) => (
              <Card key={x} style={{ padding: "12px 22px", fontSize: 32 * f, fontWeight: 800, color: red, ...pop(t, at(s, 8) + i * 0.4) }}>
                ✗ {x}
              </Card>
            ))}
          {t >= at(s, 9) - 0.2 && (
            <div style={pop(t, at(s, 9))}>
              <Kicker size={36 * f} color={ink}>Ordinary software</Kicker>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* 3. Visitor check-in */
function CheckIn({ t, mobile }: P) {
  const s = "check-in";
  const f = mobile ? 0.86 : 1;
  const name = "Priya Shah",
    host = "Tom Reed";
  const typed = ramp(t, at(s, 1) + 1, at(s, 1) + 5);
  const steps = ["Save the details", "Print a badge", "Message the host"];
  const stepOn = (i: number) => t >= at(s, 2) + i * 1.4;
  const instructions = t >= at(s, 4) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      <Label t={t} mobile={mobile} text="Tool 2: the check-in tablet" start={at(s, 0)} />
      <div style={{ ...stage(mobile), display: "flex", gap: 40, flexDirection: mobile ? "column" : "row", alignItems: "flex-start" }}>
        <div style={{ background: ink, borderRadius: 40, padding: 22, width: mobile ? "100%" : 520, boxSizing: "border-box", ...pop(t, at(s, 0)) }}>
          <div style={{ background: paper, borderRadius: 24, padding: 26 }}>
            <div style={{ fontSize: 34 * f, fontWeight: 900 }}>Welcome! Please sign in</div>
            {[
              ["Your name", name],
              ["Who are you meeting?", host],
            ].map(([label, value], i) => (
              <div key={label} style={{ marginTop: 18 }}>
                <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>{label}</div>
                <div style={{ border: `3px solid ${ink}`, borderRadius: 12, padding: "10px 14px", fontSize: 32 * f, minHeight: 40 * f, marginTop: 6 }}>
                  {value.slice(0, Math.round(ramp(typed, i * 0.5, i * 0.5 + 0.5) * value.length))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, width: mobile ? "100%" : undefined }}>
          {t >= at(s, 2) - 0.2 && (
            <Card style={pop(t, at(s, 2))}>
              {steps.map((x, i) => (
                <div key={x} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: i ? 18 : 0, fontSize: 36 * f, fontWeight: 700, opacity: stepOn(i) ? 1 : 0.35 }}>
                  <Check on={stepOn(i)} />
                  {instructions && <span style={{ fontSize: 24 * f, color: violet, fontWeight: 800 }}>INSTRUCTION {i + 1}</span>}
                  {x}
                </div>
              ))}
            </Card>
          )}
          {t >= at(s, 2) + 1.4 && t < at(s, 5) - 0.2 && (
            <Card style={{ marginTop: 26, display: "inline-flex", alignItems: "center", gap: 18, background: lavender, ...pop(t, at(s, 2) + 1.4) }}>
              <span style={{ fontSize: 48 * f }}>🪪</span>
              <span>
                <b style={{ fontSize: 34 * f }}>{name}</b>
                <br />
                <span style={{ fontSize: 26 * f, color: muted }}>Visiting {host}</span>
              </span>
            </Card>
          )}
          {t >= at(s, 5) - 0.2 && (
            <div style={{ marginTop: 30, ...pop(t, at(s, 5)) }}>
              <Kicker size={40 * f}>Automatic doesn’t mean AI</Kicker>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* 4. The smart inbox */
const examples = [
  { text: "Where can I park?", word: "park", tag: "Parking" },
  { text: "Is there visitor parking?", word: "parking", tag: "Parking" },
  { text: "A parcel arrived for Room 4", word: "parcel", tag: "Deliveries" },
  { text: "Which room is my 3 pm meeting in?", word: "room", tag: "Meeting rooms" },
];
const tagColour: Record<string, string> = { Parking: mint, Deliveries: blush, "Meeting rooms": lavender, "Visitor Information": "#fff3d6", "IT Support": "#dfe9fb" };
function Highlight({ text, word, on }: { text: string; word: string; on: boolean }) {
  const i = text.toLowerCase().indexOf(word);
  if (i < 0 || !on) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: "#ffe08a", borderRadius: 6, padding: "0 4px" }}>{text.slice(i, i + word.length)}</mark>
      {text.slice(i + word.length)}
    </>
  );
}
function Tag({ children, f }: { children: string; f: number }) {
  return <span style={{ background: tagColour[children] ?? mint, borderRadius: 999, padding: "6px 16px", fontSize: 24 * f, fontWeight: 800, whiteSpace: "nowrap" }}>{children}</span>;
}
function Inbox({ t, mobile }: P) {
  const s = "smart-inbox";
  const f = mobile ? 0.86 : 1;
  const trained = t >= at(s, 5) - 0.1;
  const learned = t >= at(s, 6) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#eef2f8" }}>
      <Label t={t} mobile={mobile} text="Tool 3: the smart inbox" start={at(s, 0)} />
      <div style={stage(mobile)}>
        {!trained && (
          <>
            <Card style={pop(t, at(s, 0))}>
              <div style={{ fontSize: 28 * f, color: muted, fontWeight: 700 }}>Shared reception inbox</div>
              {["Parking", "Deliveries", "Meeting rooms", "Visitor access"].map((x, i) => (
                <div key={x} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, fontSize: 32 * f, ...pop(t, at(s, 1) + i * 0.7) }}>
                  <span>✉️</span> A question about {x.toLowerCase()}
                </div>
              ))}
            </Card>
            {t >= at(s, 2) - 0.2 && (
              <Card style={{ marginTop: 26, background: lavender, fontSize: 38 * f, fontWeight: 800, ...pop(t, at(s, 2)) }}>
                New: a tool that suggests where each message goes
              </Card>
            )}
            {t >= at(s, 4) - 0.2 && (
              <div style={{ marginTop: 22, ...pop(t, at(s, 4)) }}>
                <Kicker size={34 * f} color={red}>No rule for every message</Kicker>
              </div>
            )}
          </>
        )}
        {trained && (
          <div style={{ display: "flex", gap: 30, alignItems: "center", flexDirection: mobile ? "column" : "row" }}>
            <Card style={{ flex: 1.3, width: mobile ? "100%" : undefined, ...pop(t, at(s, 5)) }}>
              <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Already sorted by people</div>
              {examples.map((x, i) => (
                <div key={x.text} style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", marginTop: 14, fontSize: 30 * f, ...pop(t, at(s, 5) + i * 0.5) }}>
                  <span>
                    <Highlight text={x.text} word={x.word} on={learned} />
                  </span>
                  <Tag f={f}>{x.tag}</Tag>
                </div>
              ))}
            </Card>
            <Arrow down={mobile} opacity={ramp(t, at(s, 6), at(s, 6) + 0.5)} />
            <div style={{ flex: 1, width: mobile ? "100%" : undefined }}>
              {t >= at(s, 6) + 2 && (
                <Card style={{ background: mint, ...pop(t, at(s, 6) + 2) }}>
                  <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>New message</div>
                  <div style={{ fontSize: 34 * f, fontWeight: 700, marginTop: 8 }}>
                    <Highlight text="Can I park outside today?" word="park" on />
                  </div>
                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, fontSize: 28 * f }}>
                    Suggested: <Tag f={f}>Parking</Tag>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 28 }}>
          {t >= at(s, 7) - 0.2 && (
            <div style={pop(t, at(s, 7))}>
              <Kicker size={36 * f} color={violet}>Machine learning</Kicker>
            </div>
          )}
          {t >= at(s, 8) - 0.2 && (
            <div style={pop(t, at(s, 8))}>
              <Kicker size={36 * f} color={ink}>A prediction, not a promise</Kicker>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* 5. When the prediction is wrong */
function Wrong({ t, mobile }: P) {
  const s = "wrong-prediction";
  const f = mobile ? 0.86 : 1;
  const moved = t >= at(s, 6) + 1.2;
  return (
    <>
      <Office tone="#f3f0fa" />
      <DanielIn t={t} mobile={mobile} hold={ramp(t, at(s, 0), at(s, 0) + 0.6)} mood={t >= at(s, 5) ? "thinking" : "calm"} />
      <div style={beside(mobile)}>
        {t >= at(s, 1) - 0.2 && (
          <Card style={pop(t, at(s, 1))}>
            <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>New message</div>
            <div style={{ fontSize: 40 * f, fontWeight: 800, marginTop: 8 }}>
              “The{" "}
              <mark style={{ background: t >= at(s, 4) ? "#ffe08a" : "transparent", borderRadius: 6 }}>visitor check-in</mark>{" "}
              tablet isn’t working.”
            </div>
            {t >= at(s, 2) - 0.2 && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, fontSize: 30 * f, ...pop(t, at(s, 2)) }}>
                Filed under:
                <span style={{ textDecoration: moved ? "line-through" : undefined, opacity: moved ? 0.5 : 1 }}>
                  <Tag f={f}>Visitor Information</Tag>
                </span>
                {moved && <Tag f={f}>IT Support</Tag>}
                {moved && <b style={{ color: teal }}>✓ moved by Daniel</b>}
              </div>
            )}
          </Card>
        )}
        {t >= at(s, 3) - 0.2 && t < at(s, 7) - 0.2 && (
          <Card style={{ marginTop: 26, background: "#fff3d6", fontSize: 34 * f, fontWeight: 700, ...pop(t, at(s, 3)) }}>
            Why? The words <b>visitor</b> and <b>check-in</b> often appear in visitor questions.
          </Card>
        )}
        {t >= at(s, 7) - 0.2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 26 }}>
            <Card style={{ ...pop(t, at(s, 7)) }}>
              <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>The tool</div>
              <div style={{ fontSize: 34 * f, fontWeight: 800, marginTop: 6 }}>Matched words</div>
            </Card>
            <Card style={{ background: mint, ...pop(t, at(s, 8)) }}>
              <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Daniel</div>
              <div style={{ fontSize: 34 * f, fontWeight: 800, marginTop: 6 }}>Understood the need</div>
            </Card>
          </div>
        )}
        {t >= at(s, 9) - 0.2 && (
          <div style={{ marginTop: 26, ...pop(t, at(s, 9)) }}>
            <Kicker size={36 * f}>Predictions need a human check</Kicker>
          </div>
        )}
      </div>
    </>
  );
}

/* 6. So what's the difference? */
function Difference({ t, mobile }: P) {
  const s = "difference";
  const f = mobile ? 0.86 : 1;
  const closing = t >= at(s, 8) - 0.1;
  const column = (title: string, colour: string, items: { text: string; start: number; note?: string }[], start: number) => (
    <Card style={{ flex: 1, background: colour, ...pop(t, start) }}>
      <div style={{ fontSize: 34 * f, fontWeight: 900 }}>{title}</div>
      {items.map((x) =>
        t >= x.start - 0.2 ? (
          <div key={x.text} style={{ background: paper, borderRadius: 18, padding: "14px 18px", marginTop: 14, fontSize: 32 * f, fontWeight: 700, ...pop(t, x.start) }}>
            {x.text}
            {x.note && <div style={{ fontSize: 24 * f, color: muted, fontWeight: 600, marginTop: 4 }}>{x.note}</div>}
          </div>
        ) : null,
      )}
    </Card>
  );
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      {!closing ? (
        <div style={stage(mobile)}>
          <div style={{ fontSize: 52 * f, fontWeight: 900, ...pop(t, at(s, 0)) }}>So, what’s the difference?</div>
          <div style={{ display: "flex", gap: 26, marginTop: 30, flexDirection: mobile ? "column" : "row" }}>
            {column("Follows instructions people wrote", mint, [
              { text: "📅 Appointment reminder", start: at(s, 1) },
              { text: "📲 Visitor check-in", start: at(s, 1) + 1.5 },
            ], at(s, 1))}
            {column("AI", lavender, [
              { text: "📥 Smart inbox", note: "Learns patterns from examples", start: at(s, 3) },
              { text: "📜 Expert systems (Lesson 3)", note: "Rules written down from experts’ knowledge", start: at(s, 6) },
            ], at(s, 3))}
          </div>
          {t >= at(s, 2) - 0.2 && t < at(s, 5) && (
            <div style={{ marginTop: 22, ...pop(t, at(s, 2)) }}>
              <Kicker size={32 * f}>Useful, automatic, reliable, no AI needed</Kicker>
            </div>
          )}
          {t >= at(s, 5) - 0.2 && (
            <div style={{ marginTop: 22, ...pop(t, at(s, 5)) }}>
              <Kicker size={32 * f} color={violet}>A twist: some AI uses rules too</Kicker>
            </div>
          )}
        </div>
      ) : (
        <div style={stage(mobile)}>
          <Card style={{ background: lavender, ...pop(t, at(s, 8)) }}>
            <div style={{ fontSize: 30 * f, color: muted, fontWeight: 700 }}>Don’t just go by the label. Ask:</div>
            <div style={{ fontSize: 56 * f, fontWeight: 900, marginTop: 12, lineHeight: 1.2 }}>What does it actually do?</div>
            {t >= at(s, 10) + 1 && (
              <div style={{ fontSize: 56 * f, fontWeight: 900, marginTop: 8, lineHeight: 1.2, color: violet, ...enter(ramp(t, at(s, 10) + 1, at(s, 10) + 1.6)) }}>
                How does it work?
              </div>
            )}
          </Card>
          {t >= at(s, 11) - 0.2 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 30, alignItems: "center" }}>
              {["Automatic", "Helpful", "Impressive"].map((x, i) => (
                <Card key={x} style={{ padding: "14px 24px", fontSize: 34 * f, fontWeight: 800, ...pop(t, at(s, 11) + i * 0.5) }}>
                  {x}
                </Card>
              ))}
              <div style={pop(t, at(s, 11) + 2)}>
                <Kicker size={34 * f} color={ink}>…but not always AI</Kicker>
              </div>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
}

export function AiOrSoftware({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene = narration.scenes[Math.max(0, narration.scenes.findLastIndex((s) => s.start <= t))];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  const local = { t, mobile };
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink, overflow: "hidden" }}>
      <Html5Audio src={staticFile("lessons/ai-or-software/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "is-everything-ai" && <Intro {...local} />}
        {scene.id === "reminder" && <Reminder {...local} />}
        {scene.id === "check-in" && <CheckIn {...local} />}
        {scene.id === "smart-inbox" && <Inbox {...local} />}
        {scene.id === "wrong-prediction" && <Wrong {...local} />}
        {scene.id === "difference" && <Difference {...local} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
