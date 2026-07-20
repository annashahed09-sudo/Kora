"use client";

import { useTransition } from "react";
import { switchPhase } from "../phase-actions";
import type { Database } from "@/types/database";

type Phase = Database["public"]["Enums"]["phase"];

const ORDER: Phase[] = ["Brief", "Concept", "Delivery"];

/**
 * Three-pill phase switcher. Uses `useTransition` for the pending state so
 * the rest of the page stays interactive while the server action runs.
 * Each pill updates the projects.phase column and triggers `redirect`
 * implicitly via `revalidatePath` on the server.
 */
export function PhaseSwitcher({
  projectId,
  currentPhase,
}: {
  projectId: string;
  currentPhase: Phase;
}) {
  const [pending, startTransition] = useTransition();

  function goTo(phase: Phase) {
    if (phase === currentPhase) return;
    startTransition(() => switchPhase(projectId, phase));
  }

  return (
    <div
      role="tablist"
      aria-label="Project phase"
      className="flex items-center gap-1"
    >
      {ORDER.map((p, i) => {
        const isActive = p === currentPhase;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={pending}
            onClick={() => goTo(p)}
            className={[
              "group inline-flex h-9 items-center gap-3 rounded-[8px] px-3 text-[13px] transition-colors",
              isActive
                ? "bg-bg-card text-fg"
                : "text-fg-muted hover:bg-bg-soft hover:text-fg",
              pending && !isActive ? "opacity-60" : "",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "size-1.5 rounded-full transition-colors",
                isActive ? "bg-accent" : "bg-fg-faint group-hover:bg-fg-muted",
              ].join(" ")}
            />
            <span>{p}</span>
            {i < ORDER.length - 1 ? (
              <span
                aria-hidden
                className="ml-1 hidden h-px w-6 bg-line md:inline-block"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
