"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  emptyCheckpoint,
  parseCheckpoint,
  sameCheckpoint,
  type Checkpoint,
} from "@/lib/learning-state";

export function useLearningPlace(
  slug: string,
  scope: string,
  signedIn: boolean,
) {
  const [place, setPlace] = useState<Checkpoint>(emptyCheckpoint);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Restoring your place…");
  const [conflict, setConflict] = useState(false);
  const current = useRef(emptyCheckpoint()),
    revision = useRef(0),
    generation = useRef(0),
    busy = useRef(false),
    dirty = useRef(false),
    blocked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localKey = `buggle-place:${scope}:${slug}`;
  const localRead = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(localKey) ?? "null");
      const checkpoint = parseCheckpoint(stored?.checkpoint ?? stored, slug);
      return checkpoint
        ? {
            checkpoint,
            revision: Number.isSafeInteger(stored?.revision)
              ? stored.revision
              : 0,
            pending: stored?.pending === true,
          }
        : null;
    } catch {
      return null;
    }
  }, [localKey, slug]);
  const cache = useCallback(
    (checkpoint: Checkpoint, savedRevision: number, pending: boolean) => {
      try {
        localStorage.setItem(
          localKey,
          JSON.stringify({ checkpoint, revision: savedRevision, pending }),
        );
        return true;
      } catch {
        return false;
      }
    },
    [localKey],
  );
  const flush = useCallback(async () => {
    if (!signedIn || busy.current || blocked.current || !dirty.current) return;
    busy.current = true;
    const sentGeneration = generation.current;
    const snapshot = current.current;
    setStatus("Saving your place…");
    try {
      const response = await fetch(`/api/me/learning/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revision: revision.current,
          checkpoint: snapshot,
        }),
        keepalive: true,
      });
      if (response.status === 409) {
        blocked.current = true;
        setConflict(true);
        throw new Error(
          "A newer place was saved in another tab or device. Load it before saving again.",
        );
      }
      if (response.status === 401) {
        blocked.current = true;
        throw new Error(
          "Your session ended. Sign in again to save to your account.",
        );
      }
      if (!response.ok)
        throw new Error(
          "Could not save to your account. Your place is kept on this device where available.",
        );
      const result = await response.json();
      revision.current = result.revision;
      cache(
        current.current,
        result.revision,
        generation.current !== sentGeneration,
      );
      if (generation.current === sentGeneration) {
        dirty.current = false;
        setStatus("Saved to your account");
      } else setStatus("Your latest changes are waiting to save.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not save your place.",
      );
    } finally {
      busy.current = false;
    }
  }, [signedIn, slug, cache]);
  const load = useCallback(
    async (preferAccount = false) => {
      setReady(false);
      blocked.current = true;
      const local = localRead();
      let restored = local?.checkpoint ?? emptyCheckpoint();
      let needsAccountSave = false;
      let conflictMessage = "";
      try {
        if (signedIn) {
          const response = await fetch(`/api/me/learning/${slug}`, {
            cache: "no-store",
          });
          if (!response.ok) throw new Error();
          const result = await response.json();
          revision.current = result.revision;
          const account = parseCheckpoint(result.checkpoint, slug);
          if (account) {
            if (
              local?.pending &&
              !preferAccount &&
              !sameCheckpoint(local.checkpoint, account)
            ) {
              restored = local.checkpoint;
              if (local.revision === result.revision) needsAccountSave = true;
              else
                conflictMessage =
                  "A newer place was saved in another tab or device. Load it before saving again.";
            } else restored = account;
          } else {
            let guest: Checkpoint | null = null;
            try {
              const stored = JSON.parse(
                localStorage.getItem(`buggle-place:guest:${slug}`) ?? "null",
              );
              guest = parseCheckpoint(stored?.checkpoint ?? stored, slug);
            } catch {}
            restored = local?.checkpoint ?? guest ?? restored;
            needsAccountSave = Boolean(local ?? guest);
          }
        }
        blocked.current = Boolean(conflictMessage);
        setConflict(Boolean(conflictMessage));
        setStatus(
          conflictMessage ||
            (signedIn
              ? "Your account’s learning place is ready."
              : "Your place is kept on this device."),
        );
        if (!conflictMessage)
          cache(restored, revision.current, needsAccountSave);
      } catch {
        blocked.current = true;
        setConflict(true);
        setStatus(
          "Could not load your account’s saved place. You can keep learning here, then retry loading.",
        );
      }
      current.current = restored;
      dirty.current = needsAccountSave;
      generation.current++;
      setPlace(restored);
      setReady(true);
    },
    [localRead, signedIn, slug, cache],
  );
  useEffect(() => {
    let live = true;
    void Promise.resolve().then(() => {
      if (live) void load();
    });
    const interval = setInterval(() => void flush(), 3000);
    const pageHide = () => void flush();
    window.addEventListener("pagehide", pageHide);
    return () => {
      live = false;
      clearInterval(interval);
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("pagehide", pageHide);
      void flush();
    };
  }, [load, flush]);
  const update = useCallback(
    (change: Partial<Checkpoint>) => {
      const next = { ...current.current, ...change };
      current.current = next;
      setPlace(next);
      generation.current++;
      dirty.current = true;
      if (cache(next, revision.current, signedIn)) {
        if (!signedIn) setStatus("Saved on this device");
      } else {
        setStatus(
          signedIn
            ? "Local storage is unavailable. Saving to your account…"
            : "This browser could not save your place. Keep this page open or note your place before leaving.",
        );
      }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 700);
    },
    [signedIn, flush, cache],
  );
  return {
    place,
    ready,
    status,
    conflict,
    update,
    reload: () => load(true),
    retry: () => void flush(),
  };
}
