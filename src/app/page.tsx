import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

/* ---------------------------------------------------------------------------
   Landing — server component. Composed locally so future client surfaces
   (auth, dashboard) can reuse <SiteHeader /> via a shared layout.
   --------------------------------------------------------------------------- */

export const metadata = {
  title: "A calm place to think together",
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <Pillars />
        <WorkspacePreview />
        <ClosingCTA />
      </main>
      <SiteFooter />
    </>
  );
}

/* ---------------------------------------------------------------- header -- */

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <BrandMark />
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {[
              { href: "/#workflow", label: "Workflow" },
              { href: "/#pricing", label: "Pricing" },
              { href: "/#changelog", label: "Changelog" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] text-fg-muted transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-[13px] text-fg-muted transition-colors hover:text-fg sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="group inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg-soft px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-line-strong hover:bg-bg-card"
          >
            Start a workspace
            <span
              aria-hidden
              className="inline-block translate-x-0 text-fg-muted transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ hero -- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-halftone-dense">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-12 gap-x-8 px-6 pt-24 pb-20 md:pt-36 md:pb-28">
        {/* Eyebrow + meta column */}
        <div className="col-span-12 mb-12 flex items-center justify-between md:col-span-12 md:mb-16">
          <p className="eyebrow animate-entry animate-entry-1">
            For PR & creative agencies
          </p>
          <p className="eyebrow hidden animate-entry animate-entry-1 md:block">
            No. 01 · Public preview
          </p>
        </div>

        {/* Display headline */}
        <h1 className="text-display col-span-12 animate-entry animate-entry-2 text-[clamp(3.4rem,8.5vw,7.5rem)] font-light text-fg md:col-span-11">
          A calm place
          <br />
          to{" "}
          <span className="italic text-accent">think</span>{" "}
          <span className="italic text-fg">together.</span>
        </h1>

        {/* Lead + CTAs */}
        <div className="col-span-12 mt-10 grid grid-cols-12 gap-x-8 md:mt-14">
          <p className="col-span-12 animate-entry animate-entry-3 max-w-[58ch] text-pretty text-[15.5px] leading-relaxed text-fg-muted md:col-span-6 md:col-start-7">
            Kora is a quiet, structured workspace for creative teams. Briefs,
            concepts, mockups, and final delivery live on one canvas — so the
            thinking stays connected all the way through.
          </p>

          <div className="col-span-12 mt-8 flex flex-wrap items-center gap-3 md:col-span-6 md:col-start-7 md:mt-10">
            <Link
              href="/signup"
              className="group inline-flex h-11 items-center gap-2 rounded-[10px] bg-fg px-5 text-[14px] font-medium text-bg transition-editorial hover:bg-accent"
            >
              Open a workspace
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <Link
              href="/#workflow"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line bg-transparent px-5 text-[14px] font-medium text-fg transition-editorial hover:border-navy-muted hover:bg-navy-soft"
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Hairline rule that introduces the next section */}
        <div className="col-span-12 mt-20">
          <div className="h-divider" />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- pillars -- */

function Pillars() {
  const items: Array<{
    index: string;
    title: string;
    body: string;
  }> = [
    {
      index: "01",
      title: "Brief",
      body: "Capture objectives, audiences, references, and constraints in one place. Every brief anchors the project that follows it.",
    },
    {
      index: "02",
      title: "Concept",
      body: "Sketch, paste, and write on the same infinite canvas. Comments land beside the work — never in a forgotten thread.",
    },
    {
      index: "03",
      title: "Delivery",
      body: "Lock the moments that matter. Share a read-only view with clients, and the polished work travels without the mess.",
    },
  ];

  return (
    <section id="workflow" className="border-t border-line">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-12 gap-x-8 px-6 py-24 md:py-32">
        <div className="col-span-12 mb-16 flex items-baseline justify-between md:col-span-12 md:mb-20">
          <p className="eyebrow">The workflow</p>
          <p className="eyebrow hidden md:block">Three phases — one canvas</p>
        </div>

        <h2 className="sr-only">The workflow</h2>

        <ol className="col-span-12 grid grid-cols-1 gap-px bg-line md:grid-cols-3">
          {items.map((p) => (
            <li
              key={p.index}
              className="bg-bg p-8 md:p-10 flex flex-col gap-6 transition-colors hover:bg-bg-soft"
            >
              <span
                aria-hidden="true"
                className="font-mono text-[11px] tracking-widest text-fg-subtle"
              >
                {p.index}
              </span>
              <h3 className="text-display text-[1.9rem] text-fg">{p.title}</h3>
              <p className="text-[14px] leading-relaxed text-fg-muted">
                {p.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- workspace preview -- */
/* Pure-SVG, static composition of a small window of the workspace — used in
   place of a hungrier client-side canvas until the authenticated surfaces
   are wired in the next slice. Renders instant, no JS, fully responsive. */

function WorkspacePreview() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-12 gap-x-8 px-6 py-24 md:py-32">
        <div className="col-span-12 mb-12 flex items-baseline justify-between md:col-span-12 md:mb-14">
          <p className="eyebrow">The workspace</p>
          <p className="eyebrow hidden md:block">A glimpse of the canvas</p>
        </div>

        <h2 className="sr-only">The workspace</h2>

        <div className="col-span-12 overflow-hidden rounded-[14px] border border-line bg-bg-soft shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
          <WorkspaceSvg />
        </div>

          <div className="col-span-12 mt-10 grid grid-cols-12 gap-x-8">
            <p className="col-span-12 max-w-[60ch] text-pretty text-[14.5px] leading-relaxed text-fg-muted md:col-span-5">
              A single canvas carries the brief, the concepts, and the
              delivery. Comments live next to the work. Sharing is one token —
              read-only, beautiful, and revocable.
            </p>
            <ul className="col-span-12 mt-6 grid grid-cols-1 gap-3 text-[13.5px] text-fg-muted md:col-span-6 md:col-start-7 md:mt-0">
              {[
                "Phase switcher — Brief, Concept, Delivery",
                "Infinite canvas with persisted blocks",
                "Comments anchored to the work",
                "Token-gated, read-only client view",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-[7px] inline-block size-1.5 shrink-0 rounded-full bg-fg-subtle"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
  );
}

function WorkspaceSvg() {
  return (
    <svg
      viewBox="0 0 1200 620"
      role="img"
      aria-label="A preview of the Kora workspace"
      className="block h-auto w-full"
    >
      <defs>
        <linearGradient id="kora-fade-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="1" />
        </linearGradient>
        <pattern
          id="kora-dot"
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="#1f1f1f" />
        </pattern>
      </defs>

      {/* canvas substrate */}
      <rect width="1200" height="620" fill="#0e0e0e" />
      <rect width="1200" height="620" fill="url(#kora-dot)" />

      {/* chrome top bar */}
      <rect x="0" y="0" width="1200" height="40" fill="#111111" />
      <rect x="0" y="40" width="1200" height="1" fill="#1f1f1f" />
      <circle cx="20" cy="20" r="5" fill="#27272a" />
      <circle cx="38" cy="20" r="5" fill="#27272a" />
      <circle cx="56" cy="20" r="5" fill="#27272a" />
      <rect x="84" y="12" width="120" height="16" rx="4" fill="#161616" />
      <text
        x="500"
        y="24"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans)"
        fontSize="11"
        fill="#a1a1aa"
        letterSpacing="0.6"
      >
        acme · launch brief
      </text>
      <rect x="1080" y="10" width="100" height="20" rx="6" fill="#161616" />
      <text
        x="1130"
        y="24"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans)"
        fontSize="10"
        fill="#a1a1aa"
      >
        Share
      </text>

      {/* left rail */}
      <rect x="0" y="40" width="160" height="580" fill="#0c0c0c" />
      <rect x="160" y="40" width="1" height="580" fill="#1f1f1f" />
      <g fontFamily="var(--font-geist-sans)" fontSize="11" fill="#71717a">
        <text x="20" y="76">WORKSPACE</text>
        <text x="20" y="116" fill="#f5f2ee">
          acme · launch brief
        </text>
        <text x="20" y="146">beta · prototype</text>
        <text x="20" y="176">delta · q3</text>
        <text x="20" y="226" letterSpacing="0.5">
          PHASES
        </text>
      </g>
      <g>
        <rect x="20" y="240" width="120" height="28" rx="6" fill="#161616" />
        <circle cx="34" cy="254" r="3" fill="#f5f2ee" />
        <text
          x="46"
          y="258"
          fontFamily="var(--font-geist-sans)"
          fontSize="11"
          fill="#f5f2ee"
        >
          Brief
        </text>

        <rect x="20" y="276" width="120" height="28" rx="6" fill="#0c0c0c" />
        <circle cx="34" cy="290" r="3" fill="#71717a" />
        <text
          x="46"
          y="294"
          fontFamily="var(--font-geist-sans)"
          fontSize="11"
          fill="#a1a1aa"
        >
          Concept
        </text>

        <rect x="20" y="312" width="120" height="28" rx="6" fill="#0c0c0c" />
        <circle cx="34" cy="326" r="3" fill="#71717a" />
        <text
          x="46"
          y="330"
          fontFamily="var(--font-geist-sans)"
          fontSize="11"
          fill="#a1a1aa"
        >
          Delivery
        </text>
      </g>

      {/* canvas content: 3 blocks */}
      {/* block 1 — brief */}
      <g transform="translate(220,90)">
        <rect width="320" height="180" rx="10" fill="#121212" stroke="#1f1f1f" />
        <text
          x="20"
          y="34"
          fontFamily="var(--font-geist-sans)"
          fontSize="9"
          fill="#71717a"
          letterSpacing="2"
        >
          BRIEF · 01
        </text>
        <text
          x="20"
          y="68"
          fontFamily="var(--font-newsreader)"
          fontSize="22"
          fill="#f5f2ee"
          fontStyle="italic"
        >
          Launch positioning
        </text>
        <line
          x1="20"
          y1="92"
          x2="300"
          y2="92"
          stroke="#1f1f1f"
        />
        <g fontFamily="var(--font-geist-sans)" fontSize="11" fill="#a1a1aa">
          <text x="20" y="116">Audience · founders & CTOs</text>
          <text x="20" y="136">Channels · site, niche press</text>
          <text x="20" y="156">Window · Q3 launch</text>
        </g>
      </g>

      {/* block 2 — references */}
      <g transform="translate(580,90)">
        <rect width="320" height="220" rx="10" fill="#121212" stroke="#1f1f1f" />
        <text
          x="20"
          y="34"
          fontFamily="var(--font-geist-sans)"
          fontSize="9"
          fill="#71717a"
          letterSpacing="2"
        >
          REFERENCE
        </text>
        <line
          x1="20"
          y1="58"
          x2="300"
          y2="58"
          stroke="#1f1f1f"
        />
        <g>
          <rect x="20" y="74" width="80" height="56" rx="6" fill="#0a0a0a" stroke="#1f1f1f" />
          <rect x="120" y="74" width="80" height="56" rx="6" fill="#0a0a0a" stroke="#1f1f1f" />
          <rect x="220" y="74" width="80" height="56" rx="6" fill="#0a0a0a" stroke="#1f1f1f" />
          <rect x="20" y="146" width="80" height="56" rx="6" fill="#0a0a0a" stroke="#1f1f1f" />
          <rect x="120" y="146" width="80" height="56" rx="6" fill="#0a0a0a" stroke="#1f1f1f" />
          <rect x="220" y="146" width="80" height="56" rx="6" fill="#0a0a0a" stroke="#1f1f1f" />
        </g>
      </g>

      {/* block 3 — notes */}
      <g transform="translate(220,300)">
        <rect width="320" height="240" rx="10" fill="#121212" stroke="#1f1f1f" />
        <text
          x="20"
          y="34"
          fontFamily="var(--font-geist-sans)"
          fontSize="9"
          fill="#71717a"
          letterSpacing="2"
        >
          NOTES
        </text>
        <line
          x1="20"
          y1="58"
          x2="300"
          y2="58"
          stroke="#1f1f1f"
        />
        <g fontFamily="var(--font-geist-mono)" fontSize="12" fill="#a1a1aa">
          <text x="20" y="84">— tone: calm, plain-spoken</text>
          <text x="20" y="106">— avoid jargon</text>
          <text x="20" y="128">— first 5 words matter most</text>
          <text x="20" y="150">— proof &gt; promise</text>
          <text x="20" y="172">— leave room to surprise</text>
        </g>
        <line x1="20" y1="194" x2="300" y2="194" stroke="#1f1f1f" />
        <text
          x="20"
          y="216"
          fontFamily="var(--font-geist-sans)"
          fontSize="10"
          fill="#71717a"
        >
          + 2 comments
        </text>
      </g>

      {/* block 4 — comment thread */}
      <g transform="translate(580,340)">
        <rect width="320" height="200" rx="10" fill="#121212" stroke="#1f1f1f" />
        <text
          x="20"
          y="34"
          fontFamily="var(--font-geist-sans)"
          fontSize="9"
          fill="#71717a"
          letterSpacing="2"
        >
          COMMENT · 02
        </text>
        <text
          x="20"
          y="62"
          fontFamily="var(--font-newsreader)"
          fontSize="18"
          fill="#f5f2ee"
          fontStyle="italic"
        >
          Maybe simpler?
        </text>
        <line x1="20" y1="84" x2="300" y2="84" stroke="#1f1f1f" />
        <text
          x="20"
          y="108"
          fontFamily="var(--font-geist-sans)"
          fontSize="11"
          fill="#a1a1aa"
        >
          The first three lines all say the same
        </text>
        <text
          x="20"
          y="124"
          fontFamily="var(--font-geist-sans)"
          fontSize="11"
          fill="#a1a1aa"
        >
          thing in different words. Could we cut
        </text>
        <text
          x="20"
          y="140"
          fontFamily="var(--font-geist-sans)"
          fontSize="11"
          fill="#a1a1aa"
        >
          two of them and keep one sharp line?
        </text>
        <text
          x="20"
          y="172"
          fontFamily="var(--font-geist-sans)"
          fontSize="10"
          fill="#71717a"
        >
          jules · just now
        </text>
      </g>

      {/* fade right edge to suggest an infinite canvas */}
      <rect x="1100" y="40" width="100" height="580" fill="url(#kora-fade-r)" />
    </svg>
  );
}

/* -------------------------------------------------------------- closing -- */

function ClosingCTA() {
  return (
    <section id="pricing" className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-10 px-6 py-28 md:py-36">
        <div className="flex items-center gap-6">
          <p className="eyebrow">Begin</p>
          <span aria-hidden className="h-px w-12 bg-line" />
          <p className="eyebrow">No. 02</p>
        </div>
        <h2 className="text-display max-w-[20ch] text-[clamp(2.4rem,5.5vw,4.5rem)] text-fg">
          It is a privilege to{" "}
          <span className="italic text-accent">think</span> clearly. Begin.
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="group inline-flex h-11 items-center gap-2 rounded-[10px] bg-fg px-5 text-[14px] font-medium text-bg transition-colors hover:bg-accent"
          >
            Create your workspace
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-line bg-transparent px-5 text-[14px] font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            I already have one
          </Link>
        </div>
        <p className="max-w-[48ch] text-[13.5px] leading-relaxed text-fg-subtle">
          Public preview — no payment required for the first 30 days.
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- footer -- */

function SiteFooter() {
  return (
    <footer className="border-t border-line bg-halftone">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <BrandMark variant="mark" />
          <p className="text-[12px] text-fg-subtle">
            © {new Date().getFullYear()} Kora Studio
          </p>
        </div>
        <div className="flex items-center gap-5 text-[12px] text-fg-subtle">
          <Link href="/changelog" className="transition-colors hover:text-fg">
            Changelog
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-fg">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-fg">
            Terms
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-line bg-bg-soft px-2.5 py-1 md:inline-flex">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-accent"
            />
            Public preview
          </span>
        </div>
      </div>
    </footer>
  );
}
