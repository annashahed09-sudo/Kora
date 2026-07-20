import { PageHeader } from "@/components/ui/PageHeader";
import { DemoPill } from "@/components/ui/DemoPill";
import { Tag } from "@/components/ui/Tag";

export const metadata = { title: "Appearance" };

const THEMES = [
  { id: "dark", label: "Dark · paper on ink", desc: "Default · editorial · premium" },
  { id: "paper", label: "Paper sepia", desc: "Vintage editorial · warm" },
  { id: "mint", label: "Light mint", desc: "Daylight · small contrast" },
];

const ACCENTS = ["#efe9df", "#9bc1a4", "#c8b89a", "#a1a1aa"];

export default function AppearancePage() {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>
      <PageHeader
        eyebrow="Appearance"
        title={
          <>
            Make <span className="italic text-accent">Kora</span> yours.
          </>
        }
        body="Themes, accents, density, and the second font that gives every page its rhythm."
      />

      {/* Theme */}
      <div className="mt-10">
        <p className="eyebrow mb-3">Theme</p>
        <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {THEMES.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className="flex flex-col items-start gap-2 bg-bg p-5 text-left transition-colors hover:bg-bg-soft"
            >
              <div className="flex items-center justify-between self-stretch">
                <span className="text-[13.5px] font-medium text-fg">{t.label}</span>
                {i === 0 ? <Tag label="Active" variant="positive" /> : null}
              </div>
              <span className="text-[12px] text-fg-subtle">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accent */}
      <div className="mt-12">
        <p className="eyebrow mb-3">Accent</p>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((c, i) => (
            <button
              key={c}
              className={[
                "flex h-12 w-12 items-center justify-center rounded-[10px] border",
                i === 0 ? "border-line-strong" : "border-line",
              ].join(" ")}
              style={{ background: c }}
              aria-label={`Accent ${c}`}
            >
              {i === 0 ? (
                <span className="text-[10px] font-medium text-bg">·</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className="mt-12">
        <p className="eyebrow mb-3">Density</p>
        <div className="flex items-center gap-2">
          {(["Comfortable", "Compact", "Roomy"] as const).map((d, i) => (
            <button
              key={d}
              type="button"
              className={[
                "inline-flex h-9 items-center rounded-[8px] border px-3.5 text-[12.5px] transition-colors",
                i === 0
                  ? "border-line-strong bg-bg-card text-fg"
                  : "border-line bg-bg text-fg-muted hover:border-line-strong hover:text-fg",
              ].join(" ")}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Font pairing */}
      <div className="mt-12">
        <p className="eyebrow mb-3">Type</p>
        <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
          {[
            { name: "Geist + Newsreader", desc: "Default · reads as a journal" },
            { name: "Inter + Source Serif", desc: "Modern · reads as a product" },
          ].map((f, i) => (
            <div key={f.name} className="bg-bg p-5">
              <p className="text-display text-[1.4rem] text-fg">{f.name}</p>
              <p className="mt-2 text-[12.5px] text-fg-muted">{f.desc}</p>
              {i === 0 ? <Tag label="Active" variant="positive" /> : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
