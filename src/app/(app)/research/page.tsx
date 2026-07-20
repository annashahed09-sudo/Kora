import { PageHeader } from "@/components/ui/PageHeader";
import { DemoPill } from "@/components/ui/DemoPill";
import { Tag } from "@/components/ui/Tag";
import { DEMO_RESEARCH } from "@/lib/demo/data";

export const metadata = { title: "Research" };

/**
 * Research — saved articles, bookmarks, and citations.
 */
export default function ResearchPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>
      <PageHeader
        eyebrow="Research"
        title={
          <>
            Things worth <span className="italic text-accent">reading again</span>.
          </>
        }
        body="Bookmarks, highlights, and the citations your work was built on. The library grows as you do."
      />

      <div className="mt-12 grid grid-cols-12 gap-x-8">
        <section className="col-span-12 md:col-span-8">
          <ol className="flex flex-col gap-px border border-line bg-line">
            {DEMO_RESEARCH.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 bg-bg p-6 transition-colors hover:bg-bg-soft">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">{r.domain}</p>
                  <p className="text-[11.5px] text-fg-subtle">
                    {new Date(r.savedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <h3 className="text-display text-[1.4rem] text-fg">{r.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-fg-muted">
                  {r.excerpt}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Tag label={r.tag} variant="warm" />
                  <span className="text-[12px] text-fg-subtle">
                    {r.highlights} highlight{r.highlights === 1 ? "" : "s"}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="col-span-12 mt-12 md:col-span-4 md:mt-0">
          <div className="rounded-[12px] border border-line bg-bg-soft p-5">
            <p className="eyebrow mb-2">Quick pick</p>
            <p className="text-display mt-3 text-[1.4rem] text-fg">
              "The strongest launch pages all answer one question first: <span className="italic text-accent">why now?</span>"
            </p>
            <p className="mt-3 text-[12px] text-fg-subtle">— Founder essay, substack.com</p>
          </div>

          <div className="mt-6 rounded-[12px] border border-line bg-bg-soft p-5">
            <p className="eyebrow mb-3">Top tags</p>
            <div className="flex flex-wrap gap-2">
              {["design", "positioning", "essay", "copywriting", "operations"].map((t) => (
                <Tag key={t} label={t} variant="muted" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
