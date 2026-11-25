// Shows a builder lesson's blocks to learners (and in the builder's preview).
// Everything is plain text: nothing typed in the builder is treated as HTML.

type Block = { id: string; type: string; data: Record<string, string> };

const paragraphs = (body = "") =>
  body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

export function LessonBlocks({ blocks }: { blocks: Block[] }) {
  const shown = blocks.filter(filled);
  if (!shown.length) return <p className="text-muted">This lesson has nothing in it yet.</p>;
  return (
    <div className="grid gap-6">
      {shown.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

/** Blocks the builder added but never filled in are left out. */
function filled(b: Block) {
  const d = b.data ?? {};
  if (b.type === "text") return Boolean(d.body || d.heading);
  if (b.type === "image") return Boolean(d.mediaId);
  if (b.type === "video") return Boolean(d.embed);
  if (b.type === "download") return Boolean(d.url);
  if (b.type === "reflection") return Boolean(d.prompt);
  return false;
}

function BlockView({ block }: { block: Block }) {
  const d = block.data;
  if (block.type === "text" && d.tone)
    return (
      <aside className={`rounded-3xl p-5 sm:p-6 ${d.tone === "warning" ? "bg-peach" : "bg-mint"}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">{d.tone === "warning" ? "Watch out" : "Tip"}</p>
        {paragraphs(d.body).map((p, i) => (
          <p key={i} className="mt-2 whitespace-pre-line leading-relaxed text-ink">
            {p}
          </p>
        ))}
      </aside>
    );
  if (block.type === "text")
    return (
      <section>
        {d.heading && <h2 className="text-2xl font-bold">{d.heading}</h2>}
        {paragraphs(d.body).map((p, i) => (
          <p key={i} className="mt-3 max-w-[70ch] whitespace-pre-line text-lg leading-relaxed text-ink">
            {p}
          </p>
        ))}
      </section>
    );
  if (block.type === "image")
    return (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/course-media/${d.mediaId}`} alt={d.alt} loading="lazy" className="h-auto w-full rounded-3xl border border-line bg-white object-contain" />
        {d.caption && <figcaption className="mt-2 text-sm text-muted">{d.caption}</figcaption>}
      </figure>
    );
  if (block.type === "video")
    return (
      <figure>
        <div className="aspect-video overflow-hidden rounded-3xl border border-line bg-navy">
          <iframe
            src={d.embed}
            title={d.title || "Video"}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="size-full"
          />
        </div>
        {d.caption && <figcaption className="mt-2 text-sm text-muted">{d.caption}</figcaption>}
      </figure>
    );
  if (block.type === "download")
    return (
      <p>
        <a
          href={d.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 font-semibold text-navy hover:bg-lavender"
        >
          {d.label} <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </p>
    );
  if (block.type === "reflection")
    return (
      <aside className="rounded-3xl bg-lavender p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Think about it</p>
        <p className="mt-2 whitespace-pre-line text-lg font-semibold leading-relaxed">{d.prompt}</p>
        <p className="mt-2 text-sm text-ink">Take a minute with this before you move on. There&apos;s no wrong answer.</p>
      </aside>
    );
  return null;
}
