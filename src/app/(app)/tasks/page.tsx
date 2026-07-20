import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { DemoPill } from "@/components/ui/DemoPill";
import { DEMO_KANBAN } from "@/lib/demo/data";

export const metadata = { title: "Tasks" };

const COLUMNS = [
  { id: "backlog", title: "Backlog", glyph: "·" },
  { id: "in_progress", title: "In progress", glyph: "≡" },
  { id: "review", title: "Review", glyph: "◇" },
  { id: "done", title: "Done", glyph: "○" },
] as const;

/**
 * Tasks — Kanban board.
 *
 * Renders four columns from the demo-data kanban seed. v1.1 replaces this
 * with a live Supabase query over the polymorphic `items` table where
 * `type = 'task'`.
 */
export default function TasksPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>
      <PageHeader
        eyebrow="Tasks"
        title={
          <>
            <span className="italic text-accent">Kanban</span> for the week.
          </>
        }
        body="Drag, or stay still — either is fine. The status changes when the work does."
        actions={
          <>
            <button className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg-soft px-3.5 text-[12.5px] text-fg transition-colors hover:border-line-strong">
              + New task
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg-soft px-3.5 text-[12.5px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg">
              Filter
            </button>
          </>
        }
      />

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = DEMO_KANBAN[col.id] ?? [];
          return (
            <section
              key={col.id}
              className="flex flex-col gap-4 rounded-[12px] border border-line bg-bg-soft/40 p-4"
            >
              <header className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="font-mono text-[12px] text-accent">
                    {col.glyph}
                  </span>
                  <h2 className="text-[13px] font-medium text-fg">{col.title}</h2>
                </div>
                <span className="eyebrow">{items.length}</span>
              </header>
              <ol className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <li className="rounded-[10px] border border-dashed border-line bg-bg px-4 py-6 text-center text-[12px] text-fg-subtle">
                    Drop tasks here.
                  </li>
                ) : (
                  items.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-[10px] border border-line bg-bg p-4 transition-colors hover:border-line-strong"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Tag label={t.type} variant="muted" />
                        {t.dueAt ? (
                          <span className="text-[11px] text-fg-subtle">
                            {formatShort(t.dueAt)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-display text-[1.05rem] leading-snug text-fg">
                        {t.title}
                      </p>
                      {t.tags && t.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {t.tags.map((tg) => (
                            <Tag key={tg} label={tg} variant="muted" />
                          ))}
                        </div>
                      ) : null}
                    </li>
                  ))
                )}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="mt-16 grid grid-cols-12 gap-x-8">
        <div className="col-span-12 md:col-span-8">
          <SectionHeader
            eyebrow="Other views"
            title="More ways to see your work."
            description="Calendar, timeline, and table views are next."
          />
          <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
            {[
              { glyph: "▦", label: "Calendar" },
              { glyph: "≡", label: "Timeline" },
              { glyph: "▤", label: "Table" },
            ].map((v) => (
              <li key={v.label} className="bg-bg p-5 hover:bg-bg-soft">
                <span aria-hidden className="font-mono text-accent">{v.glyph}</span>
                <p className="text-display mt-3 text-[1.1rem] text-fg">{v.label}</p>
                <p className="mt-2 text-[11.5px] text-fg-subtle">Planned for v1.1</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 mt-10 md:col-span-4 md:mt-0">
          <SectionHeader eyebrow="Pulse" title="This week." />
          <div className="rounded-[12px] border border-line bg-bg-soft p-5">
            <p className="text-[12.5px] text-fg-muted">
              <span className="text-display text-[2.2rem] text-fg">5</span> tasks moving forward,
              <span className="text-display text-[2.2rem] text-fg"> 2</span> awaiting review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
