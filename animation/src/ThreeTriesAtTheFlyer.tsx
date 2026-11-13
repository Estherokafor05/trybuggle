import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import narration from "../../public/lessons/three-tries-at-the-flyer/narration.json";
import { Avatar, ChatWindow, ChoiceScreen, MayaIn, Msg, typed } from "./chatKit";
import { Card, Kicker, Office, beside, cueStart, font, ink, lavender, mint, muted, paper, pop, ramp, red, stage, teal, violet, type P } from "./kit";

// Episode 2.3: Three Tries at the Flyer.
const at = cueStart(narration);
const mark = (on: boolean, colour = "#ffe08a"): React.CSSProperties => ({
  background: on ? colour : "transparent",
  color: on ? ink : "inherit",
  borderRadius: 6,
  padding: "0 4px",
});

/** A paper flyer pinned to a board. */
function Flyer({ f, children, style, label }: { f: number; children: React.ReactNode; style?: React.CSSProperties; label?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "22px 24px", boxShadow: "0 10px 24px #17243c2a", position: "relative", ...style }}>
      <span style={{ position: "absolute", top: -12, left: "50%", width: 24, height: 24, borderRadius: 999, background: red, transform: "translateX(-50%)" }} />
      {label && <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700, marginBottom: 8 }}>{label}</div>}
      {children}
    </div>
  );
}

/* 1. A few seconds at the noticeboard */
function Noticeboard({ t, mobile }: P) {
  const s = "noticeboard";
  const f = mobile ? 0.86 : 1;
  return (
    <>
      <Office />
      <MayaIn t={t} mobile={mobile} />
      <div style={beside(mobile)}>
        <Card style={pop(t, 0.3)}>
          <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Next job</div>
          <div style={{ fontSize: 44 * f, fontWeight: 900, marginTop: 6 }}>The open day flyer</div>
        </Card>
        {t >= at(s, 1) - 0.2 && (
          <div style={{ marginTop: 22, background: "#c99a63", borderRadius: 18, padding: 28, display: "flex", alignItems: "center", gap: 26, ...pop(t, at(s, 1)) }}>
            <Flyer f={f} style={{ width: 300 * f, height: 200 * f }}>
              <div style={{ fontSize: 30 * f, fontWeight: 900 }}>Open day</div>
              {[80, 60, 70].map((w) => <div key={w} style={{ height: 14 * f, width: `${w}%`, borderRadius: 7, background: "#d9d6e4", marginTop: 12 }} />)}
            </Flyer>
            <span style={{ fontSize: 90 * f, transform: `translateX(${ramp(t, at(s, 1), at(s, 2) + 3) * 120}px)` }}>🚶</span>
          </div>
        )}
        {t >= at(s, 2) - 0.2 && (
          <div style={{ marginTop: 22, ...pop(t, at(s, 2)) }}>
            <Kicker size={36 * f} color={violet}>⏱ A few seconds to see it and decide</Kicker>
          </div>
        )}
      </div>
    </>
  );
}

/* 2. The first draft */
const chips = ["Who", "What", "When", "Where", "Tone"];
function FirstDraft({ t, mobile }: P) {
  const s = "first-draft";
  const f = mobile ? 0.86 : 1;
  const reply = t >= at(s, 1) - 0.2;
  return (
    <AbsoluteFill style={{ background: "#f3f0fa" }}>
      <div style={stage(mobile)}>
        <ChatWindow f={f}>
          <Msg you f={f}>
            {typed("Write a short, friendly flyer for our open day…", t, at(s, 0) + 0.3, at(s, 0) + 2.5)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {chips.map((c, i) => (
                <span key={c} style={{ background: "#ffffff22", border: "2px solid #ffffff66", borderRadius: 999, padding: "2px 14px", fontSize: 22 * f, fontWeight: 800, ...pop(t, at(s, 0) + 1.5 + i * 0.8) }}>
                  ✓ {c}
                </span>
              ))}
            </div>
          </Msg>
          {reply && (
            <Msg f={f}>
              <span style={{ opacity: ramp(t, at(s, 1) - 0.2, at(s, 1) + 0.4) }}>
                <span style={mark(t >= at(s, 2), "#ffc4b8")}>We are delighted to announce that the community centre will be hosting its forthcoming open day</span>{" "}
                on <span style={mark(t >= at(s, 1) + 0.8 && t < at(s, 2), mint)}>Saturday the 21st, from 10 am to 3 pm</span>, in the{" "}
                <span style={mark(t >= at(s, 1) + 1.2 && t < at(s, 2), mint)}>main hall</span>, where local clubs and groups will be presenting their activities…
              </span>
            </Msg>
          )}
        </ChatWindow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 22 }}>
          {t >= at(s, 1) && t < at(s, 2) && <div style={pop(t, at(s, 1) + 0.4)}><Kicker size={32 * f}>✓ All the right details</Kicker></div>}
          {t >= at(s, 3) - 0.2 && <div style={pop(t, at(s, 3))}><Kicker size={34 * f} color={red}>“Nobody’s reading all that on their way out.”</Kicker></div>}
          {t >= at(s, 4) - 0.2 && <div style={pop(t, at(s, 4))}><Kicker size={32 * f} color={ink}>✏️ About to write it herself…</Kicker></div>}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* 4. Two more tries */
function Tries({ t, mobile }: P) {
  const s = "tries";
  const f = mobile ? 0.86 : 1;
  const third = t >= at(s, 4) - 0.1;
  const tryNo = third ? 3 : 2;
  return (
    <AbsoluteFill style={{ background: "#eef6f3" }}>
      <div style={stage(mobile)}>
        <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center", ...pop(t, at(s, 0)) }}>
          {[1, 2, 3].map((n) => (
            <span key={n} style={{ background: n <= tryNo ? teal : "#fff", color: n <= tryNo ? "#fff" : muted, border: `3px solid ${teal}`, borderRadius: 999, padding: "6px 20px", fontSize: 26 * f, fontWeight: 800 }}>
              Try {n}
            </span>
          ))}
          <span style={{ fontSize: 26 * f, color: muted, fontWeight: 700, marginLeft: 8 }}>Same chat</span>
        </div>
        <ChatWindow f={f}>
          {!third ? (
            <>
              {t >= at(s, 1) + 0.5 && <Msg you f={f}>{typed("Keep the date, time and place. Make it no more than fifty words.", t, at(s, 1) + 0.5, at(s, 1) + 4)}</Msg>}
              {t >= at(s, 2) - 0.2 && (
                <Msg f={f}>
                  <span style={{ opacity: ramp(t, at(s, 2) - 0.2, at(s, 2) + 0.4) }}>
                    Community centre open day. Saturday the 21st, 10 am to 3 pm, main hall. Meet local clubs and groups and discover{" "}
                    <span style={mark(t >= at(s, 3), "#ffc4b8")}>opportunities for community engagement</span>. All welcome.
                  </span>
                </Msg>
              )}
            </>
          ) : (
            <>
              {t >= at(s, 5) + 0.2 && <Msg you f={f}>{typed("Make it sound like I’m inviting a neighbour.", t, at(s, 5) + 0.2, at(s, 5) + 2)}</Msg>}
              {t >= at(s, 6) - 0.2 && (
                <Msg f={f}>
                  <span style={{ opacity: ramp(t, at(s, 6) - 0.2, at(s, 6) + 0.4) }}>
                    <span style={mark(t >= at(s, 6) + 1.2, mint)}>Come and see what’s happening at your community centre!</span> Open day, Saturday the 21st, 10 am to 3 pm, in the main hall. Meet local clubs, try something new and bring the family.
                  </span>
                </Msg>
              )}
            </>
          )}
        </ChatWindow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 22 }}>
          {!third && t >= at(s, 2) + 0.3 && <div style={pop(t, at(s, 2) + 0.5)}><Kicker size={32 * f}>✓ Fits on the flyer</Kicker></div>}
          {!third && t >= at(s, 3) + 0.5 && <div style={pop(t, at(s, 3) + 0.8)}><Kicker size={32 * f} color={red}>Still sounds stiff</Kicker></div>}
          {t >= at(s, 7) - 0.2 && <div style={pop(t, at(s, 7))}><Kicker size={34 * f}>✓ Sounds like Maya’s noticeboard</Kicker></div>}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* 5. A second language */
const bars = [78, 92, 64, 86, 55];
function Translation({ t, mobile }: P) {
  const s = "translation";
  const f = mobile ? 0.86 : 1;
  const checked = t >= at(s, 3) - 0.1;
  const up = t >= at(s, 4) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      <div style={stage(mobile)}>
        <div style={{ fontSize: 30 * f, fontWeight: 800, ...pop(t, at(s, 0)) }}>🌐 Some families read another language more easily</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, marginTop: 30, padding: up ? 26 : 0, background: up ? "#c99a63" : "transparent", borderRadius: 18 }}>
          <Flyer f={f} label="English" style={pop(t, at(s, 0) + 0.8)}>
            <div style={{ fontSize: 26 * f, fontWeight: 800, lineHeight: 1.35 }}>Come and see what’s happening at your community centre!</div>
            <div style={{ fontSize: 22 * f, color: muted, marginTop: 8 }}>Saturday the 21st · 10 am to 3 pm · Main hall</div>
          </Flyer>
          {t >= at(s, 1) - 0.2 && (
            <Flyer f={f} label="🌐 Translated version" style={pop(t, at(s, 1))}>
              {bars.map((w, i) => (
                <div key={i} style={{ height: 18 * f, width: `${w}%`, borderRadius: 9, marginTop: 12, background: checked && (i === 1 || i === 3) ? "#ffe08a" : "#d9d6e4" }} />
              ))}
              {checked && <div style={{ fontSize: 22 * f, fontWeight: 800, color: teal, marginTop: 12 }}>✓ 2 words changed</div>}
            </Flyer>
          )}
        </div>
        {t >= at(s, 2) - 0.2 && !up && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26, ...pop(t, at(s, 2)) }}>
            <Avatar name="Volunteer" colour={violet} />
            <span style={{ fontSize: 32 * f, fontWeight: 800 }}>Maya can’t check it, so a volunteer who speaks the language reads it</span>
          </div>
        )}
        {up && <div style={{ marginTop: 22, ...pop(t, at(s, 4)) }}><Kicker size={34 * f}>📌 Both versions go up</Kicker></div>}
      </div>
    </AbsoluteFill>
  );
}

/* 6. Keep the conversation going */
function KeepGoing({ t, mobile }: P) {
  const s = "keep-going";
  const f = mobile ? 0.86 : 1;
  const turn = t >= at(s, 3) - 0.1;
  return (
    <AbsoluteFill style={{ background: paper }}>
      <div style={stage(mobile)}>
        {!turn ? (
          <>
            <div style={{ fontSize: 50 * f, fontWeight: 900, ...pop(t, at(s, 0)) }}>Draft close? Keep the conversation going.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 26 }}>
              <Card style={{ background: mint, ...pop(t, at(s, 1)) }}>
                <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Say what to keep</div>
                <div style={{ fontSize: 34 * f, fontWeight: 800, marginTop: 8 }}>“Keep the date, time and place.”</div>
              </Card>
              <Card style={{ background: lavender, ...pop(t, at(s, 1) + 1) }}>
                <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Say what to change</div>
                <div style={{ fontSize: 34 * f, fontWeight: 800, marginTop: 8 }}>“No more than fifty words.”</div>
              </Card>
            </div>
            {t >= at(s, 2) - 0.2 && (
              <Card style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 18, ...pop(t, at(s, 2)) }}>
                <span style={{ fontSize: 48 * f }}>🙋</span>
                <span style={{ fontSize: 34 * f, fontWeight: 800 }}>Can’t check it yourself? Ask someone who can.</span>
              </Card>
            )}
          </>
        ) : (
          <Card style={pop(t, at(s, 3))}>
            <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Your turn</div>
            <div style={{ fontSize: 44 * f, fontWeight: 900, marginTop: 8 }}>Think of a draft you’d like to improve.</div>
            {t >= at(s, 5) - 0.2 && <div style={{ fontSize: 36 * f, fontWeight: 800, color: violet, marginTop: 20, ...pop(t, at(s, 5)) }}>📏 What would you type to change its length?</div>}
            {t >= at(s, 6) - 0.2 && <div style={{ fontSize: 36 * f, fontWeight: 800, color: teal, marginTop: 14, ...pop(t, at(s, 6)) }}>🗣 What would you type to change how it sounds?</div>}
          </Card>
        )}
      </div>
    </AbsoluteFill>
  );
}

export function ThreeTriesAtTheFlyer({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene = narration.scenes[Math.max(0, narration.scenes.findLastIndex((x) => x.start <= t))];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  const local = { t, mobile };
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink, overflow: "hidden" }}>
      <Html5Audio src={staticFile("lessons/three-tries-at-the-flyer/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "noticeboard" && <Noticeboard {...local} />}
        {scene.id === "first-draft" && <FirstDraft {...local} />}
        {scene.id === "choice" && <ChoiceScreen {...local} start={at("choice", 0)} question="The draft is close but too long and stiff. What would you say to the chat tool next?" />}
        {scene.id === "tries" && <Tries {...local} />}
        {scene.id === "translation" && <Translation {...local} />}
        {scene.id === "keep-going" && <KeepGoing {...local} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
