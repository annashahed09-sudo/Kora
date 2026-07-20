import Link from "next/link";
import type { ItemType } from "@/types/database";
import { Tag } from "@/components/ui/Tag";

type ItemLike = {
  id: string;
  type: ItemType;
  title: string;
  preview?: string | null;
  status?: string | null;
  dueAt?: string | null;
  tags?: string[];
  href?: string;
  updatedAt?: string;
};

const TYPE_GLYPH: Record<ItemType, string> = {
  note: "·",
  task: "≡",
  file: "▤",
  bookmark: "↗",
  research: "◆",
  idea: "✦",
  person: "○",
  event: "▦",
  quote: "‘",
  image: "▥",
  video: "▣",
};

const TYPE_LABEL: Record<ItemType, string> = {
  note: "Note",
  task: "Task",
  file: "File",
  bookmark: "Bookmark",
  research: "Research",
  idea: "Idea",
  person: "Person",
  event: "Event",
  quote: "Quote",
  image: "Image",
  video: "Video",
};

/**
 * ItemCard — polymorphic card used across surfaces (inbox, search,
 * knowledge, profile, etc). Renders a type-aware chip, title, optional
 * preview + tags, and a footer with due-at and updated-at.
 *
 * href is optional — when absent the card is non-interactive.
 */
export function ItemCard({ item }: { item: ItemLike }) {
  const body = (
    <article className="group flex h-full flex-col gap-4 rounded-[12px] border border-line bg-bg-soft p-5 transition-colors hover:border-line-strong">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[11.5px] text-fg-muted">
          <span aria-hidden className="font-mono text-[12px] text-accent">
            {TYPE_GLYPH[item.type]}
          </span>
          {TYPE_LABEL[item.type]}
        </span>
        {item.dueAt ? (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-fg-subtle">
            <span aria-hidden className="size-1.5 rounded-full bg-[#c8b89a]" />
            {formatShortDate(item.dueAt)}
          </span>
        ) : null}
      </header>
      <h3 className="text-display line-clamp-2 text-[1.25rem] leading-tight text-fg">
        {item.title}
      </h3>
      {item.preview ? (
        <p className="text-[13px] leading-relaxed text-fg-muted line-clamp-3">
          {item.preview}
        </p>
      ) : null}
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags?.slice(0, 3).map((t) => (
            <Tag key={t} label={t} variant="muted" />
          ))}
        </div>
        {item.updatedAt ? (
          <span className="text-[11.5px] text-fg-subtle">
            {formatRelative(item.updatedAt)}
          </span>
        ) : null}
      </footer>
    </article>
  );

  if (!item.href) return body;
  return (
    <Link href={item.href} className="block">
      {body}
    </Link>
  );
}

export { TYPE_GLYPH as ITEM_GLYPH, TYPE_LABEL as ITEM_LABEL };

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const sec = Math.floor((Date.now() - then) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min`;
  if (sec < 86_400) return `${Math.floor(sec / 3600)} hr`;
  if (sec < 86_400 * 7) {
    const days = Math.floor(sec / 86_400);
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, sameYear
    ? { month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" });
}
