import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import narration from "../../public/lessons/the-grant-that-didnt-exist/narration.json";
import { Bubble, ChatWindow, ChoiceScreen, MayaIn, Msg, typed } from "./chatKit";
import { Card, Kicker, Office, beside, cueStart, font, ink, lavender, mint, muted, paper, pop, ramp, red, stage, teal, violet, type P } from "./kit";

// Episode 2.5: The Grant That Didn't Exist.
// The made-up grant uses a reserved ".example" web address so it can never point to a real site.
const at = cueStart(narration);
const fakeLink = "www.community-open-day-fund.example/apply";
const mark = (on: boolean, colour = "#ffe08a"): React.CSSProperties => ({
  background: on ? colour : "transparent",
  color: on ? ink : "inherit",
  borderRadius: 6,
  padding: "0 4px",
});

/* 1. The budget */
function Budget({ t, mobile }: P) {
  const s = "budget";
  const f = mobile ? 0.86 : 1;
  const spent = ramp(t, at(s, 3), at(s, 3) + 2);
  return (
    <>
      <Office />
      <MayaIn t={t} mobile={mobile} />
      <div style={beside(mobile)}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={pop(t, at(s, 0))}><Kicker size={32 * f}>✓ Flyer up</Kicker></div>
          {t >= at(s, 1) - 0.2 && <div style={pop(t, at(s, 1))}><Kicker size={32 * f}>✓ Stalls filling</Kicker></div>}
        </div>
        {t >= at(s, 2) - 0.2 && (
          <Card style={{ marginTop: 22, ...pop(t, at(s, 2)) }}>
            <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Open day budget</div>
            <div style={{ display: "flex", height: 54 * f, borderRadius: 12, overflow: "hidden", marginTop: 14, background: mint }}>
              <div style={{ width: `${spent * 55}%`, background: violet, color: "#fff", fontSize: 24 * f, fontWeight: 800, display: "grid", placeItems: "center", overflow: "hidden" }}>Printing</div>
              <div style={{ width: `${spent * 39}%`, background: "#e8a33d", color: ink, fontSize: 24 * f, fontWeight: 800, display: "grid", placeItems: "center", overflow: "hidden" }}>Supplies</div>
            </div>
            {spent > 0.95 && <div style={{ fontSize: 30 * f, fontWeight: 800, color: red, marginTop: 12 }}>Left: hardly anything</div>}
          </Card>
        )}
      </div>
    </>
  );
}

/* 2. A grant made for them */
function Grant({ t, mobile }: P) {
  const s = "grant";
  const f = mobile ? 0.86 : 1;
  const report = t >= at(s, 5) - 0.2;
  return (
    <AbsoluteFill style={{ background: "#f3f0fa" }}>
      <div style={stage(mobile)}>
        <ChatWindow f={f}>
          {t >= at(s, 1) && <Msg you f={f}>{typed("Are there any small grants for community open days?", t, at(s, 1), at(s, 1) + 2)}</Msg>}
          {t >= at(s, 2) - 0.2 && (
            <Msg f={f}>
              <span style={{ opacity: ramp(t, at(s, 2) - 0.2, at(s, 2) + 0.4) }}>
                Yes! The <span style={mark(t >= at(s, 2) + 0.8)}>Community Open Day Fund</span> offers grants of{" "}
                <span style={mark(t >= at(s, 2) + 1.6)}>up to 1,000</span> for local events like yours. Apply here:{" "}
                <span style={{ ...mark(t >= at(s, 2) + 2.4), textDecoration: "underline" }}>{fakeLink}</span>
              </span>
            </Msg>
          )}
        </ChatWindow>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 20 }}>
          {t >= at(s, 3) - 0.2 && !report && <div style={pop(t, at(s, 3))}><Kicker size={32 * f}>Made for events exactly like theirs</Kicker></div>}
          {t >= at(s, 4) - 0.2 && !report && <div style={pop(t, at(s, 4))}><Kicker size={32 * f} color={violet}>“Rosa will want to see this.”</Kicker></div>}
        </div>
        {report && (
          <Card style={{ marginTop: 6, ...pop(t, at(s, 5)) }}>
            <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>📝 Report for Rosa · Funding</div>
            <div style={{ fontSize: 30 * f, fontWeight: 800, marginTop: 6 }}>
              {typed("Community Open Day Fund: up to 1,000", t, at(s, 5) + 0.3, at(s, 5) + 1.8)}
            </div>
          </Card>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* 4. Page not found */
function Checking({ t, mobile }: P) {
  const s = "checking";
  const f = mobile ? 0.86 : 1;
  const phone = t >= at(s, 5) - 0.1;
  const removed = t >= at(s, 9) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#eef6f3" }}>
      <div style={stage(mobile)}>
        {!phone ? (
          <>
            <Card style={{ padding: 0, overflow: "hidden", border: `4px solid ${ink}`, ...pop(t, at(s, 0)) }}>
              <div style={{ background: "#f3f1fb", padding: "12px 20px", fontSize: 24 * f, color: muted, borderBottom: "2px solid #e2ddf5", overflow: "hidden", whiteSpace: "nowrap" }}>🔗 {fakeLink}</div>
              <div style={{ padding: 32, textAlign: "center" }}>
                {t >= at(s, 1) - 0.2 ? (
                  <div style={pop(t, at(s, 1))}>
                    <div style={{ fontSize: 64 * f, fontWeight: 900, color: muted }}>404</div>
                    <div style={{ fontSize: 36 * f, fontWeight: 800 }}>Page not found</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 30 * f, color: muted }}>Loading…</div>
                )}
              </div>
            </Card>
            {t >= at(s, 2) - 0.2 && t < at(s, 3) - 0.1 && <div style={{ marginTop: 20, ...pop(t, at(s, 2)) }}><Kicker size={32 * f} color={ink}>💭 “Maybe they moved it.”</Kicker></div>}
            {t >= at(s, 3) - 0.2 && (
              <Card style={{ marginTop: 20, ...pop(t, at(s, 3)) }}>
                <div style={{ border: "3px solid #d9d6e4", borderRadius: 999, padding: "10px 22px", fontSize: 28 * f }}>🔍 “Community Open Day Fund”</div>
                {t >= at(s, 4) - 0.2 && <div style={{ fontSize: 30 * f, fontWeight: 800, color: red, marginTop: 14, ...pop(t, at(s, 4)) }}>Still nothing.</div>}
              </Card>
            )}
          </>
        ) : !removed ? (
          <>
            <Kicker size={30 * f} color={teal}>📞 Calling the local volunteer office</Kicker>
            <Bubble t={t} start={at(s, 5) + 0.5} who="Maya" colour={violet} f={f} right>
              The Community Open Day Fund?
            </Bubble>
            {t >= at(s, 6) - 0.2 && (
              <Bubble t={t} start={at(s, 6)} who="Volunteer office" colour={teal} f={f}>
                Where did you hear about that one?
                {t >= at(s, 7) - 0.1 && <> We don’t know of a grant by that name.</>}
                {t >= at(s, 8) - 0.1 && <span style={{ color: teal }}> But I can send you two schemes that are open right now.</span>}
              </Bubble>
            )}
          </>
        ) : (
          <>
            <Card style={pop(t, at(s, 9))}>
              <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>📝 Report for Rosa · Funding</div>
              <div style={{ fontSize: 30 * f, fontWeight: 800, marginTop: 6, textDecoration: "line-through", color: muted }}>Community Open Day Fund: up to 1,000</div>
            </Card>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
              {["Name", "Amount", "Web address"].map((x, i) => (
                <span key={x} style={{ background: "#fff", border: "3px solid #d9d6e4", borderRadius: 999, padding: "8px 20px", fontSize: 28 * f, fontWeight: 800, ...pop(t, at(s, 10) + i * 0.6) }}>
                  {x}: sounded convincing
                </span>
              ))}
            </div>
            {t >= at(s, 11) - 0.2 && <div style={{ marginTop: 20, ...pop(t, at(s, 11)) }}><Kicker size={32 * f} color={red}>No funder. No official application page.</Kicker></div>}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* 5. Real-looking, not real */
function Why({ t, mobile }: P) {
  const s = "why";
  const f = mobile ? 0.86 : 1;
  const asking = t >= at(s, 2) - 0.1;
  return (
    <AbsoluteFill style={{ background: paper }}>
      <div style={stage(mobile)}>
        {!asking ? (
          <>
            <div style={{ fontSize: 44 * f, fontWeight: 900, ...pop(t, at(s, 0)) }}>An AI answer can contain…</div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16, marginTop: 22 }}>
              {["Names", "Figures", "Quotes", "Links"].map((x, i) => (
                <Card key={x} style={{ background: lavender, fontSize: 34 * f, fontWeight: 800, textAlign: "center", ...pop(t, at(s, 0) + 1 + i * 0.6) }}>{x}</Card>
              ))}
            </div>
            <div style={{ marginTop: 18, ...pop(t, at(s, 0) + 3.6) }}><Kicker size={30 * f} color={ink}>…that look real</Kicker></div>
            {t >= at(s, 1) - 0.2 && (
              <Card style={{ marginTop: 22, display: "flex", gap: 16, alignItems: "center", ...pop(t, at(s, 1)) }}>
                <span style={{ fontSize: 46 * f }}>📅</span>
                <span style={{ fontSize: 32 * f, fontWeight: 800 }}>Or information that was true once, but is out of date</span>
              </Card>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 44 * f, fontWeight: 900, ...pop(t, at(s, 2)) }}>The way you ask can steer the answer</div>
            {t >= at(s, 3) - 0.2 && (
              <Card style={{ marginTop: 22, background: "#fde7e2", ...pop(t, at(s, 3)) }}>
                <div style={{ fontSize: 34 * f, fontWeight: 800 }}>“We qualify for this grant, right?”</div>
                <div style={{ fontSize: 28 * f, color: red, fontWeight: 800, marginTop: 8 }}>→ invites agreement</div>
              </Card>
            )}
            {t >= at(s, 4) - 0.2 && (
              <Card style={{ marginTop: 18, background: mint, ...pop(t, at(s, 4)) }}>
                <div style={{ fontSize: 34 * f, fontWeight: 800 }}>“What are the eligibility rules, and where can I check them?”</div>
                <div style={{ fontSize: 28 * f, color: teal, fontWeight: 800, marginTop: 8 }}>→ gives you something to verify</div>
              </Card>
            )}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}

/* 6. Open day */
function OpenDay({ t, mobile }: P) {
  const s = "open-day";
  const f = mobile ? 0.86 : 1;
  const day = t >= at(s, 1) - 0.1;
  return (
    <>
      <Office tone={day ? "#fff4e0" : "#eef2f8"} />
      <MayaIn t={t} mobile={mobile} />
      <div style={beside(mobile)}>
        {!day ? (
          <Card style={pop(t, at(s, 0))}>
            <div style={{ fontSize: 24 * f, color: muted, fontWeight: 700 }}>The funder’s own page</div>
            {["✓ Criteria checked", "✓ Deadline checked", "✓ Application sent"].map((x, i) => (
              <div key={x} style={{ fontSize: 34 * f, fontWeight: 800, marginTop: 10, color: i === 2 ? teal : ink, ...pop(t, at(s, 0) + 1 + i * 1.5) }}>{x}</div>
            ))}
          </Card>
        ) : (
          <>
            <div style={pop(t, at(s, 1))}><Kicker size={36 * f} color={violet}>🎉 Open day</Kicker></div>
            {[
              { icon: "🚪", text: "The first visitors come through the door", n: 1 },
              { icon: "♟", text: "A child sits down for a game of chess", n: 2 },
              { icon: "🌱", text: "The gardening club hands out a seedling", n: 3 },
              { icon: "👍", text: "Rosa gives Maya a thumbs-up", n: 4 },
            ].map((x) =>
              t >= at(s, x.n) - 0.2 ? (
                <Card key={x.text} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 18, padding: 20, ...pop(t, at(s, x.n)) }}>
                  <span style={{ fontSize: 44 * f }}>{x.icon}</span>
                  <span style={{ fontSize: 32 * f, fontWeight: 700 }}>{x.text}</span>
                </Card>
              ) : null,
            )}
          </>
        )}
      </div>
    </>
  );
}

/* 7. Money, health and the law */
function Takeaway({ t, mobile }: P) {
  const s = "takeaway";
  const f = mobile ? 0.86 : 1;
  const turn = t >= at(s, 2) - 0.1;
  return (
    <AbsoluteFill style={{ background: "#f6f1e6" }}>
      <div style={stage(mobile)}>
        {!turn ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[["💳", "Money"], ["🩺", "Health"], ["⚖️", "Legal rights"]].map(([icon, x], i) => (
                <Card key={x} style={{ textAlign: "center", ...pop(t, at(s, 0) + i * 0.8) }}>
                  <div style={{ fontSize: 56 * f }}>{icon}</div>
                  <div style={{ fontSize: 32 * f, fontWeight: 900, marginTop: 6 }}>{x}</div>
                </Card>
              ))}
            </div>
            <Card style={{ marginTop: 22, background: lavender, ...pop(t, at(s, 0) + 3.5) }}>
              <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>Use AI to</div>
              <div style={{ fontSize: 32 * f, fontWeight: 800, marginTop: 6 }}>get familiar with the topic and work out what to ask</div>
            </Card>
            {t >= at(s, 1) - 0.2 && (
              <Card style={{ marginTop: 18, background: mint, ...pop(t, at(s, 1)) }}>
                <div style={{ fontSize: 22 * f, color: muted, fontWeight: 700 }}>Before you act</div>
                <div style={{ fontSize: 32 * f, fontWeight: 800, marginTop: 6 }}>✓ Check with a reliable source or a qualified person</div>
              </Card>
            )}
          </>
        ) : (
          <Card style={pop(t, at(s, 2))}>
            <div style={{ fontSize: 26 * f, color: muted, fontWeight: 700 }}>Your turn</div>
            <div style={{ fontSize: 42 * f, fontWeight: 900, marginTop: 8 }}>Think of a question about money, health or the law you might ask an AI chat tool.</div>
            {t >= at(s, 4) - 0.2 && (
              <div style={{ fontSize: 36 * f, fontWeight: 800, color: violet, marginTop: 20, ...pop(t, at(s, 4)) }}>Where would you go, or who would you ask, to check the answer?</div>
            )}
          </Card>
        )}
      </div>
    </AbsoluteFill>
  );
}

export function TheGrantThatDidntExist({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene = narration.scenes[Math.max(0, narration.scenes.findLastIndex((x) => x.start <= t))];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  const local = { t, mobile };
  return (
    <AbsoluteFill style={{ background: paper, fontFamily: font, color: ink, overflow: "hidden" }}>
      <Html5Audio src={staticFile("lessons/the-grant-that-didnt-exist/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "budget" && <Budget {...local} />}
        {scene.id === "grant" && <Grant {...local} />}
        {scene.id === "choice" && <ChoiceScreen {...local} start={at("choice", 0)} question="Before Maya sends her report to Rosa, what would you check?" />}
        {scene.id === "checking" && <Checking {...local} />}
        {scene.id === "why" && <Why {...local} />}
        {scene.id === "open-day" && <OpenDay {...local} />}
        {scene.id === "takeaway" && <Takeaway {...local} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
