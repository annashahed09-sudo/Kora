import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata: Metadata = {
  title: "Changelog",
};

type Entry = {
  no: string;
  date: string;
  title: string;
  body: string;
  bullets: string[];
};

const ENTRIES: Entry[] = [
  {
    no: "No. 05",
    date: "2026-07-20",
    title: "v1.0 — production launch",
    body:
      "Kora is ready to deploy. Hardening pass: env validator, " +
      "rate limiting, AI guardrails, soft-delete substrate, share " +
      "expiry + revocation, segment-level Suspense fallbacks. " +
      "Production build clean across all 24 routes.",
    bullets: [
      "src/lib/env.ts — Zod-validated env with hard fail in production when public Supabase vars are missing",
      "src/lib/rate-limit.ts — sliding-window in-memory limiter; per-IP cap on auth (5/min signup, 10/min login), per-user caps on share mint, comments, canvas saves, project create / delete",
      "src/lib/ai/guardrails.ts — per-call token cap, prompt-injection scrub, $0.10 per-call cost ceiling, 200k token daily quota per user",
      "0004_soft_delete_and_share_expiry.sql — deleted_at columns + partial indexes; shares gains expires_at / revoked_at / created_by_ip / last_used_at; get_share_by_token gates on revocation + expiry",
      "Loading and Error boundaries for the root segment and the (app) segment; halftone-backdrop skeletons and quiet retry copy",
      "shareCreate now stamps expires_at (90 days) and validates the token character class; revokeShare added for the owner UI",
      ".env.example rewritten with deploy-on-Vercel instructions and a clear NEXT_PUBLIC_* / server-only boundary",
    ],
  },
  {
    no: "No. 04",
    date: "2026-07-20",
    title: "v2.0 — the editorial refinement",
    body:
      "Kora's ground shifts to pure black with warm cream highlights. " +
      "Halftone dot-matrix becomes the signature substrate, replacing the " +
      "prior navy radial glow. The wordmark gains a 9-dot halftone cluster " +
      "glyph that the rest of the surface can echo without compromise.",
    bullets: [
      "Pure-black ground (#000) with warm paper foreground (#f5f2ee)",
      "Warm cream italic accent (#efe9df) and single copper highlight (#c8b89a)",
      "Tailwind 4 @utility halftone and halftone-dense — quiet radial dot-matrix backdrops",
      "@utility transition-editorial — 380ms cubic-bezier(0.32, 0.72, 0, 1)",
      "Retired navy radial glow, gradient typography, and decorative pulse/breath motions",
      "BrandMark: 9-dot halftone cluster as the wordmark glyph",
      "Footer and knowledge-graph tile sit on the halftone backdrop; hero on halftone-dense",
    ],
  },
  {
    no: "No. 03",
    date: "2026-07-20",
    title: "v1.0 — the creative operating system",
    body:
      "Kora grows from a campaign workspace into a connected knowledge surface. " +
      "Eight new flagship surfaces, multi-tenant data model, abstractions for AI, " +
      "storage, and integrations — the foundation for a real platform.",
    bullets: [
      "Personal home (/home), inbox (/inbox), global search (/search)",
      "Tasks kanban (/tasks), calendar (/calendar), knowledge graph (/knowledge)",
      "Research hub (/research), media library (/media)",
      "Profile, settings shell with Appearance / Security / Integrations / Labs",
      "Multi-tenant schema: workspaces, folders, items, tags, mentions, notifications, AI artifacts, integrations",
      "Storage / AI / integrations abstractions — vendor lock-in is a one-file change",
      "Re-scoped agent.md permitting the broader surface",
    ],
  },
  {
    no: "No. 02",
    date: "2026-07-19",
    title: "Workspace · Brief → Concept → Delivery",
    body:
      "The first end-to-end workspace release. Auth, dashboard CRUD, " +
      "phase-aware project pages, debounced canvas persistence, structured " +
      "comments, and token-gated read-only share views.",
    bullets: [
      "Supabase auth + RLS hardened against cross-tenant reads",
      "tldraw canvas with debounced block persistence",
      "Comments with optimistic insertion",
      "Share links via SECURITY DEFINER RPC",
      "Privacy & Terms pages, premium editorial design system",
    ],
  },
  {
    no: "No. 01",
    date: "2026-07-12",
    title: "Public preview · landing",
    body:
      "Kora opens to the public. The landing captures the brand voice: " +
      "a quiet, structured workspace for PR and creative agencies. The " +
      "design system establishes a dark, editorial palette with a serif " +
      "display face and a hairline-led layout grammar.",
    bullets: [
      "Tailwind 4 @theme design tokens",
      "Geist Sans, Geist Mono, Newsreader",
      "Skip-link, accessibility-aware landmarks",
      "Hand-drawn SVG workspace composition",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header id="changelog" className="border-b border-line">
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
        <div className="mx-auto w-full max-w-[860px] px-6 pt-24 pb-32">
          <header className="flex flex-col gap-6">
            <p className="eyebrow">Changelog</p>
            <h1 className="text-display text-[clamp(2.4rem,5vw,3.6rem)] text-fg">
              What we <span className="italic text-accent">shipped</span>.
            </h1>
            <p className="max-w-[60ch] text-[14.5px] leading-relaxed text-fg-muted">
              Each entry below is a quiet acknowledgement of the work
              between releases. We name the work plainly.
            </p>
          </header>

          <hr className="my-14 h-divider border-0" />

          <ol className="flex flex-col gap-16">
            {ENTRIES.map((e) => (
              <li key={e.no} className="flex flex-col gap-5">
                <div className="flex items-baseline justify-between">
                  <p className="eyebrow">{e.no}</p>
                  <p className="eyebrow">{e.date}</p>
                </div>
                <h2 className="text-display text-[clamp(1.8rem,3.5vw,2.4rem)] text-fg">
                  {e.title}
                </h2>
                <p className="max-w-[64ch] text-[14.5px] leading-relaxed text-fg-muted">
                  {e.body}
                </p>
                <ul className="flex flex-col gap-2 pl-1">
                  {e.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-[13.5px] text-fg-muted"
                    >
                      <span
                        aria-hidden
                        className="mt-[7px] inline-block size-1.5 shrink-0 rounded-full bg-fg-subtle"
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
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
