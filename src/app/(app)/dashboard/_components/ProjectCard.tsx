import type { Database } from "@/types/database";

type ProjectRow = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  "id" | "title" | "client_name" | "phase" | "created_at" | "updated_at"
>;

const PHASE_DOT: Record<ProjectRow["phase"], string> = {
  Brief: "bg-accent",
  Concept: "bg-fg-strong",
  Delivery: "bg-[#9bc1a4]",
};

/**
 * A single project row inside the dashboard grid. Renders the title (display
 * serif), the client as a muted meta line, the current phase as a quiet dot
 * pill, and a relative "updated" timestamp.
 */
export function ProjectCard({ project }: { project: ProjectRow }) {
  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-soft px-2.5 py-1 text-[11.5px] text-fg-muted">
          <span
            aria-hidden
            className={`size-1.5 rounded-full ${PHASE_DOT[project.phase]}`}
          />
          {project.phase}
        </span>
        <span className="text-[12px] text-fg-subtle">
          {formatRelative(project.updated_at)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-display text-[1.6rem] leading-tight text-fg">
          {project.title}
        </h3>
        <p className="text-[13px] text-fg-muted">{project.client_name}</p>
      </div>
    </div>
  );
}

/**
 * Lightweight relative formatter — avoids pulling in date-fns for one
 * utility. If the timestamp is unreadable, fall back to a dash.
 */
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86_400) return `${Math.floor(diffSec / 3600)} hr ago`;
  const days = Math.floor(diffSec / 86_400);
  if (diffSec < 86_400 * 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
