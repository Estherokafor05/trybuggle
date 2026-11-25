"use client";
// Edit every question in a check at once: wording, answers, the right answer,
// the explanation Buggle shows, order, and removing or adding questions.
import { startTransition, useActionState, useState } from "react";
import { saveQuestionsAction, type QuestionFormState } from "@/app/admin/actions";
import { button, input, outline } from "./styles";

type Q = { key: string; prompt: string; options: { id: string; text: string }[]; correct: string; explanation: string };
const SLOTS = 6;
const blank = (): Q => ({ key: "", prompt: "", options: [], correct: "", explanation: "" });

export function QuestionEditor({ id, checkKey, questions }: { id: string; checkKey: string; questions: Q[] }) {
  const [rows, setRows] = useState<Q[]>(questions);
  const [state, dispatch, pending] = useActionState<QuestionFormState, FormData>(saveQuestionsAction, {});
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        // Submitted this way so nothing typed is lost if a check fails.
        startTransition(() => dispatch(data));
      }}
      className="grid gap-4"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="key" value={checkKey} />
      <input type="hidden" name="count" value={rows.length} />
      {state.error && (
        <p role="alert" className="rounded-2xl bg-peach p-4 text-sm">
          {state.error}
        </p>
      )}
      <ol className="grid gap-4">
        {rows.map((q, i) => {
          const p = `q${i}`;
          return (
            <li key={`${q.key}-${i}`} className="rounded-3xl border border-line bg-white p-5">
              <fieldset className="grid gap-3">
                <legend className="text-lg font-bold">Question {i + 1}</legend>
                <input type="hidden" name={`${p}.key`} value={q.key} />
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
                  <label className="grid gap-1 text-sm font-semibold">
                    Question
                    <textarea name={`${p}.prompt`} defaultValue={q.prompt} rows={2} maxLength={500} className={input} />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold">
                    Order
                    <input name={`${p}.order`} type="number" min={1} max={99} defaultValue={i + 1} className={input} />
                  </label>
                </div>
                <fieldset className="grid gap-2">
                  <legend className="text-sm font-semibold">Answers (choose the right one; leave spare boxes empty)</legend>
                  {Array.from({ length: SLOTS }, (_, j) => {
                    const option = q.options[j];
                    return (
                      <div key={j} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`${p}.correct`}
                          value={j}
                          defaultChecked={option ? option.id === q.correct : false}
                          aria-label={`Answer ${j + 1} is the right one`}
                          className="size-5 shrink-0 accent-brand"
                        />
                        <input type="hidden" name={`${p}.o${j}.id`} value={option?.id ?? ""} />
                        <input name={`${p}.o${j}.text`} defaultValue={option?.text ?? ""} maxLength={200} aria-label={`Answer ${j + 1}`} className={input} />
                      </div>
                    );
                  })}
                </fieldset>
                <label className="grid gap-1 text-sm font-semibold">
                  Explanation (shown when a learner asks Buggle)
                  <textarea name={`${p}.explanation`} defaultValue={q.explanation} rows={3} maxLength={1000} className={input} />
                </label>
                {q.key && (
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                    <input name={`${p}.remove`} type="checkbox" className="size-5 accent-brand" /> Remove this question
                  </label>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={outline} onClick={() => setRows((r) => (r.length < 30 ? [...r, blank()] : r))}>
          + Add a question
        </button>
        <button type="submit" className={button} disabled={pending}>
          {pending ? "Saving…" : "Save all questions"}
        </button>
      </div>
    </form>
  );
}
