import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata: Metadata = {
  title: "Privacy",
};

const UPDATED = "2026-07-19";

export default function PrivacyPage() {
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
            <p className="eyebrow">Legal · Privacy</p>
            <h1 className="text-display text-[clamp(2.4rem,5vw,3.6rem)] text-fg">
              What Kora{" "}
              <span className="italic text-accent">remembers</span> about you.
            </h1>
            <p className="max-w-[60ch] text-[14.5px] leading-relaxed text-fg-muted">
              We will only collect what's needed to operate the product, store
              it locked down with row-level security, and never sell or trade
              it.
            </p>
            <p className="text-[12px] text-fg-subtle">
              Last updated {UPDATED}
            </p>
          </header>

          <hr className="my-14 h-divider border-0" />

          <div className="flex flex-col gap-12 text-[14.5px] leading-relaxed text-fg-muted [&_h2]:text-fg [&_h2]:text-display [&_h2]:text-[1.6rem] [&_h2]:mb-3 [&_p]:mb-3 [&_p:last-child]:mb-0">
            <section>
              <h2>We collect nothing beyond what you create</h2>
              <p>
                Kora does <strong>not</strong> collect analytics, telemetry, usage
                logs, device fingerprints, location data, or any information
                beyond the content you intentionally save. No cookies are used
                for tracking — only a single session cookie to keep you signed in.
              </p>
            </section>

            <section>
              <h2>What you create stays yours</h2>
              <p>
                Your email address (required for authentication), the projects
                you create, the blocks and comments inside them, and the share
                tokens you mint. That's it. We do not sell, trade, or license
                your data to anyone. Period.
              </p>
            </section>

            <section>
              <h2>Why it's stored</h2>
              <p>
                To sign you in, to save your work, and to render the canvas.
                Comments and blocks are stored in our database and surfaced
                back to you when you return. Share tokens let an anonymous
                viewer see a read-only snapshot of a specific project — if
                and only if you explicitly create that link.
              </p>
            </section>

            <section>
              <h2>Where it lives</h2>
              <p>
                On Supabase Postgres with row-level security. Every query
                from the browser is checked against the row's owner before
                returning anything. Service-role administrative access is
                used only for migrations and never exposed to the client.
              </p>
            </section>

            <section>
              <h2>Who can see it</h2>
              <p>
                Only you. Read-only viewers can see a project if you give
                them a share link; they see what you put on the canvas and in
                comments at the moment you minted the link. Refreshing the
                link does not pick up later edits — the share is a snapshot.
              </p>
            </section>

            <section>
              <h2>How long we keep it</h2>
              <p>
                For as long as your account is active. Deleting your account
                (write to us at the address below) removes your projects,
                blocks, comments, and share tokens. Backups may persist for
                up to 30 days before being purged.
              </p>
            </section>

            <section>
              <h2>Your rights</h2>
              <p>
                You can export your data, correct it, or delete it at any
                time. Email us and we'll action the request within 7 working
                days. If you're in the EU/EEA, this aligns with the GDPR; if
                you're in California, with the CCPA/CPRA.
              </p>
            </section>

            <section>
              <h2>Children</h2>
              <p>
                Kora is not for children under 16. We do not knowingly
                collect information from anyone in that range. If we
                discover we have, we'll delete it promptly.
              </p>
            </section>

            <section>
              <h2>Cookies & tracking</h2>
              <p>
                We use a single first-party session cookie to keep you signed
                in via Supabase Auth. We do <strong>not</strong> use third-party
                analytics, advertising cookies, tracking pixels, fingerprinting,
                or any form of behavioural tracking. Kora does not load any
                external scripts beyond the Supabase client library.
              </p>
            </section>

            <section>
              <h2>Security</h2>
              <p>
                All traffic is HTTPS. Database access is scoped to the
                Supabase anon key from the browser, with RLS enforcing
                ownership server-side. We will publish a security disclosure
                policy at kora.studio/security before the public preview
                lifts.
              </p>
            </section>

            <section>
              <h2>Changes to this policy</h2>
              <p>
                We will post changes here, in the changelog, and (for
                material changes) by email. The "last updated" date at the
                top of this page is the source of truth.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions, data requests, or account deletion:{" "}
                <a
                  className="text-fg underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-accent"
                  href="mailto:privacy@kora.studio"
                >
                  privacy@kora.studio
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6 text-[12px] text-fg-subtle">
          <span>© {new Date().getFullYear()} Kora Studio</span>
          <Link href="/terms" className="hover:text-fg">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
