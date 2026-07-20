import { PageHeader } from "@/components/ui/PageHeader";
import { DemoPill } from "@/components/ui/DemoPill";
import { Tag } from "@/components/ui/Tag";
import { DEMO_MEDIA } from "@/lib/demo/data";

export const metadata = { title: "Media" };

/**
 * Media library — images, video, audio, files. Each card carries the
 * asset's palette swatches so the visual identity of the library is
 * legible at a glance.
 */
export default function MediaPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>
      <PageHeader
        eyebrow="Media"
        title={
          <>
            Files, palettes, and <span className="italic text-accent">sound</span>.
          </>
        }
        body="The library of images, prototypes, voice memos, and exports that the workspace leans on."
      />

      <div className="mt-12 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
        {DEMO_MEDIA.map((m) => (
          <article
            key={m.id}
            className="group relative bg-bg p-5 transition-colors hover:bg-bg-soft"
          >
            {/* Palette swatch */}
            <div
              className="mb-4 h-32 overflow-hidden rounded-[10px] border border-line"
              style={{
                background: `linear-gradient(135deg, ${m.palette
                  .map((c, i) => `${c} ${(i / m.palette.length) * 100}%`)
                  .join(", ")})`,
              }}
              aria-hidden
            />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex flex-col">
                <h3 className="text-[13.5px] font-medium text-fg line-clamp-2">
                  {m.title}
                </h3>
                <p className="mt-1 text-[11px] text-fg-subtle">
                  {prettyBytes(m.bytes)}
                </p>
              </div>
              <Tag label={m.kind} variant="muted" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {m.palette.map((c) => (
                <span
                  key={c}
                  title={c}
                  className="inline-block size-3 rounded-sm border border-line"
                  style={{ background: c }}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function prettyBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
