import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import narration from "../../public/lessons/what-is-ai/narration.json";
import { Maya } from "./Maya";

const ink = "#17243c",
  teal = "#087f72",
  violet = "#7155d9",
  paper = "#fffdf8";
const ramp = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
const at = (scene: string, index: number) =>
  narration.cues.find((c) => c.scene === scene && c.index === index)?.start ??
  0;
const enter = (a: number): React.CSSProperties => ({
  opacity: a,
  transform: `translateY(${(1 - a) * 24}px)`,
});
const font = "Arial, Helvetica, sans-serif";

function Animal({
  cat = false,
  hidden = false,
  novel = false,
}: {
  cat?: boolean;
  hidden?: boolean;
  novel?: boolean;
}) {
  return (
    <svg viewBox="0 0 200 180" width="100%" height="100%" aria-hidden="true">
      <rect
        width="200"
        height="180"
        rx="18"
        fill={cat ? "#eee5f7" : "#e0efe5"}
      />
      <ellipse cx="100" cy="160" rx="60" ry="9" fill="#17243c18" />
      <path
        d="M52 90Q36 35 62 28L85 59M146 90Q168 30 140 28L119 59"
        fill={cat ? "#8f939d" : "#94644b"}
      />
      <ellipse
        cx="100"
        cy="122"
        rx="49"
        ry="37"
        fill={cat ? "#a9acb5" : "#c49266"}
      />
      <ellipse
        cx="100"
        cy="81"
        rx="48"
        ry="43"
        fill={cat ? "#bfc0c7" : "#d6ab7c"}
      />
      {novel && !cat && (
        <>
          <ellipse cx="122" cy="74" rx="16" ry="21" fill="#faf5e7" />
          <path d="M61 112q40 18 78 0v13q-39 18-78 0Z" fill={teal} />
        </>
      )}
      <circle cx="81" cy="77" r="5" fill={ink} />
      <circle cx="120" cy="77" r="5" fill={ink} />
      <path d="M92 93q8-8 16 0l-8 7Z" fill={ink} />
      <path
        d="M100 99v8m-12-1q12 12 24 0"
        fill="none"
        stroke={ink}
        strokeWidth="3"
      />
      {cat && (
        <path
          d="M71 98L39 91m32 15-32 4m90-12 32-7m-32 15 32 4"
          stroke={ink}
          strokeWidth="2"
        />
      )}
      {hidden && (
        <>
          <rect x="0" y="100" width="200" height="80" fill="#c4ac8b" />
          <path d="M0 107h200m-200 30h200" stroke="#9b846c" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}
function Wave({ t, width = 300 }: { t: number; width?: number }) {
  return (
    <svg width={width} height="80" viewBox="0 0 300 80" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <rect
          key={i}
          x={i * 13 + 6}
          y={40 - (10 + Math.abs(Math.sin(t * 5 + i * 0.9)) * 27)}
          width="6"
          height={(10 + Math.abs(Math.sin(t * 5 + i * 0.9)) * 27) * 2}
          rx="3"
          fill={teal}
        />
      ))}
    </svg>
  );
}
function Room({
  mobile,
  t,
  office = false,
  checking = 0,
}: {
  mobile: boolean;
  t: number;
  office?: boolean;
  checking?: number;
}) {
  return (
    <>
      <Img
        src={staticFile(
          office
            ? "lessons/maya-day/community-centre.png"
            : "lessons/what-is-ai/kitchen.png",
        )}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: mobile ? "45% center" : "center",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg,#fffdf82a,#fffdf810)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: mobile ? -20 : 70,
          top: mobile ? 70 : 115,
          width: mobile ? 365 : 465,
          height: mobile ? 640 : 815,
        }}
      >
        <Maya time={t} checking={checking} />
      </div>
    </>
  );
}
function Introduction({ t, mobile }: { t: number; mobile: boolean }) {
  const spoken = t >= at("what-is-ai", 2),
    draft = t >= at("what-is-ai", 3),
    meet = t >= at("what-is-ai", 4);
  return (
    <>
      <Room mobile={mobile} t={t} checking={spoken ? 1 : 0} />
      <div
        style={{
          position: "absolute",
          left: mobile ? 300 : 590,
          top: mobile ? 90 : 85,
          width: mobile ? 610 : 1220,
        }}
      >
        <div
          style={{
            fontSize: mobile ? 73 : 110,
            fontWeight: 800,
            color: ink,
            ...enter(ramp(t, 0, 0.7)),
          }}
        >
          AI
        </div>
        <div
          style={{
            fontSize: mobile ? 43 : 61,
            fontWeight: 700,
            color: teal,
            ...enter(ramp(t, 1.4, 2.4)),
          }}
        >
          Artificial intelligence
        </div>
        {meet && (
          <div
            style={{
              marginTop: 24,
              fontSize: mobile ? 28 : 34,
              background: paper,
              display: "inline-block",
              padding: "14px 20px",
              borderRadius: 14,
              ...enter(ramp(t, 22.28, 23)),
            }}
          >
            Meet Maya · Community centre administrator
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: mobile ? 65 : 610,
          top: mobile ? 610 : 400,
          width: mobile ? 830 : 1130,
          display: "flex",
          alignItems: "center",
          gap: mobile ? 24 : 55,
        }}
      >
        <div
          style={{
            background: paper,
            border: `6px solid ${ink}`,
            borderRadius: 35,
            width: mobile ? 285 : 350,
            height: mobile ? 370 : 420,
            padding: 25,
            boxShadow: "0 22px 45px #17243c25",
          }}
        >
          <div
            style={{
              height: 8,
              width: 70,
              background: ink,
              margin: "0 auto 40px",
              borderRadius: 6,
            }}
          />
          {spoken ? (
            <>
              <Wave t={t} width={mobile ? 220 : 280} />
              <p style={{ fontSize: mobile ? 28 : 34, lineHeight: 1.4 }}>
                Bring a notebook.
              </p>
              <p style={{ color: teal, fontSize: 26 }}>Spoken words → text</p>
            </>
          ) : (
            <>
              <div style={{ height: 200 }}>
                <Animal />
              </div>
              <div style={{ fontSize: 28, color: teal, marginTop: 15 }}>
                A dog?
              </div>
            </>
          )}
        </div>
        <svg
          width="95"
          height="70"
          viewBox="0 0 100 70"
          style={{ opacity: ramp(t, 7, 8) }}
        >
          <path
            d="M4 35h75m-20-20 23 20-23 20"
            stroke={teal}
            strokeWidth="8"
            fill="none"
          />
        </svg>
        <div
          style={{
            background: paper,
            padding: mobile ? 25 : 40,
            width: mobile ? 340 : 460,
            boxShadow: "0 15px 45px #17243c25",
            transform: `rotate(${draft ? -3 : 2}deg)`,
            opacity: ramp(t, 5, 7),
          }}
        >
          <div style={{ fontSize: mobile ? 34 : 42, fontWeight: 800 }}>
            {draft ? "A first draft" : "Useful help"}
          </div>
          {(draft
            ? [
                "Hello everyone,",
                "Let’s meet on Tuesday.",
                "Please bring your ideas.",
              ]
            : ["Recognise patterns", "Make predictions", "Create content"]
          ).map((line, i) => (
            <div
              key={line}
              style={{
                fontSize: mobile ? 25 : 31,
                marginTop: 30,
                opacity: ramp(
                  t,
                  draft ? 19 + i * 0.7 : 6 + i * 2,
                  draft ? 19.7 + i * 0.7 : 7 + i * 2,
                ),
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
function Automation({ t, mobile }: { t: number; mobile: boolean }) {
  const phone = t >= at("automatic-or-ai", 3),
    ways = t >= at("automatic-or-ai", 7),
    r = phone ? 0 : Math.sin(t * 28) * 4;
  return (
    <>
      <Room mobile={mobile} t={t} checking={phone ? 1 : 0} />
      <div
        style={{
          position: "absolute",
          left: mobile ? 230 : 680,
          top: mobile ? 490 : 150,
          width: mobile ? 650 : 1040,
        }}
      >
        {!phone ? (
          <>
            <svg
              viewBox="0 0 600 470"
              style={{
                width: mobile ? 590 : 740,
                transform: `rotate(${r}deg)`,
              }}
            >
              <ellipse cx="300" cy="420" rx="220" ry="25" fill="#17243c20" />
              <rect
                x="80"
                y="80"
                width="440"
                height="310"
                rx="90"
                fill={teal}
                stroke={ink}
                strokeWidth="9"
              />
              <rect
                x="135"
                y="145"
                width="330"
                height="170"
                rx="30"
                fill="#eff5e4"
              />
              <text
                x="300"
                y="260"
                textAnchor="middle"
                fontSize="100"
                fill={ink}
                fontFamily={font}
              >
                00:00
              </text>
              <path
                d="M35 130-20-35m570 35 20-35M27 208H0m600 0h-27"
                stroke={ink}
                strokeWidth="9"
              />
            </svg>
            <div
              style={{
                fontSize: mobile ? 33 : 43,
                fontWeight: 800,
                color: ink,
                background: paper,
                padding: 18,
                borderRadius: 20,
                textAlign: "center",
              }}
            >
              Maya set the time. The timer follows it.
            </div>
          </>
        ) : (
          <div
            style={{
              background: paper,
              border: `10px solid ${ink}`,
              borderRadius: 44,
              padding: mobile ? 35 : 50,
              minHeight: mobile ? 460 : 660,
              boxShadow: "0 25px 65px #17243c28",
            }}
          >
            <Wave t={t} width={mobile ? 500 : 850} />
            <div
              style={{
                fontSize: mobile ? 39 : 55,
                fontWeight: 700,
                lineHeight: 1.35,
                marginTop: 30,
              }}
            >
              {"Bring a notebook to the meeting.".slice(
                0,
                Math.round(
                  ramp(
                    t,
                    at("automatic-or-ai", 3),
                    at("automatic-or-ai", 4) + 1,
                  ) * 35,
                ),
              )}
            </div>
            <div
              style={{ fontSize: mobile ? 29 : 37, marginTop: 35, color: teal }}
            >
              Speech recognition
            </div>
            {ways && (
              <div
                style={{
                  marginTop: 32,
                  borderTop: "3px solid #d9dce4",
                  paddingTop: 25,
                  fontSize: mobile ? 26 : 33,
                  lineHeight: 1.6,
                  ...enter(
                    ramp(
                      t,
                      at("automatic-or-ai", 7),
                      at("automatic-or-ai", 7) + 0.7,
                    ),
                  ),
                }}
              >
                AI can use
                <br />
                <b>Knowledge and rules</b>
                <br />
                or <b>patterns learned from examples</b>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
function Learning({ t, mobile }: { t: number; mobile: boolean }) {
  const test = t >= at("learning-from-examples", 4),
    wrong = t >= at("learning-from-examples", 7),
    named = t >= at("learning-from-examples", 9);
  const local = t - at("learning-from-examples", 0);
  return (
    <AbsoluteFill style={{ background: "#f2f0e6", padding: mobile ? 55 : 80 }}>
      <div style={{ fontSize: mobile ? 48 : 66, fontWeight: 800 }}>
        {test ? "Try a picture it hasn’t trained on" : "Pictures + labels"}
      </div>
      <div
        style={{ fontSize: mobile ? 27 : 32, color: "#526174", marginTop: 18 }}
      >
        A small illustration of the idea
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: mobile ? 24 : 80,
          marginTop: mobile ? 25 : 90,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 20,
            width: mobile ? 370 : 570,
            opacity: test ? 0.25 : 1,
          }}
        >
          {[false, true, true, false].map((cat, i) => (
            <div
              key={i}
              style={{
                width: mobile ? 175 : 270,
                transform: `translateY(${(1 - ramp(local, i * 2, i * 2 + 0.8)) * 30}px)`,
                opacity: ramp(local, i * 2, i * 2 + 0.8),
              }}
            >
              <div style={{ height: mobile ? 115 : 230 }}>
                <Animal cat={cat} />
              </div>
              <div
                style={{
                  background: cat ? "#ded4f2" : "#c8e6d9",
                  padding: 10,
                  textAlign: "center",
                  fontSize: mobile ? 25 : 38,
                  fontWeight: 800,
                }}
              >
                {cat ? "Cat" : "Dog"}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{ fontSize: mobile ? 40 : 70, color: teal, fontWeight: 800 }}
        >
          {mobile ? "↓" : "→"}
        </div>
        <div
          style={{
            width: mobile ? 610 : 520,
            background: paper,
            padding: mobile ? 30 : 45,
            borderRadius: 32,
            boxShadow: "0 20px 50px #17243c14",
          }}
        >
          {test ? (
            <>
              <div style={{ height: mobile ? 245 : 370 }}>
                <Animal cat={wrong} hidden={wrong} novel />
              </div>
              <div
                style={{
                  fontSize: mobile ? 35 : 44,
                  fontWeight: 800,
                  marginTop: 20,
                  color: wrong ? "#a13c24" : teal,
                }}
              >
                {wrong ? "Prediction: dog?" : "Prediction: dog ✓"}
              </div>
              {wrong && (
                <div style={{ fontSize: mobile ? 27 : 32, marginTop: 10 }}>
                  It’s a partly hidden cat.
                </div>
              )}
            </>
          ) : (
            <>
              <svg
                width="100%"
                height={mobile ? 130 : 240}
                viewBox="0 0 400 200"
              >
                {[55, 145, 235, 325].map((x, i) => (
                  <g key={x}>
                    <circle
                      cx={x}
                      cy={i % 2 ? 130 : 70}
                      r="27"
                      fill={i % 2 ? teal : violet}
                    />
                    {i < 3 && (
                      <path
                        d={`M${x + 25} ${i % 2 ? 120 : 80}L${x + 65} ${i % 2 ? 80 : 120}`}
                        stroke={ink}
                        strokeWidth="5"
                      />
                    )}
                  </g>
                ))}
              </svg>
              <div style={{ fontSize: mobile ? 37 : 47, fontWeight: 800 }}>
                Learning patterns
              </div>
            </>
          )}
        </div>
      </div>
      {named && (
        <div
          style={{
            position: "absolute",
            bottom: mobile ? 55 : 65,
            left: mobile ? 55 : 80,
            color: teal,
            fontSize: mobile ? 39 : 54,
            fontWeight: 800,
          }}
        >
          Machine learning · One way to build AI
        </div>
      )}
    </AbsoluteFill>
  );
}
function Invitation({
  correct = false,
  highlight = false,
  sent = false,
}: {
  correct?: boolean;
  highlight?: boolean;
  sent?: boolean;
}) {
  return (
    <div
      style={{
        background: paper,
        padding: 34,
        boxShadow: "0 15px 35px #17243c19",
        lineHeight: 1.7,
      }}
    >
      <div style={{ fontSize: 35, fontWeight: 800, marginBottom: 20 }}>
        Team meeting
      </div>
      <div style={{ fontSize: 30 }}>Hello everyone,</div>
      <div style={{ fontSize: 30 }}>Join us on Tuesday</div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          background: highlight
            ? "#ffe1c3"
            : correct
              ? "#d8f4ec"
              : "transparent",
          padding: highlight || correct ? "0 12px" : 0,
        }}
      >
        at {correct ? "10:30" : "9:00"}
      </div>
      <div style={{ fontSize: 30 }}>in Room Two.</div>
      <div style={{ fontSize: 30, marginTop: 20 }}>Bring your ideas.</div>
      <div
        style={{
          marginTop: 25,
          fontSize: 26,
          color: sent ? teal : "#526174",
          fontWeight: 700,
        }}
      >
        {sent ? "Sent by Maya ✓" : "Draft · Not sent"}
      </div>
    </div>
  );
}
function Draft({ t, mobile }: { t: number; mobile: boolean }) {
  const start = at("a-first-draft", 2),
    written = ramp(t, start + 1, start + 7),
    result = t >= at("a-first-draft", 4),
    privacy = t >= at("a-first-draft", 3);
  return (
    <>
      <Room mobile={mobile} t={t} office checking={1} />
      <div
        style={{
          position: "absolute",
          left: mobile ? 290 : 640,
          top: mobile ? 50 : 65,
          width: mobile ? 610 : 1150,
          background: paper,
          borderRadius: 26,
          padding: mobile ? 25 : 40,
          boxShadow: "0 15px 35px #17243c28",
        }}
      >
        <div style={{ fontSize: mobile ? 31 : 42, fontWeight: 800 }}>
          A meeting invitation
        </div>
        <div
          style={{
            fontSize: mobile ? 25 : 31,
            marginTop: 18,
            lineHeight: 1.4,
            minHeight: 105,
          }}
        >
          {"Draft a friendly invitation to our team meeting on Tuesday in Room Two.".slice(
            0,
            Math.round(written * 73),
          )}
          <span style={{ opacity: t % 1 < 0.5 ? 1 : 0 }}>▏</span>
        </div>
        {privacy && (
          <div
            style={{ fontSize: mobile ? 24 : 29, color: teal, marginTop: 15 }}
          >
            Private contact details stay out.
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: mobile ? 95 : 820,
          top: mobile ? 575 : 420,
          width: mobile ? 765 : 800,
          transform: `rotate(${-2 + 2 * ramp(t, start, start + 1)}deg)`,
          opacity: result ? 1 : 0.35,
        }}
      >
        {result ? (
          <Invitation />
        ) : (
          <div
            style={{
              background: paper,
              height: mobile ? 470 : 520,
              padding: 40,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  height: 16,
                  width: `${90 - i * 10}%`,
                  background: "#e5e6eb",
                  marginTop: 35,
                }}
              />
            ))}
          </div>
        )}
      </div>
      {t >= at("a-first-draft", 5) && (
        <div
          style={{
            position: "absolute",
            bottom: mobile ? 38 : 28,
            left: mobile ? 95 : 820,
            background: teal,
            color: "white",
            padding: "12px 25px",
            borderRadius: 16,
            fontSize: mobile ? 29 : 37,
            fontWeight: 800,
          }}
        >
          Generative AI creates content
        </div>
      )}
    </>
  );
}
function Check({ t, mobile }: { t: number; mobile: boolean }) {
  const calendar = t >= at("check-the-time", 3),
    correct = t >= at("check-the-time", 7);
  return (
    <AbsoluteFill style={{ background: "#eae5fa", padding: mobile ? 45 : 75 }}>
      <div style={{ fontSize: mobile ? 47 : 68, fontWeight: 800 }}>
        Where did that time come from?
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
          gap: mobile ? 30 : 90,
          marginTop: mobile ? 35 : 60,
        }}
      >
        <div style={{ transform: "rotate(-1deg)" }}>
          <Invitation correct={correct} highlight={!correct} />
        </div>
        <div
          style={{
            opacity: calendar ? 1 : 0.45,
            background: paper,
            padding: mobile ? 25 : 50,
            borderRadius: 15,
            boxShadow: "0 15px 35px #17243c16",
          }}
        >
          <div
            style={{
              fontSize: mobile ? 34 : 46,
              fontWeight: 800,
              borderBottom: `12px solid ${teal}`,
              paddingBottom: 22,
            }}
          >
            Team calendar
          </div>
          <div style={{ fontSize: mobile ? 34 : 44, marginTop: 30 }}>
            Tuesday · Room Two
          </div>
          <div
            style={{
              fontSize: mobile ? 82 : 120,
              fontWeight: 800,
              color: teal,
              marginTop: 20,
            }}
          >
            10:30
          </div>
          <div style={{ fontSize: mobile ? 27 : 33 }}>
            The recorded meeting time
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: mobile ? 29 : 40,
          fontWeight: 800,
          marginTop: 35,
          color: teal,
        }}
      >
        {correct
          ? "Maya corrects the draft using the calendar."
          : calendar
            ? "Compare the draft with a reliable record."
            : "Her request did not include a time."}
      </div>
    </AbsoluteFill>
  );
}
function Conclusion({ t, mobile }: { t: number; mobile: boolean }) {
  const sent = t >= 197.2,
    recap = t >= at("maya-decides", 4),
    reflect = t >= at("maya-decides", 7);
  return (
    <>
      <Room mobile={mobile} t={t} office checking={sent ? 0 : 1} />
      <div
        style={{
          position: "absolute",
          left: mobile ? 280 : 680,
          top: mobile ? 60 : 120,
          width: mobile ? 620 : 1020,
        }}
      >
        <div
          style={{
            fontSize: mobile ? 43 : 68,
            fontWeight: 800,
            background: paper,
            padding: 25,
            borderRadius: 20,
          }}
        >
          {reflect ? "What would you check?" : "Maya makes the decision"}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: mobile ? 75 : 690,
          top: mobile ? 600 : 310,
          width: mobile ? 810 : 1030,
        }}
      >
        {!recap ? (
          <Invitation correct sent={sent} />
        ) : (
          <div
            style={{
              background: paper,
              padding: mobile ? 35 : 50,
              borderRadius: 30,
              boxShadow: "0 18px 45px #17243c24",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <div
                style={{
                  width: mobile ? 150 : 210,
                  height: mobile ? 140 : 180,
                }}
              >
                <Animal />
              </div>
              <span
                style={{
                  fontSize: mobile ? 37 : 50,
                  color: teal,
                  fontWeight: 800,
                }}
              >
                Recognise · Predict · Create
              </span>
            </div>
            <div
              style={{
                fontSize: mobile ? 30 : 39,
                lineHeight: 1.5,
                marginTop: 30,
              }}
            >
              {reflect ? (
                <>
                  Does it fit the task?
                  <br />
                  Which details need checking?
                </>
              ) : (
                <>
                  Knowledge and rules
                  <br />
                  Patterns learned from examples
                </>
              )}
            </div>
            {t >= at("maya-decides", 8) && (
              <div
                style={{
                  fontSize: mobile ? 27 : 34,
                  marginTop: 23,
                  color: teal,
                  fontWeight: 700,
                }}
              >
                Protect private information.
              </div>
            )}
            {t >= at("maya-decides", 9) && (
              <div style={{ fontSize: mobile ? 25 : 31, marginTop: 19 }}>
                Serious decisions need qualified human judgment.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
export function WhatIsAI({ mobile = false }: { mobile?: boolean }) {
  const { fps } = useVideoConfig(),
    t = useCurrentFrame() / fps;
  const scene =
    narration.scenes[
      Math.max(
        0,
        narration.scenes.findLastIndex((s) => s.start <= t),
      )
    ];
  const opacity = ramp(t, scene.start, scene.start + 0.3);
  return (
    <AbsoluteFill
      style={{
        background: paper,
        fontFamily: font,
        color: ink,
        overflow: "hidden",
      }}
    >
      <Html5Audio src={staticFile("lessons/what-is-ai/narration.mp3")} />
      <AbsoluteFill style={{ opacity }}>
        {scene.id === "what-is-ai" && <Introduction t={t} mobile={mobile} />}
        {scene.id === "automatic-or-ai" && <Automation t={t} mobile={mobile} />}
        {scene.id === "learning-from-examples" && (
          <Learning t={t} mobile={mobile} />
        )}
        {scene.id === "a-first-draft" && <Draft t={t} mobile={mobile} />}
        {scene.id === "check-the-time" && <Check t={t} mobile={mobile} />}
        {scene.id === "maya-decides" && <Conclusion t={t} mobile={mobile} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
