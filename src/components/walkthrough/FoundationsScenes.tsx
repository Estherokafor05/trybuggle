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
        <path d="M14 14h21v8c6-4 13 1 13 6s-7 10-13 6v8h-9c4 6-1 13-6 13s-10-7-6-13H6V14Z" fill="var(--color-lavender)" />
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
        <path d="M8 13h45a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5H27L16 48v-8H8a5 5 0 0 1-5-5V18a5 5 0 0 1 5-5Z" fill="var(--color-white)" />
        <path d="M42 32h25a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4h-4v7l-9-7H42a4 4 0 0 1-4-4V36a4 4 0 0 1 4-4Z" fill="var(--color-blush)" />
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
  const active = examples[cue - 1];

  return (
    <figure className={stage + " bg-ivory"} aria-label="Four everyday situations">
      <div key={cue} className={"flex min-h-36 items-center justify-center gap-3 px-2 py-3 sm:min-h-44 sm:gap-6 " + styles.reveal}>
        {active ? (
          <>
            <span className={"block size-24 shrink-0 rounded-full p-3 sm:size-32 " + active.colour}>
              <ExampleIllustration scene={active.scene} />
            </span>
            <p className="max-w-40 text-lg font-bold leading-snug sm:text-2xl">
              {active.label}
            </p>
          </>
        ) : (
          <>
            <span aria-hidden="true" className="grid size-20 shrink-0 place-items-center rounded-full bg-hero-lavender text-4xl font-bold sm:size-28">
              ?
            </span>
            <p className="max-w-48 text-lg font-bold leading-snug sm:text-2xl">
              Where might you meet AI?
            </p>
          </>
        )}
      </div>
      <ol aria-label="Examples introduced" className="grid grid-cols-4 gap-1 border-t border-navy/15 pt-3 sm:gap-2">
        {examples.map((example, index) => {
          const introduced = cue > index;
          const current = cue === index + 1;

          return (
            <li
              key={example.scene}
              aria-current={current ? "step" : undefined}
              className="min-w-0 text-center"
            >
              <span
                aria-hidden="true"
                className={
                  "mx-auto grid size-9 place-items-center rounded-full border border-navy/20 p-1 text-xs font-semibold sm:size-11 " +
                  (current ? "ring-2 ring-brand-deep " : "") +
                  (introduced ? example.colour : "bg-white")
                }
              >
                {introduced ? <ExampleIllustration scene={example.scene} /> : index + 1}
              </span>
              <span className="sr-only">
                {introduced ? example.label : "Example " + (index + 1) + " is coming up"}
              </span>
            </li>
          );
        })}
      </ol>
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
  [[-22, -13], [24, -10], [-18, 14], [22, 16]],
  [[0, 0], [7, -8], [-18, 14], [22, 16]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
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
      <rect x="1" y="1" width="146" height="130" rx="13" fill="var(--color-white)" strokeOpacity=".24" />
      <g transform="translate(30 24)">
        <rect width="88" height="84" rx="2" fill="var(--color-ivory)" strokeDasharray="4 4" strokeOpacity=".35" />
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
        {step === 1 && <path d="M0 14V0h14" stroke="var(--color-brand-deep)" strokeWidth="4" />}
      </g>
    </svg>
  );
}

function ApproachName({ children }: { children: string }) {
  return (
    <figcaption className={"mx-auto mt-3 w-fit rounded-full border border-navy/20 bg-white px-4 py-2 text-center text-sm font-semibold " + styles.reveal}>
      {children}
    </figcaption>
  );
}

function PuzzleScene({ cue, elapsedInCue, settled }: { cue: number; elapsedInCue: number; settled: boolean }) {
  const step = cue >= 2 ? 2 : cue === 1 ? 1 : 0;
  const showModel = cue >= 3;
  const modelStep = settled || cue >= 4 || elapsedInCue >= 5.2 ? 2 : elapsedInCue >= 3.6 ? 1 : 0;
  const stepLabels = ["Start with loose pieces", "Find the corners", "Group colours and try a fit"];

  return (
    <figure className={stage + " bg-lavender"} aria-label="Comparing two puzzle-solving processes">
      <div className={"mx-auto grid max-w-md gap-2 sm:gap-4 " + (showModel ? "grid-cols-2" : "grid-cols-1")}>
        <div className="min-w-0 text-center">
          <p className="mb-1 text-xs font-semibold sm:text-sm">Person</p>
          <PuzzleBoard step={step} />
          {showModel && <p className="mt-1 text-xs font-medium">{stepLabels[step]}</p>}
        </div>
        {showModel && (
          <div className={"min-w-0 text-center " + styles.reveal}>
            <p className="mb-1 text-xs font-semibold sm:text-sm">Computer model</p>
            <PuzzleBoard step={modelStep} />
            <p className="mt-1 text-xs font-medium">{stepLabels[modelStep]}</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm font-semibold">
        {cue === 0 && "A jigsaw puzzle"}
        {cue === 1 && "Find the corner pieces"}
        {cue === 2 && "Group similar colours and try a fit"}
        {showModel && "Both follow the same steps"}
      </p>
      {showModel && (
        <ol aria-label="Matching steps" className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-xs sm:text-sm">
          <li>1. Find corners</li>
          <li>2. Group colours</li>
          <li>3. Try a fit</li>
        </ol>
      )}
      {cue >= 4 && <ApproachName>Thinking humanly</ApproachName>}
    </figure>
  );
}

function DiscountScene({ cue }: { cue: number }) {
  return (
    <figure className={stage + " bg-peach"} aria-label="Working out the price at a supermarket checkout">
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
            <span className="block px-3 py-2">Item price <strong className="text-lg">£20</strong></span>
          </p>
        </div>
        <ol aria-label="Checkout steps" className="space-y-2 rounded-2xl border border-navy/15 bg-white p-3 text-sm sm:p-4">
          {cue >= 1 && (
            <li className={"flex flex-wrap justify-between gap-x-3 gap-y-1 " + styles.reveal}>
              <span className="font-medium">Shop rule</span>
              <strong>10% off for members</strong>
            </li>
          )}
          {cue >= 2 && (
            <li className={"flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-line pt-2 " + styles.reveal}>
              <span className="font-medium">Membership check</span>
              <strong><span aria-hidden="true">✓ </span>Member confirmed</strong>
            </li>
          )}
          {cue >= 3 && (
            <li className={"border-t border-dashed border-navy/30 pt-2 " + styles.reveal}>
              <p className="flex justify-between gap-3">
                <span>Discount</span><span>£2 off</span>
              </p>
              <p className="mt-1 flex items-baseline justify-between gap-3 font-semibold">
                <span>Total to pay</span><strong className="text-xl">£18</strong>
              </p>
            </li>
          )}
          {cue === 0 && <li className="font-medium">Ready at the checkout</li>}
        </ol>
      </div>
      {cue >= 4 && (
        <>
          <p className="mt-2 text-center text-xs">
            The checkout shows how to apply a rule to a fact. A basic discount calculator is ordinary software.
          </p>
          <ApproachName>Thinking rationally</ApproachName>
        </>
      )}
    </figure>
  );
}

function LibraryScene({ cue }: { cue: number }) {
  const followUpAnswered = cue >= 4;

  return (
    <figure className={stage + " bg-blush"} aria-label="A conversation at the library">
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
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-lavender text-lg">▤</span>
          <p className="text-sm font-semibold">Library help chat</p>
        </div>
        <ol aria-label="Conversation" className="grid gap-2 p-3 text-sm sm:p-4">
          {cue === 0 && <li className="text-muted">A visitor needs to return a book.</li>}
          {cue >= 1 && (
            <li className={"ml-auto max-w-[90%] rounded-xl bg-lavender px-3 py-2 " + styles.reveal}>
              <span className="block text-xs font-semibold">Visitor</span>
              Where do I drop this off?
            </li>
          )}
          {cue >= 2 && (
            <li className={"mr-auto max-w-[90%] rounded-xl bg-mint px-3 py-2 " + styles.reveal}>
              <span className="block text-xs font-semibold">Library assistant</span>
              There&apos;s a <span className={followUpAnswered ? "font-semibold underline decoration-2 underline-offset-2" : undefined}>returns box</span> beside the main entrance.
            </li>
          )}
          {cue >= 3 && (
            <li className={"ml-auto max-w-[90%] rounded-xl bg-lavender px-3 py-2 " + styles.reveal}>
              <span className="block text-xs font-semibold">Visitor</span>
              Is <span className={followUpAnswered ? "font-semibold underline decoration-2 underline-offset-2" : undefined}>it</span> outside?
            </li>
          )}
          {followUpAnswered && (
            <li className={"mr-auto max-w-[90%] rounded-xl bg-mint px-3 py-2 " + styles.reveal}>
              <span className="block text-xs font-semibold">Library assistant</span>
              Yes, <span className="font-semibold underline decoration-2 underline-offset-2">the box</span> is just outside the main doors.
            </li>
          )}
        </ol>
      </div>
      </div>
      {followUpAnswered && <p className="mt-2 text-center text-xs font-medium">“It” refers to the same returns box.</p>}
      {cue >= 5 && <ApproachName>Acting humanly</ApproachName>}
    </figure>
  );
}

function RouteMap({ cue }: { cue: number }) {
  const routeA = "M48 132H101V48h199";
  const routeB = "M48 132h157V94h95V48";

  return (
    <svg viewBox="0 0 350 171" aria-hidden="true" className="mx-auto block w-full max-w-md rounded-2xl">
      <rect width="350" height="171" rx="15" fill="var(--color-white)" />
      <path d="M8 48h334M8 94h334M8 132h334M48 8v155M101 8v155M205 8v155M300 8v155" stroke="var(--color-line)" strokeWidth="8" />
      <rect x="118" y="62" width="72" height="55" rx="9" fill="var(--color-mint)" />
      <rect x="61" y="63" width="26" height="34" rx="4" fill="var(--color-peach)" />
      <rect x="235" y="106" width="42" height="15" rx="4" fill="var(--color-lavender)" />
      {cue >= 1 && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" className={styles.reveal}>
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
          <g fill="var(--color-navy)" textAnchor="middle" fontSize="13" fontWeight="700">
            <text x="133" y="52.5">A</text>
            <text x="233" y="98.5">B</text>
          </g>
        </g>
      )}
      {cue >= 2 && (
        <g className={styles.reveal}>
          <path d="m171 23 12 22h-24Z" fill="var(--color-peach)" stroke="var(--color-navy)" strokeWidth="1.5" />
          <text x="171" y="41" textAnchor="middle" fill="var(--color-navy)" fontWeight="700" fontSize="15">!</text>
        </g>
      )}
      <g stroke="var(--color-navy)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <circle cx="48" cy="132" r="7" fill="var(--color-white)" />
        <circle cx="300" cy="48" r="7" fill="var(--color-white)" />
        <path d="M300 41V20l16 5-16 6" fill="var(--color-peach)" />
      </g>
      <g fill="var(--color-navy)" fontSize="13" fontWeight="600">
        <text x="24" y="157">Start</text>
        <text x="264" y="28">Work</text>
      </g>
    </svg>
  );
}

function RoutesScene({ cue }: { cue: number }) {
  return (
    <figure className={stage + " bg-mint"} aria-label="Recommending a route to work as traffic changes">
      <p className="mb-2 text-center text-sm font-semibold">Goal: Arrive as quickly as possible</p>
      <RouteMap cue={cue} />
      {cue >= 1 && (
        <div className="mx-auto mt-3 grid max-w-md grid-cols-2 gap-2 text-center text-sm">
          <p className="rounded-xl bg-white px-2 py-2">
            <strong className="block">Route A</strong>
            <span className="block">{cue >= 2 ? "18 minutes" : "10 minutes"}</span>
            <span className="block text-xs font-semibold">{cue >= 2 ? "Heavy traffic" : "Recommended"}</span>
          </p>
          <p className="rounded-xl bg-white px-2 py-2">
            <strong className="block">Route B</strong>
            <span className="block">12 minutes</span>
            <span className="block text-xs font-semibold">{cue >= 3 ? "Recommended" : "Alternative"}</span>
          </p>
        </div>
      )}
      {cue >= 4 && <ApproachName>Acting rationally</ApproachName>}
    </figure>
  );
}

export function FoundationsScenes({
  scene,
  cue,
  elapsedInCue,
  settled,
}: {
  scene: FoundationScene;
  cue: number;
  elapsedInCue: number;
  settled: boolean;
}) {
  switch (scene) {
    case "intro":
      return <IntroScene cue={cue} />;
    case "puzzle":
      return <PuzzleScene cue={cue} elapsedInCue={elapsedInCue} settled={settled} />;
    case "discount":
      return <DiscountScene cue={cue} />;
    case "library":
      return <LibraryScene cue={cue} />;
    case "routes":
      return <RoutesScene cue={cue} />;
  }
}
