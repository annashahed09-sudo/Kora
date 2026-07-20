import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Start a workspace",
};

/**
 * Signup — mirrors login structure as a deliberate tone-of-voice pairing.
 */
export default function SignupPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Begin</p>
        <h1 className="text-display text-[clamp(2.2rem,4vw,2.8rem)] text-fg">
          Start a <span className="italic text-accent">workspace</span>.
        </h1>
        <p className="max-w-[42ch] text-[14px] leading-relaxed text-fg-muted">
          Create an account to keep your briefs, concepts, and deliveries in
          one continuous place. Free during the public preview.
        </p>
      </div>

      <SignupForm />

      <p className="text-[13px] text-fg-muted">
        Already have one?{" "}
        <Link
          href="/login"
          className="text-fg underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-accent"
        >
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
