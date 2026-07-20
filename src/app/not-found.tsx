import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata: Metadata = {
  title: "Not found",
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-6">
          <BrandMark />
          <Link
            href="/"
            className="text-[13px] text-fg-muted transition-colors hover:text-fg"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main
        id="main"
        className="flex flex-1 items-center justify-center px-6"
      >
        <div className="flex w-full max-w-[500px] flex-col items-start gap-8">
          <div className="flex flex-col gap-4">
            <p className="eyebrow">404</p>
            <h1 className="text-display text-[clamp(2.4rem,6vw,4rem)] text-fg">
              Not{" "}
              <span className="italic text-accent">here</span>.
            </h1>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-fg-muted">
              This page doesn&apos;t exist — or it did once and has been
              moved. Either way, the canvas is blank.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="group inline-flex h-11 items-center gap-2 rounded-[10px] bg-fg px-5 text-[14px] font-medium text-bg transition-colors hover:bg-accent"
            >
              Go home
              <span
                aria-hidden
                className="inline-block transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line bg-transparent px-5 text-[14px] font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              Your workspaces
            </Link>
          </div>

          {/* Decorative SVG — a quiet visual anchor */}
          <svg
            viewBox="0 0 200 60"
            role="presentation"
            className="mt-8 w-full text-fg-subtle opacity-30"
          >
            <rect
              x="0"
              y="0"
              width="200"
              height="60"
              rx="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <rect
              x="10"
              y="10"
              width="30"
              height="16"
              rx="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="50"
              y1="18"
              x2="190"
              y2="18"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line x1="10" y1="36" x2="100" y2="36" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="10" y1="46" x2="140" y2="46" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <circle cx="180" cy="42" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      </main>
    </div>
  );
}
