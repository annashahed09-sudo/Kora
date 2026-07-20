import { PageHeader } from "@/components/ui/PageHeader";
import { DemoPill } from "@/components/ui/DemoPill";
import { Tag } from "@/components/ui/Tag";

export const metadata = { title: "Labs" };

const FLAGS = [
  {
    id: "copresence",
    label: "Co-presence cursors",
    desc: "See collaborators on the canvas in real time.",
    on: false,
    status: "alpha",
  },
  {
    id: "ai-mindmap",
    label: "AI auto-maps the canvas",
    desc: "Generate a mind map of the current project.",
    on: true,
    status: "beta",
  },
  {
    id: "voice-comments",
    label: "Verbal comments",
    desc: "Leave a voice note next to a block.",
    on: false,
    status: "alpha",
  },
  {
    id: "calendar-sync",
    label: "Two-way calendar sync",
    desc: "Push workspace events into your calendar and back.",
    on: false,
    status: "beta",
  },
];

export default function LabsPage() {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>
      <PageHeader
        eyebrow="Labs"
        title={
          <>
            <span className="italic text-accent">Experimental</span>, on the edge of the product.
          </>
        }
        body="Features that are sharp but not stable. We collect signal before we commit."
      />

      <ol className="mt-10 flex flex-col gap-px border border-line bg-line">
        {FLAGS.map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-6 bg-bg px-5 py-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-medium text-fg">{f.label}</h3>
                <Tag
                  label={f.status}
                  variant={f.status === "beta" ? "warm" : "muted"}
                />
              </div>
              <p className="text-[12.5px] leading-relaxed text-fg-muted">
                {f.desc}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={f.on}
              className={[
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
                f.on
                  ? "border-line-strong bg-bg-card"
                  : "border-line bg-bg",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "absolute size-4 rounded-full transition-transform",
                  f.on ? "translate-x-6 bg-accent" : "translate-x-1 bg-fg-faint",
                ].join(" ")}
              />
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
