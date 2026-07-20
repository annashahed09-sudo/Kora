"use client";

import { useEffect, useRef, useState } from "react";
import { shareProject } from "../share-actions";

/**
 * ShareDialog — small modal sheet that mints a share token and copies the
 * resulting read-only URL to the clipboard. Uses native dialog semantics
 * (`<dialog>` + showModal) so focus traps, scrim, and Escape key come for
 * free.
 */
export function ShareDialog({ projectId }: { projectId: string }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setError(null);
  }

  async function generate() {
    setPending(true);
    setError(null);
    const res = await shareProject(projectId);
    setPending(false);
    if (res.ok) {
      setUrl(res.url);
      try {
        await navigator.clipboard.writeText(res.url);
      } catch {
        // Clipboard write can fail in insecure contexts — ignore.
      }
    } else {
      setError(res.message ?? "Couldn't generate a link.");
    }
  }

  // Close on backdrop click without bubbling into the dialog box.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const handler = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    d.addEventListener("click", handler);
    return () => d.removeEventListener("click", handler);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg-soft px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-line-strong hover:bg-bg-card"
      >
        Share
        <span
          aria-hidden
          className="text-fg-muted transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-[14px] border border-line bg-bg p-0 text-fg backdrop:bg-black/60"
      >
        <div className="flex w-[min(420px,90vw)] flex-col gap-5 p-7">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Share</p>
            <button
              type="button"
              onClick={close}
              className="text-[13px] text-fg-muted transition-colors hover:text-fg"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <h2 className="text-display text-[1.6rem] text-fg">
            A read-only view of this project.
          </h2>
          <p className="text-[13.5px] leading-relaxed text-fg-muted">
            Anyone with the link can review the canvas. Editing is disabled.
            The token can be revoked by deleting it from the database.
          </p>

          {url ? (
            <div className="flex flex-col gap-2">
              <label className="eyebrow" htmlFor="share-url">
                Link
              </label>
              <input
                id="share-url"
                readOnly
                value={url}
                onFocus={(e) => e.currentTarget.select()}
                className="h-11 rounded-[10px] border border-line bg-bg-soft px-3.5 text-[13.5px] text-fg"
              />
              <p className="text-[12px] text-fg-subtle">
                Copied to your clipboard.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={generate}
              disabled={pending}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-fg px-5 text-[14px] font-medium text-bg transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Generating…" : "Generate share link"}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          )}

          {error ? (
            <p role="alert" className="text-[12.5px] text-[#e0a89a]">
              {error}
            </p>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
