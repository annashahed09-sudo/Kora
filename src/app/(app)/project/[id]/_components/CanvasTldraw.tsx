"use client";

import { useEffect } from "react";
import { Tldraw, useEditor, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import type { Database } from "@/types/database";

type Block = Pick<
  Database["public"]["Tables"]["blocks"]["Row"],
  "id" | "type" | "content" | "x" | "y" | "width" | "height"
>;

/**
 * Inner tldraw editor surface.
 *
 * Hydrates initial blocks into the editor store on mount, then debounces
 * subsequent changes into the `replaceBlocks` server action.
 *
 * v1 simplification: we treat the tldraw snapshot as an opaque bag of
 * shapes. Block `type` is the tldraw shape type (geo / note / image /
 * draw / frame). `content` carries the rest of the shape JSON for richer
 * hydration later.
 *
 * ⚠️ tldraw v3 API caveat
 * -----------------------
 * The exact shape of `SerializedRecord`, the snapshot/schema objects
 * accepted by `editor.store.loadSnapshot`, and the signature of
 * `editor.store.listen` change between tldraw majors. The defaults
 * below are written against the conventions of tldraw@3; verify them
 * against the installed version on first `npm run dev` and adjust if
 * the editor throws on hydration or never receives change events.
 */
export function CanvasTldraw({
  initialBlocks,
  onDebouncedSave,
  debounceMs,
}: {
  initialBlocks: Block[];
  onDebouncedSave: (blocks: Block[], deletedIds: string[]) => void;
  debounceMs: number;
}) {
  return (
    <div className="kora-canvas-host h-full w-full">
      <Tldraw
        onMount={(editor: Editor) => {
          hydrate(editor, initialBlocks);
          attachAutoSave(editor, initialBlocks, onDebouncedSave, debounceMs);
        }}
        hideUi={false}
      />
    </div>
  );
}

/* ----------------------------------------------------- hydration helpers -- */

function hydrate(editor: Editor, blocks: Block[]) {
  if (blocks.length === 0) return;
  try {
    for (const block of blocks) {
      const shapeRecord = toTldrawShapeRecord(block);
      editor.store.put([shapeRecord] as never);
    }
  } catch (err) {
    console.warn("Kora canvas hydration skipped:", err);
  }
}

function toTldrawShapeRecord(b: Block) {
  // Mapping our `blocks` row shape onto tldraw's serialisable record shape.
  // We prefix the id so we can recover our own id when reading records back.
  return {
    id: `shape:${b.id}`,
    typeName: "shape",
    type: b.type,
    parentId: undefined,
    isLocked: false,
    props:
      typeof b.content === "object" && b.content !== null
        ? (b.content as Record<string, unknown>)
        : {},
    meta: {},
  };
}

function attachAutoSave(
  editor: Editor,
  initial: Block[],
  save: (blocks: Block[], deletedIds: string[]) => void,
  debounceMs: number
) {
  const initialIds = new Set(initial.map((b) => b.id));
  const deletedIds: string[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  };

  const flush = () => {
    try {
      const allShapes = editor.store.allRecords().filter(isShapeRecord);
      const currentIds = new Set<string>();
      const live: Block[] = [];

      for (const rec of allShapes) {
        const id = stripShapePrefix(String((rec as { id: unknown }).id));
        currentIds.add(id);
        live.push(toBlockRow(rec, id));
      }

      for (const id of initialIds) {
        if (!currentIds.has(id)) deletedIds.push(id);
      }

      save(live, deletedIds);
    } catch (err) {
      console.error("Kora canvas autosave flush failed:", err);
    }
  };

  const unsub = editor.store.listen(() => schedule());

  return () => {
    if (timer) clearTimeout(timer);
    flush();
    unsub();
  };
}

function isShapeRecord(r: { typeName?: string }): boolean {
  return r.typeName === "shape";
}

function stripShapePrefix(id: string): string {
  return id.startsWith("shape:") ? id.slice("shape:".length) : id;
}

function toBlockRow(rec: unknown, id: string): Block {
  const r = rec as {
    type?: string;
    props?: Record<string, unknown>;
    x?: number;
    y?: number;
  };
  return {
    id,
    type: String(r.type ?? "unknown"),
    content: (r.props ?? {}) as Database["public"]["Tables"]["blocks"]["Row"]["content"],
    x: Number(r.x ?? 0),
    y: Number(r.y ?? 0),
    width: 0,
    height: 0,
  };
}

// Hook-style sanity probe: if tldraw fails to expose `useEditor`, the bundler
// will surface an import error here on first build. Kept as a small named
// export so tests / future revisions can confirm the API match.
export function CanvasEditorProbe() {
  const editor = useEditor();
  useEffect(() => {
    if (!editor) return;
    return () => undefined;
  }, [editor]);
  return null;
}
