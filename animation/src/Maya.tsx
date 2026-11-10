import React from "react";
// Original layered character. All motion is derived from the composition clock.
export function Maya({
  time = 0,
  checking = 0,
  walking = false,
}: {
  time?: number;
  checking?: number;
  walking?: boolean;
}) {
  const gait = walking ? Math.sin(time * 9) * 13 : 0;
  const blink = time % 4.7 > 4.48 ? 0.12 : 1;
  const breath = Math.sin(time * 2) * 1.5;
  return (
    <svg viewBox="0 0 400 700" width="100%" height="100%" aria-hidden="true">
      <ellipse
        cx="201"
        cy="671"
        rx="103"
        ry="13"
        fill="#17243c"
        opacity=".12"
      />
      <g
        transform={`translate(0 ${walking ? Math.abs(Math.sin(time * 9)) * 4 : breath})`}
      >
        <g transform={`rotate(${gait} 178 447)`}>
          <path
            d="M142 432Q137 510 145 568L138 644Q159 654 183 641L193 540L205 438"
            fill="#273449"
          />
          <path
            d="M140 633L183 637L187 667H115Q105 653 140 633"
            fill="#17243c"
          />
          <path d="M114 666h74" stroke="#f7f5ef" strokeWidth="5" />
        </g>
        <g transform={`rotate(${-gait} 229 447)`}>
          <path
            d="M201 438L215 552L225 644Q248 652 270 639L260 536L260 431"
            fill="#35435a"
          />
          <path
            d="M224 637L267 634Q280 654 296 657L296 669H223Z"
            fill="#17243c"
          />
          <path d="M224 668h72" stroke="#f7f5ef" strokeWidth="5" />
        </g>
        <path
          d="M153 242Q120 245 108 292L92 386Q88 407 104 415Q122 417 126 397L154 313"
          fill="#0c766e"
        />
        <path
          d="M94 391Q81 419 99 438Q107 446 113 437L118 410Z"
          fill="#b97554"
        />
        <path
          d="M163 235Q197 221 233 238L265 260L277 445Q207 469 132 447L140 268Z"
          fill="#17867b"
        />
        <path d="M180 238L197 266L215 237L242 447H163Z" fill="#f7ead5" />
        <path
          d="M163 235L184 244L176 303L165 450M233 238L213 245L221 304L241 451"
          fill="none"
          stroke="#0a685f"
          strokeWidth="7"
        />
        <path d="M148 370h25v34h-29M239 370h25l4 34h-24" fill="#0f776c" />
        <g transform={`rotate(${-checking * 13 - gait * 0.3} 253 264)`}>
          <path
            d="M243 245Q267 240 281 269L300 326L273 339L244 290"
            fill="#199083"
          />
          <g transform={`rotate(${-checking * 93} 286 329)`}>
            <path
              d="M272 318Q299 311 304 337L310 391L286 395Z"
              fill="#168479"
            />
            <path
              d="M286 385Q281 406 291 420Q306 432 316 411L313 386"
              fill="#c88b69"
            />
            <g transform="translate(297 395) rotate(14)">
              <rect
                x="-12"
                y="-17"
                width="37"
                height="67"
                rx="7"
                fill="#17243c"
              />
              <rect
                x="-7"
                y="-10"
                width="27"
                height="48"
                rx="3"
                fill="#bce0d4"
              />
              <path
                d="M-2 24L8 10L16 17"
                fill="none"
                stroke="#7155d9"
                strokeWidth="3"
              />
              <circle cx="6" cy="43" r="2" fill="#fff" />
            </g>
            <path
              d="M285 397Q290 387 301 394L308 404Q305 411 298 405L293 405"
              fill="#c88b69"
            />
          </g>
        </g>
        <path d="M175 207L173 239Q196 265 220 238L218 201" fill="#b97554" />
        <path
          d="M174 211Q198 230 218 207V222Q197 240 175 225"
          fill="#8b503c"
          opacity=".5"
        />
        <g transform={`rotate(${checking * 7} 198 203)`}>
          <path
            d="M130 164Q93 122 119 68Q145 18 205 29Q266 14 284 79Q306 126 270 177L247 209L143 201Z"
            fill="#20232d"
          />
          {[
            [124, 87],
            [148, 48],
            [182, 37],
            [216, 37],
            [247, 52],
            [269, 82],
            [277, 114],
            [124, 132],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="28"
              fill={i % 2 ? "#292b35" : "#252732"}
            />
          ))}
          <ellipse cx="139" cy="156" rx="14" ry="22" fill="#b97554" />
          <ellipse cx="259" cy="156" rx="13" ry="22" fill="#b97554" />
          <path
            d="M141 111Q153 77 198 77Q244 75 258 112L252 178Q243 220 199 225Q158 216 145 180Z"
            fill="#ca8b68"
          />
          <path
            d="M145 119Q159 111 167 85Q207 112 255 103L262 121Q278 68 233 54L175 59Q132 70 145 119"
            fill="#252732"
          />
          <path
            d="M154 134q15-10 30-2m28 0q17-10 30 2"
            fill="none"
            stroke="#3b2d2c"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <g transform={`translate(173 149) scale(1 ${blink})`}>
            <ellipse rx="11" ry="7" fill="#fff5e9" />
            <ellipse cx={checking ? 3 : 0} rx="4.2" ry="6" fill="#342c2b" />
            <circle cx="2" cy="-2" r="1.5" fill="#fff" />
          </g>
          <g transform={`translate(228 149) scale(1 ${blink})`}>
            <ellipse rx="11" ry="7" fill="#fff5e9" />
            <ellipse cx={checking ? 3 : 0} rx="4.2" ry="6" fill="#342c2b" />
            <circle cx="2" cy="-2" r="1.5" fill="#fff" />
          </g>
          <path
            d="M199 147l-5 26q7 6 15 0"
            fill="none"
            stroke="#a7664c"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M183 190Q201 202 221 187Q205 215 183 190" fill="#8f4a43" />
          <path
            d="M187 191q16 7 29-1"
            stroke="#fff2df"
            strokeWidth="4"
            fill="none"
          />
          <ellipse
            cx="162"
            cy="175"
            rx="12"
            ry="6"
            fill="#cf795e"
            opacity=".5"
          />
          <ellipse
            cx="238"
            cy="174"
            rx="12"
            ry="6"
            fill="#cf795e"
            opacity=".5"
          />
          <circle
            cx="138"
            cy="175"
            r="7"
            fill="none"
            stroke="#e6c47f"
            strokeWidth="4"
          />
          <circle
            cx="260"
            cy="174"
            r="7"
            fill="none"
            stroke="#e6c47f"
            strokeWidth="4"
          />
          <path
            d="M139 106Q119 90 138 67M158 70Q143 50 166 42M191 63Q181 42 204 35M231 71Q242 50 254 70"
            fill="none"
            stroke="#3a3b45"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
}
