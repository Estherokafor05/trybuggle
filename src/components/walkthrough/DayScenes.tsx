"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { RouteMap } from "./FoundationsScenes";
import styles from "./FoundationsScenes.module.css";

const button =
  "min-h-11 rounded-full border border-navy/30 bg-white px-4 py-2 text-sm font-semibold hover:bg-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep";
const stage =
  "overflow-hidden rounded-3xl border border-line bg-ivory p-4 sm:p-6";
const moments = ["Photo", "Journey", "Shopping", "Messages"];

function Flow({ input, output }: { input: string; output: string }) {
  return (
    <div className="my-4 flex flex-wrap items-center justify-center gap-3 text-center text-sm">
      <span className="rounded-xl border border-navy/25 bg-white p-3">
        {input}
      </span>
      <span aria-label="leads to" className="text-2xl">
        →
      </span>
      <strong className="rounded-xl bg-lavender p-3">{output}</strong>
    </div>
  );
}

function Photo({
  cat = false,
  park = false,
}: {
  cat?: boolean;
  park?: boolean;
}) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className="w-full rounded-xl">
      <rect
        width="160"
        height="120"
        rx="12"
        fill={park ? "#d5ede3" : "#e7e1fa"}
      />
      <path d="M0 100Q40 65 80 100T160 90V120H0" fill="#93bdab" />
      <ellipse cx="83" cy="99" rx="38" ry="10" fill="#16203d" opacity=".12" />
      <path
        d="M52 92Q40 57 64 45L65 28L80 40L95 27L101 50Q122 69 105 94Z"
        fill={cat ? "#6c7185" : "#e5b17e"}
        stroke="#17203d"
        strokeWidth="2"
      />
      {!cat && (
        <>
          <path
            d="M62 43Q35 25 42 70Q52 79 62 50M100 43Q124 27 119 68Q109 81 100 50"
            fill="#865b44"
            stroke="#17203d"
            strokeWidth="2"
          />
        </>
      )}
      <circle cx="72" cy="61" r="3" />
      <circle cx="94" cy="61" r="3" />
      <path
        d="m80 72 4 4 4-4M84 76v7m-11-3 11 3 11-3"
        fill="none"
        stroke="#17203d"
        strokeWidth="2"
      />
      {cat && (
        <path d="m70 75-22-4m22 9-22 4m49-9 21-4m-21 9 21 4" stroke="#17203d" />
      )}
    </svg>
  );
}

function Backpack({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 120 135" aria-hidden="true" className="mx-auto h-28 w-24">
      <path
        d="M43 30V20q17-16 34 0v10"
        fill="none"
        stroke="#17203d"
        strokeWidth="5"
      />
      <rect
        x="22"
        y="28"
        width="76"
        height="98"
        rx="24"
        fill={small ? "#c9c0f1" : "#efb390"}
        stroke="#17203d"
        strokeWidth="3"
      />
      <rect
        x="33"
        y="78"
        width="54"
        height="35"
        rx="10"
        fill="#fff"
        stroke="#17203d"
        strokeWidth="2"
      />
      <path d="M36 60h48m-40 31h32" stroke="#17203d" strokeWidth="3" />
    </svg>
  );
}

function Photos({ cue }: { cue: number }) {
  const [checking, setChecking] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <figure className={stage} aria-label="Searching a fictional photo library">
      <div className="mx-auto max-w-lg rounded-[2rem] border-4 border-navy bg-white p-4">
        <p className="text-xs font-semibold">Your photos · fictional example</p>
        <div className="my-3 rounded-full border border-navy/30 px-4 py-2">
          Search: <strong>dog</strong>
        </div>
        <div
          key={cue === 0 ? "library" : "matches"}
          className={"grid grid-cols-3 gap-2 " + styles.reveal}
        >
          {(cue === 0 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2]).map((i) => (
            <button
              key={i}
              type="button"
              disabled={!checking}
              onClick={() => setSelected(i)}
              className="rounded-xl border-2 border-transparent p-1 focus-visible:border-brand-deep disabled:opacity-100"
              aria-label={
                i === 1
                  ? "Cat in the suggested matches"
                  : i >= 3
                    ? "Cat in your photo library " + i
                    : i === 0
                      ? "Dog on a walk"
                      : "Dog at home"
              }
            >
              <Photo cat={i === 1 || i >= 3} park={i === 0 || i === 4} />
              <span className="text-xs">
                {cue === 0
                  ? "Recent photo"
                  : i === 1
                    ? "Check this match"
                    : i === 0
                      ? "On a walk"
                      : "At home"}
              </span>
            </button>
          ))}
        </div>
        {cue >= 1 && (
          <p className="mt-2 text-sm">
            Suggested matches, including one mistake
          </p>
        )}
        {cue >= 3 && (
          <button
            className={button + " mt-3"}
            onClick={() => {
              setChecking(true);
              setSelected(null);
            }}
          >
            Check the matches
          </button>
        )}
        {checking && (
          <p className="mt-2 text-sm">Select a picture to inspect it.</p>
        )}
        {selected !== null && (
          <div role="status" className="mt-3 border-t border-line pt-3">
            <Photo cat={selected === 1} park={selected === 0} />
            <p className="mt-2 text-sm">
              {selected === 1
                ? "This is a cat. It does not belong in these dog results."
                : selected === 0
                  ? "This is the dog photo from the walk. Check it is the one your friend wanted."
                  : "This is a dog, but it is a different photo. A match is not always the picture you need."}
            </p>
          </div>
        )}
      </div>
      {cue >= 1 && (
        <Flow input="Photos + search word" output="Suggested matches" />
      )}
      {cue >= 2 && (
        <figcaption className="text-center font-bold">
          Machine learning: learning patterns from examples
        </figcaption>
      )}
    </figure>
  );
}

function Journey({ cue }: { cue: number }) {
  const [compare, setCompare] = useState(false);
  return (
    <figure
      className={stage + " bg-mint"}
      aria-label="Comparing fictional journey estimates before leaving home"
    >
      <p className="mb-3 text-center font-semibold">
        Still at home · planning the journey
      </p>
      <RouteMap cue={3} />
      <div className="mx-auto mt-3 flex max-w-md justify-between gap-3 text-sm">
        <span>
          Route A<br />
          <strong>Estimated 30 min</strong>
          <br />
          Heavy traffic
        </span>
        <span>
          Route B<br />
          <strong>Estimated 20 min</strong>
          <br />
          Suggested alternative
        </span>
      </div>
      {cue >= 1 && (
        <Flow
          input="Traffic now + patterns from earlier journeys"
          output="Journey-time estimates"
        />
      )}
      {cue >= 3 && (
        <figcaption className="text-center font-bold">
          Prediction: estimating something we don’t yet know
        </figcaption>
      )}
      {cue >= 4 && (
        <div className="mt-4 text-center">
          <button className={button} onClick={() => setCompare(!compare)}>
            Compare routes
          </button>
          {compare && (
            <div role="status" className="mt-3 text-sm">
              <p>A: usual road, heavy traffic, estimated 30 minutes.</p>
              <p>B: alternative road, estimated 20 minutes.</p>
              <p className="mt-2 font-semibold">
                Check that the route is suitable and follow road signs. Times
                are fictional estimates.
              </p>
            </div>
          )}
        </div>
      )}
    </figure>
  );
}

function Shopping({ cue }: { cue: number }) {
  const [fit, setFit] = useState(false);
  return (
    <figure
      className={stage + " bg-peach"}
      aria-label="Checking whether a recommended backpack fits a laptop"
    >
      <div className="mx-auto max-w-xl">
        <p className="text-sm font-semibold">You browsed</p>
        <div className="flex items-center justify-center gap-4">
          <Backpack />
          <Backpack small />
          <span aria-label="leads to" className="text-3xl">
            →
          </span>
          <div className="rounded-2xl border-2 border-navy bg-white p-3 text-center">
            <Backpack small />
            <strong className="text-sm">Suggested bag · £35</strong>
          </div>
        </div>
        {cue >= 1 && (
          <Flow
            input="Viewed items + activity patterns"
            output="Product suggestions"
          />
        )}
        {cue >= 2 && (
          <figcaption className="text-center font-bold">
            Recommendation: a suggestion to consider
          </figcaption>
        )}
        {cue >= 3 && (
          <div className="mt-4 text-center">
            <button className={button} onClick={() => setFit(!fit)}>
              Check the fit
            </button>
            {fit && (
              <div role="status" className="mt-4 rounded-xl bg-white p-4">
                <div className="mx-auto w-full max-w-80 border-2 border-dashed border-navy p-3">
                  <p className="mb-2 text-sm">Laptop width: 32 cm</p>
                  <div className="w-[87.5%] rounded-lg bg-lavender p-3 text-sm">
                    Bag compartment: 28 cm
                  </div>
                </div>
                <p className="mt-3 font-semibold">
                  Too narrow for this laptop.
                </p>
                <p className="text-sm">
                  The recommendation looked appealing. Checking the dimensions
                  showed it would not meet your needs.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}

function Messages({ cue }: { cue: number }) {
  const [found, setFound] = useState(false);
  return (
    <figure
      className={stage + " bg-lavender"}
      aria-label="Finding a misplaced fictional booking confirmation"
    >
      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-navy/30 bg-white">
        <div className="flex gap-6 border-b border-line bg-ivory p-3 font-semibold">
          <span>Inbox · 0</span>
          <span
            className={found ? "underline decoration-2 underline-offset-4" : ""}
          >
            Spam · 1
          </span>
        </div>
        {!found ? (
          <div className="p-6 text-center">
            <p className="mb-4">No booking confirmation here.</p>
            <button className={button} onClick={() => setFound(true)}>
              Find the missing message
            </button>
          </div>
        ) : (
          <div className={"p-4 " + styles.reveal}>
            <p className="text-xs font-semibold">
              Spam folder · fictional example
            </p>
            <p className="mt-2 font-bold">Your pottery workshop booking</p>
            <p className="mt-2">Saturday, 10:00 · One place</p>
            <p className="mt-3 rounded-lg bg-peach p-2 text-sm">
              Possibly unwanted
            </p>
            {cue >= 4 && (
              <div className="mt-4 border-t border-line pt-3">
                <strong>Your own plan</strong>
                <p>
                  You booked one place at a pottery workshop for Saturday at
                  10:00.
                </p>
                <p className="mt-2 text-sm">
                  The details match what you expected. Check through a known
                  contact if unsure. A folder or sender name is not proof of
                  safety.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {cue >= 1 && (
        <Flow
          input="Message patterns + sender information + feedback"
          output="A sorting decision"
        />
      )}
      {cue >= 3 && (
        <figcaption className="text-center font-bold">
          Classification: sorting into a group
        </figcaption>
      )}
      {cue >= 4 && !found && (
        <p className="mt-3 text-center text-sm">
          Find the message to compare it with your own plan.
        </p>
      )}
    </figure>
  );
}

export function DayActivity() {
  const activityId = useId();
  return (
    <section
      className="mt-5 rounded-2xl border border-line bg-white p-4"
      aria-labelledby={activityId}
    >
      <h4 id={activityId} className="text-lg font-bold">
        Try it with a tool you know
      </h4>
      <p className="mt-2 text-sm">
        Use a fictional example or non-sensitive details. These notes stay on
        this page and are not saved or submitted.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          "I use it to…",
          "It receives…",
          "It gives me…",
          "I would check…",
          "I know it uses AI because… / I’m not sure yet.",
        ].map((label, index) => (
          <label key={label} className="text-sm font-semibold">
            {label}
            <textarea
              rows={2}
              className="mt-1 block w-full rounded-lg border border-navy/30 bg-white p-2 font-normal"
              name={"reflection-" + index}
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-sm">
        Look for an explanation in the product’s official documentation. “I’m
        not sure yet” is a useful starting point.
      </p>
    </section>
  );
}

export function DayScenes({
  scene,
  cue,
  onSelect,
}: {
  scene: string;
  cue: number;
  onSelect: (id: string) => void;
}) {
  if (scene === "photos") return <Photos cue={cue} />;
  if (scene === "journey") return <Journey cue={cue} />;
  if (scene === "shopping") return <Shopping cue={cue} />;
  if (scene === "messages") return <Messages cue={cue} />;
  if (scene === "day-recap")
    return (
      <div className={stage}>
        <ol className="grid gap-3 sm:grid-cols-2">
          {[
            ["photos", "Photo matches", "Is this the picture I wanted?"],
            ["journey", "Journey estimate", "Is this route suitable?"],
            ["shopping", "Product suggestion", "Does it meet my needs?"],
            ["messages", "Sorted message", "Has something been misplaced?"],
          ].map(([id, label, check]) => (
            <li key={id}>
              <button
                className={button + " w-full text-left"}
                onClick={() => onSelect(id)}
              >
                {label}
              </button>
              {cue >= 1 && <p className="mt-2 px-3 text-sm">{check}</p>}
            </li>
          ))}
        </ol>
        {cue >= 2 && (
          <div className="mt-5 flex items-center justify-center gap-4 border-t border-navy/20 pt-5">
            <span className="rounded-full border-4 border-navy bg-white p-5 font-mono text-2xl">
              07:00
            </span>
            <p className="max-w-64 text-sm">
              You set the time. The alarm rings.
              <br />
              <strong>A basic alarm does not need AI.</strong>
            </p>
          </div>
        )}
        {cue >= 3 && <DayActivity />}
      </div>
    );
  return (
    <figure className={stage}>
      {cue === 0 ? (
        <Image
          src="/illustrations/ai-learning-hero.png"
          alt="An adult at home using a laptop to explore everyday tasks."
          width={1448}
          height={1086}
          className="mx-auto h-auto w-full max-w-sm"
          sizes="(max-width: 639px) 90vw, 384px"
        />
      ) : cue === 1 ? (
        <RouteMap cue={1} />
      ) : cue === 2 ? (
        <div className="mx-auto max-w-xs rounded-2xl bg-peach p-5">
          <Backpack />
          <p className="text-center font-semibold">Looking for a backpack</p>
        </div>
      ) : cue === 3 ? (
        <div className="mx-auto max-w-sm rounded-2xl border-2 border-navy bg-white p-6">
          <p className="border-b border-line pb-3 text-lg font-bold">
            Your messages
          </p>
          <p className="py-4">A booking confirmation</p>
          <p className="border-t border-line pt-4">A note from a friend</p>
        </div>
      ) : (
        <Image
          src="/illustrations/ai-learning-hero.png"
          alt="An adult exploring everyday tasks with a laptop."
          width={1448}
          height={1086}
          className="mx-auto h-auto w-full max-w-sm"
          sizes="(max-width: 639px) 90vw, 384px"
        />
      )}
      <ol
        aria-label="Moments in the day"
        className="mt-4 flex flex-wrap justify-center gap-3"
      >
        {moments.map((moment, i) => (
          <li
            key={moment}
            aria-current={cue === i ? "step" : undefined}
            className="flex items-center gap-3 text-sm font-semibold"
          >
            <span
              className={
                cue === i ? "underline decoration-2 underline-offset-4" : ""
              }
            >
              {moment}
            </span>
            {i < 3 && <span aria-hidden="true">→</span>}
          </li>
        ))}
      </ol>
      {cue >= 5 && (
        <Flow
          input="Information in"
          output="Result out → What would you check?"
        />
      )}
    </figure>
  );
}
