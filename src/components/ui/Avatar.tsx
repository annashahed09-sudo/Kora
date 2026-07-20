/**
 * Avatar — minimal two-letter or icon chip. Used everywhere we need a
 * "who is this" mark without committing to user photos.
 */
export function Avatar({
  label,
  size = 24,
  background = "bg-bg-card",
  border = true,
}: {
  label: string;
  size?: number;
  background?: string;
  border?: boolean;
}) {
  const initials = label
    .split(/\s+|·|,/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "•";
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full text-fg",
        background,
        border ? "border border-line" : "",
      ].join(" ")}
      aria-label={label}
    >
      {initials}
    </span>
  );
}
