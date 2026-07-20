/**
 * SectionHeader — a quieter header for sub-sections within a page.
 * Used inside a page to give each subsection its own eyebrow moment.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div className="flex flex-col gap-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="text-display text-[clamp(1.5rem,2.6vw,2rem)] text-fg">
          {title}
        </h2>
        {description ? (
          <p className="max-w-[60ch] text-[13.5px] leading-relaxed text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
