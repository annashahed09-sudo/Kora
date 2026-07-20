import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandMark } from "@/components/ui/BrandMark";

export const metadata: Metadata = {
  title: "Shared view",
  robots: { index: false, follow: false },
};

type Params = Promise<{ token: string }>;

type ShareSnapshot = {
  project_id: string;
  title: string;
  client_name: string;
  phase: "Brief" | "Concept" | "Delivery";
  blocks: Array<{
    id: string;
    type: string;
    content: unknown;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  comments: Array<{
    id: string;
    text: string;
    created_at: string;
  }>;
};

/**
 * Public, token-gated, read-only view.
 *
 * No auth required; the browser cookie isn't checked. Access is mediated by
 * the existence of a row in `shares` with a matching token, looked up via
 * the SECURITY DEFINER RPC `get_share_by_token`.
 *
 * `noindex` so search engines don't try to crawl arbitrary token URLs.
 * Bad tokens fall through to `notFound()` — we deliberately do not
 * differentiate "no token" from "expired token" since either way the view
 * is unreachable.
 */
export default async function ShareViewPage({ params }: { params: Params }) {
  const { token } = await params;
  if (!isLikelyToken(token)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_share_by_token", {
    token,
  } as never);

  if (error || !data || (Array.isArray(data as never) && (data as never[]).length === 0)) {
    notFound();
  }

  const row = (Array.isArray(data) ? data[0] : data) as ShareSnapshot;
  if (!row?.project_id) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-6">
          <BrandMark />
          <Link
            href="https://kora.studio"
            className="text-[13px] text-fg-muted transition-colors hover:text-fg"
          >
            About Kora →
          </Link>
        </div>
      </header>

      <main id="main" className="flex-1">
        <article className="mx-auto w-full max-w-[920px] px-6 py-16 md:py-24">
          <header className="flex flex-col gap-4">
            <p className="eyebrow text-fg-subtle">Read-only view</p>
            <h1 className="text-display text-[clamp(2.4rem,5.5vw,4rem)] text-fg">
              {row.title}
            </h1>
            <p className="max-w-[60ch] text-[14.5px] leading-relaxed text-fg-muted">
              Shared by the team at {row.client_name}. This view is static —
              updates made on the live workspace won&apos;t appear here.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-soft px-2.5 py-1 text-[11.5px] text-fg-muted">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                {row.phase}
              </span>
              <span className="eyebrow">{row.blocks.length} blocks</span>
              <span className="eyebrow">{row.comments.length} notes</span>
            </div>
          </header>

          <hr className="my-12 h-divider border-0" />

          <section aria-labelledby="canvas">
            <h2 id="canvas" className="sr-only">
              Project canvas
            </h2>
            {row.blocks.length === 0 ? (
              <p className="text-[14px] text-fg-muted">
                Nothing on the canvas yet.
              </p>
            ) : (
              <ol className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
                {row.blocks.map((b) => (
                  <li key={b.id} className="bg-bg p-5 md:p-6">
                    <BlockTile block={b} />
                  </li>
                ))}
              </ol>
            )}
          </section>

          {row.comments.length > 0 ? (
            <section
              aria-labelledby="notes"
              className="mt-16 flex flex-col gap-6"
            >
              <p className="eyebrow">Notes</p>
              <h2
                id="notes"
                className="text-display text-[clamp(1.6rem,3vw,2.2rem)] text-fg"
              >
                Team notes from the project.
              </h2>
              <ol className="flex flex-col gap-5">
                {row.comments.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-[10px] border border-line bg-bg-soft p-5"
                  >
                    <p className="text-[13.5px] leading-relaxed text-fg">
                      {c.text}
                    </p>
                    <p className="mt-3 text-[11.5px] text-fg-subtle">
                      {new Date(c.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </article>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6 text-[12px] text-fg-subtle">
          <span>Shared via Kora</span>
          <Link href="/privacy" className="hover:text-fg">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}

function BlockTile({
  block,
}: {
  block: ShareSnapshot["blocks"][number];
}) {
  // Pull any text out of arbitrary `content` JSON. The shape of `content`
  // is whatever tldraw saved; we sniff for the most common fields.
  const c = (block.content ?? {}) as Record<string, unknown>;
  const text =
    firstString(c["text"]) ??
    firstString(c["richText"]) ??
    firstString(c["caption"]) ??
    null;
  const title = firstString(c["title"]) ?? null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{humanType(block.type)}</span>
        <span className="text-[10.5px] text-fg-subtle">
          x:{Math.round(block.x)}, y:{Math.round(block.y)}
        </span>
      </div>
      {title ? (
        <p className="text-display text-[1.2rem] text-fg">{title}</p>
      ) : null}
      {text ? (
        <p className="text-[13px] leading-relaxed text-fg-muted">{text}</p>
      ) : (
        <p className="text-[12.5px] text-fg-subtle">
          {summariseContent(c)}
        </p>
      )}
    </div>
  );
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

function humanType(t: string): string {
  const map: Record<string, string> = {
    geo: "Shape",
    note: "Note",
    image: "Image",
    draw: "Sketch",
    frame: "Frame",
    text: "Text",
    group: "Group",
  };
  return map[t.toLowerCase()] ?? t;
}

function summariseContent(c: Record<string, unknown>): string {
  const keys = Object.keys(c).slice(0, 3);
  if (keys.length === 0) return "Empty block";
  return keys.map((k) => `${k}: …`).join(" · ");
}

// Guard against trivially malformed URLs; the RPC will still 404 on bad rows.
function isLikelyToken(s: string): boolean {
  return s.length >= 12 && s.length <= 64 && /^[A-Za-z0-9_-]+$/.test(s);
}
