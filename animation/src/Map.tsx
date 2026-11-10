import React from "react";
const A = [
  [100, 440],
  [290, 440],
  [290, 160],
  [850, 160],
  [850, 90],
  [1050, 90],
];
const B = [
  [100, 440],
  [100, 550],
  [1050, 550],
  [1050, 90],
];
export function pointOnRoute(points: number[][], progress: number) {
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let d =
    Math.max(0, Math.min(1, progress)) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i]) {
      const p = points[i],
        q = points[i + 1];
      return {
        x: p[0] + ((q[0] - p[0]) * d) / lengths[i],
        y: p[1] + ((q[1] - p[1]) * d) / lengths[i],
        angle: (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI,
      };
    }
    d -= lengths[i];
  }
  return { x: 1050, y: 90, angle: -90 };
}
export function Car({
  x,
  y,
  angle = 0,
  color = "#7155d9",
}: {
  x: number;
  y: number;
  angle?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx="0" cy="7" rx="25" ry="13" fill="#17243c" opacity=".14" />
      <rect x="-23" y="-11" width="46" height="22" rx="9" fill={color} />
      <path d="M-5-8h14l5 4v8L9 8H-5Z" fill="#d5e9e4" />
      <path d="M6-8V8" stroke={color} strokeWidth="3" />
      <path
        d="M-18-11h8m-8 22h8m16-22h8m-8 22h8"
        stroke="#17243c"
        strokeWidth="3"
      />
    </g>
  );
}
export function JourneyMap({
  time = 0,
  heavy = true,
  compare = true,
  routeProgress = 0,
}: {
  time?: number;
  heavy?: boolean;
  compare?: boolean;
  routeProgress?: number;
}) {
  const p = pointOnRoute(B, routeProgress);
  return (
    <svg viewBox="0 0 1200 650" width="100%" height="100%" aria-hidden="true">
      <rect width="1200" height="650" rx="32" fill="#eaf0e5" />
      <path
        d="M0 325Q250 270 500 335T1200 280"
        stroke="#bfdedc"
        strokeWidth="55"
        fill="none"
      />
      {[
        [430, 360],
        [850, 380],
        [650, 75],
        [115, 180],
        [1090, 340],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect
            x={x - 70}
            y={y - 50}
            width="140"
            height="100"
            rx="15"
            fill={i % 2 ? "#dbd2be" : "#ddd2e8"}
          />
          <rect
            x={x - 60}
            y={y - 45}
            width="120"
            height="75"
            rx="9"
            fill={i % 2 ? "#f5ead3" : "#eee6f7"}
          />
          {[0, 1, 2].map((j) => (
            <rect
              key={j}
              x={x - 42 + j * 33}
              y={y - 28}
              width="18"
              height="25"
              rx="3"
              fill="#fff9ed"
            />
          ))}
        </g>
      ))}
      {[A, B].map((pts, i) => (
        <g key={i}>
          <polyline
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="#c9cbbf"
            strokeWidth="42"
            strokeLinejoin="round"
          />
          <polyline
            points={pts.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="#fffdf7"
            strokeWidth="34"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <polyline
        points={A.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={heavy ? "#c16a46" : "#7155d9"}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      {compare && (
        <polyline
          points={B.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="#087f72"
          strokeWidth="9"
          strokeLinejoin="round"
          strokeDasharray="18 9"
        />
      )}
      {Array.from({ length: heavy ? 7 : 3 }, (_, i) => {
        const c = pointOnRoute(
          A,
          heavy
            ? Math.min(
                0.45 + i * 0.033,
                Math.max(0, (time - 9) * 0.11) + i * 0.033,
              )
            : (time * 0.045 + i * 0.25) % 1,
        );
        return <Car key={i} {...c} color={i % 2 ? "#e4aa79" : "#566b83"} />;
      })}
      {compare && routeProgress > 0 && <Car {...p} color="#087f72" />}
      <g transform="translate(100 440)">
        <circle r="24" fill="#17243c" stroke="#fff" strokeWidth="5" />
        <path d="m-11 1 11-10 11 10v10H-11Z" fill="#fff" />
      </g>
      <g transform="translate(1050 90)">
        <circle r="30" fill="#087f72" stroke="#fff" strokeWidth="5" />
        <path
          d="M-17 12v-20h34v20M-22-10 0-24 22-10M-5 12V0h10v12"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
        />
      </g>
      <g fontFamily="Arial,sans-serif" fontWeight="700" fill="#17243c">
        <text x="48" y="495" fontSize="27">
          Home
        </text>
        <text x="905" y="40" fontSize="27">
          Community centre
        </text>
      </g>
      <g transform="translate(460 184)">
        <rect width="245" height="89" rx="18" fill="#fffdf7" />
        <text x="20" y="32" fontFamily="Arial" fontSize="22" fill="#526174">
          Usual road · estimate
        </text>
        <text
          x="20"
          y="69"
          fontFamily="Arial"
          fontSize="35"
          fontWeight="700"
          fill="#17243c"
        >
          {heavy && time >= 12 ? "30" : "15"} min
        </text>
      </g>
      {compare && (
        <g transform="translate(600 430)">
          <rect width="280" height="85" rx="18" fill="#fffdf7" />
          <text x="20" y="30" fontFamily="Arial" fontSize="22" fill="#526174">
            Other route · estimate
          </text>
          <text
            x="20"
            y="66"
            fontFamily="Arial"
            fontSize="35"
            fontWeight="700"
            fill="#087f72"
          >
            20 min
          </text>
        </g>
      )}
    </svg>
  );
}
