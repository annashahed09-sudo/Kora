import { DemoPill } from "@/components/ui/DemoPill";
import { Avatar } from "@/components/ui/Avatar";
import { Tag } from "@/components/ui/Tag";
import { DEMO_PROJECTS } from "@/lib/demo/data";

export const metadata = { title: "Profile" };

const SKILLS = ["Writing", "Strategy", "Design", "Research", "Operations"];
const ACTIVITY = [
  { at: "12 min ago", text: "Pinned Launch positioning." },
  { at: "2 hr ago", text: "Commented on a 'Beta brief'." },
  { at: "1 day ago", text: "Asked Kora for a SWOT on Helio Q3." },
  { at: "3 days ago", text: "Imported 14 bookmarks into Research." },
];

/**
 * Profile — public-facing user surface.
 */
export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[1000px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>

      <header className="flex flex-col gap-6">
        <div className="flex items-start gap-6">
          <Avatar label="AN" size={64} />
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Public profile</p>
            <h1 className="text-display text-[clamp(2.2rem,4.5vw,3rem)] text-fg">
              <span className="italic text-accent">Ana</span>
            </h1>
            <p className="text-[13.5px] text-fg-muted">
              Studio lead · Strategy · Writing · Tiny details that compound.
            </p>
          </div>
        </div>

        <p className="max-w-[60ch] text-[14.5px] leading-relaxed text-fg-muted">
          Ana writes the things that hold the room together. Founding team of
          Kora, formerly editor at a longform press, currently inside the
          brief→concept→delivery loop.
        </p>

        <div className="flex flex-wrap gap-2">
          {SKILLS.map((s) => (
            <Tag key={s} label={s} variant="muted" />
          ))}
        </div>
      </header>

      <hr className="my-12 h-divider border-0" />

      <div className="grid grid-cols-12 gap-x-8">
        <section className="col-span-12 md:col-span-7">
          <p className="eyebrow mb-4">Activity</p>
          <ol className="flex flex-col gap-px border border-line bg-line">
            {ACTIVITY.map((a, idx) => (
              <li key={idx} className="flex items-center justify-between bg-bg px-4 py-3">
                <span className="text-[13.5px] text-fg">{a.text}</span>
                <span className="text-[11.5px] text-fg-subtle">{a.at}</span>
              </li>
            ))}
          </ol>
        </section>
        <aside className="col-span-12 mt-10 md:col-span-5 md:mt-0">
          <p className="eyebrow mb-4">Pinned projects</p>
          <ul className="flex flex-col gap-px border border-line bg-line">
            {DEMO_PROJECTS.slice(0, 3).map((p) => (
              <li key={p.id} className="bg-bg p-4 hover:bg-bg-soft">
                <p className="text-display text-[1.1rem] text-fg">{p.title}</p>
                <p className="text-[12px] text-fg-muted">{p.client_name}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-[12px] border border-line bg-bg-soft p-5">
            <p className="eyebrow">Workspace</p>
            <p className="text-display mt-2 text-[1.4rem] text-fg">
              4 projects
            </p>
            <p className="mt-2 text-[12.5px] text-fg-muted">
              All in active rotation · shared with 3 collaborators.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
