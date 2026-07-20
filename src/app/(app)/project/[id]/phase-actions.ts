"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { phaseUpdateSchema } from "@/lib/zod/schemas";

/**
 * Switch the phase of the current project. Returns void — the server
 * action just revalidates the route so the chrome re-renders with the
 * new phase pill as active.
 *
 * RLS guarantees the user can only mutate their own row.
 */
export async function switchPhase(projectId: string, phase: "Brief" | "Concept" | "Delivery") {
  const parsed = phaseUpdateSchema.safeParse({ project_id: projectId, phase });
  if (!parsed.success) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ phase } as never)
    .eq("id", projectId);

  if (error) {
    console.error("switchPhase failed:", error.message);
    return;
  }

  revalidatePath(`/project/${projectId}`);
}
