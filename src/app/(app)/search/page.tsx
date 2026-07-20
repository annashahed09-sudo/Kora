import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ItemCard } from "@/components/ui/ItemCard";
import { DemoPill } from "@/components/ui/DemoPill";
import { DEMO_PROJECTS, DEMO_ITEMS, DEMO_AI_ARTIFACTS } from "@/lib/demo/data";
import { KbdHint } from "@/components/ui/KbdHint";

export const metadata = { title: "Search" };

const RECENT = ["launch positioning", "swot helio", "founder essay"];
const QUICK_PALETTE = [
  { glyph: "◇", label: "Go to Projects", href: "/dashboard" },
  { glyph: "✦", label: "Ask Kora", href: "/knowledge" },
  { glyph: "≡", label: "Open Tasks", href: "/tasks" },
];

/**
 * Global search — instant results over projects, items, and AI artifacts.
 *
 * Server component reads `?q=`. Filters results by case-insensitive
 * substring match. v1.1 will move to a real full-text + semantic search
 * via Postgres / pgvector.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const projectsMatch = DEMO_PROJECTS.filter(
    (p) =>
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.client_name.toLowerCase().includes(query)
  );
  const itemsMatch = DEMO_ITEMS.filter(
    (i) =>
      !query ||
      i.title.toLowerCase().includes(query) ||
      (i.preview ?? "").toLowerCase().includes(query)
  );
  const aiMatch = DEMO_AI_ARTIFACTS.filter(
    (a) =>
      !query ||
      a.title.toLowerCase().includes(query) ||
      a.excerpt.toLowerCase().includes(query)
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>

      <PageHeader
        eyebrow="Search"
        title={
          <>
            Find anything in <span className="italic text-accent">Kora</span>.
          </>
        }
        body="Projects, items, files, and AI artifacts — one search across the workspace."
      />

      {/* Search input */}
      <form
        action="/search"
        method="GET"
        className="mx-auto mt-12 flex w-full max-w-[720px] items-center gap-3 rounded-[14px] border border-line-strong bg-bg-soft px-5 py-4"
      >
        <span aria-hidden className="text-[20px] text-fg-subtle">⌕</span>
        <input
          name="q"
          defaultValue={q ?? ""}
          autoFocus
          placeholder="Search the workspace…"
          className="flex-1 border-0 bg-transparent text-[18px] text-fg placeholder:text-fg-subtle focus:outline-none"
        />
        <KbdHint keys={["⌘", "K"]} />
      </form>

      {/* Recent + palette */}
      {!query && (
        <div className="mt-12 grid grid-cols-12 gap-x-8">
          <div className="col-span-12 md:col-span-6">
            <p className="eyebrow mb-3">Recent searches</p>
            <div className="flex flex-wrap items-center gap-2">
              {RECENT.map((r) => (
                <Link
                  key={r}
                  href={`/search?q=${encodeURIComponent(r)}`}
                  className="inline-flex h-8 items-center rounded-full border border-line bg-bg-soft px-3 text-[12px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  {r}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-12 mt-8 md:col-span-6 md:mt-0">
            <p className="eyebrow mb-3">Command palette</p>
            <ol className="flex flex-col gap-1">
              {QUICK_PALETTE.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="group flex items-center gap-3 rounded-[7px] px-3 py-2 text-[13px] text-fg-muted transition-colors hover:bg-bg-soft hover:text-fg"
                  >
                    <span aria-hidden className="font-mono text-accent">{p.glyph}</span>
                    {p.label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div className="mt-14 flex flex-col gap-14">
          {projectsMatch.length > 0 ? (
            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <p className="eyebrow">Projects</p>
                <p className="eyebrow">{projectsMatch.length} hit{projectsMatch.length === 1 ? "" : "s"}</p>
              </div>
              <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
                {projectsMatch.map((p) => (
                  <li key={p.id} className="bg-bg">
                    <Link href="/dashboard" className="block p-5 hover:bg-bg-soft">
                      <p className="eyebrow">{p.client_name}</p>
                      <p className="text-display mt-2 text-[1.3rem] text-fg">{p.title}</p>
                      <p className="mt-3 text-[11.5px] text-fg-subtle">
                        Phase {p.phase}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {itemsMatch.length > 0 ? (
            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <p className="eyebrow">Items</p>
                <p className="eyebrow">{itemsMatch.length} hit{itemsMatch.length === 1 ? "" : "s"}</p>
              </div>
              <ul className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
                {itemsMatch.map((i) => (
                  <li key={i.id} className="bg-bg">
                    <ItemCard
                      item={{
                        id: i.id,
                        type: i.type,
                        title: i.title,
                        preview: i.preview,
                        dueAt: i.dueAt,
                        tags: i.tags,
                        updatedAt: i.updatedAt,
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {aiMatch.length > 0 ? (
            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <p className="eyebrow">AI artifacts</p>
                <p className="eyebrow">{aiMatch.length} hit{aiMatch.length === 1 ? "" : "s"}</p>
              </div>
              <ul className="flex flex-col gap-px border border-line bg-line">
                {aiMatch.map((a) => (
                  <li key={a.id} className="bg-bg p-5 hover:bg-bg-soft">
                    <p className="eyebrow">{a.kind} · {a.model}</p>
                    <p className="text-display mt-2 text-[1.2rem] text-fg">{a.title}</p>
                    <p className="mt-3 text-[12.5px] leading-relaxed text-fg-muted line-clamp-2">
                      {a.excerpt}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {projectsMatch.length + itemsMatch.length + aiMatch.length === 0 ? (
            <p className="text-center text-[14.5px] text-fg-muted">
              Nothing matches "{query}". Try a shorter query, or browse the{" "}
              <Link href="/dashboard" className="text-fg underline decoration-line decoration-1 underline-offset-4 hover:text-accent">
                projects
              </Link>.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
