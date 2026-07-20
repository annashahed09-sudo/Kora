"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  blocksReplaceSchema,
  blockUpsertSchema,
} from "@/lib/zod/schemas";
import type { Json } from "@/types/database";
import { bucket, keyForUser } from "@/lib/rate-limit";

/**
 * Canvas persistence actions for /project/[id]. tldraw debounces saves at
 * ~700 ms so real-world traffic stays well below the cap; the cap exists
 * to defend against a tampered client flooding the server action.
 *
 * RLS guarantees writes only succeed for projects the signed-in user owns.
 */

async function enforceCanvasRateLimit(
  userId: string,
  action: "canvas:replace" | "canvas:upsert"
): Promise<void> {
  const limit = action === "canvas:replace" ? 30 : 60;
  const v = bucket({
    key: keyForUser(userId, action),
    limit,
    windowMs: 60_000,
  });
  if (!v.allowed) {
    throw new Error("Canvas save rate limit reached. Try again shortly.");
  }
}

export async function replaceBlocks(payload: unknown) {
  const parsed = blocksReplaceSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Not signed in." };

  await enforceCanvasRateLimit(user.id, "canvas:replace");

  const { error: deleteError } = await supabase
    .from("blocks")
    .delete()
    .eq("project_id", parsed.data.project_id)
    .in("id", parsed.data.deleted_ids);

  if (deleteError) {
    return { ok: false as const, message: deleteError.message };
  }

  if (parsed.data.blocks.length === 0) {
    revalidatePath(`/project/${parsed.data.project_id}`);
    return { ok: true as const };
  }

  const rows = parsed.data.blocks.map((b) => ({
    id: b.id,
    project_id: parsed.data.project_id,
    type: b.type,
    content: b.content as Json,
    x: b.x,
    y: b.y,
    width: b.width,
    height: b.height,
  }));

  const { error: upsertError } = await supabase
    .from("blocks")
    .upsert(rows as never, { onConflict: "id" });

  if (upsertError) {
    return { ok: false as const, message: upsertError.message };
  }

  revalidatePath(`/project/${parsed.data.project_id}`);
  return { ok: true as const };
}

export async function upsertBlock(payload: unknown) {
  const parsed = blockUpsertSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Not signed in." };

  await enforceCanvasRateLimit(user.id, "canvas:upsert");

  const { error } = await supabase.from("blocks").upsert(
    {
      id: parsed.data.id,
      project_id: parsed.data.project_id,
      type: parsed.data.type,
      content: parsed.data.content as Json,
      x: parsed.data.x,
      y: parsed.data.y,
      width: parsed.data.width,
      height: parsed.data.height,
    } as never,
    { onConflict: "id" }
  );

  if (error) return { ok: false as const, message: error.message };

  revalidatePath(`/project/${parsed.data.project_id}`);
  return { ok: true as const };
}
