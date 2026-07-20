import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

/**
 * Auth route-group layout.
 *
 * Renders a centered card against the dark canvas, with a quiet back-to-home
 * link up top. No sidebar, no nav — auth pages should feel like a single
 * focused moment, not a navigation problem.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="border-b border-line/70">
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
        className="flex flex-1 items-center justify-center px-6 py-16"
      >
        <div className="w-full max-w-[420px]">{children}</div>
      </main>

      <footer className="border-t border-line/70 px-6 py-5 text-center text-[12px] text-fg-subtle">
        © {new Date().getFullYear()} Kora Studio ·{" "}
        <Link href="/privacy" className="hover:text-fg">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="hover:text-fg">
          Terms
        </Link>
      </footer>
    </div>
  );
}
