"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Database } from "@/types/database";
import { replaceBlocks } from "../canvas-actions";

type Block = Pick<
  Database["public"]["Tables"]["blocks"]["Row"],
  "id" | "type" | "content" | "x" | "y" | "width" | "height"
>;

// tldraw must NOT be SSR'd — it touches `window` at module load time.
// Dynamic import gives us a graceful progressive enhancement fallback.
const TldrawClient = dynamic(
  () => import("./CanvasTldraw").then((m) => m.CanvasTldraw),
  {
    ssr: false,
    loading: () => <CanvasPlaceholder />,
  }
);

const DEBOUNCE_MS = 700;

/**
 * Canvas — client wrapper. Holds the debounced-save logic and the falling
 * back render. Hands the actual tldraw editor off to <CanvasTldraw/>.
 *
 * Why a wrapper + a subcomponent: keeps the dynamic boundary small so the
 * tldraw bundle ships separately from the rest of the page.
 */
export function Canvas({
  projectId,
  initialBlocks,
}: {
  projectId: string;
  initialBlocks: Block[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    (blocks: Block[], deletedIds: string[]) => {
      setSaving(true);
      replaceBlocks({
        project_id: projectId,
        blocks: blocks.map((b) => ({
          id: b.id,
          type: b.type,
          content: b.content,
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
        })),
        deleted_ids: deletedIds,
      })
        .then((res) => {
          if (res.ok) setSavedAt(new Date());
        })
        .catch((e) => {
          console.error("replaceBlocks failed:", e);
        })
        .finally(() => setSaving(false));
    },
    [projectId]
  );

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <TldrawClient
        initialBlocks={initialBlocks}
        onDebouncedSave={save}
        debounceMs={DEBOUNCE_MS}
      />

      <CanvasStatusBar saving={saving} savedAt={savedAt} />
    </div>
  );
}

/**
 * Quiet status pill at the top-right of the canvas surface. Shows
 * "Saving..." while pending and the time of the last save otherwise.
 */
function CanvasStatusBar({
  saving,
  savedAt,
}: {
  saving: boolean;
  savedAt: Date | null;
}) {
  const [, force] = useState(0);
  // Tick once a minute so the relative "saved Xm ago" stays accurate.
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-line bg-bg-soft/90 px-3 py-1.5 backdrop-blur"
    >
      <span
        aria-hidden
        className={[
          "size-1.5 rounded-full",
          saving ? "bg-[#c8b89a]" : savedAt ? "bg-accent" : "bg-fg-faint",
        ].join(" ")}
      />
      <span className="text-[11.5px] text-fg-muted">
        {saving
          ? "Saving…"
          : savedAt
          ? `Saved ${formatRelative(savedAt)}`
          : "Not yet saved"}
      </span>
    </div>
  );
}

function fallbackPreview() {
  return (
    <svg
      viewBox="0 0 800 480"
      role="img"
      aria-label="An empty canvas"
      className="block h-full w-full"
    >
      <defs>
        <pattern id="kora-canvas-dot" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#1f1f1f" />
        </pattern>
      </defs>
      <rect width="800" height="480" fill="#0e0e0e" />
      <rect width="800" height="480" fill="url(#kora-canvas-dot)" />
    </svg>
  );
}

function CanvasPlaceholder() {
  return <div className="h-full w-full">{fallbackPreview()}</div>;
}

function formatRelative(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  return new Date(d).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
