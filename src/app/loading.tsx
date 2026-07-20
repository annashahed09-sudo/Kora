/**
 * Root Suspense fallback — shown while Server Components are streaming.
 *
 * Brand-aligned with v2.0: pure black ground, halftone dot-matrix
 * backdrop, halftone-cluster wordmark in the corner, and a calm pulsing
 * dot so the user knows the request is being processed without feeling
 * like they're staring at a frozen screen.
 */
export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-halftone text-fg">
      <div className="flex flex-col items-center gap-6">
        <HalftoneCluster aria-hidden />
        <div className="flex flex-col items-center gap-2.5">
          <p className="eyebrow">Thinking…</p>
          <p
            aria-hidden
            className="size-1.5 animate-pulse rounded-full bg-accent"
          />
        </div>
      </div>
    </div>
  );
}

function HalftoneCluster() {
  return (
    <svg viewBox="0 0 12 12" width="18" height="18" aria-hidden>
      <circle cx="2"  cy="2"  r="0.95" fill="#d8c8b8" />
      <circle cx="6"  cy="2"  r="0.85" fill="#b5aea5" opacity="0.9" />
      <circle cx="10" cy="2"  r="0.95" fill="#d8c8b8" />
      <circle cx="2"  cy="6"  r="0.85" fill="#b5aea5" opacity="0.9" />
      <circle cx="6"  cy="6"  r="1.1"  fill="#f3ebdf" />
      <circle cx="10" cy="6"  r="0.85" fill="#b5aea5" opacity="0.9" />
      <circle cx="2"  cy="10" r="0.95" fill="#d8c8b8" />
      <circle cx="6"  cy="10" r="0.85" fill="#b5aea5" opacity="0.9" />
      <circle cx="10" cy="10" r="0.95" fill="#d8c8b8" />
    </svg>
  );
}
