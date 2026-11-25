"use client";
// Invite and join-link forms. Links are shown once, here, and never put in
// the address bar, so they don't end up in browser history or server logs.
import { useActionState, useState } from "react";
import { inviteAction, joinLinkAction, type LinkState } from "@/app/org/actions";
import { orgButton, orgInput, orgOutline } from "./styles";

function LinkBox({ link, label }: { link: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
      <input readOnly aria-label={label} value={link} onFocus={(e) => e.currentTarget.select()} className={`${orgInput} font-mono text-sm`} />
      <button type="button" className={orgOutline} onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true), () => setCopied(false))}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function InviteForm({ org, owner, free }: { org: string; owner: boolean; free: number }) {
  const [state, action, pending] = useActionState<LinkState, FormData>(inviteAction, {});
  return (
    <>
      <form action={action} className="mt-3 grid gap-3">
        <input type="hidden" name="org" value={org} />
        <label className="grid gap-1 text-sm font-semibold">
          Their email
          <input name="email" type="email" required className={orgInput} />
        </label>
        {owner && (
          <label className="grid gap-1 text-sm font-semibold">
            Role
            <select name="role" className={orgInput} defaultValue="member">
              <option value="member">Member (learns)</option>
              <option value="manager">Manager (learns and manages)</option>
            </select>
          </label>
        )}
        <p className="text-sm text-muted">
          {free} {free === 1 ? "place" : "places"} free.
        </p>
        <button type="submit" className={`${orgButton} justify-self-start`} disabled={pending}>
          {pending ? "Creating…" : "Create invite"}
        </button>
      </form>
      {state.error && (
        <p role="alert" className="mt-3 rounded-xl bg-peach p-3 text-sm">
          {state.error}
        </p>
      )}
      {state.link && (
        <div role="status" className="mt-3 rounded-xl bg-mint p-3 text-sm leading-relaxed">
          <p>
            {state.emailed
              ? `Invite emailed to ${state.email}. You can also send them this link:`
              : `Send this link to ${state.email}. It works once, for that email, for 14 days. It won't be shown again.`}
          </p>
          <LinkBox link={state.link} label="Invite link" />
        </div>
      )}
    </>
  );
}

export function JoinLinkForm({ org, hasLink }: { org: string; hasLink: boolean }) {
  const [state, action, pending] = useActionState<LinkState, FormData>(joinLinkAction, {});
  const on = state.stopped ? false : state.link ? true : hasLink;
  return (
    <>
      {state.link && (
        <div role="status" className="mt-3 rounded-xl bg-mint p-3 text-sm">
          New link made. Any older link has stopped working.
          <LinkBox link={state.link} label="Join link" />
        </div>
      )}
      {state.stopped && (
        <p role="status" className="mt-3 rounded-xl bg-mint p-3 text-sm">
          Join link switched off.
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={action}>
          <input type="hidden" name="org" value={org} />
          <input type="hidden" name="do" value="make" />
          <button type="submit" className={orgOutline} disabled={pending}>
            {on ? "Make a new link" : "Make a join link"}
          </button>
        </form>
        {on && (
          <form action={action}>
            <input type="hidden" name="org" value={org} />
            <input type="hidden" name="do" value="stop" />
            <button type="submit" className={orgOutline} disabled={pending}>
              Switch link off
            </button>
          </form>
        )}
      </div>
      {on && !state.link && <p className="mt-2 text-xs text-muted">A link is on. It&apos;s only shown when it&apos;s made; make a new one to see it again.</p>}
    </>
  );
}
