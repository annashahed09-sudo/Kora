import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ItemCard } from "@/components/ui/ItemCard";
import { Tag } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { DemoPill } from "@/components/ui/DemoPill";
import {
  DEMO_PROJECTS,
  DEMO_ITEMS,
  DEMO_AI_ARTIFACTS,
  DEMO_CALENDAR_ENTRIES,
} from "@/lib/demo/data";

export const metadata = { title: "Home" };

const QUICK_ACTIONS = [
  { glyph: "·", label: "New note", href: "/dashboard" },
  { glyph: "≡", label: "New task", href: "/tasks" },
  { glyph: "◇", label: "New project", href: "/dashboard" },
  { glyph: "✦", label: "Ask Kora", href: "/search" },
];

/**
 * Personal home — the user's daily overview surface.
 *
 * Composition (top-down):
 *   - PageHeader greeting + Day card
 *   - Quick actions row (workspace-wide shortcuts)
 *   - Recent projects grid
 *   - AI suggestions strip
 *   - "Continue where you left off" with the most-recently-updated item
 *
 * All sections render from demo data so the surface feels complete in
 * v1.0. Swap to live Supabase queries in v1.1.
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>

      <PageHeader
        eyebrow={`Today · ${todayLabel()}`}
        title={
          <>
            The canvas is{" "}
            <span className="italic text-accent">quiet.</span>
            <br />
            Awaken a new thought.
          </>
        }
        body="A small, careful workspace. Pick up where you left off, or start something entirely new."
        actions={
          <>
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="group inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-bg-soft px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-line-strong hover:bg-bg-card"
              >
                <span aria-hidden className="font-mono text-accent">
                  {a.glyph}
                </span>
                {a.label}
              </Link>
            ))}
          </>
        }
      />

      {/* Today + AI suggestions */}
      <div className="mt-16 grid grid-cols-12 gap-x-8">
        <section className="col-span-12 md:col-span-7">
          <SectionHeader
            eyebrow="Today"
            title="What is on your plate."
            description="Meetings, deadlines, and the loose thread from yesterday."
          />
          <ol className="flex flex-col gap-px border border-line bg-line">
            {DEMO_CALENDAR_ENTRIES.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 bg-bg px-5 py-4 transition-colors hover:bg-bg-soft"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[11.5px] text-fg-subtle">
                    {formatHour(e.at)}
                  </span>
                  <span className="text-[14px] text-fg">{e.title}</span>
                </div>
                <Tag label={e.kind} variant={e.kind === "deadline" ? "warm" : "muted"} />
              </li>
            ))}
          </ol>
        </section>

        <section className="col-span-12 mt-16 md:col-span-5 md:mt-0">
          <SectionHeader
            eyebrow="Today"
            title="From the workspace."
            description="Quiet suggestions — three moments worth a glance."
          />
          <div className="flex flex-col gap-3">
            {DEMO_AI_ARTIFACTS.slice(0, 3).map((a) => (
              <Link
                key={a.id}
                href="/knowledge"
                className="group flex flex-col gap-2 rounded-[12px] border border-line bg-bg-soft p-5 transition-colors hover:border-line-strong"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-[11.5px] text-fg-muted">
                    <span aria-hidden className="font-mono text-accent">✦</span>
                    {a.kind}
                  </span>
                  <span className="text-[11.5px] text-fg-subtle">
                    {formatMinutes(a.createdAt)}
                  </span>
                </div>
                <p className="text-display text-[1.2rem] text-fg">{a.title}</p>
                <p className="text-[12.5px] leading-relaxed text-fg-muted line-clamp-3">
                  {a.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Recent projects */}
      <div className="mt-20 grid grid-cols-12 gap-x-8">
        <section className="col-span-12">
          <SectionHeader
            eyebrow="Recent work"
            title="Projects you've shaped."
            actions={
              <Link
                href="/dashboard"
                className="text-[13px] text-fg-muted transition-colors hover:text-fg"
              >
                All projects →
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_PROJECTS.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href="/dashboard"
                className="group flex flex-col gap-5 bg-bg p-6 transition-colors hover:bg-bg-soft"
              >
                <div className="flex items-center justify-between">
                  <Tag label={p.phase} variant={p.phase === "Delivery" ? "positive" : "muted"} />
                  <span className="text-[11.5px] text-fg-subtle">
                    {formatHours(p.updatedAt)}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-display text-[1.5rem] leading-tight text-fg">
                    {p.title}
                  </h3>
                  <p className="text-[12.5px] text-fg-muted">{p.client_name}</p>
                </div>
                <div className="mt-auto flex items-center -space-x-1.5">
                  {p.collaborators.map((c) => (
                    <span
                      key={c.initials}
                      title={c.initials}
                      style={{ background: c.color, color: "#0a0a0a" }}
                      className="inline-flex size-6 items-center justify-center rounded-full text-[10px] font-medium ring-2 ring-bg"
                    >
                      {c.initials}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Continue where you left off */}
      <div className="mt-20 grid grid-cols-12 gap-x-8">
        <section className="col-span-12">
          <SectionHeader
            eyebrow="Continue"
            title="The next loose thread."
          />
          <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
            {DEMO_ITEMS.slice(0, 4).map((i) => (
              <Link
                key={i.id}
                href="/dashboard"
                className="block bg-bg"
              >
                <ItemCard
                  item={{
                    id: i.id,
                    type: i.type,
                    title: i.title,
                    preview: i.preview,
                    status: i.status,
                    dueAt: i.dueAt,
                    tags: i.tags,
                    updatedAt: i.updatedAt,
                  }}
                />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Workspace recommendations */}
      <div className="mt-20 grid grid-cols-12 gap-x-8">
        <section className="col-span-12 md:col-span-6">
          <div className="rounded-[14px] border border-line bg-bg-soft p-7">
            <p className="eyebrow">Tip</p>
            <h3 className="text-display mt-3 text-[1.5rem] text-fg">
              Press <span className="italic text-accent">⌘K</span> from anywhere.
            </h3>
            <p className="mt-3 text-[13.5px] leading-relaxed text-fg-muted">
              Search projects, jump to a phase, or summon the AI assistant. The
              command palette carries you through the whole workspace.
            </p>
            <div className="mt-5">
              <Link
                href="/search"
                className="text-[13px] text-fg underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-accent"
              >
                Try it
              </Link>
            </div>
          </div>
        </section>
        <section className="col-span-12 md:col-span-6">
          <div className="rounded-[14px] border border-line bg-bg-soft p-7">
            <p className="eyebrow">Updates</p>
            <h3 className="text-display mt-3 text-[1.5rem] text-fg">
              Workspace pulse.
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-[13.5px] leading-relaxed text-fg-muted">
                Three pending comments. Two new mentions. One draft ready to ship.
              </p>
              <Avatar label="AN" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function todayLabel(): string {
  // Hour-resolving greetings would hydration-mismatch across hour
  // boundaries. The eyebrow above resolves to this static label only —
  // dial the greeting client-side in v1.0.1 if needed.
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatMinutes(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 60) return `${diffMin} min ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} hr ago`;
  const days = Math.floor(h / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatHours(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)} hr`;
  if (diff < 86_400 * 7) {
    const days = Math.floor(diff / 86_400);
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
