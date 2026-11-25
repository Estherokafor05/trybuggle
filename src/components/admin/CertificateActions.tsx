import { restoreCertificateAction, withdrawCertificateAction } from "@/app/admin/actions";
import { input, outline } from "@/components/admin/format";

/** Withdraw a certificate (with a reason), or restore a withdrawn one. */
export function CertificateActions({
  code,
  withdrawn,
  back,
}: {
  code: string;
  withdrawn: { reason: string } | null;
  back: string;
}) {
  if (withdrawn)
    return (
      <form action={restoreCertificateAction} className="mt-2 flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-navy">Withdrawn{withdrawn.reason ? `: ${withdrawn.reason}` : ""}</p>
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="back" value={back} />
        <button type="submit" className={outline}>
          Restore<span className="sr-only"> {code}</span>
        </button>
      </form>
    );
  return (
    <details className="mt-2">
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-navy underline underline-offset-4">
        Withdraw<span className="sr-only"> {code}</span>
      </summary>
      <form action={withdrawCertificateAction} className="mt-2 grid gap-2">
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="back" value={back} />
        <label className="text-sm font-semibold" htmlFor={`reason-${code}`}>
          Reason (kept in the activity log)
        </label>
        <input id={`reason-${code}`} name="reason" required maxLength={300} className={input} />
        <button type="submit" className={outline}>
          Withdraw this certificate
        </button>
      </form>
    </details>
  );
}
