"use client";

import { useOptimistic, useActionState } from "react";
import {
  addComment,
  type CommentActionState,
} from "../comment-actions";
import type { Database } from "@/types/database";

type Row = Pick<
  Database["public"]["Tables"]["comments"]["Row"],
  "id" | "block_id" | "text" | "created_at"
>;

const INITIAL: CommentActionState = { ok: true };

/**
 * CommentsPanel — server-fetches the initial list once; new comments are
 * added through the server action with React 19 optimistic updates so the
 * text appears immediately and is reconciled on the server response.
 */
export function CommentsPanel({
  projectId,
  initialComments,
}: {
  projectId: string;
  initialComments: Row[];
}) {
  const [optimistic, addOptimistic] = useOptimistic<Row[], Row>(
    initialComments,
    (state, newRow) => [...state, newRow]
  );
  const [state, formAction, pending] = useActionState<
    CommentActionState,
    FormData
  >(addComment, INITIAL);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-baseline justify-between border-b border-line px-5 py-4">
        <h2 className="text-[13px] font-medium text-fg">Comments</h2>
        <span className="eyebrow">{optimistic.length}</span>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {optimistic.length === 0 ? (
          <p className="text-[13px] text-fg-subtle">
            No comments yet. Use comments to leave feedback for the team.
          </p>
        ) : (
          <ol className="flex flex-col gap-5">
            {optimistic.map((c) => (
              <li key={c.id} className="flex flex-col gap-1.5">
                <p className="text-[13.5px] leading-relaxed text-fg">
                  {c.text}
                </p>
                <p className="text-[11.5px] text-fg-subtle">
                  {new Date(c.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <form
        action={(formData) => {
          const text = formData.get("text");
          if (typeof text === "string" && text.trim().length > 0) {
            // Optimistic placeholder so the comment appears immediately.
            addOptimistic({
              id: `temp-${Date.now()}`,
              block_id: null,
              text: text.trim(),
              created_at: new Date().toISOString(),
            });
          }
          formAction(formData);
        }}
        className="border-t border-line bg-bg-soft/40 px-5 py-4"
      >
        <div className="flex flex-col gap-2">
          <input type="hidden" name="project_id" value={projectId} />
          <label className="sr-only" htmlFor="comment-text">
            New comment
          </label>
          <textarea
            id="comment-text"
            name="text"
            rows={3}
            placeholder="Leave a note for the team…"
            className="resize-none rounded-[10px] border border-line bg-bg px-3.5 py-2.5 text-[13.5px] text-fg placeholder:text-fg-faint transition-colors hover:border-line-strong focus:border-line-strong focus:outline-none"
          />
          {state.fieldErrors?.text ? (
            <p className="text-[12px] text-[#e0a89a]">
              {state.fieldErrors.text}
            </p>
          ) : null}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-8 items-center gap-2 rounded-[8px] border border-line bg-bg-soft px-3 text-[12.5px] font-medium text-fg transition-colors hover:border-line-strong hover:bg-bg-card disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Posting…" : "Post comment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
