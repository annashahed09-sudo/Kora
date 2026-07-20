import { PageHeader } from "@/components/ui/PageHeader";
import { DemoPill } from "@/components/ui/DemoPill";
import { Tag } from "@/components/ui/Tag";
import { DEMO_PROJECTS, DEMO_ITEMS, DEMO_MENTIONS } from "@/lib/demo/data";

export const metadata = { title: "Knowledge" };

/**
 * Knowledge — visual map of the workspace's relationships.
 *
 * Each demo entity becomes a node; each mention becomes an edge. v1.1
 * introduces a real force-directed simulation with `cosine` clustering on
 * tag embeddings; for v1.0 the layout is hand-laid in concentric rings so
 * the surface looks intentional without runtime cost.
 */
export default function KnowledgePage() {
  const cx = 460;
  const cy = 280;

  /* Layout — three concentric rings: people (innermost), items (mid), projects (outer). */
  const ITEM_R = innerRadius();   // items inner
  const PROJ_R = MID_R;
  const ring = (radius: number, count: number, start = 0) =>
    Array.from({ length: count }, (_, i) => {
      const t = start + (i / count) * Math.PI * 2;
      return [cx + radius * Math.cos(t), cy + radius * Math.sin(t)] as const;
    });

  const projectNodes = DEMO_PROJECTS.slice(0, 4).map((p, i, arr) => ({
    ...p,
    pos: ring(PROJ_R, arr.length)[i],
  }));

  const itemNodes = DEMO_ITEMS.slice(0, 8).map((it, i, arr) => ({
    ...it,
    pos: ring(ITEM_R, arr.length, Math.PI / 8)[i],
  }));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>

      <PageHeader
        eyebrow="Knowledge"
        title={
          <>
            The map of <span className="italic text-accent">connections</span>.
          </>
        }
        body="Every object in the workspace becomes a node. Shared tags, mentions, and references draw the edges that matter."
      />

      <div className="mt-12 grid grid-cols-12 gap-x-8">
        <section className="col-span-12 md:col-span-9">
          <div className="overflow-hidden rounded-[14px] border border-line bg-halftone">
            <KnowledgeSvg
              cx={cx}
              cy={cy}
              projects={projectNodes}
              items={itemNodes}
              mentions={DEMO_MENTIONS}
            />
          </div>
        </section>

        <aside className="col-span-12 mt-10 md:col-span-3 md:mt-0">
          <p className="eyebrow mb-3">Insights</p>
          <div className="flex flex-col gap-4">
            {[
              {
                title: "Launch positioning",
                body: "Connects to 4 items and 2 projects — your most cross-cutting thread.",
              },
              {
                title: "Tag cluster: positioning",
                body: "5 items share this tag. Looking for a stronger connection between them?",
              },
              {
                title: "Quiet week",
                body: "No mentions older than 6 days. The canvas is stable — good moment to revisit.",
              },
            ].map((i, idx) => (
              <article
                key={idx}
                className="rounded-[12px] border border-line bg-bg-soft p-4"
              >
                <p className="eyebrow mb-1">No. {String(idx + 1).padStart(2, "0")}</p>
                <h3 className="text-display text-[1.05rem] text-fg">{i.title}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-fg-muted">{i.body}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-16 grid grid-cols-12 gap-x-8">
        <section className="col-span-12">
          <p className="eyebrow mb-4">Tag clusters</p>
          <div className="flex flex-wrap gap-2">
            {uniqueTags().map((t) => (
              <Tag key={t.name} label={`${t.name} · ${t.count}`} variant={t.count > 2 ? "warm" : "muted"} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function innerRadius() { return 130; }
const MID_R = 230;
const OUTER_R = 360;

/* ---------------------------------------------------------- knowledge svg */

type NodePos = readonly [number, number];

function KnowledgeSvg({
  cx,
  cy,
  projects,
  items,
  mentions,
}: {
  cx: number;
  cy: number;
  projects: Array<{ id: string; title: string; phase: string; pos: NodePos }>;
  items: Array<{ id: string; type: string; title: string; pos: NodePos }>;
  mentions: Array<{ sourceId: string; targetId: string }>;
}) {
  const itemById = new Map(items.map((i) => [i.id, i]));
  return (
    <svg
      viewBox="0 0 920 560"
      role="img"
      aria-label="Knowledge graph: 4 projects surrounding 8 items in a radial layout, connected by mention edges."
      className="block h-auto w-full"
    >
      <defs>
        <pattern id="kora-kg-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#1a1a1a" />
        </pattern>
        <radialGradient id="kora-kg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5f2ee" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="920" height="560" fill="#0e0e0e" />
      <rect width="920" height="560" fill="url(#kora-kg-dots)" />
      <circle cx={cx} cy={cy} r={OUTER_R} fill="url(#kora-kg-glow)" />

      {/* Concentric guidelines (very subtle) */}
      {[130, MID_R, OUTER_R].map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1a1a1a"
          strokeDasharray="2 6"
          strokeWidth={1}
          opacity={0.6 - i * 0.15}
        />
      ))}

      {/* Mentions → edges (between item nodes) */}
      {mentions
        .map((m, idx) => {
          const a = itemById.get(m.sourceId);
          const b = itemById.get(m.targetId);
          if (!a || !b) return null;
          return (
            <path
              key={idx}
              d={`M${a.pos[0]} ${a.pos[1]} C ${cx} ${cy}, ${cx} ${cy}, ${b.pos[0]} ${b.pos[1]}`}
              fill="none"
              stroke="#2a2a2a"
              strokeWidth={1}
            />
          );
        })}

      {/* Projects (outer ring) */}
      {projects.map((p) => (
        <g key={p.id} transform={`translate(${p.pos[0]}, ${p.pos[1]})`}>
          <circle r={18} fill="#121212" stroke="#efe9df" strokeWidth={1} />
          <text
            textAnchor="middle"
            dy="0.32em"
            fontFamily="var(--font-geist-sans)"
            fontSize="9"
            fill="#f5f2ee"
            letterSpacing="2"
          >
            {p.phase.toUpperCase().slice(0, 4)}
          </text>
          <text
            x={26}
            y={4}
            fontFamily="var(--font-geist-sans)"
            fontSize="10"
            fill="#a1a1aa"
          >
            {p.title.length > 18 ? p.title.slice(0, 18) + "…" : p.title}
          </text>
        </g>
      ))}

      {/* Items (inner ring) */}
      {items.map((it) => (
        <g key={it.id} transform={`translate(${it.pos[0]}, ${it.pos[1]})`}>
          <circle
            r={10}
            fill="#0e0e0e"
            stroke={itemStroke(it.type)}
            strokeWidth={1}
          />
          <text
            textAnchor="middle"
            dy="0.32em"
            fontFamily="var(--font-geist-mono)"
            fontSize="9"
            fill="#a1a1aa"
          >
            {itemGlyph(it.type)}
          </text>
        </g>
      ))}

      {/* Center label */}
      <g transform={`translate(${cx}, ${cy - OUTER_R - 50})`}>
        <text
          x={0}
          textAnchor="middle"
          fontFamily="var(--font-newsreader)"
          fontStyle="italic"
          fontSize="22"
          fill="#efe9df"
        >
          you
        </text>
        <line x1={-22} y1={6} x2={22} y2={6} stroke="#2a2a2a" strokeWidth={1} />
        <text
          x={0}
          y={24}
          textAnchor="middle"
          fontFamily="var(--font-geist-sans)"
          fontSize="9"
          fill="#71717a"
          letterSpacing="2"
        >
          WORKSPACE
        </text>
      </g>
    </svg>
  );
}

function itemGlyph(type: string): string {
  return {
    note: "·",
    task: "≡",
    file: "▤",
    bookmark: "↗",
    research: "◆",
    idea: "✦",
    person: "○",
    event: "▦",
    quote: "‘",
    image: "▥",
    video: "▣",
  }[type] ?? "?";
}

function itemStroke(type: string): string {
  return type === "task" ? "#c8b89a" : type === "research" ? "#9bc1a4" : "#2a2a2a";
}

/* -------------------------------------------------------------- helpers -- */

function uniqueTags() {
  const counts = new Map<string, number>();
  for (const it of DEMO_ITEMS) {
    for (const t of it.tags ?? []) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
