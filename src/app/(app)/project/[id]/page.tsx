import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Canvas } from "./_components/Canvas";
import { PhaseSwitcher } from "./_components/PhaseSwitcher";
import { CommentsPanel } from "./_components/CommentsPanel";
import { ShareDialog } from "./_components/ShareDialog";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Project",
};

type Params = Promise<{ id: string }>;

/**
 * /project/[id] — server component. Validates the URL id is a UUID, fetches
 * the project under the user's RLS context, and renders the workspace.
 *
 * Falls back to `notFound()` for any of: malformed id, missing row, or a
 * row that exists but the UI shouldn't access (treated as 404 to avoid
 * revealing the existence of other users' projects).
 */
export default async function ProjectPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: rawProject } = await supabase
    .from("projects")
    .select("id, user_id, title, client_name, phase, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!rawProject) notFound();

  const project = rawProject as Database["public"]["Tables"]["projects"]["Row"];

  // Touch updated_at so the project bubbles to the top of the dashboard list.
  await supabase
    .from("projects")
    .update({ updated_at: new Date().toISOString() } as never)
    .eq("id", id);

  // Fetch blocks + comments for the initial render. tldraw will hydrate
  // from `blocks` and re-save through the canvas server action.
  const [{ data: rawBlocks }, { data: rawComments }] = await Promise.all([
    supabase
      .from("blocks")
      .select("id, type, content, x, y, width, height")
      .eq("project_id", id),
    supabase
      .from("comments")
      .select("id, block_id, text, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const blocks = (rawBlocks ?? []) as Array<
    Pick<
      Database["public"]["Tables"]["blocks"]["Row"],
      "id" | "type" | "content" | "x" | "y" | "width" | "height"
    >
  >;
  const comments = (rawComments ?? []) as Array<
    Pick<
      Database["public"]["Tables"]["comments"]["Row"],
      "id" | "block_id" | "text" | "created_at"
    >
  >;

  revalidatePath(`/project/${id}`);

  return (
    <div className="flex flex-1">
      {/* Left column — phase switcher + canvas */}
      <section className="flex flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-bg-soft/50 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <p className="eyebrow">{project.client_name}</p>
            <h1 className="text-display text-[1.8rem] text-fg">
              {project.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ShareDialog projectId={project.id} />
          </div>
        </header>

        <div className="border-b border-line px-6 py-4">
          <PhaseSwitcher
            projectId={project.id}
            currentPhase={project.phase}
          />
        </div>

        <div className="relative flex-1 overflow-hidden bg-bg">
          <Canvas projectId={project.id} initialBlocks={blocks} />
        </div>
      </section>

      {/* Right column — comments */}
      <aside
        aria-label="Comments"
        className="hidden w-[360px] shrink-0 border-l border-line bg-bg-soft/30 md:block"
      >
        <CommentsPanel projectId={project.id} initialComments={comments} />
      </aside>
    </div>
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}
