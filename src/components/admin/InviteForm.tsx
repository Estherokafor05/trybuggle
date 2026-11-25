"use client";
import { useActionState, useState } from "react";
import { inviteAdminAction, type InviteState } from "@/app/admin/actions";
import { button, input, outline } from "@/components/admin/styles";

/** Invite by email. The one-time link shows once, to send if email isn't set up yet. */
export function InviteForm() {
  const [state, invite, pending] = useActionState<InviteState, FormData>(inviteAdminAction, {});
  const [copied, setCopied] = useState(false);
  return (
    <>
      <form action={invite} className="mt-3 grid gap-3">
        <label className="text-sm font-semibold" htmlFor="invite-email">
          Their email
        </label>
        <input id="invite-email" name="email" type="email" required className={input} />
        <button type="submit" className={button} disabled={pending}>
          {pending ? "Creating…" : "Create invite"}
        </button>
      </form>
      {state.error && (
        <p role="alert" className="mt-3 rounded-xl bg-peach p-3 text-sm">
          {state.error}
        </p>
      )}
      {state.link && (
        <div role="status" className="mt-4 rounded-xl bg-mint p-3 text-sm leading-relaxed">
          <p>
            {state.emailed
              ? `Invite emailed to ${state.email}. You can also send them this link:`
              : `Send this link to ${state.email} yourself. It works once and expires in 7 days, and it won't be shown again.`}
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={state.link} aria-label="Invite link" onFocus={(e) => e.currentTarget.select()} className={`${input} font-mono text-sm`} />
            <button
              type="button"
              className={outline}
              onClick={() => navigator.clipboard.writeText(state.link!).then(() => setCopied(true), () => setCopied(false))}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
