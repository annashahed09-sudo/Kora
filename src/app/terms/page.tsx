import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata: Metadata = {
  title: "Terms",
};

const UPDATED = "2026-07-19";

export default function TermsPage() {
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

      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-[760px] px-6 pt-24 pb-32">
          <header className="flex flex-col gap-6">
            <p className="eyebrow">Legal · Terms</p>
            <h1 className="text-display text-[clamp(2.4rem,5vw,3.6rem)] text-fg">
              Using <span className="italic text-accent">Kora</span> — the rules.
            </h1>
            <p className="max-w-[60ch] text-[14.5px] leading-relaxed text-fg-muted">
              These terms cover your use of Kora during the public preview.
              Plain language; no surprises.
            </p>
            <p className="text-[12px] text-fg-subtle">
              Last updated {UPDATED}
            </p>
          </header>

          <hr className="my-14 h-divider border-0" />

          <div className="flex flex-col gap-12 text-[14.5px] leading-relaxed text-fg-muted [&_h2]:text-fg [&_h2]:text-display [&_h2]:text-[1.6rem] [&_h2]:mb-3 [&_p]:mb-3 [&_p:last-child]:mb-0">
            <section>
              <h2>What Kora is</h2>
              <p>
                A workspace for creative teams. You create projects, fill
                them with structured phases (Brief, Concept, Delivery), and
                optionally share a read-only view with a client. The canvas,
                comments, and share links are the entire product. We don't
                sell or share your content with third parties.
              </p>
            </section>

            <section>
              <h2>Who can use it</h2>
              <p>
                Anyone 16 or older. One account per person. If you're using
                Kora on behalf of an agency or team, you agree that you have
                authority to bind the account to these terms.
              </p>
            </section>

            <section>
              <h2>Acceptable use</h2>
              <p>
                Don't use Kora to host illegal content, harass anyone, send
                spam, scrape other users' data, or attempt to circumvent our
                security. We may suspend accounts that violate this; we'll
                notify you first whenever possible.
              </p>
            </section>

            <section>
              <h2>License</h2>
              <p>
                We grant you a personal, non-exclusive, non-transferable,
                revocable license to use Kora during the public preview at
                no cost. When paid plans launch, license terms will be
                updated and we'll email you before they take effect.
              </p>
            </section>

            <section>
              <h2>Your content</h2>
              <p>
                You own what you create. By using Kora you give us a limited
                license to store it, back it up, and render it back to you
                (and to read-only viewers if you minted a share link).
                That's it. We don't train AI on your content during the
                preview.
              </p>
            </section>

            <section>
              <h2>Termination</h2>
              <p>
                You can delete your account and content at any time by
                emailing{" "}
                <a
                  className="text-fg underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-accent"
                  href="mailto:privacy@kora.studio"
                >
                  privacy@kora.studio
                </a>
                . We can suspend or terminate accounts that materially breach
                these terms. Either way, your data will be deleted within 30
                days.
              </p>
            </section>

            <section>
              <h2>Service availability</h2>
              <p>
                During the public preview, Kora is provided as-is. We aim
                for high availability but do not guarantee uptime. We'll
                never silently lose your work — when something goes wrong
                we'll tell you in the changelog.
              </p>
            </section>

            <section>
              <h2>Disclaimers and liability</h2>
              <p>
                To the maximum extent permitted by law, Kora is provided
                without warranties of any kind. Our total liability to you
                for any claim arising from your use of Kora is capped at
                the amount you've paid us in the twelve months prior — or
                USD 0 during the free public preview.
              </p>
            </section>

            <section>
              <h2>Governing law</h2>
              <p>
                These terms are governed by the laws of the State of
                California, USA. Disputes will be resolved in the courts of
                San Francisco County. If any part of these terms is found
                unenforceable, the rest remains in effect.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions, complaints, or account requests:{" "}
                <a
                  className="text-fg underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-accent"
                  href="mailto:privacy@kora.studio"
                >
                  privacy@kora.studio
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6 text-[12px] text-fg-subtle">
          <span>© {new Date().getFullYear()} Kora Studio</span>
          <Link href="/privacy" className="hover:text-fg">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
