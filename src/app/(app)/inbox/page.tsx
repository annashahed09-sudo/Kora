import { PageHeader } from "@/components/ui/PageHeader";
import { Tag } from "@/components/ui/Tag";
import { DemoPill } from "@/components/ui/DemoPill";
import Link from "next/link";
import { listForUser } from "@/lib/notifications";

export const metadata = { title: "Inbox" };

const FILTERS = [
  { id: "all", label: "All" },
  { id: "mentions", label: "Mentions" },
  { id: "comments", label: "Comments" },
  { id: "system", label: "System" },
  { id: "unread", label: "Unread" },
];

/**
 * Inbox — notifications feed with filter chips. Server component pulls the
 * user's notification list (falling back to demo data when Supabase is not
 * configured).
 */
/**
 * Translate the URL filter id to the singular `NotificationKind`. The
 * query string reads naturally as a plural ("?filter=comments") but the
 * in-memory kind is singular ("comment"), so we collapse here.
 *
 * `?filter=all` and `?filter=unread` deliberately collapse to `undefined`
 * (no kind filter) — `unreadOnly` toggles "show unread" independently of
 * which kind to scope to. Unknown filter ids likewise map to undefined,
 * which `listForUser` already treats as "show every kind".
 */
const FILTER_TO_KIND: Record<
  string,
  "mention" | "comment" | "system" | undefined
> = {
  mentions: "mention",
  comments: "comment",
  system: "system",
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const kind = filter ? FILTER_TO_KIND[filter] : undefined;
  const items = await listForUser("demo-user", {
    unreadOnly: filter === "unread",
    kind,
  });

  return (
    <div className="mx-auto w-full max-w-[920px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>

      <PageHeader
        eyebrow="Inbox"
        title={
          <>
            <span className="italic text-accent">Pings</span> & mentions.
          </>
        }
        body="Everything that asked for your attention, sorted newest first."
        actions={
          <button className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg-soft px-3 text-[12.5px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg">
            Mark all read
          </button>
        }
      />

      {/* Filter chips */}
      <div className="mt-12 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => {
          const isActive = (filter ?? "all") === f.id;
          const href = f.id === "all" ? "/inbox" : `/inbox?filter=${f.id}`;
          return (
            <Link
              key={f.id}
              href={href}
              className={[
                "inline-flex h-8 items-center rounded-full border px-3 text-[12px] transition-colors",
                isActive
                  ? "border-line-strong bg-bg-card text-fg"
                  : "border-line bg-transparent text-fg-muted hover:border-line-strong hover:text-fg",
              ].join(" ")}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Notifications */}
      <ol className="mt-10 flex flex-col gap-px border border-line bg-line">
        {items.length === 0 ? (
          <li className="bg-bg px-6 py-12 text-center text-[14px] text-fg-muted">
            No notifications here. Quiet day.
          </li>
        ) : (
          items.map((n) => (
            <li
              key={n.id}
              className={[
                "group flex flex-col gap-2 bg-bg px-6 py-5 transition-colors hover:bg-bg-soft",
                n.readAt ? "opacity-70" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={[
                      "size-2 rounded-full",
                      n.readAt ? "bg-fg-faint" : "bg-accent",
                    ].join(" ")}
                  />
                  <Tag label={n.kind} variant={n.kind === "system" ? "muted" : "warm"} />
                  <h3 className="text-[14px] font-medium text-fg">{n.title}</h3>
                </div>
                <span className="text-[11.5px] text-fg-subtle">
                  {formatRelative(n.createdAt)}
                </span>
              </div>
              {n.body ? (
                <p className="pl-5 max-w-[60ch] text-[13px] leading-relaxed text-fg-muted">
                  {n.body}
                </p>
              ) : null}
              {n.targetUrl ? (
                <Link
                  href={n.targetUrl}
                  className="self-start pl-5 text-[12.5px] text-fg-subtle transition-colors hover:text-fg"
                >
                  Open →
                </Link>
              ) : null}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

function formatRelative(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86_400) return `${Math.floor(sec / 3600)} hr ago`;
  const days = Math.floor(sec / 86_400);
  if (sec < 86_400 * 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
