/**
 * Tag — small label pill used on cards, item previews, and project rows.
 */
export function Tag({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "muted" | "warm" | "positive";
}) {
  const styles =
    variant === "warm"
      ? "border-line-strong bg-bg-soft text-accent"
      : variant === "positive"
      ? "border-line-strong bg-bg-soft text-[#9bc1a4]"
      : variant === "muted"
      ? "border-line bg-bg text-fg-subtle"
      : "border-line bg-bg-soft text-fg-muted";
  return (
    <span
      className={`inline-flex h-5 items-center rounded border px-2 text-[10.5px] tracking-wide ${styles}`}
    >
      {label}
    </span>
  );
}
