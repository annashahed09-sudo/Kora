import { PageHeader } from "@/components/ui/PageHeader";
import { DemoPill } from "@/components/ui/DemoPill";
import { Tag } from "@/components/ui/Tag";

export const metadata = { title: "Settings" };

const GENERAL_FIELDS = [
  { label: "Workspace name", value: "Studio" },
  { label: "URL", value: "kora.studio/studio" },
  { label: "Default phase", value: "Brief" },
  { label: "Time zone", value: "Europe/Lisbon" },
];

export default function SettingsGeneralPage() {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>
      <PageHeader
        eyebrow="General"
        title={
          <>
            <span className="italic text-accent">Workspace</span> settings.
          </>
        }
        body="The basics — identity, defaults, and dangerous actions."
      />
      <ol className="mt-10 flex flex-col gap-px border border-line bg-line">
        {GENERAL_FIELDS.map((f) => (
          <li
            key={f.label}
            className="flex items-center justify-between bg-bg px-5 py-4"
          >
            <span className="text-[13px] text-fg-muted">{f.label}</span>
            <span className="text-[13px] text-fg">{f.value}</span>
          </li>
        ))}
      </ol>
      <div className="mt-10 rounded-[12px] border border-line bg-bg-soft p-5">
        <p className="eyebrow mb-2">Notifications</p>
        <div className="flex flex-col gap-3">
          {[
            { label: "Mentions", on: true },
            { label: "Comments", on: true },
            { label: "System updates", on: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <span className="text-[13.5px] text-fg">{n.label}</span>
              <Tag label={n.on ? "On" : "Off"} variant={n.on ? "positive" : "muted"} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-[12px] border border-line-strong bg-bg-soft p-6">
        <p className="eyebrow mb-1 text-[#c8b89a]">Danger zone</p>
        <h3 className="text-display text-[1.3rem] text-fg">Delete this workspace</h3>
        <p className="mt-3 text-[13px] leading-relaxed text-fg-muted">
          Removes all projects, blocks, comments, and shares. Cannot be undone.
        </p>
        <button className="mt-5 inline-flex h-9 items-center gap-2 rounded-[8px] border border-line-strong px-3.5 text-[12.5px] text-fg transition-colors hover:bg-bg-card">
          Delete workspace…
        </button>
      </div>
    </>
  );
}
