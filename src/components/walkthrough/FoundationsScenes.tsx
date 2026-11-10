import { useState } from "react";
import Image from "next/image";
import styles from "./FoundationsScenes.module.css";

type FoundationScene = "intro" | "puzzle" | "discount" | "library" | "routes";
type ExampleScene = Exclude<FoundationScene, "intro">;

const stage =
  "m-0 min-w-0 overflow-hidden rounded-3xl border border-line p-3 text-navy sm:p-5";

const examples: { scene: ExampleScene; label: string; colour: string }[] = [
  { scene: "puzzle", label: "Solving a puzzle", colour: "bg-lavender" },
  { scene: "discount", label: "Shopping", colour: "bg-peach" },
  { scene: "library", label: "Asking for help", colour: "bg-blush" },
  { scene: "routes", label: "Choosing a route", colour: "bg-mint" },
];

export function ExampleIllustration({ scene }: { scene: ExampleScene }) {
  const artwork = {
    puzzle: (
      <>
        <path
          d="M14 14h21v8c6-4 13 1 13 6s-7 10-13 6v8h-9c4 6-1 13-6 13s-10-7-6-13H6V14Z"
          fill="var(--color-lavender)"
        />
        <path d="M55 20h13v13m0-13-14 14" />
        <path d="M53 48h14v14H53Z" fill="var(--color-peach)" />
      </>
    ),
    discount: (
      <>
        <path d="M14 29h48l-6 27H20Z" fill="var(--color-peach)" />
        <path d="m25 29 9-15m17 15-9-15M28 39v9m10-9v9m10-9v9" />
        <circle cx="58" cy="19" r="10" fill="var(--color-white)" />
        <path d="m54 19 3 3 5-6" />
      </>
    ),
    library: (
      <>
        <path
          d="M8 13h45a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5H27L16 48v-8H8a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5Z"
          fill="var(--color-white)"
        />
        <path
          d="M42 32h25a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4h-4v7l-9-7H42a4 4 0 0 1-4-4V36a4 4 0 0 1 4-4Z"
          fill="var(--color-blush)"
        />
        <path d="M13 23h31m-31 8h17m15 11h19m-19 6h10" />
      </>
    ),
    routes: (
      <>
        <path d="M14 55h19V31h24" strokeDasharray="4 4" />
        <path d="M14 55h8V16h35v15" stroke="var(--color-teal)" />
        <circle cx="14" cy="55" r="6" fill="var(--color-white)" />
        <path d="M57 35V10l14 5-14 5" fill="var(--color-peach)" />
        <circle cx="57" cy="35" r="5" fill="var(--color-white)" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 76 72"
      fill="none"
      stroke="var(--color-navy)"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mx-auto size-full"
    >
      {artwork[scene]}
    </svg>
  );
}

function IntroScene({ cue }: { cue: number }) {
  const example = examples[cue <= 3 ? cue : 0];
  const images = {
    puzzle: "/illustrations/puzzle-at-home.png",
    discount: "/illustrations/checkout-reference.jpg",
    library: "/illustrations/library-help-scene.png",
  };
  return (
    <figure
      className={stage + " bg-ivory"}
      aria-label="Four familiar situations introduce four questions about AI"
    >
      {cue <= 3 || cue === 7 ? (
        <div key={cue} className={styles.reveal}>
          {example.scene === "routes" ? (
            <RouteMap cue={1} />
          ) : (
            <Image
              src={images[example.scene]}
              alt={
                example.scene === "puzzle"
                  ? "A person selects a puzzle piece at a kitchen table."
                  : example.scene === "discount"
                    ? "A shopper at a checkout."
                    : "A visitor with a book at a library help screen."
              }
              width={1672}
              height={941}
              className="mx-auto h-auto w-full max-w-lg rounded-2xl"
              sizes="(max-width: 639px) 90vw, 512px"
            />
          )}
          <p className="mt-4 text-center text-xl font-bold">{example.label}</p>
        </div>
      ) : (
        <div className="mx-auto max-w-xl py-6">
          <p className="text-center text-xl font-bold">
            What question are we asking?
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="mx-auto block size-16">
                <ExampleIllustration scene="puzzle" />
              </span>
              <p className="mt-2 font-semibold">
                How it works through a problem
              </p>
            </div>
            <div>
              <span className="mx-auto block size-16">
                <ExampleIllustration scene="library" />
              </span>
              <p className="mt-2 font-semibold">What it does</p>
            </div>
          </div>
          {cue >= 6 && (
            <div className="mt-5 border-t border-navy/20 pt-4 text-center">
              <p>Compare with people</p>
              <p className="my-2" aria-hidden="true">
                ↕
              </p>
              <p>Check reasoning and choices</p>
            </div>
          )}
        </div>
      )}
      <figcaption className="mt-3 text-center text-sm">
        {cue === 7
          ? "Let’s start with the puzzle."
          : "Familiar situations help us ask different questions."}
      </figcaption>
    </figure>
  );
}

const jigsawPieces = [
  {
    path: "M0 0H44V13C58 8 58 29 44 25V42H30C34 54 11 54 15 42H0Z",
    fill: "var(--color-lavender)",
  },
  {
    path: "M44 0H88V42H72C77 54 56 54 60 42H44V25C58 29 58 8 44 13Z",
    fill: "var(--color-hero-lavender)",
  },
  {
    path: "M0 42H15C11 54 34 54 30 42H44V57C56 53 56 74 44 70V84H0Z",
    fill: "var(--color-mint)",
  },
  {
    path: "M44 42H60C56 54 77 54 72 42H88V84H44V70C56 74 56 53 44 57Z",
    fill: "var(--color-peach)",
  },
];

const puzzleOffsets = [
  [
    [-22, -13],
    [24, -10],
    [-18, 14],
    [22, 16],
  ],
  [
    [0, 0],
    [7, -8],
    [-18, 14],
    [22, 16],
  ],
  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
] as const;

function PuzzleBoard({ step }: { step: 0 | 1 | 2 }) {
  return (
    <svg
      viewBox="0 0 148 132"
      aria-hidden="true"
      className="mx-auto w-full max-w-44"
      stroke="var(--color-navy)"
      strokeWidth="1.7"
      strokeLinejoin="round"
    >
      <rect
        x="1"
        y="1"
        width="146"
        height="130"
        rx="13"
        fill="var(--color-white)"
        strokeOpacity=".24"
      />
      <g transform="translate(30 24)">
        <rect
          width="88"
          height="84"
          rx="2"
          fill="var(--color-ivory)"
          strokeDasharray="4 4"
          strokeOpacity=".35"
        />
        {jigsawPieces.map((piece, index) => {
          const [x, y] = puzzleOffsets[step][index];
          return (
            <path
              key={piece.path}
              d={piece.path}
              fill={piece.fill}
              style={{ transform: "translate(" + x + "px, " + y + "px)" }}
              className="motion-safe:transition-transform motion-safe:duration-700"
            />
          );
        })}
        {step === 1 && (
          <path
            d="M0 14V0h14"
            stroke="var(--color-brand-deep)"
            strokeWidth="4"
          />
        )}
      </g>
    </svg>
  );
}

function ApproachName({ children }: { children: string }) {
  return (
    <figcaption
      className={
        "mx-auto mt-3 w-fit rounded-full border border-navy/20 bg-white px-4 py-2 text-center text-sm font-semibold " +
        styles.reveal
      }
    >
      {children}
    </figcaption>
  );
}

function PuzzleScene({ cue }: { cue: number }) {
  const [comparisonStep, setComparisonStep] = useState<0 | 1 | 2>(0);
  const showModel = cue >= 3;
  const step = showModel ? comparisonStep : cue >= 2 ? 2 : cue === 1 ? 1 : 0;
  const labels = [
    "Loose pieces",
    "Find corners and group colours",
    "Try a fit",
  ];
  return (
    <figure
      className={stage + " bg-lavender"}
      aria-label="Comparing observed puzzle-solving steps with a computer model"
    >
      {cue === 0 && (
        <Image
          src="/illustrations/puzzle-at-home.png"
          alt="A person solving a jigsaw puzzle at a kitchen table."
          width={1672}
          height={941}
          className="mx-auto mb-4 h-auto w-full max-w-lg rounded-2xl"
          sizes="(max-width: 639px) 90vw, 512px"
        />
      )}
      <div
        className={
          "mx-auto grid max-w-lg gap-4 " +
          (showModel ? "grid-cols-2" : "grid-cols-1")
        }
      >
        <div className="text-center">
          <p className="mb-2 font-semibold">Person</p>
          <PuzzleBoard step={step} />
          <p className="mt-2 text-sm">{labels[step]}</p>
        </div>
        {showModel && (
          <div className="text-center">
            <p className="mb-2 font-semibold">Computer model</p>
            <PuzzleBoard step={step} />
            <p className="mt-2 text-sm">{labels[step]}</p>
          </div>
        )}
      </div>
      {cue === 2 && (
        <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-4">
          <svg viewBox="0 0 90 65" className="w-24" aria-hidden="true">
            <rect
              x="5"
              y="5"
              width="50"
              height="50"
              fill="white"
              stroke="#17243c"
              strokeDasharray="4 3"
            />
            <path
              d="M20 10h50v45H20Z"
              fill="#ffe1c3"
              stroke="#17243c"
              transform="rotate(20 45 30)"
            />
            <path
              d="m60 40 15 15m0-15-15 15"
              stroke="#17243c"
              strokeWidth="3"
            />
          </svg>
          <p className="text-sm">Doesn’t fit → try another piece → a match</p>
        </div>
      )}
      {showModel && (
        <div className="mt-4 text-center">
          <p className="mb-3 text-sm">
            Compare the model with steps people actually used.
          </p>
          <button
            type="button"
            onClick={() =>
              setComparisonStep((value) => ((value + 1) % 3) as 0 | 1 | 2)
            }
            className="min-h-11 rounded-full border border-navy/30 bg-white px-4 py-2 text-sm font-semibold"
          >
            {comparisonStep === 2 ? "Replay comparison" : "Compare the steps"}
          </button>
          <p role="status" className="mt-2 text-sm">
            Step {comparisonStep + 1} of 3: {labels[comparisonStep]}
          </p>
        </div>
      )}
      {cue >= 5 && <ApproachName>Thinking humanly</ApproachName>}
    </figure>
  );
}

function DiscountScene({ cue }: { cue: number }) {
  const [member, setMember] = useState(true);
  return (
    <figure
      className={stage + " bg-peach"}
      aria-label="Working out the price at a supermarket checkout"
    >
      <div className="mx-auto grid max-w-xl items-start gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-5">
        <div className="overflow-hidden rounded-2xl bg-white/65">
          <Image
            src="/illustrations/checkout-reference.jpg"
            alt="A shopper shows a 10% discount voucher to a cashier."
            width={1536}
            height={1024}
            sizes="(max-width: 639px) 90vw, 240px"
            className="h-auto w-full"
          />
          <p className="text-sm font-medium sm:pb-2 sm:text-center">
            <span className="block px-3 py-2">
              Item price <strong className="text-lg">£20</strong>
            </span>
          </p>
        </div>
        <ol
          aria-label="Checkout steps"
          className="space-y-2 rounded-2xl border border-navy/15 bg-white p-3 text-sm sm:p-4"
        >
          {cue >= 1 && (
            <li
              className={
                "flex flex-wrap justify-between gap-x-3 gap-y-1 " +
                styles.reveal
              }
            >
              <span className="font-medium">Shop rule</span>
              <strong>10% off for members</strong>
            </li>
          )}
          {cue >= 2 && (
            <li
              className={
                "flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-line pt-2 " +
                styles.reveal
              }
            >
              <span className="font-medium">Membership check</span>
              <strong>
                <span aria-hidden="true">{member ? "✓ " : ""}</span>
                {member ? "Member confirmed" : "No membership"}
              </strong>
            </li>
          )}
          {cue >= 3 && (
            <li
              className={
                "border-t border-dashed border-navy/30 pt-2 " + styles.reveal
              }
            >
              <p className="flex justify-between gap-3">
                <span>Discount</span>
                <span>{member ? "£2 off" : "No discount"}</span>
              </p>
              <p className="mt-1 flex items-baseline justify-between gap-3 font-semibold">
                <span>Total to pay</span>
                <strong className="text-xl">{member ? "£18" : "£20"}</strong>
              </p>
            </li>
          )}
          {cue === 0 && <li className="font-medium">Ready at the checkout</li>}
        </ol>
      </div>
      {cue >= 5 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={member === value}
              onClick={() => setMember(value)}
              className="min-h-11 rounded-full border border-navy/30 bg-white px-4 py-2 text-sm font-semibold"
            >
              {value ? "Member" : "Without membership"}
            </button>
          ))}
        </div>
      )}
      {cue >= 4 && (
        <>
          <p className="mt-2 text-center text-xs">
            The checkout shows how to apply a rule to a fact. A basic discount
            calculator is ordinary software.
          </p>
          <ApproachName>Thinking rationally</ApproachName>
        </>
      )}
    </figure>
  );
}

function LibraryScene({ cue }: { cue: number }) {
  const [connection, setConnection] = useState(false);
  const followUpAnswered = cue >= 4;

  return (
    <figure
      className={stage + " bg-blush"}
      aria-label="A conversation at the library"
    >
      <div className="mx-auto grid max-w-3xl items-start gap-4 sm:grid-cols-2">
        <Image
          src="/illustrations/library-help-scene.png"
          alt="A visitor holds a book while using a library help screen. A returns box stands just outside the doorway."
          width={1536}
          height={1024}
          sizes="(max-width: 639px) 90vw, 360px"
          className="h-auto w-full rounded-2xl"
        />
        <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-navy/15 bg-white">
          <div className="flex items-center gap-2 border-b border-line bg-ivory px-3 py-2">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-lavender text-lg"
            >
              ▤
            </span>
            <p className="text-sm font-semibold">
              Library help chat · illustrative conversation
            </p>
          </div>
          <ol
            aria-label="Conversation"
            className="grid gap-2 p-3 text-sm sm:p-4"
          >
            {cue === 0 && (
              <li className="text-muted">A visitor needs to return a book.</li>
            )}
            {cue >= 1 && (
              <li
                className={
                  "ml-auto max-w-[90%] rounded-xl bg-lavender px-3 py-2 " +
                  styles.reveal
                }
              >
                <span className="block text-xs font-semibold">Visitor</span>
                Where do I drop this off?
              </li>
            )}
            {cue >= 2 && (
              <li
                className={
                  "mr-auto max-w-[90%] rounded-xl bg-mint px-3 py-2 " +
                  styles.reveal
                }
              >
                <span className="block text-xs font-semibold">
                  Library assistant
                </span>
                There&apos;s a{" "}
                <span
                  className={
                    followUpAnswered
                      ? "font-semibold underline decoration-2 underline-offset-2"
                      : undefined
                  }
                >
                  returns box
                </span>{" "}
                beside the main entrance.
              </li>
            )}
            {cue >= 3 && (
              <li
                className={
                  "ml-auto max-w-[90%] rounded-xl bg-lavender px-3 py-2 " +
                  styles.reveal
                }
              >
                <span className="block text-xs font-semibold">Visitor</span>
                Is{" "}
                <span
                  className={
                    followUpAnswered
                      ? "font-semibold underline decoration-2 underline-offset-2"
                      : undefined
                  }
                >
                  it
                </span>{" "}
                outside?
              </li>
            )}
            {followUpAnswered && (
              <li
                className={
                  "mr-auto max-w-[90%] rounded-xl bg-mint px-3 py-2 " +
                  styles.reveal
                }
              >
                <span className="block text-xs font-semibold">
                  Library assistant
                </span>
                Yes,{" "}
                <span className="font-semibold underline decoration-2 underline-offset-2">
                  the box
                </span>{" "}
                is just outside the main doors.
              </li>
            )}
          </ol>
        </div>
      </div>
      {followUpAnswered && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setConnection(!connection)}
            className="min-h-11 rounded-full border border-navy/30 bg-white px-4 py-2 text-sm font-semibold"
          >
            Show the connection
          </button>
          {connection && (
            <p role="status" className="mt-3 font-semibold">
              “It” → “returns box” → just outside the doors
            </p>
          )}
        </div>
      )}
      {cue >= 6 && (
        <>
          <ApproachName>Acting humanly</ApproachName>
          <p className="mt-3 text-center text-sm">
            Check the entrance sign. A natural reply can still be wrong.
          </p>
        </>
      )}
    </figure>
  );
}

export function RouteMap({ cue }: { cue: number }) {
  const routeA = "M48 132H101V48h199";
  const routeB = "M48 132h157V94h95V48";

  return (
    <svg
      viewBox="0 0 350 171"
      aria-hidden="true"
      className="mx-auto block w-full max-w-md rounded-2xl"
    >
      <rect width="350" height="171" rx="15" fill="var(--color-white)" />
      <path
        d="M8 48h334M8 94h334M8 132h334M48 8v155M101 8v155M205 8v155M300 8v155"
        stroke="var(--color-line)"
        strokeWidth="8"
      />
      <rect
        x="118"
        y="62"
        width="72"
        height="55"
        rx="9"
        fill="var(--color-mint)"
      />
      <rect
        x="61"
        y="63"
        width="26"
        height="34"
        rx="4"
        fill="var(--color-peach)"
      />
      <rect
        x="235"
        y="106"
        width="42"
        height="15"
        rx="4"
        fill="var(--color-lavender)"
      />
      {cue >= 1 && (
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.reveal}
        >
          <path
            d={routeA}
            stroke={cue >= 2 ? "var(--color-muted)" : "var(--color-brand-deep)"}
            strokeWidth={cue >= 2 ? "4" : "8"}
            strokeDasharray={cue >= 2 ? "5 6" : undefined}
            className="motion-safe:transition-[stroke,stroke-width] motion-safe:duration-500"
          />
          <path
            d={routeB}
            stroke={cue >= 3 ? "var(--color-teal)" : "var(--color-muted)"}
            strokeWidth={cue >= 3 ? "8" : "4"}
            strokeDasharray={cue >= 3 ? undefined : "5 6"}
            className="motion-safe:transition-[stroke,stroke-width] motion-safe:duration-500"
          />
          <g stroke="var(--color-navy)" strokeWidth="1.3">
            <circle cx="133" cy="48" r="11" fill="var(--color-white)" />
            <circle cx="233" cy="94" r="11" fill="var(--color-white)" />
          </g>
          <g
            fill="var(--color-navy)"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
          >
            <text x="133" y="52.5">
              A
            </text>
            <text x="233" y="98.5">
              B
            </text>
          </g>
        </g>
      )}
      {cue >= 2 && (
        <g className={styles.reveal}>
          <path
            d="m171 23 12 22h-24Z"
            fill="var(--color-peach)"
            stroke="var(--color-navy)"
            strokeWidth="1.5"
          />
          <text
            x="171"
            y="41"
            textAnchor="middle"
            fill="var(--color-navy)"
            fontWeight="700"
            fontSize="15"
          >
            !
          </text>
        </g>
      )}
      <g
        stroke="var(--color-navy)"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <circle cx="48" cy="132" r="7" fill="var(--color-white)" />
        <circle cx="300" cy="48" r="7" fill="var(--color-white)" />
        <path d="M300 41V20l16 5-16 6" fill="var(--color-peach)" />
      </g>
      <g fill="var(--color-navy)" fontSize="13" fontWeight="600">
        <text x="24" y="157">
          Start
        </text>
        <text x="264" y="28">
          Work
        </text>
      </g>
    </svg>
  );
}

function RoutesScene({ cue: originalCue }: { cue: number }) {
  const [before, setBefore] = useState(false);
  const cue = before ? 1 : originalCue;
  return (
    <figure
      className={stage + " bg-mint"}
      aria-label="Recommending a route to work as traffic changes"
    >
      <p className="mb-2 text-center text-sm font-semibold">
        Goal: Quickest safe route
      </p>
      <RouteMap cue={cue} />
      {cue >= 1 && (
        <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-2 text-center text-sm">
          <p className="rounded-xl bg-white px-2 py-2">
            <strong className="block">Route A</strong>
            <span className="block">
              {cue >= 2 ? "Estimated 18 minutes" : "Estimated 10 minutes"}
            </span>
            <span className="block text-xs font-semibold">
              {cue >= 2 ? "Heavy traffic" : "Recommended"}
            </span>
          </p>
          <p className="rounded-xl bg-white px-2 py-2">
            <strong className="block">Route B</strong>
            <span className="block">Estimated 12 minutes</span>
            <span className="block text-xs font-semibold">
              {cue >= 3 ? "Recommended" : "Alternative"}
            </span>
          </p>
        </div>
      )}
      {originalCue >= 4 && <ApproachName>Acting rationally</ApproachName>}
      {originalCue >= 3 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            aria-pressed={!before}
            onClick={() => setBefore(!before)}
            className="min-h-11 rounded-full border border-navy/30 bg-white px-4 py-2 text-sm font-semibold"
          >
            {before ? "Show traffic change" : "Compare before traffic"}
          </button>
        </div>
      )}
      {originalCue >= 5 && (
        <p className="mt-3 text-center text-sm">
          Check before leaving. Follow road signs. Times are fictional
          estimates.
        </p>
      )}
    </figure>
  );
}

export function FoundationsScenes({
  scene,
  cue,
}: {
  scene: string;
  cue: number;
}) {
  switch (scene) {
    case "intro":
      return <IntroScene cue={cue} />;
    case "puzzle":
      return <PuzzleScene cue={cue} />;
    case "discount":
      return <DiscountScene cue={cue} />;
    case "library":
      return <LibraryScene cue={cue} />;
    case "routes":
      return <RoutesScene cue={cue} />;
    default:
      return null;
  }
}
