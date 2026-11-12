import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import narration from "../../public/lessons/what-ai-can-do/narration.json";
import { Person, amina } from "./Person";
import {
  Arrow, Card, Check, Kicker, Label, Office, Quote, beside, blush, cueStart, font, ink,
  lavender, mint, muted, paper, pop, ramp, red, stage, teal, violet, type P,
} from "./kit";

// Lesson 5: What AI Can Do, and Where You Stay in Charge. Amina, HR.
const at = cueStart(narration);

function AminaIn({ t, mobile, hold = 0, mood = "calm" }: P & { hold?: number; mood?: "calm" | "thinking" | "smile" }) {
  return (
    <div style={{ position: "absolute", left: mobile ? 560 : 70, top: mobile ? 610 : 130, width: mobile ? 380 : 450, height: mobile ? 665 : 790 }}>
      <Person look={amina} time={t} hold={hold} mood={mood} />
    </div>
  );
}
const jobLines = ["Office administrator", "Manage the team diary and bookings", "Answer phone and email enquiries", "Keep records up to date", "Based at head office"];
const questions = [
  "Tell us about a time you managed a busy diary.",
  "How do you keep records accurate?",
  "How would you handle a difficult phone call?",
  "Do you have children, or are you planning to?",
];

/* 1. A busy recruitment week */
function Week({ t, mobile }: P) {
  const s = "busy-week";
  const f = mobile ? 0.86 : 1;
  return (
    <>
      <Office tone="#f6eef2" />
      <AminaIn t={t} mobile={mobile} hold={ramp(t, at(s, 3), at(s, 3) + 0.6)} />
      <div style={beside(mobile)}>
        <div style={pop(t, 0.4)}>
          <Card style={{ display: "inline-block", padding: "20px 30px" }}>
            <span style={{ fontSize: 46 * f, fontWeight: 800 }}>Amina</span>
            <span style={{ fontSize: 34 * f, color: teal, marginLeft: 18 }}>HR</span>
          </Card>
        </div>
        {t >= at(s, 2) - 0.2 && (
          <Card style={{ marginTop: 28, ...pop(t, at(s, 2)) }}>
            <div style={{ fontSize: 28 * f, color: muted, fontWeight: 700 }}>Hiring: office administrator</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 14 }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
                <div key={d} style={{ background: i % 2 ? lavender : blush, borderRadius: 14, padding: "12px 6px", textAlign: "center", fontSize: 24 * f, fontWeight: 800, ...pop(t, at(s, 2) + 0.5 + i * 0.3) }}>
                  {d}
                  <div style={{ fontSize: 20 * f, fontWeight: 600, marginTop: 4 }}>Interviews</div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {t >= at(s, 3) - 0.2 && (
          <div style={{ marginTop: 26, ...pop(t, at(s, 3)) }}>
            <Kicker size={34 * f} color={violet}>✓ Company-approved AI assistant</Kicker>
          </div>
        )}
        {t >= at(s, 5) - 0.2 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 26 }}>
            {["How to use AI", "When to check its work"].map((x, i) => (
              <Card key={x} style={{ padding: "16px 24px", fontSize: 34 * f, fontWeight: 800, background: i ? mint : paper, ...pop(t, at(s, 5) + i * 1.5) }}>
                {x}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* 2. A useful starting point */
function Start({ t, mobile }: P) {
  const s = "starting-point";
  const f = mobile ? 0.86 : 1;
  const draft = ramp(t, at(s, 1), at(s, 1) + 3);
  return (
    <AbsoluteFill style={{ background: "#eef2f8" }}>
      <Label t={t} mobile={mobile} text="Asking the assistant" start={at(s, 0)} />
      <div style={stage(mobile)}>
      <div style={{ display: "flex", gap: 26, alignItems: "flex-start", flexDirection: mobile ? "column" : "row" }}>
        <Card style={{ flex: 1, width: mobile ? "100%" : undefined, ...pop(t, at(s, 0)) }}>
          <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>Job description (public)</div>
          {jobLines.map((x, i) => (
            <div key={x} style={{ fontSize: (i ? 26 : 34) * f, fontWeight: i ? 500 : 800, marginTop: 10 }}>{x}</div>
          ))}
          <div style={{ marginTop: 18, background: lavender, borderRadius: 16, padding: 14, fontSize: 26 * f }}>
            “Suggest ten interview questions, and write a short summary of the job.”
          </div>
        </Card>
        <Arrow down={mobile} opacity={ramp(t, at(s, 1) - 0.5, at(s, 1))} />
        <Card style={{ flex: 1.2, width: mobile ? "100%" : undefined, background: mint, opacity: ramp(t, at(s, 1) - 0.3, at(s, 1)) }}>
          <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>AI draft</div>
          {questions.slice(0, 3).map((q, i) => (
            <div key={q} style={{ fontSize: 28 * f, marginTop: 10, opacity: ramp(draft, i * 0.2, i * 0.2 + 0.2) }}>
              {i + 1}. {q}
            </div>
          ))}
          <div style={{ fontSize: 28 * f, marginTop: 10, opacity: ramp(draft, 0.6, 0.8) }}>…</div>
          <div style={{ fontSize: 26 * f, marginTop: 12, opacity: ramp(draft, 0.8, 1) }}>
            <b>Summary:</b> Join our friendly office team…
          </div>
        </Card>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 26 }}>
        {t >= at(s, 3) - 0.2 && (
          <div style={pop(t, at(s, 3))}>
            <Kicker size={32 * f} color={ink}>A first draft to review</Kicker>
          </div>
        )}
        {t >= at(s, 4) - 0.2 && (
          <div style={pop(t, at(s, 4))}>
            <Kicker size={32 * f} color={violet}>Generative AI: creates new text</Kicker>
          </div>
        )}
      </div>
      </div>
    </AbsoluteFill>
  );
}

/* 3. Something isn't right */
function NeedsChecking({ t, mobile }: P) {
  const s = "needs-checking";
  const f = mobile ? 0.86 : 1;
  const second = t >= at(s, 4) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      <Label t={t} mobile={mobile} text="Checking the draft" start={at(s, 0)} />
      <div style={stage(mobile)}>
        {!second ? (
          <div style={{ display: "flex", gap: 26, flexDirection: mobile ? "column" : "row" }}>
            <Card style={{ flex: 1, ...pop(t, at(s, 0)) }}>
              <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>AI summary</div>
              <div style={{ fontSize: 30 * f, marginTop: 10, lineHeight: 1.4 }}>
                Join our friendly office team. You’ll manage the diary and keep records up to date.{" "}
                <mark style={{ background: t >= at(s, 1) ? "#ffd1c7" : "transparent", borderRadius: 6, padding: "0 4px" }}>
                  A full driving licence is required.
                </mark>
              </div>
            </Card>
            <Card style={{ flex: 1, ...pop(t, at(s, 2)) }}>
              <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>Job description</div>
              {jobLines.map((x) => (
                <div key={x} style={{ fontSize: 26 * f, marginTop: 8 }}>{x}</div>
              ))}
              {t >= at(s, 2) && (
                <div style={{ marginTop: 14, fontSize: 28 * f, fontWeight: 800, color: red }}>✗ No driving licence mentioned</div>
              )}
            </Card>
          </div>
        ) : (
          <Card style={pop(t, at(s, 4))}>
            <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>Suggested questions</div>
            {questions.map((q, i) => {
              const bad = i === 3;
              const struck = bad && t >= at(s, 6);
              return (
                <div key={q} style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 12, fontSize: 30 * f, background: bad && t < at(s, 6) ? "#ffd1c7" : "transparent", borderRadius: 12, padding: "6px 10px" }}>
                  <span style={{ textDecoration: struck ? "line-through" : undefined, opacity: struck ? 0.45 : 1 }}>
                    {bad ? 7 : i + 1}. {q}
                  </span>
                  {bad && t >= at(s, 5) && <b style={{ color: red, whiteSpace: "nowrap" }}>✗ Not about the job</b>}
                </div>
              );
            })}
          </Card>
        )}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 26 }}>
          {t >= at(s, 3) - 0.2 && !second && (
            <div style={pop(t, at(s, 3))}>
              <Kicker size={32 * f} color={red}>Made up, but sounded confident</Kicker>
            </div>
          )}
          {t >= at(s, 6) - 0.2 && (
            <div style={pop(t, at(s, 6) + 2)}>
              <Kicker size={32 * f}>✓ Checked against interview guidance</Kicker>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* 4. Protecting people's information */
function Privacy({ t, mobile }: P) {
  const s = "privacy";
  const f = mobile ? 0.86 : 1;
  const checks = ["Is the tool approved?", "Is it secure?", "Do our privacy rules allow it?"];
  return (
    <>
      <Office tone="#eef6f3" />
      <AminaIn t={t} mobile={mobile} mood={t >= at(s, 2) ? "thinking" : "calm"} />
      <div style={beside(mobile)}>
        {t < at(s, 5) - 0.2 ? (
          <>
            <Quote t={t} start={at(s, 1)} who="A colleague suggests" f={f}>
              “Paste all the applicants’ CVs into an AI website.”
            </Quote>
            {t >= at(s, 2) - 0.2 && (
              <div style={{ marginTop: 22, ...pop(t, at(s, 2)) }}>
                <Kicker size={36 * f} color={red}>Amina stops</Kicker>
              </div>
            )}
            {t >= at(s, 3) - 0.2 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 24 }}>
                {["Names", "Addresses", "Work histories"].map((x, i) => (
                  <Card key={x} style={{ padding: "14px 22px", fontSize: 32 * f, fontWeight: 800, background: blush, ...pop(t, at(s, 3) + i * 0.6) }}>
                    🔒 {x}
                  </Card>
                ))}
              </div>
            )}
            {t >= at(s, 4) - 0.2 && (
              <Card style={{ marginTop: 22, fontSize: 32 * f, fontWeight: 700, ...pop(t, at(s, 4)) }}>
                Real people shared them for one purpose.
              </Card>
            )}
          </>
        ) : (
          <>
            <Card style={pop(t, at(s, 5))}>
              <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Before sharing personal information</div>
              {checks.map((x, i) => (
                <div key={x} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, fontSize: 34 * f, fontWeight: 700, ...pop(t, at(s, 5) + 1 + i * 1.2) }}>
                  <Check on={false} /> {x}
                </div>
              ))}
            </Card>
            {t >= at(s, 6) - 0.2 && (
              <Card style={{ marginTop: 22, background: lavender, display: "flex", alignItems: "center", gap: 16, ...pop(t, at(s, 6)) }}>
                <span style={{ fontSize: 40 * f, fontWeight: 900, color: red }}>✗</span>
                <span style={{ fontSize: 32 * f, fontWeight: 700 }}>Able to process it doesn’t mean it’s the right place</span>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}

/* 5. Who makes the decision? */
function Panel({ w }: { w: number }) {
  const people = ["#8a5a3c", "#e2a984", "#6e4330"];
  return (
    <svg width={w} height={w * 0.45} viewBox="0 0 600 270" aria-hidden="true">
      {people.map((skin, i) => (
        <g key={i} transform={`translate(${130 + i * 170} 40)`}>
          <circle r="42" cy="40" fill={skin} />
          <path d="M-62 160q0-70 62-70t62 70z" fill={[violet, teal, "#b8476a"][i]} />
        </g>
      ))}
      <rect x="20" y="170" width="560" height="26" rx="10" fill="#c9875e" />
      <rect x="250" y="140" width="100" height="40" rx="6" fill="#fff" stroke={ink} strokeWidth="4" />
    </svg>
  );
}
function Decides({ t, mobile }: P) {
  const s = "who-decides";
  const f = mobile ? 0.86 : 1;
  return (
    <AbsoluteFill style={{ background: "#f3f0fa" }}>
      <Label t={t} mobile={mobile} text="Who decides?" start={at(s, 0)} />
      <div style={stage(mobile)}>
        <div style={{ display: "flex", gap: 26, alignItems: "center", flexDirection: mobile ? "column" : "row" }}>
          <div style={{ flex: 1.2, ...pop(t, at(s, 0)) }}>
            <Panel w={mobile ? 720 : 760} />
            <div style={{ fontSize: 34 * f, fontWeight: 800, textAlign: "center", marginTop: 6 }}>The interview panel</div>
          </div>
          {t >= at(s, 1) - 0.2 && (
            <Card style={{ flex: 1, opacity: 0.85, ...pop(t, at(s, 1)) }}>
              <div style={{ fontSize: 30 * f, fontWeight: 900, color: muted }}>💻 The AI assistant</div>
              {t >= at(s, 2) - 0.2 &&
                ["Doesn’t know the candidates", "Can repeat unfair patterns"].map((x, i) => (
                  <div key={x} style={{ fontSize: 28 * f, marginTop: 12, fontWeight: 700, color: red, ...pop(t, at(s, 2) + 1.5 + i * 2) }}>
                    ✗ {x}
                  </div>
                ))}
            </Card>
          )}
        </div>
        {t >= at(s, 3) - 0.2 && (
          <Card style={{ marginTop: 26, background: mint, display: "flex", gap: 18, alignItems: "center", ...pop(t, at(s, 3)) }}>
            <span style={{ fontSize: 44 * f }}>📋</span>
            <span style={{ fontSize: 34 * f, fontWeight: 800 }}>Same agreed criteria for every candidate</span>
          </Card>
        )}
        {t >= at(s, 4) - 0.2 && (
          <div style={{ marginTop: 22, ...pop(t, at(s, 4)) }}>
            <Kicker size={36 * f} color={ink}>People stay in charge</Kicker>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* 6. Stay in charge */
function InCharge({ t, mobile }: P) {
  const s = "in-charge";
  const f = mobile ? 0.86 : 1;
  const qs = ["Is it correct?", "Is it fair?", "Am I protecting people’s information?", "Should a person make this decision?"];
  const closing = t >= at(s, 6) - 0.1;
  return (
    <>
      <Office tone="#f6eef2" />
      <AminaIn t={t} mobile={mobile} mood="smile" />
      <div style={beside(mobile)}>
        {!closing ? (
          <Card style={pop(t, at(s, 1))}>
            <div style={{ fontSize: 28 * f, color: muted, fontWeight: 700 }}>Before using anything AI produces</div>
            {qs.map((x, i) => (
              <div key={x} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, fontSize: 36 * f, fontWeight: 800, opacity: t >= at(s, 2 + i) - 0.1 ? 1 : 0.3 }}>
                <Check on={t >= at(s, 2 + i)} /> {x}
              </div>
            ))}
          </Card>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {["Write", "Organise ideas", "Save time"].map((x, i) => (
                <Card key={x} style={{ padding: "14px 22px", fontSize: 34 * f, fontWeight: 800, background: mint, ...pop(t, at(s, 6) + i * 0.6) }}>
                  ✓ {x}
                </Card>
              ))}
            </div>
            {t >= at(s, 7) - 0.2 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 18 }}>
                {["Makes mistakes", "Sounds sure when wrong", "Misses what matters"].map((x, i) => (
                  <Card key={x} style={{ padding: "14px 22px", fontSize: 32 * f, fontWeight: 800, background: blush, ...pop(t, at(s, 7) + i * 0.8) }}>
                    ⚠ {x}
                  </Card>
                ))}
              </div>
            )}
            {t >= at(s, 8) - 0.2 && (
              <Card style={{ marginTop: 24, background: lavender, fontSize: 40 * f, fontWeight: 900, lineHeight: 1.3, ...pop(t, at(s, 8)) }}>
                AI helps with the work.
                <br />
                <span style={{ color: violet }}>People stay responsible for the decisions.</span>
              </Card>
            )}
            {t >= at(s, 9) - 0.2 && (
              <div style={{ marginTop: 24, ...pop(t, at(s, 9)) }}>
                <Kicker size={36 * f}>🎉 Module 1 lessons complete</Kicker>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export function WhatAiCanDo({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene = narration.scenes[Math.max(0, narration.scenes.findLastIndex((s) => s.start <= t))];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  const local = { t, mobile };
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink, overflow: "hidden" }}>
      <Html5Audio src={staticFile("lessons/what-ai-can-do/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "busy-week" && <Week {...local} />}
        {scene.id === "starting-point" && <Start {...local} />}
        {scene.id === "needs-checking" && <NeedsChecking {...local} />}
        {scene.id === "privacy" && <Privacy {...local} />}
        {scene.id === "who-decides" && <Decides {...local} />}
        {scene.id === "in-charge" && <InCharge {...local} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
