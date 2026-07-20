/**
 * EmptyState — consistent empty-state composition used across routes.
 *
 * Each surface's empty state is composed locally rather than abstracted,
 * because the right empty state is always bespoke to that surface. This
 * primitive gives the honest shape (eyebrow + headline + description +
 * affordance + decoration) and expects callers to fill those in.
 */
export function EmptyState({
  eyebrow,
  headline,
  body,
  cta,
  decoration,
}: {
  eyebrow: string;
  headline: React.ReactNode;
  body: React.ReactNode;
  cta?: React.ReactNode;
  decoration?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-dashed border-line bg-bg-soft/40">
      <div className="grid grid-cols-12 gap-x-8 px-7 py-14 md:py-20">
        <div className="col-span-12 flex flex-col gap-5 md:col-span-7">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-display text-[clamp(1.8rem,3.5vw,2.4rem)] text-fg">
            {headline}
          </h2>
          <p className="max-w-[52ch] text-[13.5px] leading-relaxed text-fg-muted">
            {body}
          </p>
          {cta ? <div className="mt-3">{cta}</div> : null}
        </div>
        <div className="col-span-12 mt-10 flex items-center justify-center md:col-span-5 md:mt-0">
          {decoration}
        </div>
      </div>
    </div>
  );
}
