import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Login — server component shell. The form body is a thin client wrapper
 * around the `login` server action so we get React 19's `useActionState`
 * (pending state + progressive enhancement) without inflating the bundle.
 */
export default function LoginPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Welcome back</p>
        <h1 className="text-display text-[clamp(2.2rem,4vw,2.8rem)] text-fg">
          Sign <span className="italic text-accent">in</span>.
        </h1>
        <p className="max-w-[42ch] text-[14px] leading-relaxed text-fg-muted">
          Pick up where you left off. Your workspaces and shared views are
          exactly as you left them.
        </p>
      </div>

      <LoginForm />

      <p className="text-[13px] text-fg-muted">
        No account yet?{" "}
        <Link
          href="/signup"
          className="text-fg underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-accent"
        >
          Start a workspace
        </Link>
        .
      </p>
    </div>
  );
}
