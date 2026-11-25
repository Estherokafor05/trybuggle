"use client";
// A builder form: sends its fields to the builder action and shows any problem
// right above it, keeping whatever was typed.
import { startTransition, useActionState, type ReactNode } from "react";
import { builderAction, type BuilderState } from "@/app/actions/builder";

export function ActionForm({
  fields,
  children,
  className,
  label,
}: {
  /** Hidden values: actor, op and the ids the change is about. */
  fields: Record<string, string>;
  children: ReactNode;
  className?: string;
  /** Names the form for screen readers when it has no heading of its own. */
  label?: string;
}) {
  const [state, dispatch, pending] = useActionState<BuilderState, FormData>(builderAction, {});
  return (
    <form
      aria-label={label}
      aria-busy={pending || undefined}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => dispatch(data));
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {state.error && (
        <p role="alert" className="basis-full rounded-2xl bg-peach p-3 text-sm leading-relaxed text-ink">
          {state.error}
        </p>
      )}
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
