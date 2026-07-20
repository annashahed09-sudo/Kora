/**
 * PageHeader — consistent top section of a flagship surface.
 * Used by /home, /knowledge, /search, etc.
 */
export function PageHeader({
  eyebrow,
  title,
  body,
  actions,
  decoration,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  actions?: React.ReactNode;
  decoration?: React.ReactNode;
}) {
  return (
    <header className="grid grid-cols-12 gap-x-8 border-b border-line pb-12 md:pb-16">
      <div className="col-span-12 flex flex-col gap-6 md:col-span-9">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="text-display text-[clamp(2.2rem,5.5vw,4rem)] text-fg">
          {title}
        </h1>
        {body ? (
          <p className="max-w-[60ch] text-[14.5px] leading-relaxed text-fg-muted">
            {body}
          </p>
        ) : null}
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {decoration ? (
        <div className="col-span-12 mt-8 flex items-center justify-end md:col-span-3 md:mt-0">
          {decoration}
        </div>
      ) : null}
    </header>
  );
}
