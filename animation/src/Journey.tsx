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
import { Maya } from "./Maya";
import { Car, JourneyMap } from "./Map";
const C = {
  navy: "#17243c",
  teal: "#087f72",
  violet: "#7155d9",
  ivory: "#f7f5ef",
};
const ramp = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
export function Journey({ mobile = false }: { mobile?: boolean }) {
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = frame / fps;
  const W = mobile ? 960 : 1920,
    H = mobile ? 1200 : 1080;
  const home = t < 9 || t >= 43;
  const leaving = t >= 49;
  const look = leaving ? 1 - ramp(t, 49, 51) : ramp(t, 1.5, 4);
  const fade = 1 - ramp(t, 56, 57);
  return (
    <AbsoluteFill
      style={{
        background: C.ivory,
        fontFamily: "Arial, sans-serif",
        color: C.navy,
      }}
    >
      <Html5Audio src={staticFile("lessons/maya-journey/narration.m4a")} />
      <AbsoluteFill style={{ opacity: fade }}>
        {home ? (
          <AbsoluteFill style={{ overflow: "hidden" }}>
            <Img
              src={staticFile("lessons/maya-journey/hallway.png")}
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                objectFit: "cover",
                objectPosition: mobile ? "57% center" : "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg,rgba(247,245,239,.13),transparent 60%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: mobile ? 130 : 670,
                top: mobile ? 210 : 170,
                width: mobile ? 610 : 470,
                height: mobile ? 950 : 820,
                transform: `translateX(${leaving ? ramp(t, 50, 55) * (mobile ? 740 : 720) : 0}px) scale(${1 + ramp(t, 0, 8) * 0.025})`,
                transformOrigin: "bottom center",
              }}
            >
              <Maya time={t} checking={look} walking={leaving && t > 50} />
            </div>
            {t < 9 && (
              <div
                style={{
                  position: "absolute",
                  left: mobile ? 52 : 110,
                  top: mobile ? 105 : 210,
                  opacity: ramp(t, 0, 0.6) * (1 - ramp(t, 7, 9)),
                }}
              >
                <div
                  style={{
                    fontSize: mobile ? 28 : 30,
                    letterSpacing: 6,
                    fontWeight: 700,
                    color: C.teal,
                  }}
                >
                  MEET MAYA
                </div>
                <div
                  style={{
                    fontSize: mobile ? 62 : 84,
                    lineHeight: 1.05,
                    fontWeight: 700,
                    marginTop: 18,
                  }}
                >
                  A journey
                  <br />
                  to work.
                </div>
              </div>
            )}
            {t >= 43 && t < 49 && (
              <div
                style={{
                  position: "absolute",
                  left: mobile ? 50 : 115,
                  top: mobile ? 135 : 250,
                  background: "#fffdf7",
                  padding: mobile ? "30px 35px" : "35px 45px",
                  borderRadius: 22,
                  boxShadow: "0 14px 40px #17243c12",
                  transform: `translateY(${(1 - ramp(t, 43, 43.6)) * 30}px)`,
                  maxWidth: mobile ? 540 : 460,
                }}
              >
                <div
                  style={{
                    fontSize: mobile ? 40 : 38,
                    color: C.teal,
                    fontWeight: 700,
                  }}
                >
                  Check before leaving
                </div>
                <div
                  style={{
                    fontSize: mobile ? 58 : 72,
                    fontWeight: 700,
                    marginTop: 10,
                  }}
                >
                  20 min{" "}
                  <span style={{ fontSize: mobile ? 30 : 32, fontWeight: 400 }}>
                    estimated
                  </span>
                </div>
                <svg width="100%" height="100" viewBox="0 0 400 100">
                  <path
                    d="M20 80V30H200V65H380"
                    fill="none"
                    stroke={C.teal}
                    strokeWidth="7"
                    strokeDasharray="12 6"
                  />
                  <circle cx="20" cy="80" r="10" fill={C.navy} />
                  <circle cx="380" cy="65" r="12" fill={C.teal} />
                </svg>
              </div>
            )}
            {leaving && (
              <div
                style={{
                  position: "absolute",
                  left: mobile ? 55 : 115,
                  top: mobile ? 150 : 250,
                  opacity: ramp(t, 49, 50),
                  maxWidth: mobile ? 660 : 650,
                }}
              >
                <div
                  style={{
                    fontSize: mobile ? 64 : 88,
                    fontWeight: 700,
                    lineHeight: 1.08,
                  }}
                >
                  An estimate.
                  <br />
                  Not a promise.
                </div>
                <div style={{ fontSize: mobile ? 38 : 42, marginTop: 25 }}>
                  Traffic can change.
                </div>
              </div>
            )}
          </AbsoluteFill>
        ) : t < 23 || t >= 37 ? (
          <AbsoluteFill style={{ background: "#f7f5ef" }}>
            <div
              style={{
                position: "absolute",
                left: mobile ? 50 : 100,
                top: mobile ? 135 : 115,
                fontSize: mobile ? 64 : 75,
                fontWeight: 700,
                lineHeight: 1.08,
                maxWidth: mobile ? 820 : 1500,
              }}
            >
              {t < 15
                ? "Her usual road is busy."
                : t < 23
                  ? "Two routes. Different estimates."
                  : "Prediction: what may happen next."}
            </div>
            <div
              style={{
                position: "absolute",
                left: mobile ? 25 : 120,
                top: mobile ? 350 : 280,
                width: mobile ? 910 : 1430,
                height: mobile ? 600 : 700,
                transform: `scale(${1 + ramp(t, 9, 12) * 0.02})`,
              }}
            >
              <JourneyMap
                time={t}
                heavy={true}
                compare={t >= 15}
                routeProgress={t >= 37 ? ramp(t, 38, 42) : 0}
              />
            </div>
            {!mobile && (
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 20,
                  width: 380,
                  height: 650,
                }}
              >
                <Maya time={t} checking={1} />
              </div>
            )}
            {mobile && (
              <div
                style={{
                  position: "absolute",
                  left: 55,
                  right: 55,
                  bottom: 140,
                  display: "flex",
                  gap: 35,
                  fontSize: 43,
                  fontWeight: 700,
                }}
              >
                <div style={{ flex: 1 }}>
                  Usual road
                  <br />
                  <span style={{ fontSize: 68 }}>30 min</span>
                </div>
                {t >= 15 && (
                  <div style={{ flex: 1, color: C.teal }}>
                    Other route
                    <br />
                    <span style={{ fontSize: 68 }}>20 min</span>
                  </div>
                )}
              </div>
            )}
          </AbsoluteFill>
        ) : (
          <AbsoluteFill style={{ background: "#f0eee7" }}>
            <div
              style={{
                position: "absolute",
                left: mobile ? 50 : 100,
                top: mobile ? 110 : 120,
                fontSize: mobile ? 62 : 78,
                fontWeight: 700,
              }}
            >
              Where does the
              <br />
              estimate come from?
            </div>
            <svg
              viewBox={mobile ? "0 0 960 850" : "0 0 1800 650"}
              style={{
                position: "absolute",
                left: mobile ? 0 : 60,
                top: mobile ? 300 : 330,
                width: mobile ? 960 : 1800,
                height: mobile ? 850 : 650,
              }}
            >
              <g transform={mobile ? "translate(80 40)" : "translate(45 50)"}>
                <text
                  x="0"
                  y="0"
                  fontSize={mobile ? 43 : 38}
                  fontFamily="Arial"
                  fill={C.navy}
                  fontWeight="700"
                >
                  Traffic now
                </text>
                <path d="M0 90H440" stroke="#d6d8d1" strokeWidth="65" />
                <path d="M0 90H440" stroke="#fffdf7" strokeWidth="54" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <Car
                    key={i}
                    x={50 + i * 70 + Math.sin(t) * 3}
                    y={90}
                    color={i % 2 ? C.violet : "#c78560"}
                  />
                ))}
              </g>
              <g
                transform={mobile ? "translate(80 270)" : "translate(45 330)"}
                opacity={ramp(t, 26, 27)}
              >
                <text
                  x="0"
                  y="0"
                  fontSize={mobile ? 43 : 38}
                  fontFamily="Arial"
                  fill={C.navy}
                  fontWeight="700"
                >
                  Earlier journeys
                </text>
                {[0, 1, 2].map((i) => (
                  <g key={i} transform={`translate(${i * 145} 35)`}>
                    <rect
                      width="125"
                      height="130"
                      rx="15"
                      fill={i === 1 ? "#ddd4f5" : "#fffdf7"}
                    />
                    <path d="M0 30h125" stroke="#b4b7b2" strokeWidth="2" />
                    <circle
                      cx="63"
                      cy="80"
                      r="30"
                      stroke={C.violet}
                      strokeWidth="5"
                      fill="none"
                    />
                    <path
                      d={`M63 57v23l${16 - i * 9} ${8 + i * 3}`}
                      fill="none"
                      stroke={C.navy}
                      strokeWidth="4"
                    />
                  </g>
                ))}
              </g>
              <g opacity={ramp(t, 29, 30)}>
                {mobile ? (
                  <path
                    d="M600 145Q810 145 810 450Q810 565 480 565V610"
                    fill="none"
                    stroke={C.violet}
                    strokeWidth="8"
                    strokeDasharray="15 12"
                    strokeDashoffset={-t * 35}
                  />
                ) : (
                  <>
                    <path
                      d="M540 145Q730 145 730 280H1020M540 430Q730 430 730 280"
                      fill="none"
                      stroke={C.violet}
                      strokeWidth="8"
                      strokeDasharray="18 12"
                      strokeDashoffset={-t * 35}
                    />
                    <path
                      d="m990 260 30 20-30 20"
                      stroke={C.violet}
                      strokeWidth="8"
                      fill="none"
                    />
                  </>
                )}
              </g>
              <g
                transform={
                  mobile ? "translate(160 610)" : "translate(1100 130)"
                }
                opacity={ramp(t, 31, 32)}
              >
                <rect
                  width={mobile ? 640 : 590}
                  height={mobile ? 190 : 300}
                  rx="32"
                  fill={C.navy}
                />
                <text
                  x="35"
                  y={mobile ? 63 : 78}
                  fontFamily="Arial"
                  fontSize={mobile ? 42 : 40}
                  fill="#eae5fa"
                >
                  Estimated journey
                </text>
                <text
                  x="35"
                  y={mobile ? 145 : 200}
                  fontFamily="Arial"
                  fontSize={mobile ? 80 : 84}
                  fontWeight="700"
                  fill="#fff"
                >
                  30 minutes
                </text>
              </g>
            </svg>
          </AbsoluteFill>
        )}
        <div
          style={{
            position: "absolute",
            left: mobile ? 45 : 65,
            top: 35,
            color: C.navy,
            fontSize: mobile ? 24 : 25,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          BUGGLE LEARN <span style={{ opacity: 0.5 }}> / </span> AI IN YOUR DAY
        </div>
        <div
          style={{
            position: "absolute",
            left: mobile ? 45 : 65,
            bottom: mobile ? 25 : 30,
            fontSize: mobile ? 23 : 24,
            color: C.navy,
            background: "#f7f5efdf",
            padding: "9px 16px",
            borderRadius: 8,
          }}
        >
          Fictional journey · example times
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
