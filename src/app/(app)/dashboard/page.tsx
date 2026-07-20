import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewProjectForm } from "./_components/NewProjectForm";
import { ProjectCard } from "./_components/ProjectCard";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Workspaces",
};

/**
 * Dashboard — server-rendered list of the current user's projects, sorted
 * by recency, with a "new project" affordance that opens an inline form.
 *
 * Why a server component: we want the list to be authoritative on every
 * load, including the first paint after navigation. Mutations go through
 * server actions in `./actions.ts` which `revalidatePath` this route.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The route group layout has already redirected anon users, so this is
  // for the type-narrowing only.
  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, client_name, phase, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }

  const projects = (data ?? []) as Array<
    Pick<
      Database["public"]["Tables"]["projects"]["Row"],
      "id" | "title" | "client_name" | "phase" | "created_at" | "updated_at"
    >
  >;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-16 md:py-20">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Your workspaces</p>
        <h1 className="text-display text-[clamp(2.2rem,4.5vw,3.4rem)] text-fg">
          Projects.
        </h1>
        <p className="max-w-[60ch] text-[14.5px] leading-relaxed text-fg-muted">
          Every project carries a brief, a concept, a delivery — and the
          thinking in between.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-12 gap-x-8">
        <section
          aria-labelledby="new-project"
          className="col-span-12 md:col-span-4"
        >
          <h2 id="new-project" className="sr-only">
            Start a new project
          </h2>
          <NewProjectForm />
        </section>

        <section
          aria-labelledby="all-projects"
          className="col-span-12 mt-12 md:col-span-8 md:mt-0"
        >
          <h2
            id="all-projects"
            className="flex items-baseline justify-between pb-4"
          >
            <span className="eyebrow">All</span>
            <span className="eyebrow">{projects.length}</span>
          </h2>

          {projects.length === 0 ? (
            <EmptyDashboard />
          ) : (
            <ul className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id} className="bg-bg">
                  <Link
                    href={`/project/${p.id}`}
                    className="block p-6 md:p-7 transition-colors hover:bg-bg-soft"
                  >
                    <ProjectCard project={p} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="rounded-[14px] border border-dashed border-line bg-bg-soft p-8 md:p-12">
      <div className="flex flex-col gap-5">
        {/* Tiny inline SVG composition to keep presence without imagery. */}
        <svg
          viewBox="0 0 320 120"
          role="presentation"
          className="h-16 w-auto text-fg-subtle"
        >
          <rect
            x="0"
            y="0"
            width="220"
            height="80"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="22"
            x2="220"
            y2="22"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="44"
            x2="160"
            y2="44"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="60"
            x2="180"
            y2="60"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
          <circle cx="280" cy="40" r="6" fill="currentColor" opacity="0.4" />
        </svg>
        <p className="text-display text-[1.55rem] text-fg">
          No projects yet.
        </p>
        <p className="max-w-[44ch] text-[13.5px] leading-relaxed text-fg-muted">
          Start your first on the left — give it a title, the client, and
          which phase it should open in. The rest unfolds from there.
        </p>
      </div>
    </div>
  );
}
