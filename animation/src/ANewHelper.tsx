import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import narration from "../../public/lessons/a-new-helper/narration.json";
import { Bubble, ChatWindow, MayaIn, Msg, typed } from "./chatKit";
import {
  Card, Kicker, Office, beside, cueStart, font, ink, lavender, mint, muted, paper, pop, ramp, red,
  stage, teal, violet, type P,
} from "./kit";

// Episode 2.1: A New Helper. Maya, her manager Rosa and colleague Leo.
// No real AI tool appears: chats are a generic "AI chat tool" screen.
const at = cueStart(narration);

const request = "Write a short, welcoming paragraph about our community centre for the open day newsletter.";
const draft = [
  "Our community centre is a warm, welcoming place for people of all ages.",
  "For over fifty years, our centre has brought people together.",
  "With activities, clubs and friendly faces, there is something for everyone.",
];

/* 1. An open day in three weeks */
function OpenDay({ t, mobile }: P) {
  const s = "open-day";
  const f = mobile ? 0.86 : 1;
  const listing = t >= at(s, 8) - 0.1;
  const items = ["Book the rooms", "Call the volunteers", "Get something into the newsletter", "Answer those emails"];
  return (
    <>
      <Office />
      <MayaIn t={t} mobile={mobile} />
      <div style={beside(mobile)}>
        <div style={pop(t, 0.3)}>
          <Card style={{ display: "inline-block", padding: "20px 30px" }}>
            <span style={{ fontSize: 46 * f, fontWeight: 800 }}>Maya</span>
            <span style={{ fontSize: 32 * f, color: teal, marginLeft: 18 }}>Community centre office</span>
          </Card>
        </div>
        {!listing ? (
          <>
            {t >= at(s, 2) - 0.2 && t < at(s, 3) - 0.2 && (
              <Card style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 18, ...pop(t, at(s, 2)) }}>
                <span style={{ fontSize: 50 * f }}>📧</span>
                <span style={{ fontSize: 34 * f, fontWeight: 700 }}>23 unread emails</span>
              </Card>
            )}
            {t >= at(s, 3) - 0.2 && <Bubble t={t} start={at(s, 3)} who="Rosa" colour={teal} f={f}>“We’re holding an open day. Could you organise it?”</Bubble>}
            {t >= at(s, 5) - 0.2 && <Bubble t={t} start={at(s, 5)} who="Maya" colour={violet} f={f} right>“Of course. When is it?”</Bubble>}
            {t >= at(s, 6) - 0.2 && <Bubble t={t} start={at(s, 6)} who="Rosa" colour={teal} f={f}>“Three weeks from Saturday.”</Bubble>}
            {t >= at(s, 7) - 0.2 && (
              <div style={{ marginTop: 20, textAlign: "right", ...pop(t, at(s, 7)) }}>
                <Kicker size={46 * f} color={red}>Three weeks?!</Kicker>
              </div>
            )}
          </>
        ) : (
          <Card style={{ marginTop: 26, ...pop(t, at(s, 8)) }}>
            <div style={{ fontSize: 28 * f, color: muted, fontWeight: 700 }}>Maya’s list</div>
            {items.map((x, i) => (
              <div key={x} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, fontSize: 36 * f, fontWeight: 700, ...pop(t, at(s, 9 + i)) }}>
                <span style={{ width: 34, height: 34, border: `4px solid ${ink}`, borderRadius: 8, flexShrink: 0 }} />
                {x}
              </div>
            ))}
          </Card>
        )}
      </div>
    </>
  );
}

/* 2. Leo suggests a chat tool */
function NewHelper({ t, mobile }: P) {
  const s = "new-helper";
  const f = mobile ? 0.86 : 1;
  return (
    <>
      <Office tone="#eef6f3" />
      <MayaIn t={t} mobile={mobile} />
      <div style={beside(mobile)}>
        <Bubble t={t} start={at(s, 1)} who="Leo" colour="#b8476a" f={f}>“Why don’t you try an AI chat tool for the newsletter?”</Bubble>
        {t >= at(s, 3) - 0.2 && (
          <Card style={{ marginTop: 26, ...pop(t, at(s, 3)) }}>
            <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>AI chat tools, for example</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
              {["ChatGPT", "Gemini", "Claude", "Copilot"].map((x, i) => (
                <span key={x} style={{ background: lavender, borderRadius: 999, padding: "10px 20px", fontSize: 32 * f, fontWeight: 800, ...pop(t, at(s, 3) + 0.4 + i * 0.5) }}>{x}</span>
              ))}
            </div>
            {t >= at(s, 4) - 0.2 && <div style={{ marginTop: 18, fontSize: 30 * f, fontWeight: 700, color: teal, ...pop(t, at(s, 4)) }}>✓ Most have a free version</div>}
          </Card>
        )}
        {t >= at(s, 5) - 0.2 && (
          <div style={{ marginTop: 24, ...pop(t, at(s, 5)) }}>
            <Kicker size={34 * f} color={ink}>Ask in ordinary words</Kicker>
          </div>
        )}
      </div>
    </>
  );
}

/* 3. A polished first draft */
function FirstDraft({ t, mobile }: P) {
  const s = "first-draft";
  const f = mobile ? 0.86 : 1;
  const replyText = draft.join(" ");
  return (
    <AbsoluteFill style={{ background: "#f3f0fa" }}>
      <div style={stage(mobile)}>
        <ChatWindow f={f}>
          <Msg you f={f}>{typed(request, t, at(s, 0) + 0.5, at(s, 0) + 5.5)}</Msg>
          {t >= at(s, 1) - 0.3 && <Msg f={f}>{typed(replyText, t, at(s, 1), at(s, 1) + 3.2)}</Msg>}
        </ChatWindow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 24, alignItems: "center" }}>
          {t >= at(s, 2) - 0.2 && <div style={pop(t, at(s, 2))}><Kicker size={32 * f}>Warm</Kicker></div>}
          {t >= at(s, 3) - 0.2 && <div style={pop(t, at(s, 3))}><Kicker size={32 * f} color={violet}>Professional</Kicker></div>}
          {t >= at(s, 5) - 0.2 && (
            <Card style={{ padding: "12px 20px", fontSize: 30 * f, fontWeight: 700, ...pop(t, at(s, 5)) }}>Maya: “I could actually use this.”</Card>
          )}
          {t >= at(s, 6) - 0.2 && (
            <div style={{ ...pop(t, at(s, 6)), background: ink, color: "#fff", borderRadius: 14, padding: "12px 24px", fontSize: 30 * f, fontWeight: 800, boxShadow: `0 0 0 ${6 + Math.sin(t * 6) * 4}px #7155d955` }}>
              📋 Copy
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* 4. The choice */
function Choice({ t, mobile }: P) {
  const s = "choice";
  const f = mobile ? 0.86 : 1;
  return (
    <AbsoluteFill style={{ background: ink }}>
      <div style={{ ...stage(mobile), top: (mobile ? 330 : 260) / (mobile ? 1.18 : 1.3) }}>
        <div style={pop(t, at(s, 0))}>
          <Kicker size={30 * f} color={violet}>Your choice</Kicker>
        </div>
        <div style={{ color: "#fff", fontSize: 60 * f, fontWeight: 900, lineHeight: 1.2, marginTop: 24, ...pop(t, at(s, 1)) }}>
          If an answer sounds this confident, is that enough to trust it?
        </div>
        <div style={{ color: "#c9c3e8", fontSize: 32 * f, marginTop: 24, ...pop(t, at(s, 1) + 1.5) }}>Pause the film and decide before you carry on.</div>
      </div>
    </AbsoluteFill>
  );
}

/* 5. Fifty years? */
function FiftyYears({ t, mobile }: P) {
  const s = "fifty-years";
  const f = mobile ? 0.86 : 1;
  const explain = t >= at(s, 3) - 0.1;
  const bars = [
    { w: "together", p: 92 },
    { w: "closer", p: 6 },
    { w: "pancakes", p: 1 },
  ];
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      <div style={stage(mobile)}>
        {!explain ? (
          <>
            <Card style={pop(t, at(s, 0))}>
              <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>First draft</div>
              {draft.map((d, i) => (
                <div key={d} style={{ fontSize: 32 * f, lineHeight: 1.45, marginTop: 10, background: i === 1 && t >= at(s, 1) ? "#ffe08a" : "transparent", borderRadius: 8, padding: "2px 6px" }}>{d}</div>
              ))}
            </Card>
            {t >= at(s, 2) - 0.2 && (
              <div style={{ marginTop: 24, ...pop(t, at(s, 2)) }}>
                <Kicker size={40 * f} color={red}>“Fifty years? Where did it get that from?”</Kicker>
              </div>
            )}
          </>
        ) : (
          <>
            <Card style={pop(t, at(s, 3))}>
              <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>How a chat tool writes: the most likely next word</div>
              <div style={{ fontSize: 40 * f, fontWeight: 800, marginTop: 14 }}>Our centre has brought people …</div>
              {bars.map((b, i) => (
                <div key={b.w} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, ...pop(t, at(s, 3) + 1.5 + i * 0.6) }}>
                  <span style={{ width: 170 * f, fontSize: 30 * f, fontWeight: 700 }}>{b.w}</span>
                  <span style={{ flex: 1, height: 22, background: "#e7e2d6", borderRadius: 999 }}>
                    <span style={{ display: "block", height: 22, width: `${b.p * ramp(t, at(s, 3) + 2, at(s, 3) + 4)}%`, background: i === 0 ? teal : "#b7b0a2", borderRadius: 999 }} />
                  </span>
                </div>
              ))}
            </Card>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 22 }}>
              {t >= at(s, 6) - 0.2 && <div style={pop(t, at(s, 6))}><Kicker size={32 * f} color={red}>✗ Not checking facts</Kicker></div>}
              {t >= at(s, 7) - 0.2 && <div style={pop(t, at(s, 7))}><Kicker size={32 * f} color={violet}>Choosing words that sound right</Kicker></div>}
            </div>
            {t >= at(s, 8) - 0.2 && (
              <Card style={{ marginTop: 22, background: mint, fontSize: 34 * f, fontWeight: 800, ...pop(t, at(s, 8)) }}>
                Just as confident when it’s wrong as when it’s right.
              </Card>
            )}
            {t >= at(s, 10) - 0.2 && (
              <Card style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16, ...pop(t, at(s, 10)) }}>
                <span style={{ fontSize: 44 * f }}>📅</span>
                <span style={{ fontSize: 32 * f, fontWeight: 700 }}>When did the centre actually open?</span>
              </Card>
            )}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* 6. Draft first, then check */
function Habit({ t, mobile }: P) {
  const s = "habit";
  const f = mobile ? 0.86 : 1;
  const turn = t >= at(s, 5) - 0.1;
  return (
    <>
      <Office tone="#f6eef2" />
      <MayaIn t={t} mobile={mobile} checking={turn ? 0 : 1} />
      <div style={beside(mobile)}>
        {!turn ? (
          <>
            <Card style={{ background: "#fff7c2", transform: "rotate(-1.5deg)", ...pop(t, at(s, 1)) }}>
              <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>📝 Maya’s note</div>
              <div style={{ fontSize: 38 * f, fontWeight: 800, marginTop: 6 }}>Check opening date with Rosa before printing.</div>
            </Card>
            {t >= at(s, 2) - 0.2 && (
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 30, flexWrap: "wrap", ...pop(t, at(s, 2)) }}>
                <Kicker size={36 * f} color={violet}>1. Draft with AI</Kicker>
                <span style={{ fontSize: 40 * f, color: teal, fontWeight: 900 }}>→</span>
                {t >= at(s, 4) - 0.2 && <div style={pop(t, at(s, 4))}><Kicker size={36 * f}>2. Check the details</Kicker></div>}
              </div>
            )}
          </>
        ) : (
          <Card style={{ background: lavender, ...pop(t, at(s, 5)) }}>
            <div style={{ fontSize: 30 * f, color: muted, fontWeight: 700 }}>Your turn</div>
            <div style={{ fontSize: 44 * f, fontWeight: 900, marginTop: 10, lineHeight: 1.25 }}>What could a chat tool help you with this week?</div>
            {t >= at(s, 7) - 0.2 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18, ...pop(t, at(s, 7)) }}>
                {["A message", "A short description", "A list of ideas"].map((x) => (
                  <span key={x} style={{ background: paper, borderRadius: 999, padding: "10px 18px", fontSize: 28 * f, fontWeight: 700 }}>{x}</span>
                ))}
              </div>
            )}
            {t >= at(s, 8) - 0.2 && (
              <div style={{ fontSize: 36 * f, fontWeight: 800, color: violet, marginTop: 20, ...pop(t, at(s, 8)) }}>
                And one detail you’d check before using it?
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

export function ANewHelper({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene = narration.scenes[Math.max(0, narration.scenes.findLastIndex((x) => x.start <= t))];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  const local = { t, mobile };
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink, overflow: "hidden" }}>
      <Html5Audio src={staticFile("lessons/a-new-helper/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "open-day" && <OpenDay {...local} />}
        {scene.id === "new-helper" && <NewHelper {...local} />}
        {scene.id === "first-draft" && <FirstDraft {...local} />}
        {scene.id === "choice" && <Choice {...local} />}
        {scene.id === "fifty-years" && <FiftyYears {...local} />}
        {scene.id === "habit" && <Habit {...local} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
