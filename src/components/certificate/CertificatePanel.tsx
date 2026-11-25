"use client";
import { useId, useState } from "react";
import type { Certificate } from "@/server/certificates";
import { linkedInAddUrl, linkedInShareUrl } from "@/lib/certificate-links";

const primary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50";
const secondary =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-navy/25 bg-white px-5 py-2.5 text-sm font-semibold text-navy hover:bg-lavender disabled:opacity-50";

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * Confirm or edit the name, create the certificate once, preview it, download
 * the PDF and share it: a public check page and LinkedIn.
 */
export function CertificatePanel({
  slug,
  moduleTitle,
  profileName,
  initial,
  origin,
  canCreate = true,
  api = `/api/me/certificates/${slug}`,
}: {
  /** Where the certificate is created, renamed and downloaded. */
  api?: string;
  slug: string;
  /** What the certificate is for, e.g. "AI Literacy Essentials". */
  moduleTitle: string;
  profileName: string;
  initial: Certificate | null;
  /** This site's address, for the public check link. */
  origin: string;
  /** False for module certificates, which are no longer created. */
  canCreate?: boolean;
}) {
  const inputId = useId();
  const [certificate, setCertificate] = useState(initial);
  const [editing, setEditing] = useState(!initial);
  const [name, setName] = useState(initial?.learnerName ?? profileName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [copied, setCopied] = useState(false);
  const verifyUrl = certificate ? `${origin}/verify/${encodeURIComponent(certificate.code)}` : "";
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const response = await fetch(api, {
        method: certificate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSaved(certificate ? "Name updated. Download the PDF again to get the new version." : "Your certificate is ready.");
      setCertificate(data.certificate);
      setName(data.certificate.learnerName);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="certificate-title" className="mt-6">
      <h2 id="certificate-title" className="text-2xl font-bold">
        {certificate ? "Your certificate" : "Create your certificate"}
      </h2>
      {saved && (
        <p role="status" className="mt-3 rounded-xl bg-mint p-3 font-semibold">
          ✓ {saved}
        </p>
      )}

      {certificate && (
        <>
          {/* A faithful on-screen preview of the PDF. */}
          <figure className="mt-4 overflow-hidden rounded-[1.5rem] border-[3px] border-brand bg-white p-2">
            <div className="rounded-[1.1rem] border border-lavender px-5 py-7 text-center sm:px-10 sm:py-10">
              <p className="text-xs font-bold tracking-[0.14em] text-brand">BUGGLE LEARN</p>
              <p className="mt-3 font-display text-[clamp(1.6rem,4vw,2.4rem)] font-bold leading-tight text-navy">
                Certificate of Completion
              </p>
              <p className="mt-4 text-sm text-muted">This certifies that</p>
              <p className="ph-mask mx-auto mt-2 max-w-[28ch] break-words border-b-2 border-brand pb-2 font-display text-[clamp(1.5rem,4vw,2.2rem)] font-bold text-navy">
                {certificate.learnerName}
              </p>
              <p className="mt-3 text-sm text-muted">has completed</p>
              <p className="mt-1 text-lg font-bold text-teal sm:text-xl">{moduleTitle}</p>
              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted">Completed on</dt>
                  <dd className="font-bold text-navy">{longDate(certificate.completedOn)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Issued by</dt>
                  <dd className="font-bold text-navy">Buggle Learn</dd>
                </div>
                <div>
                  <dt className="text-muted">Certificate ID</dt>
                  <dd className="font-mono font-bold text-navy">{certificate.code}</dd>
                </div>
              </dl>
              <p className="mt-5 break-words text-xs font-semibold text-navy">
                Check this certificate at {verifyUrl.replace(/^https?:\/\//, "")}
              </p>
              <p className="mt-2 text-xs text-muted">
                This is a certificate of completion. It is not an accredited qualification or proof of professional competence.
              </p>
            </div>
            <figcaption className="sr-only">Preview of your certificate</figcaption>
          </figure>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a href={`${api}/pdf`} download className={primary}>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4">
                <path d="M10 3v9m0 0-3.5-3.5M10 12l3.5-3.5M4 15h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download PDF
            </a>
            {!editing && (
              <button type="button" className={secondary} onClick={() => { setEditing(true); setSaved(""); }}>
                Edit name
              </button>
            )}
          </div>

          <section aria-labelledby="share-title" className="mt-6 rounded-[1.5rem] bg-lavender p-5 sm:p-6">
            <h3 id="share-title" className="text-lg font-bold">
              Share it
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              Anyone with this link can check your certificate is real. It shows your name, the
              certificate and its dates, and nothing else about you.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                readOnly
                aria-label="Link to check your certificate"
                value={verifyUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 font-mono text-sm text-navy"
              />
              <button type="button" className={secondary} onClick={copyLink}>
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
            <p role="status" className="sr-only">
              {copied ? "Link copied" : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={linkedInAddUrl(certificate, moduleTitle, verifyUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className={primary}
              >
                Add to LinkedIn profile
                <span className="sr-only"> (opens LinkedIn in a new tab)</span>
              </a>
              <a
                href={linkedInShareUrl(verifyUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className={secondary}
              >
                Share in a LinkedIn post
                <span className="sr-only"> (opens LinkedIn in a new tab)</span>
              </a>
              <a href={`/verify/${encodeURIComponent(certificate.code)}`} className={secondary}>
                See the check page
              </a>
            </div>
          </section>
        </>
      )}

      {editing && (certificate || canCreate) && (
        <form onSubmit={save} className="mt-4 rounded-[1.5rem] border border-line bg-white p-5 sm:p-6">
          <label htmlFor={inputId} className="block font-semibold">
            Name on your certificate
          </label>
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-muted">
            {certificate
              ? "Your certificate ID and completion date stay the same."
              : "We've used the name on your profile. Change it if you'd like it to appear differently."}
          </p>
          <input
            id={inputId}
            aria-describedby={`${inputId}-hint`}
            value={name}
            maxLength={80}
            autoComplete="name"
            required
            onChange={(e) => setName(e.target.value)}
            className="mt-3 w-full rounded-xl border-2 border-navy/30 px-3 py-2.5 text-lg focus-visible:outline-2 focus-visible:outline-brand-deep"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="submit" className={primary} disabled={busy || !name.trim()}>
              {busy ? "Saving…" : certificate ? "Save name" : "Create my certificate"}
            </button>
            {certificate && (
              <button type="button" className={secondary} onClick={() => { setEditing(false); setName(certificate.learnerName); setError(""); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-peach p-3">
          {error}
        </p>
      )}
    </section>
  );
}
