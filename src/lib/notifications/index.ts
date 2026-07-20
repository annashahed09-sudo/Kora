/**
 * Notifications abstraction.
 *
 * Pages call `listForUser(userId)` to render the inbox feed. The default
 * implementation reads from Supabase `public.notifications` directly; for
 * v1.0 without persistence, the function returns the demo feed so the
 * surface is still populated.
 */

type NotificationKind = "mention" | "comment" | "system" | "invite";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  targetUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

export async function listForUser(
  userId: string | null,
  options: { unreadOnly?: boolean; kind?: NotificationKind } = {}
): Promise<Notification[]> {
  // Demo-mode path. v1.1 swaps this for a Supabase query +
  // the real-time channel so multi-device fan-out is real.
  const all = demoFeed();
  return all.filter((n) =>
    (!options.unreadOnly || !n.readAt) &&
    (!options.kind || n.kind === options.kind)
  );
}

export async function unreadCount(userId: string | null): Promise<number> {
  const items = await listForUser(userId, { unreadOnly: true });
  return items.length;
}

function demoFeed(): Notification[] {
  const now = Date.now();
  const ago = (mins: number) => new Date(now - mins * 60_000).toISOString();
  return [
    {
      id: "n1",
      kind: "mention",
      title: "Jules mentioned you in 'Launch positioning'",
      body: "@you can you read through the third paragraph once more?",
      targetUrl: "/project/demo-1",
      readAt: null,
      createdAt: ago(8),
    },
    {
      id: "n2",
      kind: "comment",
      title: "Mira left a comment on the Beta brief",
      body: "Maybe simpler?",
      targetUrl: "/project/demo-2",
      readAt: null,
      createdAt: ago(28),
    },
    {
      id: "n3",
      kind: "system",
      title: "Delivery phase 03 is ready to review",
      body: null,
      targetUrl: "/project/demo-3",
      readAt: null,
      createdAt: ago(120),
    },
    {
      id: "n4",
      kind: "invite",
      title: "You've been invited to 'Acme · launch brief'",
      body: "Read-only view, includes comments.",
      targetUrl: "/dashboard",
      readAt: ago(900_000 / 60).toString(),
      createdAt: ago(180),
    },
    {
      id: "n5",
      kind: "mention",
      title: "AI suggested an outline for 'Why now?'",
      body: "Four-part structure — accept or reject to teach",
      targetUrl: "/home",
      readAt: ago(240),
      createdAt: ago(220),
    },
  ];
}
