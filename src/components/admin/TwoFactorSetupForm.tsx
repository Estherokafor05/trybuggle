"use client";
import { useActionState } from "react";
import { confirmTwoFactorAction, startTwoFactorAction, type TwoFactorSetup } from "@/app/admin/actions";
import { FormMessage, primaryButton, TextField } from "@/components/auth/fields";

/** Confirm the password, scan the QR code, save backup codes, enter the first code. */
export function TwoFactorSetupForm() {
  const [state, start, starting] = useActionState<TwoFactorSetup, FormData>(startTwoFactorAction, { step: "start" });
  const [confirmed, confirm, confirming] = useActionState<TwoFactorSetup, FormData>(
    async (prev, form) => confirmTwoFactorAction(state.step === "scan" ? state : prev, form),
    state,
  );
  const scan = state.step === "scan" ? state : null;
  const error = confirmed.error && scan ? confirmed.error : state.error;

  if (!scan)
    return (
      <form action={start} className="mt-6 grid gap-4">
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink">
          <li>Install an authenticator app on your phone, if you don&apos;t have one.</li>
          <li>Confirm your password below.</li>
          <li>Scan the code we show you, then type the code the app gives you.</li>
        </ol>
        <TextField id="password" label="Your password" type="password" autoComplete="current-password" required />
        <button type="submit" className={primaryButton} disabled={starting}>
          {starting ? "One moment…" : "Continue"}
        </button>
      </form>
    );

  return (
    <div className="mt-6 grid gap-5">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <div>
        <h2 className="font-semibold">1. Scan this with your authenticator app</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scan.qr} alt="QR code for your authenticator app" width={220} height={220} className="mt-3 rounded-xl border border-line" />
        <p className="mt-2 text-sm text-muted">
          Can&apos;t scan? Type this key into the app instead:{" "}
          <span className="break-all font-mono font-semibold text-navy">{scan.secret}</span>
        </p>
      </div>
      <div>
        <h2 className="font-semibold">2. Save your backup codes</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          If you lose your phone, each of these lets you sign in once. Keep them somewhere safe, such as a password
          manager. They won&apos;t be shown again.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-canvas p-3 font-mono text-sm text-navy" aria-label="Backup codes">
          {scan.backupCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
      </div>
      <form action={confirm} className="grid gap-4">
        <h2 className="font-semibold">3. Enter the code from the app</h2>
        <TextField id="code" label="6-digit code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} required />
        <button type="submit" className={primaryButton} disabled={confirming}>
          {confirming ? "Checking…" : "Turn it on"}
        </button>
      </form>
    </div>
  );
}
