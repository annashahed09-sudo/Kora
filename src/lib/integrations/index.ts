/**
 * Integrations registry.
 *
 * Kora surfaces connected services (Google Drive, Figma, GitHub, Slack, …)
 * without coupling page code to a vendor. Each provider registers itself
 * with display metadata + a sync factory; OAuth handshakes plug into the
 * `connect()` hook in v1.1.
 *
 * The UI scrapes this registry to render `/settings/integrations` and to
 * surface inline integration state on `/inbox`, `/home`, and per-project
 * pages.
 */

import type { IntegrationProvider } from "@/types/database";

export type IntegrationCapability =
  | "files"
  | "design"
  | "code"
  | "messaging"
  | "calendar"
  | "knowledge";

export type IntegrationState =
  | { status: "demo"; note: string }
  | { status: "connected"; lastSyncedAt: string; accountLabel: string }
  | { status: "disconnected" }
  | { status: "error"; message: string };

export interface IntegrationMeta {
  id: IntegrationProvider;
  name: string;
  description: string;
  icon: string;             // serialised inline SVG path data — see `icons.ts`
  capabilities: IntegrationCapability[];
  category: "files" | "design" | "engineering" | "communication";
  available: boolean;       // false until v1.1 wiring lands
}

export interface IntegrationInstance extends IntegrationMeta {
  state: IntegrationState;
  connect(): Promise<IntegrationState>;
  sync(): Promise<{ updatedAt: string; count: number }>;
}

/* ---------------------------------------------------------------------- */
/* Catalog. Each entry is the canonical metadata for a provider.          */
/* ---------------------------------------------------------------------- */

const CATALOG: IntegrationMeta[] = [
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Bring documents, spreadsheets, and slides into the workspace.",
    icon: "M8.5 3.5h7L20 8v12H8.5L4 15.5z",
    capabilities: ["files"],
    category: "files",
    available: true,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Surface Figma files and prototypes inside project contexts.",
    icon: "M5 4h6v6H5zm0 6h6v6H5zm6 0h6v6h-6zm6-6h-6V4h6z",
    capabilities: ["design", "files"],
    category: "design",
    available: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Link issues, pull requests, and releases to projects.",
    icon: "M10 1.5A8.5 8.5 0 0 0 7.3 18c.4.1.6-.2.6-.4v-1.5c-2.5.5-3-1.2-3-1.2-.4-1-1-1.3-1-1.3-.8-.5 0-.5 0-.5.9 0 1.4 1 1.4 1 .8 1.4 2.2 1 2.7.8 0-.6.3-1 .6-1.3-2-.2-4-1-4-4.4 0-1 .4-1.8 1-2.4-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1A9 9 0 0 1 12 6a9 9 0 0 1 2.5.4c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.6.6 1 1.4 1 2.4 0 3.4-2 4.2-4 4.4.4.3.7.9.7 1.8v2.6c0 .3.2.6.6.4A8.5 8.5 0 0 0 10 1.5",
    capabilities: ["code", "files"],
    category: "engineering",
    available: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Route mentions, comments, and status changes to channels.",
    icon: "M4 10a2 2 0 1 1 4 0v6H6a2 2 0 1 1 0-4h2v-2H4zm12 0a2 2 0 1 0-4 0v6h2a2 2 0 1 0 0-4h-2v-2h4z",
    capabilities: ["messaging"],
    category: "communication",
    available: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Import pages and structure from existing Notion workspaces.",
    icon: "M3 4h12v12H3zM3 4l14 14M16 4l-12 12",
    capabilities: ["knowledge", "files"],
    category: "files",
    available: true,
  },
  {
    id: "miro",
    name: "Miro",
    description: "Bring boards into project contexts alongside the canvas.",
    icon: "M2 12h20M12 2v20",
    capabilities: ["design"],
    category: "design",
    available: true,
  },
  {
    id: "linear",
    name: "Linear",
    description: "Sync issues, cycles, and project status bidirectionally.",
    icon: "M3 18L18 3M12 3h6v6",
    capabilities: ["knowledge"],
    category: "engineering",
    available: true,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Sync files and folders automatically.",
    icon: "M6 4l6 4 6-4-6 4 6 4-6 4-6-4z",
    capabilities: ["files"],
    category: "files",
    available: false,
  },
];

export function listIntegrations(): IntegrationMeta[] {
  return [...CATALOG];
}

export function getIntegrationMeta(id: IntegrationProvider): IntegrationMeta | null {
  return CATALOG.find((m) => m.id === id) ?? null;
}

/* ---------------------------------------------------------------------- */
/* Instance factory. v1.0 returns a "demo" state so the UI renders        */
/* without OAuth configured. v1.1 wires real provider implementations.    */
/* ---------------------------------------------------------------------- */

export function listIntegrationInstances(): IntegrationInstance[] {
  return CATALOG.map((meta) => ({
    ...meta,
    state: demoStateFor(meta),
    async connect() {
      // v1.1: route through /api/integrations/[provider]/start
      throw new Error(`${meta.name} OAuth wiring is part of v1.1`);
    },
    async sync() {
      throw new Error(`${meta.name} sync is part of v1.1`);
    },
  }));
}

function demoStateFor(meta: IntegrationMeta): IntegrationState {
  if (!meta.available) return { status: "demo", note: "Planned for v1.1." };
  return {
    status: "demo",
    note: "Connect in v1.1 — finished infrastructure, provider handshake pending.",
  };
}
