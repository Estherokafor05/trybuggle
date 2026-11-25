// The form for checking a certificate by its ID. Works without JavaScript.
export function VerifyForm({ invalid, value = "", heading = true }: { invalid?: boolean; value?: string; heading?: boolean }) {
  return (
    <section aria-labelledby="verify-title" className="rounded-[2rem] bg-hero-lavender p-6 sm:p-9">
      {heading ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Certificate check</p>
          <h1 id="verify-title" className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">
            Check a certificate
          </h1>
        </>
      ) : (
        <h2 id="verify-title" className="text-2xl font-bold">
          Check another certificate
        </h2>
      )}
      <p className="mt-3 max-w-[58ch] leading-relaxed text-ink">
        Every Buggle Learn certificate has an ID, such as BL-E-7KQ2-M9XD. Enter it to see who it was
        issued to and when.
      </p>
      <form action="/verify" method="get" className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="block font-semibold">Certificate ID</span>
          <input
            name="code"
            defaultValue={value}
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "verify-error" : undefined}
            className="mt-2 min-h-11 w-full rounded-xl border-2 border-navy/30 bg-white px-3 py-2.5 font-mono text-lg uppercase focus-visible:outline-2 focus-visible:outline-brand-deep"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
        >
          Check it
        </button>
      </form>
      {invalid && (
        <p id="verify-error" role="alert" className="mt-3 rounded-xl bg-peach p-3">
          That doesn&apos;t look like a Buggle Learn certificate ID. Check it against the certificate and try again.
        </p>
      )}
    </section>
  );
}
