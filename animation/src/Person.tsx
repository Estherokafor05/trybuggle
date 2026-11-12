import React from "react";
// Original layered characters for Lessons 4 and 5, drawn in the same flat
// style as Maya and Sarah. All motion is derived from the composition clock.
export type Look = {
  skin: string;
  shade: string;
  hair: string;
  hairStyle: "short" | "bun";
  top: string;
  jacket: string;
  jacketLine: string;
  trousers: string;
  glasses?: boolean;
  beard?: boolean;
  lanyard?: string;
};
export const daniel: Look = {
  skin: "#8a5a3c",
  shade: "#714630",
  hair: "#1d1715",
  hairStyle: "short",
  top: "#e9f4f1",
  jacket: "#2f6f8f",
  jacketLine: "#255a74",
  trousers: "#2b3142",
  beard: true,
  lanyard: "#7155d9",
};
export const amina: Look = {
  skin: "#6e4330",
  shade: "#5a3424",
  hair: "#1c1513",
  hairStyle: "bun",
  top: "#fbe9e4",
  jacket: "#b8476a",
  jacketLine: "#9a3858",
  trousers: "#3a3550",
  glasses: true,
};

export function Person({
  look,
  time = 0,
  hold = 0,
  mood = "calm",
}: {
  look: Look;
  time?: number;
  /** 0 = arm down, 1 = holding a tablet or phone up to read. */
  hold?: number;
  mood?: "calm" | "thinking" | "smile";
}) {
  const blink = time % 4.9 > 4.7 ? 0.12 : 1;
  const breath = Math.sin(time * 2) * 1.5;
  const { skin, shade, hair, jacket, jacketLine, top, trousers } = look;
  const ink = "#17243c";
  return (
    <svg viewBox="0 0 400 700" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="201" cy="671" rx="103" ry="13" fill={ink} opacity=".12" />
      <g transform={`translate(0 ${breath})`}>
        <path d="M150 440Q146 520 150 640L186 644L196 540L204 442" fill={trousers} />
        <path d="M202 442L214 550L222 644L258 640L262 520L258 438" fill={trousers} opacity=".9" />
        <path d="M144 636L188 640L190 667H122Q114 652 144 636" fill={ink} />
        <path d="M220 640L262 636Q282 652 292 657V669H219Z" fill={ink} />
        <path d="M153 244Q122 248 110 294L96 388Q93 408 108 414Q124 416 128 398L156 316" fill={jacket} />
        <path d="M98 392Q86 420 103 437Q111 444 116 436L121 410Z" fill={skin} />
        <path d="M166 236Q199 224 232 238L250 452Q201 466 150 452Z" fill={top} />
        <path d="M163 235L140 268L130 470Q160 478 182 474L184 300L176 246Z" fill={jacket} stroke={jacketLine} strokeWidth="3" />
        <path d="M235 237L262 262L276 470Q246 478 220 474L218 300L226 246Z" fill={jacket} stroke={jacketLine} strokeWidth="3" />
        {look.lanyard && (
          <>
            <path d="M184 240L200 330L216 240" fill="none" stroke={look.lanyard} strokeWidth="6" />
            <rect x="186" y="326" width="30" height="40" rx="5" fill="#fff" stroke={look.lanyard} strokeWidth="3" />
            <rect x="192" y="336" width="18" height="5" rx="2" fill={look.lanyard} />
          </>
        )}
        <g transform={`rotate(${-hold * 14} 252 262)`}>
          <path d="M243 245Q268 240 282 270L300 328L273 340L245 292" fill={jacket} />
          <g transform={`rotate(${-hold * 95} 286 330)`}>
            <path d="M272 318Q299 311 304 337L310 391L286 395Z" fill={jacket} />
            <path d="M286 385Q281 406 291 420Q306 432 316 411L313 386" fill={skin} />
            {hold > 0.05 && (
              <g transform="translate(290 392) rotate(14)" opacity={Math.min(1, hold * 2)}>
                <rect x="-16" y="-20" width="48" height="66" rx="7" fill={ink} />
                <rect x="-11" y="-14" width="38" height="52" rx="3" fill="#e3ddfa" />
                <rect x="-7" y="-8" width="22" height="5" rx="2" fill="#7155d9" />
                <rect x="-7" y="2" width="28" height="5" rx="2" fill="#087f72" />
              </g>
            )}
          </g>
        </g>
        <path d="M176 206L174 240Q197 262 221 239L219 200" fill={skin} />
        <path d="M175 212Q198 230 219 207V222Q197 240 176 226" fill={shade} opacity=".6" />
        {look.hairStyle === "bun" && <circle cx="200" cy="44" r="34" fill={hair} />}
        <ellipse cx="141" cy="156" rx="13" ry="21" fill={skin} />
        <ellipse cx="258" cy="156" rx="13" ry="21" fill={skin} />
        <path d="M142 112Q154 78 199 78Q244 77 257 113L251 178Q242 219 199 224Q159 216 147 180Z" fill={skin} />
        {look.hairStyle === "short" ? (
          <path d="M140 132Q132 70 200 64Q270 68 260 132Q250 100 226 96Q200 90 172 96Q150 102 140 132Z" fill={hair} />
        ) : (
          <path d="M138 140Q130 70 200 68Q272 70 262 140Q252 100 228 96Q200 104 172 96Q148 102 138 140Z" fill={hair} />
        )}
        {look.beard && (
          <path d="M150 176Q160 226 200 228Q240 226 250 176Q240 200 222 200Q200 192 178 200Q160 200 150 176Z" fill={hair} />
        )}
        <path d={`M155 ${mood === "thinking" ? 128 : 133}q15-9 30-2m28 0q16-9 30 2`} fill="none" stroke={hair} strokeWidth="5" strokeLinecap="round" />
        {[173, 227].map((x) => (
          <g key={x} transform={`translate(${x} 149) scale(1 ${blink})`}>
            <ellipse rx="11" ry="7" fill="#fff7ec" />
            <ellipse cx={hold > 0.5 ? 3 : mood === "thinking" ? -2 : 0} cy={mood === "thinking" ? -2 : 0} rx="4.4" ry="6" fill="#241a17" />
            <circle cx="2" cy="-2" r="1.5" fill="#fff" />
          </g>
        ))}
        <path d="M200 148l-5 25q7 6 14 0" fill="none" stroke={shade} strokeWidth="3" strokeLinecap="round" />
        {mood === "smile" ? (
          <>
            <path d="M180 188Q200 206 222 186Q205 218 180 188" fill="#5e2a28" />
            <path d="M185 190q15 7 31-1" stroke="#fff2df" strokeWidth="4" fill="none" />
          </>
        ) : mood === "thinking" ? (
          <path d="M188 195q12-4 26 0" fill="none" stroke="#5e2a28" strokeWidth="5" strokeLinecap="round" />
        ) : (
          <path d="M184 192q16 8 32 0" fill="none" stroke="#5e2a28" strokeWidth="5" strokeLinecap="round" />
        )}
        {look.glasses && (
          <g fill="none" stroke="#e0b25a" strokeWidth="3.5">
            <circle cx="173" cy="149" r="17" />
            <circle cx="227" cy="149" r="17" />
            <path d="M190 148q10-5 20 0" />
          </g>
        )}
      </g>
    </svg>
  );
}
