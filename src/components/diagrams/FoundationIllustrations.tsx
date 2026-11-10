export function FoundationsIllustration() {
  return (
    <svg
      viewBox="0 0 360 238"
      fill="none"
      aria-hidden="true"
      className="mx-auto w-full max-w-[22.5rem]"
    >
      <circle cx="181" cy="116" r="98" fill="#cec3ff" />
      <circle cx="266" cy="62" r="25" fill="#f7b6eb" />
      <circle cx="90" cy="151" r="26" fill="#f5d7bc" />
      <g stroke="#17243c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M72 185h216M94 195h170" />
        <path d="M123 108h125l-14 65H111z" fill="#fff" />
        <path d="M111 173h139v12H100l11-12Z" fill="#17243c" />
        <path d="M163 123h49v35h-49z" fill="#eae5fa" />
        <path d="m174 143 8 6 17-14" />
        <path d="M100 56h61a10 10 0 0 1 10 10v21a10 10 0 0 1-10 10h-32l-19 14V97h-10a10 10 0 0 1-10-10V66a10 10 0 0 1 10-10Z" fill="#fff" />
        <path d="M108 72h43m-43 12h25" />
        <path d="M236 50h32v29h-32z" transform="rotate(11 236 50)" fill="#fff" />
        <path d="m242 65 5 5 10-8" />
        <path d="m282 110 17 14-10 21m-74-65 11-14m-124 70-13-11" />
        <circle cx="301" cy="125" r="7" fill="#fff" />
        <circle cx="90" cy="126" r="6" fill="#fff" />
        <path d="M77 45v15m-7-7h14m199 92v15m-7-7h14" />
        <circle cx="200" cy="53" r="4" fill="#17243c" />
      </g>
    </svg>
  );
}

export function LessonStepIllustration({
  everyday,
  step,
}: {
  everyday: boolean;
  step: number;
}) {
  const drawings = everyday
    ? [
        <g key="message">
          <path d="M23 24h58v41H23z" fill="#fff" />
          <path d="m25 28 27 21 27-21" />
          <path d="M66 53h12l5 6h13v17H66z" fill="#f5bae9" />
        </g>,
        <g key="suggestion">
          <rect x="23" y="24" width="70" height="49" rx="10" fill="#fff" />
          <path d="m48 37 21 11-21 12V37Z" fill="#fdac82" />
          <path d="M84 14v14m-7-7h14" />
        </g>,
        <g key="translation">
          <path d="M25 23h44v31H43L31 64V54h-6z" fill="#fff" />
          <path d="M55 47h39v29H79l-10 8v-8H55z" fill="#a7e1cc" />
          <path d="M34 34h24m-24 9h12m18 14h20m-20 8h10" />
        </g>,
        <g key="draft">
          <path d="M36 17h31l18 18v46H36z" fill="#fff" />
          <path d="M67 17v18h18M47 47h24M47 57h24M47 67h15" />
          <path d="m82 58 13-15 7 6-13 16-10 4z" fill="#f5bae9" />
        </g>,
      ]
    : [
        <g key="think">
          <path d="M35 72V58a20 20 0 1 1 35-12l9 11h-9v15" fill="#fff" />
          <path d="M51 32a5 5 0 0 1 6 6 5 5 0 0 1-7 4" />
          <circle cx="84" cy="34" r="3" fill="#c9b9ff" />
          <circle cx="96" cy="24" r="7" fill="#fff" />
          <path d="M30 73h46" />
        </g>,
        <g key="reason">
          <path d="M57 41v11M31 64V52h52v12" />
          <rect x="43" y="21" width="29" height="20" rx="5" fill="#fff" />
          <rect x="20" y="63" width="23" height="16" rx="4" fill="#fff" />
          <rect x="72" y="63" width="23" height="16" rx="4" fill="#fdac82" />
          <path d="m51 31 4 4 8-7" />
        </g>,
        <g key="behave">
          <path d="M23 28h60v32H54L40 72V60H23z" fill="#fff" />
          <path d="M64 50h32v22H84l-8 7v-7H64z" fill="#a7e1cc" />
          <path d="M35 40h35M35 49h18" />
        </g>,
        <g key="goal">
          <path d="M71 74V20m0 3 25 8-25 9" fill="#f5bae9" />
          <path d="M19 72h29V52h23" strokeDasharray="5 5" />
          <circle cx="20" cy="72" r="6" fill="#fff" />
          <path d="M60 75h23" />
        </g>,
      ];

  return (
    <svg
      viewBox="0 0 116 94"
      fill="none"
      aria-hidden="true"
      className="size-22 shrink-0 sm:size-24"
    >
      <circle cx="58" cy="47" r="38" fill="#fff" fillOpacity=".55" />
      <g stroke="#17243c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {drawings[step]}
      </g>
    </svg>
  );
}
