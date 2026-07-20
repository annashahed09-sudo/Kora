"use client";

import Link from "next/link";

/**
 * Root Error Boundary — catches uncaught exceptions inside any Server
 * Component below. Resets back to a re-render of the same route when
 * the user presses Try again.
 *
 * Phone-home: we log to console. v1.1 hooks this up to a telemetry sink.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-halftone text-fg">
      <div className="flex w-full max-w-[440px] flex-col items-start gap-7 px-6 py-8">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="text-display text-[clamp(2.2rem,4.4vw,3rem)] text-fg">
          We hit a snag <span className="italic text-accent">on this route</span>.
        </h1>
        <p className="max-w-[44ch] text-[14px] leading-relaxed text-fg-muted">
          The page failed to render. Your work is safe — try again, or
          come back to the home screen and try a different path.
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
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-bg-soft px-4 text-[13px] font-medium text-fg-muted transition-editorial hover:border-line-strong hover:text-fg"
          >
            ← Home
          </Link>
        </div>
        {typeof window !== "undefined" ? (
          <button
            type="button"
            onClick={() => {
              // Best-effort: capture and surface the message so the user
              // can paste it into a bug report.
              if (typeof console !== "undefined") console.error(error);
            }}
            className="font-mono text-[11px] text-fg-subtle underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-fg"
          >
            Copy details to console
          </button>
        ) : null}
      </div>
    </div>
  );
}
