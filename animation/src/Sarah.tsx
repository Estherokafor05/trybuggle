import React from "react";
// Sarah, a pharmacist. Original layered character drawn in the same flat
// style as Maya. All motion is derived from the composition clock.
export function Sarah({
  time = 0,
  phone = 0,
  mood = "calm",
}: {
  time?: number;
  /** 0 = arm down, 1 = holding a phone up to read. */
  phone?: number;
  mood?: "calm" | "surprised" | "smile";
}) {
  const blink = time % 5.1 > 4.9 ? 0.12 : 1;
  const breath = Math.sin(time * 2) * 1.5;
  const skin = "#e2a984",
    shade = "#c98d6b",
    hair = "#7b3a22",
    hairDark = "#5f2b18",
    coat = "#f6f7f9",
    coatLine = "#c9d1dc",
    top = "#2e4a7d",
    ink = "#17243c";
  const brow = mood === "surprised" ? -7 : 0;
  return (
    <svg viewBox="0 0 400 700" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="201" cy="671" rx="103" ry="13" fill={ink} opacity=".12" />
      <g transform={`translate(0 ${breath})`}>
        {/* legs */}
        <path d="M150 440Q146 520 150 640L186 644L196 540L204 442" fill="#3b3f4c" />
        <path d="M202 442L214 550L222 644L258 640L262 520L258 438" fill="#454a59" />
        <path d="M144 636L188 640L190 667H122Q114 652 144 636" fill={ink} />
        <path d="M220 640L262 636Q282 652 292 657V669H219Z" fill={ink} />
        {/* back arm */}
        <path
          d="M153 244Q122 248 110 294L96 388Q93 408 108 414Q124 416 128 398L156 316"
          fill={coat}
          stroke={coatLine}
          strokeWidth="3"
        />
        <path d="M98 392Q86 420 103 437Q111 444 116 436L121 410Z" fill={skin} />
        {/* body: navy top under an open lab coat */}
        <path d="M166 236Q199 224 232 238L250 452Q201 466 150 452Z" fill={top} />
        <path
          d="M163 235L140 268L130 470Q160 478 182 474L184 300L176 246Z"
          fill={coat}
          stroke={coatLine}
          strokeWidth="3"
        />
        <path
          d="M235 237L262 262L276 470Q246 478 220 474L218 300L226 246Z"
          fill={coat}
          stroke={coatLine}
          strokeWidth="3"
        />
        <path d="M140 400h30v30h-30M236 400h30v30h-30" fill="none" stroke={coatLine} strokeWidth="3" />
        {/* name badge */}
        <rect x="232" y="300" width="34" height="20" rx="4" fill="#0c766e" />
        <rect x="237" y="307" width="24" height="5" rx="2" fill="#e8f5f2" />
        {/* front arm, raises a phone when reading */}
        <g transform={`rotate(${-phone * 14} 252 262)`}>
          <path
            d="M243 245Q268 240 282 270L300 328L273 340L245 292"
            fill={coat}
            stroke={coatLine}
            strokeWidth="3"
          />
          <g transform={`rotate(${-phone * 95} 286 330)`}>
            <path d="M272 318Q299 311 304 337L310 391L286 395Z" fill={coat} stroke={coatLine} strokeWidth="3" />
            <path d="M286 385Q281 406 291 420Q306 432 316 411L313 386" fill={skin} />
            {phone > 0.05 && (
              <g transform="translate(297 395) rotate(14)" opacity={Math.min(1, phone * 2)}>
                <rect x="-12" y="-17" width="37" height="67" rx="7" fill={ink} />
                <rect x="-7" y="-10" width="27" height="48" rx="3" fill="#e3ddfa" />
                <rect x="-4" y="-4" width="15" height="5" rx="2" fill="#7155d9" />
                <rect x="1" y="6" width="16" height="5" rx="2" fill="#0c766e" />
              </g>
            )}
          </g>
        </g>
        {/* neck */}
        <path d="M176 206L174 240Q197 262 221 239L219 200" fill={skin} />
        <path d="M175 212Q198 230 219 207V222Q197 240 176 226" fill={shade} opacity=".55" />
        {/* head */}
        <g>
          {/* hair behind: straight bob */}
          <path
            d="M128 120Q124 46 200 38Q276 44 272 120L280 214Q244 228 226 206L174 206Q152 228 120 214Z"
            fill={hair}
          />
          <ellipse cx="141" cy="156" rx="13" ry="21" fill={skin} />
          <ellipse cx="258" cy="156" rx="13" ry="21" fill={skin} />
          <path
            d="M142 112Q154 78 199 78Q244 77 257 113L251 178Q242 219 199 224Q159 216 147 180Z"
            fill={skin}
          />
          {/* fringe */}
          <path
            d="M138 128Q140 64 200 58Q262 62 262 128Q236 96 212 100Q190 112 160 104Q148 112 138 128Z"
            fill={hairDark}
          />
          <path d="M150 112Q176 92 204 96M214 92Q240 92 254 116" fill="none" stroke={hair} strokeWidth="5" strokeLinecap="round" />
          {/* brows */}
          <path
            d={`M155 ${133 + brow}q15-9 30-2m28 0q16-9 30 2`}
            fill="none"
            stroke="#4a2417"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* eyes */}
          {[173, 227].map((x) => (
            <g key={x} transform={`translate(${x} 149) scale(1 ${blink})`}>
              <ellipse rx="11" ry={mood === "surprised" ? 9 : 7} fill="#fff7ec" />
              <ellipse cx={phone > 0.5 ? 3 : 0} rx="4.4" ry="6" fill="#2f2622" />
              <circle cx="2" cy="-2" r="1.5" fill="#fff" />
            </g>
          ))}
          <path d="M200 148l-5 25q7 6 14 0" fill="none" stroke="#b5755a" strokeWidth="3" strokeLinecap="round" />
          {mood === "surprised" ? (
            <ellipse cx="200" cy="195" rx="10" ry="12" fill="#8f4a43" />
          ) : mood === "smile" ? (
            <>
              <path d="M180 188Q200 206 222 186Q205 218 180 188" fill="#8f4a43" />
              <path d="M185 190q15 7 31-1" stroke="#fff2df" strokeWidth="4" fill="none" />
            </>
          ) : (
            <path d="M184 192q16 8 32 0" fill="none" stroke="#8f4a43" strokeWidth="5" strokeLinecap="round" />
          )}
          <ellipse cx="163" cy="176" rx="12" ry="6" fill="#d9806a" opacity=".45" />
          <ellipse cx="237" cy="175" rx="12" ry="6" fill="#d9806a" opacity=".45" />
          {/* glasses */}
          <g fill="none" stroke="#2b3550" strokeWidth="3.5">
            <rect x="155" y="137" width="37" height="26" rx="10" />
            <rect x="208" y="137" width="37" height="26" rx="10" />
            <path d="M192 148q8-5 16 0" />
          </g>
        </g>
      </g>
    </svg>
  );
}
