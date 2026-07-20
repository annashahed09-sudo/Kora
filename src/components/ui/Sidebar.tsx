"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { KbdHint } from "@/components/ui/KbdHint";

/**
 * Sidebar — the left rail of the (app) surface.
 *
 * Collapsed = icon-only (rail width 56px). Expanded = full labels (rail width
 * 248px). State is stored in the `kora-rail` cookie so it persists across
 * page navigations. The server-side (app)/layout reads the cookie via
 * `next/headers` (Next 16 async) and decides the column width on first
 * render — the client-side toggle just flips the cookie and calls
 * `router.refresh()` so the layout re-renders without losing scroll.
 */

type Item = {
  href: string;
  label: string;
  glyph: string;             // minimalist unicode glyph instead of icons
  badge?: string | number;
  group: "Workspace" | "Personal" | "Admin";
};

const ITEMS: Item[] = [
  { href: "/home",       label: "Home",       glyph: "◐", group: "Workspace" },
  { href: "/inbox",      label: "Inbox",      glyph: "■", group: "Workspace", badge: "5" },
  { href: "/dashboard",  label: "Projects",   glyph: "◇", group: "Workspace" },
  { href: "/tasks",      label: "Tasks",      glyph: "≡", group: "Workspace" },
  { href: "/calendar",   label: "Calendar",   glyph: "▦", group: "Workspace" },
  { href: "/research",   label: "Research",   glyph: "◆", group: "Workspace" },
  { href: "/media",      label: "Media",      glyph: "▤", group: "Workspace" },
  { href: "/knowledge",  label: "Knowledge",  glyph: "✦", group: "Workspace" },
  { href: "/profile",    label: "Profile",    glyph: "○", group: "Personal" },
  { href: "/settings",   label: "Settings",   glyph: "·", group: "Admin" },
];

const GROUPS: Item["group"][] = ["Workspace", "Personal", "Admin"];

export function Sidebar({
  email,
  collapsed,
}: {
  email: string | null;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function toggle() {
    const next = collapsed ? RAIL_STATES.OPEN : RAIL_STATES.COLLAPSED;
    document.cookie =
      `kora-rail=${next}; path=/; ` +
      `max-age=${RAIL_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    // Soft re-render — keep scroll, no full page reload.
    router.refresh();
  }

  return (
    <aside
      data-collapsed={collapsed}
      className="sticky top-0 z-30 hidden h-dvh shrink-0 border-r border-line bg-bg md:block"
      style={{ width: collapsed ? 56 : 248 }}
    >
      <div className="flex h-dvh flex-col">
        {/* Brand row */}
        <div className="flex h-14 items-center justify-between border-b border-line px-3">
          {!collapsed && (
            <Link href="/home" aria-label="Kora — home">
              <BrandMark />
            </Link>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Open sidebar" : "Collapse sidebar"}
            className="inline-flex size-6 items-center justify-center rounded text-fg-subtle transition-colors hover:bg-bg-soft hover:text-fg"
          >
            <span aria-hidden className="text-[12px]">{collapsed ? "›" : "‹"}</span>
          </button>
        </div>

        {/* Search / palette trigger */}
        <div className="border-b border-line px-3 py-3">
          <Link
            href="/search"
            className="group flex h-9 items-center gap-2.5 rounded-[8px] border border-line bg-bg-soft px-2.5 text-[12.5px] text-fg-subtle transition-colors hover:border-line-strong hover:text-fg"
          >
            <span aria-hidden>⌕</span>
            {!collapsed && <span className="flex-1">Search…</span>}
            {!collapsed && <KbdHint keys={["⌘", "K"]} />}
          </Link>
        </div>

        {/* Nav */}
        <nav aria-label="Workspace" className="flex-1 overflow-y-auto px-2 pt-3">
          {GROUPS.map((group) => {
            const items = ITEMS.filter((i) => i.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="mb-6">
                {!collapsed && (
                  <p className="eyebrow mb-2 px-2">{group}</p>
                )}
                <ul className="flex flex-col gap-px">
                  {items.map((it) => {
                    const isActive =
                      it.href === "/home"
                        ? pathname === "/home"
                        : pathname?.startsWith(it.href);
                    return (
                      <li key={it.href}>
                        <Link
                          href={it.href}
                          aria-current={isActive ? "page" : undefined}
                          title={collapsed ? it.label : undefined}
                          className={[
                            "group flex h-8 items-center gap-3 rounded-[7px] px-2.5 text-[13px] transition-colors",
                            isActive
                              ? "bg-bg-card text-fg"
                              : "text-fg-muted hover:bg-bg-soft hover:text-fg",
                          ].join(" ")}
                        >
                          <span
                            aria-hidden
                            className={[
                              "size-4 text-center font-mono text-[11px] leading-4",
                              isActive ? "text-accent" : "text-fg-subtle group-hover:text-fg",
                            ].join(" ")}
                          >
                            {it.glyph}
                          </span>
                          {!collapsed && <span className="flex-1">{it.label}</span>}
                          {!collapsed && it.badge ? (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-line px-1.5 text-[10.5px] text-fg-muted">
                              {it.badge}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User chip */}
        <div className="border-t border-line px-3 py-3">
          {collapsed ? (
            <div
              title={email ?? ""}
              className="mx-auto flex size-7 items-center justify-center rounded-full bg-bg-card text-[10px] text-fg-muted"
            >
              {initialsFrom(email)}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-card text-[10.5px] text-fg">
                {initialsFrom(email)}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[12px] font-medium text-fg">
                  {email ?? "You"}
                </span>
                <Link
                  href="/profile"
                  className="text-[11px] text-fg-subtle transition-colors hover:text-fg"
                >
                  View profile →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function initialsFrom(email: string | null): string {
  if (!email) return "•";
  const local = email.split("@")[0] ?? "";
  const seg = local.split(/[._-]/)[0] ?? "";
  return (seg.slice(0, 2) || "•").toUpperCase();
}

/* ---------------- shared cookie state values ---------------------------- */

const RAIL_STATES = {
  OPEN: "open",
  COLLAPSED: "collapsed",
} as const;
export const RAIL_COOKIE_NAME = "kora-rail";
export const RAIL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseRailState(raw: string | undefined): (typeof RAIL_STATES)[keyof typeof RAIL_STATES] {
  return raw === RAIL_STATES.COLLAPSED ? RAIL_STATES.COLLAPSED : RAIL_STATES.OPEN;
}
