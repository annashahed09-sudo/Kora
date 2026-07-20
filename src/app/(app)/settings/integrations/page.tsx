import { PageHeader } from "@/components/ui/PageHeader";
import { DemoPill } from "@/components/ui/DemoPill";
import { Tag } from "@/components/ui/Tag";
import { listIntegrationInstances } from "@/lib/integrations";

export const metadata = { title: "Integrations" };

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "files", label: "Files" },
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
  { id: "communication", label: "Communication" },
];

export default function IntegrationsPage() {
  const providers = listIntegrationInstances();

  return (
    <>
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>
      <PageHeader
        eyebrow="Integrations"
        title={
          <>
            Bring the <span className="italic text-accent">tools</span> you already use.
          </>
        }
        body="Each connection is auditable, scoped, and revocable. Connect in v1.1 — the registry is wired."
      />

      {/* Category chips */}
      <div className="mt-10 flex flex-wrap items-center gap-1.5">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={[
              "inline-flex h-8 items-center rounded-full border px-3 text-[12px] transition-colors",
              i === 0
                ? "border-line-strong bg-bg-card text-fg"
                : "border-line bg-transparent text-fg-muted hover:border-line-strong hover:text-fg",
            ].join(" ")}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Provider grid */}
      <div className="mt-8 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
        {providers.map((p) => (
          <div key={p.id} className="flex flex-col gap-4 bg-bg p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="inline-flex size-9 items-center justify-center rounded-[8px] border border-line bg-bg-soft"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d={p.icon} stroke="#efe9df" strokeWidth="1.4" />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <h3 className="text-display text-[1.2rem] text-fg">{p.name}</h3>
                  <p className="text-[12px] text-fg-subtle">{p.category} · {p.capabilities.join(", ")}</p>
                </div>
              </div>
              <IntegrationStatusPill state={p.state} />
            </div>
            <p className="text-[13px] leading-relaxed text-fg-muted">
              {p.description}
            </p>
            <div className="mt-auto flex items-center justify-between">
              <span className="eyebrow">
                {p.state.status === "demo" ? p.state.note : (p.state as { status: string }).status}
              </span>
              <button className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg-soft px-3.5 text-[12.5px] text-fg transition-colors hover:border-line-strong hover:bg-bg-card">
                {p.state.status === "connected" ? "Manage" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function IntegrationStatusPill({ state }: { state: { status: string } }) {
  if (state.status === "connected") return <Tag label="Connected" variant="positive" />;
  if (state.status === "error") return <Tag label="Error" variant="warm" />;
  if (state.status === "disconnected") return <Tag label="Disconnected" variant="muted" />;
  return <Tag label="Demo" variant="muted" />;
}
