import { PageHeader } from "@/components/ui/PageHeader";
import { Tag } from "@/components/ui/Tag";
import { DemoPill } from "@/components/ui/DemoPill";
import { DEMO_CALENDAR_ENTRIES } from "@/lib/demo/data";

export const metadata = { title: "Calendar" };

/**
 * Calendar — month grid.
 *
 * Server-rendered grid of the current month with demo entries seeded on
 * specific cells. v1.1 replaces the demo source with a Supabase items +
 * events query.
 */
export default function CalendarPage() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lead = firstOfMonth.getDay();             // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: number | null; inMonth: boolean; isToday: boolean }> = [];

  for (let i = 0; i < lead; i++) cells.push({ date: null, inMonth: false, isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: d, inMonth: true, isToday: d === today.getDate() });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, inMonth: false, isToday: false });

  const monthLabel = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  // Two-letter weekday headers. Single-letter ("S", "M", "T") read as
  // stray characters next to a date grid; the longer abbreviation keeps
  // each column legible without crowding.
  const weekdayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>

      <PageHeader
        eyebrow="Calendar"
        title={
          <>
            <span className="italic text-accent">{monthLabel}</span>.
          </>
        }
        body="Deadlines, meetings, focus blocks. Time is part of the workspace."
      />

      <div className="mt-12 grid grid-cols-12 gap-x-8">
        <section className="col-span-12 md:col-span-9">
          <div className="grid grid-cols-7 border border-line bg-line">
            {weekdayHeaders.map((w, i) => (
              <div key={`${w}-${i}`} className="bg-bg-soft p-3 text-center">
                <span className="eyebrow">{w}</span>
              </div>
            ))}
            {cells.map((c, idx) => {
              const entries = c.date
                ? DEMO_CALENDAR_ENTRIES.filter((e) => sameDay(e.at, today, c.date!))
                : [];
              return (
                <div
                  key={idx}
                  className={[
                    "min-h-[88px] bg-bg p-2.5",
                    c.isToday ? "ring-1 ring-inset ring-line-strong" : "",
                  ].join(" ")}
                >
                  {c.date ? (
                    <>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span
                          className={[
                            "font-mono text-[11.5px]",
                            c.isToday ? "text-accent" : "text-fg-subtle",
                          ].join(" ")}
                        >
                          {c.date}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1">
                        {entries.map((e) => (
                          <li
                            key={e.id}
                            className="rounded-[4px] border-l-2 border-accent/70 bg-bg-card px-1.5 py-0.5 text-[10.5px] text-fg"
                          >
                            <span className="line-clamp-1">{e.title}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="col-span-12 mt-12 md:col-span-3 md:mt-0">
          <p className="eyebrow mb-4">Upcoming</p>
          <ol className="flex flex-col gap-px border border-line bg-line">
            {DEMO_CALENDAR_ENTRIES.map((e) => (
              <li key={e.id} className="bg-bg p-4">
                <p className="text-[13px] text-fg">{e.title}</p>
                <p className="mt-1 text-[11px] text-fg-subtle">
                  {new Date(e.at).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
                <div className="mt-2">
                  <Tag label={e.kind} variant={e.kind === "deadline" ? "warm" : "muted"} />
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function sameDay(iso: string, anchor: Date, day: number): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === anchor.getFullYear() &&
    d.getMonth() === anchor.getMonth() &&
    d.getDate() === day
  );
}
