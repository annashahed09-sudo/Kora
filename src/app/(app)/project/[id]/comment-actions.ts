"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { commentCreateSchema } from "@/lib/zod/schemas";
import { bucket, keyForUser } from "@/lib/rate-limit";

export type CommentActionState = {
  ok: boolean;
  fieldErrors?: { text?: string };
  message?: string;
};

/**
 * Per-user comment cap — protects against a runaway loop or a scripted
 * commenter spamming a single project.
 */
async function enforceCommentRateLimit(userId: string): Promise<void> {
  const v = bucket({
    key: keyForUser(userId, "comment:create"),
    limit: 5,
    windowMs: 60_000,
  });
  if (!v.allowed) {
    throw new Error("You're commenting too quickly. Try again in a minute.");
  }
}

export async function addComment(
  _prev: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const parsed = commentCreateSchema.safeParse({
    project_id: formData.get("project_id"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return mapFieldErrors(parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  await enforceCommentRateLimit(user.id);

  const { error } = await supabase.from("comments").insert({
    project_id: parsed.data.project_id,
    block_id: parsed.data.block_id ?? null,
    text: parsed.data.text,
    user_id: user.id,
  } as never);

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/project/${parsed.data.project_id}`);
  return { ok: true };
}

function mapFieldErrors(
  fe: Record<string, string[] | undefined>
): CommentActionState {
  return {
    ok: false,
    fieldErrors: { text: fe.text?.[0] },
  };
}
