import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import narration from "../../public/lessons/thirty-pages-by-friday/narration.json";
import { Bubble, ChatWindow, ChoiceScreen, MayaIn, Msg, typed } from "./chatKit";
import { Card, Kicker, Office, beside, cueStart, font, ink, lavender, mint, muted, paper, pop, ramp, red, stage, teal, violet, type P } from "./kit";

// Episode 2.4: Thirty Pages by Friday.
const at = cueStart(narration);

/* 1. Thirty pages by Friday */
function Monday({ t, mobile }: P) {
  const s = "monday";
  const f = mobile ? 0.86 : 1;
  return (
    <>
      <Office />
      <MayaIn t={t} mobile={mobile} />
      <div style={beside(mobile)}>
        <Card style={pop(t, 0.3)}>
          <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>Monday · From Rosa</div>
          <div style={{ fontSize: 36 * f, fontWeight: 900, marginTop: 6 }}>📎 Running public events safely</div>
          <div style={{ fontSize: 26 * f, color: muted, marginTop: 4 }}>A guide from the local authority</div>
        </Card>
        {t >= at(s, 2) - 0.2 && (
          <Bubble t={t} start={at(s, 2)} who="Rosa" colour={teal} f={f}>
            Could you turn this into a checklist for the open day?
            {t >= at(s, 3) - 0.1 && <span style={{ color: red }}> I’ll need it by Friday.</span>}
          </Bubble>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 22, alignItems: "center" }}>
          {t >= at(s, 5) - 0.2 && (
            <div style={pop(t, at(s, 5))}>
              <Kicker size={36 * f} color={ink}>📄 30 pages</Kicker>
            </div>
          )}
          {t >= at(s, 6) - 0.2 && (
            <Card style={{ padding: "14px 20px", ...pop(t, at(s, 6)) }}>
              <span style={{ fontSize: 28 * f, fontWeight: 700 }}>🌱 Gardening club: how many tables? <span style={{ color: muted }}>Still waiting…</span></span>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

/* 2. A twelve-point checklist (no first aid) */
export const checklist = [
  ["Risk assessment", 4],
  ["Room capacity", 6],
  ["Fire exits kept clear", 9],
  ["Emergency contacts", 11],
  ["Stall layout", 13],
  ["Electrical checks", 15],
  ["Food hygiene", 18],
  ["Step-free entrance", 20],
  ["Lost children plan", 22],
  ["Waste and cleaning", 24],
  ["Insurance", 26],
  ["Signs and directions", 28],
] as const;
function List({ f, t, start, highlight = [], mobile, limit = 12 }: { f: number; t: number; start: number; highlight?: number[]; mobile: boolean; limit?: number }) {
  return (
    <div style={{ background: "#fff", border: `4px solid ${ink}`, borderRadius: 26, padding: "18px 24px", boxShadow: "0 20px 50px #17243c26" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ display: "inline-grid", placeItems: "center", width: 36, height: 36, borderRadius: 999, background: violet, color: "#fff", fontWeight: 900, fontSize: 16 }}>AI</span>
        <span style={{ fontSize: 26 * f, fontWeight: 800 }}>Open day checklist</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", columnGap: 22, rowGap: 6, marginTop: 12 }}>
        {checklist.slice(0, limit).map(([item, page], i) => (
          <div
            key={item}
            style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: (mobile ? 34 : 28) * f, padding: "3px 8px", borderRadius: 8, background: highlight.includes(i) ? mint : "transparent", opacity: ramp(t, start + i * 0.12, start + i * 0.12 + 0.3) }}
          >
            <span style={{ color: highlight.includes(i) ? teal : muted, fontWeight: 800 }}>{highlight.includes(i) ? "✓" : "☐"}</span>
            <span style={{ fontWeight: 700 }}>{item}</span>
            <span style={{ color: muted, fontSize: (mobile ? 26 : 22) * f, marginLeft: "auto" }}>p.{page}</span>
          </div>
        ))}
        {limit < checklist.length && <div style={{ fontSize: 26 * f, color: muted, padding: "3px 8px" }}>+ {checklist.length - limit} more items</div>}
      </div>
    </div>
  );
}
function Summary({ t, mobile }: P) {
  const s = "summary";
  const f = mobile ? 0.86 : 1;
  const list = t >= at(s, 2) - 0.2;
  return (
    <AbsoluteFill style={{ background: "#f3f0fa" }}>
      <div style={stage(mobile)}>
        {!list ? (
          <ChatWindow f={f}>
            <Msg you f={f}>
              <div style={{ display: "inline-block", background: "#ffffff22", border: "2px solid #ffffff66", borderRadius: 12, padding: "4px 14px", fontSize: 22 * f, fontWeight: 800, marginBottom: 8 }}>📄 Public events guide · 30 pages</div>
              <div>{typed("Summarise this in plain language, then turn it into a checklist. Show me where each item comes from in the guide.", t, at(s, 0) + 0.8, at(s, 1) + 2)}</div>
            </Msg>
          </ChatWindow>
        ) : (
          <>
            <List f={f} t={t} start={at(s, 2)} mobile={mobile} />
            {t >= at(s, 4) - 0.2 && t < at(s, 5) - 0.1 && (
              <Card style={{ marginTop: 18, background: lavender, ...pop(t, at(s, 4)) }}>
                <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>Jargon, explained</div>
                <div style={{ fontSize: 30 * f, fontWeight: 700, marginTop: 6 }}>
                  <b>Risk assessment:</b> working out what could go wrong, and what you can do to reduce the risk.
                </div>
              </Card>
            )}
            {t >= at(s, 3) - 0.2 && t < at(s, 4) - 0.2 && <div style={{ marginTop: 18, ...pop(t, at(s, 3)) }}><Kicker size={32 * f}>Even the jargon feels manageable</Kicker></div>}
            {t >= at(s, 6) - 0.2 && <div style={{ marginTop: 18, ...pop(t, at(s, 6)) }}><Kicker size={32 * f} color={violet}>Forward to Rosa right now? ➜</Kicker></div>}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* 4. Checking against the guide */
const sections = [
  { name: "Fire exits", cue: 3, found: true },
  { name: "Emergency contacts", cue: 5, found: true },
  { name: "First aid", cue: 7, found: false },
];
function Check({ t, mobile }: P) {
  const s = "check";
  const f = mobile ? 0.86 : 1;
  const ticked = [t >= at(s, 4) ? 2 : -1, t >= at(s, 6) ? 3 : -1].filter((n) => n >= 0);
  const missing = t >= at(s, 10) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#eef6f3" }}>
      <div style={stage(mobile)}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "0.8fr 1.2fr", gap: 22, alignItems: "start" }}>
          <Card style={{ background: "#fff", ...pop(t, at(s, 0)) }}>
            <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>📄 The guide · Safety sections</div>
            {sections.map((x) => {
              const on = t >= at(s, x.cue) - 0.1;
              return (
                <div key={x.name} style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, fontSize: 26 * f, fontWeight: 800, background: on ? (x.found ? mint : "#ffe0d8") : "#f4f3f8", opacity: t >= at(s, 1) - 0.1 ? 1 : 0.5 }}>
                  {on ? (x.found ? "✓ " : "! ") : ""}
                  {x.name}
                  {!x.found && t >= at(s, 8) - 0.1 && (
                    <div style={{ fontSize: 22 * f, fontWeight: 700, marginTop: 4, ...pop(t, at(s, 8)) }}>A trained first-aider on site for the whole day</div>
                  )}
                </div>
              );
            })}
          </Card>
          <div style={pop(t, at(s, 0) + 0.4)}>
            <List f={mobile ? f : 0.82} t={t} start={-10} highlight={ticked} mobile={mobile} limit={mobile ? 5 : 12} />
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 20 }}>
          {missing && <div style={pop(t, at(s, 10))}><Kicker size={34 * f} color={red}>✗ No first-aid item at all</Kicker></div>}
          {t >= at(s, 11) - 0.2 && <div style={pop(t, at(s, 11))}><Kicker size={30 * f} color={ink}>Every line can look right, and still leave something out</Kicker></div>}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* 5. Fixed, and honest about it */
function Fixed({ t, mobile }: P) {
  const s = "fixed";
  const f = mobile ? 0.86 : 1;
  return (
    <>
      <Office tone="#f6f1e6" />
      <MayaIn t={t} mobile={mobile} />
      <div style={beside(mobile)}>
        <Card style={{ background: mint, ...pop(t, at(s, 0)) }}>
          <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>Added by Maya</div>
          <div style={{ fontSize: 34 * f, fontWeight: 900, marginTop: 6 }}>☑ Trained first-aider on site all day</div>
          {t >= at(s, 0) + 2.5 && <div style={{ fontSize: 28 * f, fontWeight: 700, color: teal, marginTop: 8, ...pop(t, at(s, 0) + 2.5) }}>✓ A trained volunteer can cover the whole day</div>}
        </Card>
        {t >= at(s, 1) - 0.2 && (
          <Card style={{ marginTop: 22, ...pop(t, at(s, 1)) }}>
            <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>Friday · To Rosa</div>
            <div style={{ fontSize: 30 * f, marginTop: 8, lineHeight: 1.4 }}>
              Here’s the open day checklist. <b>I used AI to draft it</b> and <b>checked the safety requirements against the guide.</b>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

/* 6. Go back to what matters */
function Takeaway({ t, mobile }: P) {
  const s = "takeaway";
  const f = mobile ? 0.86 : 1;
  const turn = t >= at(s, 2) - 0.1;
  return (
    <AbsoluteFill style={{ background: paper }}>
      <div style={stage(mobile)}>
        {!turn ? (
          <>
            <div style={{ fontSize: 46 * f, fontWeight: 900, ...pop(t, at(s, 0)) }}>Using a summary to make a decision?</div>
            <Card style={{ marginTop: 24, background: mint, display: "flex", gap: 18, alignItems: "center", ...pop(t, at(s, 0) + 1.5) }}>
              <span style={{ fontSize: 46 * f }}>🔎</span>
              <span style={{ fontSize: 34 * f, fontWeight: 800 }}>Go back to the parts of the original that matter most</span>
            </Card>
            {t >= at(s, 1) - 0.2 && (
              <Card style={{ marginTop: 18, background: lavender, display: "flex", gap: 18, alignItems: "center", ...pop(t, at(s, 1)) }}>
                <span style={{ fontSize: 46 * f }}>🧩</span>
                <span style={{ fontSize: 34 * f, fontWeight: 800 }}>Look for what’s missing, as well as what’s there</span>
              </Card>
            )}
          </>
        ) : (
          <Card style={pop(t, at(s, 2))}>
            <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Your turn</div>
            <div style={{ fontSize: 44 * f, fontWeight: 900, marginTop: 8 }}>Think of a long document you deal with.</div>
            {t >= at(s, 4) - 0.2 && (
              <div style={{ fontSize: 36 * f, fontWeight: 800, color: violet, marginTop: 20, ...pop(t, at(s, 4)) }}>
                Which part would you read for yourself before acting on an AI summary?
              </div>
            )}
          </Card>
        )}
      </div>
    </AbsoluteFill>
  );
}

export function ThirtyPagesByFriday({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene = narration.scenes[Math.max(0, narration.scenes.findLastIndex((x) => x.start <= t))];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  const local = { t, mobile };
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink, overflow: "hidden" }}>
      <Html5Audio src={staticFile("lessons/thirty-pages-by-friday/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "monday" && <Monday {...local} />}
        {scene.id === "summary" && <Summary {...local} />}
        {scene.id === "choice" && <ChoiceScreen {...local} start={at("choice", 0)} question="The checklist looks ready. Would you send it to Rosa now?" />}
        {scene.id === "check" && <Check {...local} />}
        {scene.id === "fixed" && <Fixed {...local} />}
        {scene.id === "takeaway" && <Takeaway {...local} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
