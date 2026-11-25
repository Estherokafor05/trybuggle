"use client";
// Choosing a profile photo. The photo is cropped to a square and shrunk in the
// browser before it is sent, so big phone photos upload quickly and hidden
// details (such as where it was taken) are left behind.
import { startTransition, useRef, useState } from "react";
import { removePhotoAction, savePhotoAction } from "@/app/actions/account";
import { Avatar } from "@/components/Avatar";

const SIZE = 256;
const button =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50";
const outline =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-navy hover:bg-lavender focus-within:outline-2 focus-within:outline-brand-deep";

async function square(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.86));
}

export function PhotoPicker({ name, image }: { name: string; image: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  // Once the saved photo comes back from the server, show it instead of the preview.
  const [shown, setShown] = useState(image);
  if (shown !== image) {
    setShown(image);
    setPreview(null);
    setBlob(null);
    setBusy(false);
  }

  async function choose(file: File | undefined) {
    setProblem("");
    if (!file) return;
    try {
      const small = await square(file);
      setBlob(small);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(small);
      });
    } catch {
      setProblem("That photo couldn't be opened. Try a JPEG or PNG photo.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Your new photo, not saved yet" className="size-20 shrink-0 rounded-full object-cover ring-2 ring-white" />
      ) : (
        <Avatar name={name} image={image} size="lg" alt={image ? "Your profile photo" : `Your initials, ${name}`} />
      )}
      <div className="grid min-w-0 flex-1 gap-3">
        <p className="text-sm leading-relaxed text-muted">
          {image ? "Shown next to your name at the top of the page." : "No photo yet, so your initials show instead."} Use a clear photo of you; it&apos;s made into a small
          square.
        </p>
        <div className="flex flex-wrap gap-2">
          <label className={outline}>
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h2l1.2-2h4.6L13.5 6h2A1.5 1.5 0 0 1 17 7.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5Z" />
              <circle cx="10" cy="11" r="2.8" />
            </svg>
            {image ? "Choose a new photo" : "Choose a photo"}
            <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(e) => void choose(e.target.files?.[0])} />
          </label>
          {blob && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData();
                data.set("photo", new File([blob], "photo.jpg", { type: "image/jpeg" }));
                setBusy(true);
                startTransition(() => savePhotoAction(data));
              }}
            >
              <button type="submit" className={button} disabled={busy}>
                {busy ? "Saving…" : "Save photo"}
              </button>
            </form>
          )}
          {image && !blob && (
            <form action={removePhotoAction}>
              <button type="submit" className={outline}>
                Remove photo
              </button>
            </form>
          )}
        </div>
        {problem && (
          <p role="alert" className="rounded-xl bg-peach/60 p-3 text-sm text-ink">
            {problem}
          </p>
        )}
      </div>
    </div>
  );
}
