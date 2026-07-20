/**
 * Demo data layer.
 *
 * Pages use these stubs so the surface renders even when no real Supabase
 * data exists — vital for "first impression" demos before the user has
 * created any of their own work. Each stub is structurally aligned with
 * the corresponding Database row to make the swap-in trivial.
 *
 * To wire real data later: replace the import in each page with a real
 * Supabase query. No page logic changes.
 */

import type {
  ItemType,
  IntegrationProvider,
  Phase,
} from "@/types/database";

export type DemoProject = {
  id: string;
  title: string;
  client_name: string;
  phase: Phase;
  updatedAt: string;
  collaborators: Array<{ initials: string; color: string }>;
};

export type DemoItem = {
  id: string;
  type: ItemType;
  title: string;
  status?: string;
  dueAt?: string;
  url?: string;
  preview?: string;
  tags: string[];
  updatedAt: string;
};

export type DemoMention = {
  sourceId: string;
  targetId: string;
};

export type DemoIntegration = {
  provider: IntegrationProvider;
  status: "connected" | "disconnected" | "demo" | "error";
  note: string;
};

export type DemoAiArtifact = {
  id: string;
  kind: "summary" | "outline" | "mind_map" | "swot" | "critique";
  title: string;
  excerpt: string;
  model: string;
  createdAt: string;
};

/* -------------------------------------------------------------- projects -- */

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: "demo-1",
    title: "Launch positioning",
    client_name: "Acme Co.",
    phase: "Concept",
    updatedAt: relativeIso(-12),
    collaborators: [
      { initials: "AN", color: "#c8b89a" },
      { initials: "JU", color: "#9bc1a4" },
    ],
  },
  {
    id: "demo-2",
    title: "Brand system",
    client_name: "Beta Atelier",
    phase: "Brief",
    updatedAt: relativeIso(-180),
    collaborators: [{ initials: "MI", color: "#c0a4dc" }],
  },
  {
    id: "demo-3",
    title: "Investigative report",
    client_name: "Delta Foundation",
    phase: "Delivery",
    updatedAt: relativeIso(-600),
    collaborators: [
      { initials: "AN", color: "#c8b89a" },
      { initials: "JU", color: "#9bc1a4" },
      { initials: "MI", color: "#c0a4dc" },
      { initials: "KO", color: "#a1a1aa" },
    ],
  },
  {
    id: "demo-4",
    title: "Q3 press cycle",
    client_name: "Helio Bank",
    phase: "Concept",
    updatedAt: relativeIso(-3600),
    collaborators: [{ initials: "JU", color: "#9bc1a4" }],
  },
];

/* ---------------------------------------------------------------- items -- */

export const DEMO_ITEMS: DemoItem[] = [
  {
    id: "it-1",
    type: "task",
    title: "Pick anchor headline for launch",
    status: "in_progress",
    dueAt: relativeIsoIso(10),
    tags: ["copywriting", "high-priority"],
    updatedAt: relativeIso(-22),
  },
  {
    id: "it-2",
    type: "task",
    title: "Compare with three competitor pages",
    status: "todo",
    dueAt: relativeIsoIso(36),
    tags: ["research"],
    updatedAt: relativeIso(-60),
  },
  {
    id: "it-3",
    type: "research",
    title: "Founder essay — 'Why now'",
    url: "https://example.com/founder-essay",
    preview:
      "Most startups announce. Few explain. The strongest launch pages — Notion 2016, Linear 2019, Arc 2022 — all answer one question before they ask for anything: why now?",
    tags: ["essay", "positioning"],
    updatedAt: relativeIso(-130),
  },
  {
    id: "it-4",
    type: "idea",
    title: "Use a quiet calendar as the home hero",
    preview:
      "The day is the canvas. Show what's planned, what's loose, and what just landed.",
    tags: ["ux", "draft"],
    updatedAt: relativeIso(-680),
  },
  {
    id: "it-5",
    type: "bookmark",
    title: "Stripe homepage (2024)",
    url: "https://stripe.com",
    tags: ["reference", "design"],
    updatedAt: relativeIso(-1440),
  },
  {
    id: "it-6",
    type: "note",
    title: "Hire slowly. Fire quickly.",
    preview:
      "If you can't write down the criteria for a great hire in 5 sentences, you don't have criteria — you have instinct.",
    tags: ["operations"],
    updatedAt: relativeIso(-1800),
  },
  {
    id: "it-7",
    type: "quote",
    title: "— Frank Chimero",
    preview: "People ignore design that ignores people.",
    tags: ["design"],
    updatedAt: relativeIso(-2200),
  },
  {
    id: "it-8",
    type: "task",
    title: "Sketch three names for the announcement email",
    status: "todo",
    dueAt: relativeIsoIso(96),
    tags: ["naming"],
    updatedAt: relativeIso(-2800),
  },
];

export const DEMO_KANBAN: Record<string, DemoItem[]> = {
  backlog: DEMO_ITEMS.filter((i) => i.type === "task" && i.status === "todo"),
  in_progress: DEMO_ITEMS.filter((i) => i.type === "task" && i.status === "in_progress"),
  review: [],
  done: [
    {
      id: "it-done-1",
      type: "task",
      title: "Lock brief objectives (v2)",
      status: "done",
      tags: ["brief"],
      updatedAt: relativeIso(-2880),
    },
  ],
};

/* -------------------------------------------------------------- mentions -- */

export const DEMO_MENTIONS: DemoMention[] = [
  { sourceId: "it-1", targetId: "it-3" },
  { sourceId: "it-2", targetId: "it-5" },
  { sourceId: "it-8", targetId: "it-4" },
];

/* -------------------------------------------------------- integrations -- */

export const DEMO_INTEGRATIONS: DemoIntegration[] = [
  { provider: "figma", status: "connected", note: "2 files linked" },
  { provider: "github", status: "connected", note: "Issues sync on" },
  { provider: "google_drive", status: "demo", note: "Connect in v1.1" },
  { provider: "notion", status: "demo", note: "Importer ready" },
  { provider: "slack", status: "disconnected", note: "Re-authorise" },
  { provider: "linear", status: "connected", note: "Status updates on" },
  { provider: "dropbox", status: "demo", note: "Planned for v1.1" },
];

/* ----------------------------------------------------- AI artifact log -- */

export const DEMO_AI_ARTIFACTS: DemoAiArtifact[] = [
  {
    id: "ai-1",
    kind: "summary",
    title: "Summary of 'Launch positioning'",
    excerpt:
      "Three observations stand out. First, the strongest signal in the available material is the opening framing — it sets the tone for everything that follows. Second…",
    model: "kora-stub-1",
    createdAt: relativeIso(-220),
  },
  {
    id: "ai-2",
    kind: "outline",
    title: "Outline for 'Why now?'",
    excerpt:
      "I. Open with a single, anchored claim. II. Provide two pieces of evidence from the workspace. III. Surface a tension the audience will recognise. IV. Resolve it with a tighter ask.",
    model: "kora-stub-1",
    createdAt: relativeIso(-340),
  },
  {
    id: "ai-3",
    kind: "swot",
    title: "SWOT — Helio Q3 press",
    excerpt:
      "Strengths — clarity of intent; a single anchor that survives editing. Weaknesses — pacing in the middle section; jargon creep on slide 3. …",
    model: "kora-stub-1",
    createdAt: relativeIso(-1120),
  },
];

/* ---------------------------------------------------- calendar entries -- */

export const DEMO_CALENDAR_ENTRIES = [
  { id: "cal-1", title: "Brief review (Acme)", at: relativeIsoIso(60 * 24), kind: "meeting" },
  { id: "cal-2", title: "Deliver v2 — Beta Atelier", at: relativeIsoIso(60 * 48), kind: "deadline" },
  { id: "cal-3", title: "Press call — Delta", at: relativeIsoIso(60 * 96), kind: "meeting" },
  { id: "cal-4", title: "Weekly workspace review", at: relativeIsoIso(60 * 24 * 7), kind: "recurring" },
];

/* ----------------------------------------------------- research entries -- */

export const DEMO_RESEARCH = [
  {
    id: "r-1",
    title: "Founder essay — 'Why now'",
    domain: "longform.substack.com",
    excerpt:
      "Most startups announce. Few explain. The strongest launch pages — Notion 2016, Linear 2019, Arc 2022 — all answer one question before they ask for anything.",
    highlights: 3,
    savedAt: relativeIso(-130),
    tag: "essay",
  },
  {
    id: "r-2",
    title: "Linear's launch page, annotated",
    domain: "linear.app/launch",
    excerpt:
      "The headline is small. The body is dense. There's whitespace everywhere. The CTA is below the fold on purpose — a contrarian bet that says 'read first'.",
    highlights: 7,
    savedAt: relativeIso(-880),
    tag: "design",
  },
  {
    id: "r-3",
    title: "Stripe Sessions — Talk transcript",
    domain: "stripe.com/sessions",
    excerpt:
      "Mikkel Svane and Jens-Fabian Göttert on writing onboarding copy that doesn't feel like onboarding.",
    highlights: 4,
    savedAt: relativeIso(-2200),
    tag: "copywriting",
  },
];

/* ---------------------------------------------------------- media items -- */

export const DEMO_MEDIA = [
  {
    id: "m-1",
    kind: "image" as const,
    title: "Hero — Kora cover (WIP)",
    palette: ["#0a0a0a", "#f5f2ee", "#9bc1a4"],
    bytes: 124_000,
  },
  {
    id: "m-2",
    kind: "image" as const,
    title: "Moodboard — quiet, paper, dawn",
    palette: ["#0a0a0a", "#f5f2ee", "#c8b89a"],
    bytes: 312_000,
  },
  {
    id: "m-3",
    kind: "image" as const,
    title: "Sketch — workspace composition",
    palette: ["#0a0a0a", "#efe9df", "#6b6b70"],
    bytes: 92_000,
  },
  {
    id: "m-4",
    kind: "video" as const,
    title: "Screen record — onboarding tour",
    palette: ["#0a0a0a", "#a1a1aa", "#f5f2ee"],
    bytes: 8_320_000,
  },
  {
    id: "m-5",
    kind: "audio" as const,
    title: "Voice memo — founder note",
    palette: ["#0a0a0a", "#9bc1a4"],
    bytes: 4_120_000,
  },
  {
    id: "m-6",
    kind: "image" as const,
    title: "Brand mark — k glyph (alternate)",
    palette: ["#0a0a0a", "#efe9df"],
    bytes: 12_000,
  },
];

/* ------------------------------------------------------------ smartviews -- */

export const DEMO_SMARTVIEWS = [
  { id: "view-pin", title: "Pinned projects", glyph: "★", count: 3 },
  { id: "view-today", title: "Today", glyph: "•", count: 2 },
  { id: "view-week", title: "This week", glyph: "•", count: 5 },
  { id: "view-archive", title: "Archive", glyph: "◇", count: 0 },
  { id: "view-trash", title: "Trash", glyph: "○", count: 0 },
];

/* ------------------------------------------------------------ folder tree -- */

export const DEMO_FOLDERS = [
  { id: "f-1", name: "Studio notes", icon: "◇", depth: 0 },
  { id: "f-2", name: "Client work", icon: "●", depth: 0 },
  { id: "f-3", name: "Press", icon: "▪", depth: 1, parent: "f-2" },
  { id: "f-4", name: "Brand", icon: "▪", depth: 1, parent: "f-2" },
  { id: "f-5", name: "Reading", icon: "○", depth: 0 },
  { id: "f-6", name: "Skipped later", icon: "▫", depth: 0 },
];

/* ----------------------------------------------------------------- helpers */

export function relativeIso(offsetMinutes: number): string {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

function relativeIsoIso(offsetMinutes: number): string {
  return relativeIso(offsetMinutes);
}
