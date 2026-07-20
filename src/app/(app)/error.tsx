"use client";

/**
 * Segment-level Error Boundary for everything inside (app).
 *
 * Catches uncaught exceptions thrown by any descendant Server Component.
 * Resets back to a re-render of the same route on "Try again".
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-halftone text-fg">
      <div className="flex w-full max-w-[460px] flex-col items-start gap-7 px-6 py-8">
        <p className="eyebrow">Workspace hiccup</p>
        <h1 className="text-display text-[clamp(2rem,4vw,2.8rem)] text-fg">
          The canvas <span className="italic text-accent">hit a snag</span>.
        </h1>
        <p className="max-w-[44ch] text-[14px] leading-relaxed text-fg-muted">
          A part of the workspace failed to render. Your project data and
          recent edits are safe. Try again, or come back from the dashboard.
        </p>
        {error.digest ? (
          <p className="font-mono text-[11px] text-fg-subtle">
            ref: {error.digest}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-fg px-4 text-[13px] font-medium text-bg transition-editorial hover:bg-accent"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-bg-soft px-4 text-[13px] font-medium text-fg-muted transition-editorial hover:border-line-strong hover:text-fg"
          >
            ← Dashboard
          </a>
        </div>
        {typeof console !== "undefined" ? (
          <button
            type="button"
            onClick={() => console.error(error)}
            className="font-mono text-[11px] text-fg-subtle underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-fg"
          >
            Log details
          </button>
        ) : null}
      </div>
    </div>
  );
}
