/**
 * DemoPill — a quiet, intentional indicator that the surface is rendering
 * with seeded demo data. Visible in the top-right chrome of authenticated
 * surfaces so an investor or first-time user doesn't mistake demo data
 * for real data.
 *
 * Only renders when NEXT_PUBLIC_SUPABASE_URL is missing — i.e. when the
 * client is running on demo data only.
 */
export function DemoPill() {
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (hasSupabase) return null;
  return (
    <span
      title="Demo data — connect Supabase to load real records."
      className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-soft px-3 py-1 text-[11px] text-fg-muted"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-[#c8b89a]" />
      Demo · no Supabase yet
    </span>
  );
}
