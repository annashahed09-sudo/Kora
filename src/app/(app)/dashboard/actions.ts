"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { projectCreateSchema } from "@/lib/zod/schemas";
import { bucket, keyForIp, keyForUser } from "@/lib/rate-limit";

/**
 * UUID-only schema for `deleteProject` and similar destructive endpoints.
 * The Zod-validated create/update paths already enforce UUIDs through
 * `projectCreateSchema` / `phaseUpdateSchema`.
 */
const projectIdSchema = z.object({ id: z.string().uuid() });

/**
 * Dual-layer cap on project creation.
 *
 * - per-user bucket stops a single account from running away with the
 *   Supabase free-tier quota
 * - per-IP bucket catches bot nests using one machine to churn many accounts
 *
 * Both must allow; either failing surfaces "rate limited" to the client.
 */
async function enforceCreateRateLimit(userId: string | null): Promise<void> {
  const h = await headers();
  // Per-user bucket is the dominant limit; per-IP bucket catches bot nests.
  const perUser = bucket({
    key: keyForUser(userId ?? "anon", "project:create"),
    limit: 30,
    windowMs: 60_000 * 10,
  });
  const perIp = bucket({
    key: `create-project:${keyForIp(h)}`,
    limit: 60,
    windowMs: 60_000 * 10,
  });
  if (!perUser.allowed || !perIp.allowed) {
    throw new Error("Project creation rate limit reached. Slow down a moment.");
  }
}

/**
 * Dashboard server actions.
 *
 * createProject uses the authenticated user's id (never a client-supplied
 * one) and validates the body via Zod. Ownership + RLS guarantee the row
 * is only ever visible to its owner. The redirect lands in the new project
 * workspace.
 */
export async function createProject(formData: FormData) {
  const parsed = projectCreateSchema.safeParse({
    title: formData.get("title"),
    client_name: formData.get("client_name"),
    phase: formData.get("phase"),
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, message: "Not signed in." };

  await enforceCreateRateLimit(user.id);

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: parsed.data.title,
      client_name: parsed.data.client_name,
      phase: parsed.data.phase,
      user_id: user.id,
    } as never)
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false as const, message: error?.message ?? "Couldn't create project." };
  }

  const projectId = (data as { id: string }).id;

  revalidatePath("/dashboard");
  redirect(`/project/${projectId}`);
}

export async function deleteProject(formData: FormData) {
  const parsed = projectIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Hard cap so a leaked id can't drive an automated purge.
  const v = bucket({
    key: keyForUser(user.id, "project:delete"),
    limit: 10,
    windowMs: 60_000,
  });
  if (!v.allowed) return;

  // Soft delete — projects.deleted_at is set, RLS still scopes to the
  // owner, the row disappears from dashboard views via the partial index
  // (created in 0004_soft_delete_and_share_expiry.sql).
  const { error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq("id", parsed.data.id);

  if (error) {
    console.error("deleteProject failed:", error.message);
    return;
  }

  revalidatePath("/dashboard");
}
