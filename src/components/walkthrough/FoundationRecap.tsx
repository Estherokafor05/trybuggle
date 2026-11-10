import { useState } from "react";
import { ExampleIllustration } from "@/components/walkthrough/FoundationsScenes";

type ExampleScene = "puzzle" | "discount" | "library" | "routes";

const comparison = [
  {
    label: "Thinking",
    examples: [
      {
        scene: "puzzle",
        cue: 1,
        example: "Solve a puzzle using steps a person might use",
        term: "Thinking humanly",
      },
      {
        scene: "discount",
        cue: 2,
        example: "Work out the price from a rule and the facts",
        term: "Thinking rationally",
      },
    ],
  },
  {
    label: "Acting",
    examples: [
      {
        scene: "library",
        cue: 3,
        example: "Have a natural conversation",
        term: "Acting humanly",
      },
      {
        scene: "routes",
        cue: 4,
        example: "Choose a route that serves your goal",
        term: "Acting rationally",
      },
    ],
  },
] as const;

export function FoundationRecap({
  cue,
  onSelect,
}: {
  cue: number;
  onSelect: (scene: ExampleScene) => void;
}) {
  const [reflection, setReflection] = useState(false);
  return (
    <div className="space-y-4">
      <table className="w-full table-fixed border-collapse text-left text-navy">
        <caption className="pb-3 text-left text-sm leading-relaxed text-muted">
          Select an example to revisit its scene.
        </caption>
        <thead>
          <tr className="border-b border-line">
            <td className="w-[24%] sm:w-28" />
            <th
              scope="col"
              className="p-1.5 align-bottom text-xs font-semibold sm:p-3 sm:text-sm"
            >
              Like a person
            </th>
            <th
              scope="col"
              className="p-1.5 align-bottom text-xs font-semibold sm:p-3 sm:text-sm"
            >
              Using reason or goals
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {comparison.map((row) => (
            <tr key={row.label}>
              <th
                scope="row"
                className="break-words py-3 pr-1 text-xs font-semibold align-top sm:pr-3 sm:text-sm"
              >
                {row.label}
              </th>
              {row.examples.map((entry) => {
                const focused = cue === entry.cue;

                return (
                  <td key={entry.scene} className="p-1 align-top sm:p-2">
                    <button
                      type="button"
                      aria-current={focused ? "step" : undefined}
                      onClick={() => onSelect(entry.scene)}
                      className={
                        "block min-h-12 w-full rounded-lg border px-2 py-2.5 text-left text-xs leading-relaxed hover:border-brand hover:bg-lavender focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-deep sm:px-3 sm:text-sm " +
                        (focused
                          ? "border-brand-deep bg-lavender ring-1 ring-brand-deep"
                          : "border-line bg-white")
                      }
                    >
                      {focused && (
                        <span className="mb-1 block text-xs font-bold text-brand-deep">
                          In focus
                        </span>
                      )}
                      <span className="mb-1 block size-7" aria-hidden="true">
                        <ExampleIllustration scene={entry.scene} />
                      </span>
                      <span className="block font-medium">{entry.example}</span>
                      {cue >= entry.cue && (
                        <span className="mt-1 block font-bold">
                          {entry.term}
                        </span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {cue >= 5 && (
        <section className="rounded-xl bg-mint p-4">
          <h4 className="font-bold">Think about it</h4>
          <p className="mt-2 text-sm">
            Two systems finish the same puzzle. What else would you need to know
            to compare how they solved it?
          </p>
          <button
            className="mt-3 min-h-11 rounded-full border border-navy/30 bg-white px-4 py-2 text-sm font-semibold"
            onClick={() => setReflection(!reflection)}
          >
            Explore an answer
          </button>
          {reflection && (
            <p role="status" className="mt-3 text-sm">
              You would need evidence about their steps, such as which pieces
              they tried and in what order. The finished puzzle alone does not
              reveal the process.
            </p>
          )}
        </section>
      )}
      {cue >= 5 && (
        <p className="text-sm leading-relaxed text-muted">
          You can ask more than one of these questions about the same system.
          These are approaches to studying AI. An everyday example can
          illustrate one without itself being AI.
        </p>
      )}
    </div>
  );
}
