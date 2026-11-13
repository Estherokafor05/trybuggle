import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import narration from "../../public/lessons/the-email-that-said-nothing/narration.json";
import { ChatWindow, ChoiceScreen, MayaIn, Msg, typed } from "./chatKit";
import { Card, Kicker, Office, beside, cueStart, font, ink, lavender, mint, muted, paper, pop, ramp, red, stage, teal, violet, type P } from "./kit";

// Episode 2.2: The Email That Said Nothing.
const at = cueStart(narration);
const mark = (on: boolean, colour = "#ffe08a"): React.CSSProperties => ({
  background: on ? colour : "transparent",
  // Highlights sit inside dark and light bubbles, so set the text colour too.
  color: on ? ink : "inherit",
  borderRadius: 6,
  padding: "0 4px",
});

/* 1. Inviting the clubs */
function Invite({ t, mobile }: P) {
  const s = "invite";
  const f = mobile ? 0.86 : 1;
  return (
    <>
      <Office />
      <MayaIn t={t} mobile={mobile} />
      <div style={beside(mobile)}>
        <Card style={pop(t, 0.3)}>
          <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Next job</div>
          <div style={{ fontSize: 44 * f, fontWeight: 900, marginTop: 6 }}>Invite local clubs and groups</div>
        </Card>
        {[
          { icon: "🌱", text: "Gardening club: bring some seedlings", n: 2 },
          { icon: "♟", text: "Chess club: run a quick game", n: 3 },
        ].map((x) =>
          t >= at(s, x.n) - 0.2 ? (
            <Card key={x.text} style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 18, padding: 24, ...pop(t, at(s, x.n)) }}>
              <span style={{ fontSize: 48 * f }}>{x.icon}</span>
              <span style={{ fontSize: 34 * f, fontWeight: 700 }}>{x.text}</span>
            </Card>
          ) : null,
        )}
      </div>
    </>
  );
}

/* 2. The email that said nothing */
function Vague({ t, mobile }: P) {
  const s = "vague";
  const f = mobile ? 0.86 : 1;
  const reply = t >= at(s, 1) - 0.3;
  const dateOn = t >= at(s, 3);
  return (
    <AbsoluteFill style={{ background: "#f3f0fa" }}>
      <div style={stage(mobile)}>
        <ChatWindow f={f}>
          <Msg you f={f}>{typed("Write an email about the open day.", t, at(s, 0) + 0.6, at(s, 0) + 2.5)}</Msg>
          {reply && (
            <Msg f={f}>
              <span style={{ opacity: ramp(t, at(s, 1) - 0.3, at(s, 1) + 0.3) }}>
                Join us for <span style={mark(t >= at(s, 1) + 0.5)}>an exciting event</span> with{" "}
                <span style={mark(t >= at(s, 1) + 1.5)}>fun for all the family</span>! Our open day is on{" "}
                <span style={mark(dateOn, "#ffc4b8")}>the twelfth</span>. We can’t wait to see you there!
              </span>
            </Msg>
          )}
        </ChatWindow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 24 }}>
          {t >= at(s, 2) - 0.2 && t < at(s, 3) - 0.1 && <div style={pop(t, at(s, 2))}><Kicker size={32 * f} color={teal}>Friendly enough…</Kicker></div>}
          {t >= at(s, 4) - 0.2 && <div style={pop(t, at(s, 4))}><Kicker size={34 * f} color={red}>“I never said the twelfth.”</Kicker></div>}
        </div>
        {t >= at(s, 5) - 0.2 && (
          <Card style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, ...pop(t, at(s, 5)) }}>
            <span style={{ fontSize: 44 * f }}>♟</span>
            <span style={{ fontSize: 32 * f, fontWeight: 700 }}>Chess club: run a stall? <span style={{ color: red }}>The email never asks.</span></span>
          </Card>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* 4. A better request */
const parts = [
  { label: "Who", text: "the people who run local clubs and community groups", colour: "#dfe9fb" },
  { label: "What", text: "invite them to run a stall … so they can meet people who might want to join", colour: mint },
  { label: "Where", text: "in the main hall", colour: "#fff3d6" },
  { label: "Tone", text: "short, friendly", colour: lavender },
];
function Better({ t, mobile }: P) {
  const s = "better";
  const f = mobile ? 0.86 : 1;
  const rewrite = t >= at(s, 4) - 0.1;
  const replied = t >= at(s, 8) - 0.2;
  return (
    <AbsoluteFill style={{ background: "#eef6f3" }}>
      <div style={stage(mobile)}>
        {!rewrite ? (
          <>
            <Card style={pop(t, at(s, 0))}>
              <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>What Maya typed</div>
              <div style={{ fontSize: 44 * f, fontWeight: 800, marginTop: 8 }}>“Write an email about the open day.”</div>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 16, marginTop: 22 }}>
              {t >= at(s, 1) - 0.2 && <Card style={{ fontSize: 30 * f, fontWeight: 700, ...pop(t, at(s, 1)) }}>✓ Maya knows what the open day is for</Card>}
              {t >= at(s, 2) - 0.2 && <Card style={{ fontSize: 30 * f, fontWeight: 700, ...pop(t, at(s, 2)) }}>✓ Maya knows who she wants there</Card>}
            </div>
            {t >= at(s, 3) - 0.2 && <div style={{ marginTop: 22, ...pop(t, at(s, 3)) }}><Kicker size={34 * f} color={red}>But the tool knew none of it</Kicker></div>}
          </>
        ) : !replied ? (
          <>
            <ChatWindow f={f}>
              <Msg you f={f}>
                <span style={{ opacity: ramp(t, at(s, 5) - 0.3, at(s, 5) + 0.4) }}>
                  Write a <span style={mark(t >= at(s, 5) + 1, parts[3].colour)}>short, friendly</span> email to{" "}
                  <span style={mark(t >= at(s, 5) + 2, parts[0].colour)}>the people who run local clubs and community groups</span>. Invite them to{" "}
                  <span style={mark(t >= at(s, 6) + 0.5, parts[1].colour)}>run a stall</span> at our open day{" "}
                  <span style={mark(t >= at(s, 6) + 2, parts[2].colour)}>in the main hall</span> so they can meet people who might want to join.
                  {t >= at(s, 7) - 0.1 && <span style={mark(true, "#ffd9a8")}> Saturday the 21st, 10 am to 3 pm.</span>}
                </span>
              </Msg>
            </ChatWindow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
              {[...parts, { label: "When", text: "", colour: "#ffd9a8" }].map((p, i) => (
                <span key={p.label} style={{ background: p.colour, borderRadius: 999, padding: "10px 20px", fontSize: 30 * f, fontWeight: 800, ...pop(t, i < 4 ? at(s, 5) + 1 + i * 0.6 : at(s, 7)) }}>
                  {p.label}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <ChatWindow f={f}>
              <Msg f={f}>
                Hello! We’d love your club or group to <b>run a stall</b> at our community centre open day, so you can meet people who might want to join. It’s on <b>Saturday the 21st, 10 am to 3 pm</b>, in the <b>main hall</b>. Just reply to let us know!
              </Msg>
            </ChatWindow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 22 }}>
              {t >= at(s, 9) - 0.2 && <div style={pop(t, at(s, 9))}><Kicker size={32 * f}>✓ Says where and when</Kicker></div>}
              {t >= at(s, 10) - 0.2 && <div style={pop(t, at(s, 10))}><Kicker size={32 * f} color={violet}>📅 Checked against the calendar</Kicker></div>}
              {t >= at(s, 10) + 2 && <div style={pop(t, at(s, 10) + 2)}><Kicker size={32 * f} color={ink}>✏️ Opening sounds like Maya</Kicker></div>}
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* 5. Keep contact details out */
function Private({ t, mobile }: P) {
  const s = "private";
  const f = mobile ? 0.86 : 1;
  const stopped = t >= at(s, 1) - 0.1;
  return (
    <>
      <Office tone="#f6eef2" />
      <MayaIn t={t} mobile={mobile} checking={stopped ? 0 : 1} />
      <div style={beside(mobile)}>
        <Card style={{ position: "relative", ...pop(t, at(s, 0)) }}>
          <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>Group leaders</div>
          {["Gardening club: A. Lewis · 07••• ••••••", "Chess club: K. Osei · 07••• ••••••", "Book club: M. Rossi · 07••• ••••••"].map((x) => (
            <div key={x} style={{ fontSize: 30 * f, marginTop: 10, fontFamily: "Menlo, monospace", opacity: t >= at(s, 3) ? 0.35 : 1 }}>{x}</div>
          ))}
          {t >= at(s, 3) - 0.2 && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", ...pop(t, at(s, 3)) }}>
              <span style={{ background: ink, color: "#fff", borderRadius: 999, padding: "12px 24px", fontSize: 32 * f, fontWeight: 800 }}>🔒 Kept out of the chat</span>
            </div>
          )}
        </Card>
        {stopped && t < at(s, 2) - 0.1 && <div style={{ marginTop: 22, ...pop(t, at(s, 1)) }}><Kicker size={40 * f} color={red}>✋ Stop</Kicker></div>}
        {t >= at(s, 2) - 0.2 && (
          <Card style={{ marginTop: 22, background: mint, ...pop(t, at(s, 2)) }}>
            <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>All the tool needs</div>
            <div style={{ fontSize: 40 * f, fontWeight: 800, marginTop: 6 }}>“Local club and group leaders”</div>
          </Card>
        )}
        {t >= at(s, 4) - 0.2 && <div style={{ marginTop: 22, ...pop(t, at(s, 4)) }}><Kicker size={32 * f} color={violet}>More on this in Module 3</Kicker></div>}
      </div>
    </>
  );
}

/* 6. Four questions before you ask */
const four = [
  { q: "Who’s it for?", colour: "#dfe9fb" },
  { q: "What should it say or do?", colour: mint },
  { q: "When and where?", colour: "#ffd9a8" },
  { q: "How should it sound?", colour: lavender },
];
function Four({ t, mobile }: P) {
  const s = "four-questions";
  const f = mobile ? 0.86 : 1;
  const turn = t >= at(s, 5) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      <div style={stage(mobile)}>
        <div style={{ fontSize: 50 * f, fontWeight: 900, ...pop(t, at(s, 0)) }}>Before you send a request, ask:</div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
          {four.map((x, i) => (
            <Card key={x.q} style={{ background: x.colour, padding: 24, fontSize: 34 * f, fontWeight: 800, opacity: turn ? 0.6 : 1, ...pop(t, at(s, 1 + i)) }}>
              <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>{i + 1}</div>
              {x.q}
            </Card>
          ))}
        </div>
        {turn && (
          <Card style={{ marginTop: 26, ...pop(t, at(s, 5)) }}>
            <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Your turn</div>
            <div style={{ fontSize: 40 * f, fontWeight: 900, marginTop: 8 }}>What message might you ask AI to write this week?</div>
            {t >= at(s, 7) - 0.2 && <div style={{ fontSize: 34 * f, fontWeight: 800, color: violet, marginTop: 14, ...pop(t, at(s, 7)) }}>What would you tell it so it has less to guess?</div>}
          </Card>
        )}
      </div>
    </AbsoluteFill>
  );
}

export function TheEmailThatSaidNothing({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene = narration.scenes[Math.max(0, narration.scenes.findLastIndex((x) => x.start <= t))];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  const local = { t, mobile };
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink, overflow: "hidden" }}>
      <Html5Audio src={staticFile("lessons/the-email-that-said-nothing/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "invite" && <Invite {...local} />}
        {scene.id === "vague" && <Vague {...local} />}
        {scene.id === "choice" && <ChoiceScreen {...local} start={at("choice", 0)} question="What could Maya add to her request to make the biggest difference?" />}
        {scene.id === "better" && <Better {...local} />}
        {scene.id === "private" && <Private {...local} />}
        {scene.id === "four-questions" && <Four {...local} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
