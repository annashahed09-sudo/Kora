import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Kora brand mark — v2.0.
 *
 * The primary wordmark replaces the prior CSS dot with a hand-drawn SVG
 * "halftone cluster" — a 3x3 dot matrix in warm cream tones. This is the
 * reference-design signature in miniature: every appearance of the
 * wordmark (header, footer, dialog, /changelog entries) carries the
 * halftone touch without needing the full backdrop utility.
 *
 * Monogram variant stays as "k" in Newsreader italic inside a square chip.
 */

type Variant = "wordmark" | "mark";

type Props = {
  variant?: Variant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "href"> & {
  /**
   * `href` is supplied by the underlying <Link>; we override it to be
   * optional because the runtime defaults to "/" (see the destructuring
   * default below). Page-level chrome (auth, dashboard, share, /changelog,
   * footer) just wants the wordmark and shouldn't have to thread an href.
   */
  href?: string;
};

export function BrandMark({
  variant = "wordmark",
  className,
  href = "/",
  ...rest
}: Props) {
  if (variant === "mark") {
    return (
      <Link
        href={href}
        aria-label="Kora"
        className={
          "inline-flex h-8 w-8 items-center justify-center rounded-[7px] " +
          "border border-line bg-bg-soft text-fg transition-editorial " +
          "hover:border-line-strong hover:bg-bg-card " +
          (className ?? "")
        }
        {...rest}
      >
        <span className="text-display text-[15px] italic leading-none">k</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label="Kora — home"
      className={
        "group inline-flex items-baseline gap-1.5 text-fg transition-editorial hover:opacity-80 " +
        (className ?? "")
      }
      {...rest}
    >
      <span className="text-display text-[1.55rem] italic leading-none">
        kora
      </span>
      <HalftoneCluster aria-hidden className="translate-y-[-1px]" />
    </Link>
  );
}

/**
 * A 9-dot halftone cluster, 3x3, with a subtly-varied cream palette so it
 * reads as a typed mark, not a CSS primitive. Inline SVG so it composites
 * cleanly at any size and inherits text color where appropriate.
 */
function HalftoneCluster({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="12"
      height="12"
      role="presentation"
      aria-hidden
      className={className}
    >
      {/* Row 1 */}
      <circle cx="2"  cy="2"  r="0.95" fill="#d8c8b8" />
      <circle cx="6"  cy="2"  r="0.85" fill="#b5aea5" opacity="0.9" />
      <circle cx="10" cy="2"  r="0.95" fill="#d8c8b8" />
      {/* Row 2 */}
      <circle cx="2"  cy="6"  r="0.85" fill="#b5aea5" opacity="0.9" />
      <circle cx="6"  cy="6"  r="1.1"  fill="#f3ebdf" />
      <circle cx="10" cy="6"  r="0.85" fill="#b5aea5" opacity="0.9" />
      {/* Row 3 */}
      <circle cx="2"  cy="10" r="0.95" fill="#d8c8b8" />
      <circle cx="6"  cy="10" r="0.85" fill="#b5aea5" opacity="0.9" />
      <circle cx="10" cy="10" r="0.95" fill="#d8c8b8" />
    </svg>
  );
}
