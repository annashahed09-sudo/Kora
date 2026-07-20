/**
 * AI provider abstraction.
 *
 * Pages and components never call OpenAI or any vendor directly. They call
 * `getAI().generateText(...)` and receive a structured response. Switching
 * providers (or to a local model) is a single-file change.
 *
 * v1.0 ships a deterministic stub provider so the UI renders with seeded
 * suggestions without burning model tokens. v1.1 plugs in the OpenAI /
 * Anthropic / local provider behind the same interface.
 *
 * Hard guardrails (token cap, prompt injection scrub, daily quota) live in
 * `./guardrails.ts` and run INSIDE `generateText` so a caller can't bypass
 * them by mistake.
 */

import {
  AiGuardInput,
  estimateTotalTokens,
  remainingDailyTokens,
  recordTokens,
  throwIfDisallowed,
} from "./guardrails";

export type AiCapability =
  | "summary"
  | "outline"
  | "mind_map"
  | "swot"
  | "critique"
  | "brainstorm"
  | "rename"
  | "roadmap";

export type AiInput = {
  capability: AiCapability;
  prompt: string;
  context?: Array<{ type: "note" | "doc" | "task"; title: string; body: string }>;
  workspaceId: string;
  /** Optional user id for per-user quota tracking. */
  userId?: string | null;
};

export type AiOutput = {
  capability: AiCapability;
  text: string;
  structured?: unknown;        // typed by capability downstream
  model: string;
  createdAt: string;
  /** Tokens consumed (input + output estimate) — surfaced in the audit log. */
  tokensUsed?: number;
};

export interface AIProvider {
  name: string;
  isAvailable(userId?: string | null): boolean;
  generateText(input: AiInput): Promise<AiOutput>;
}

/* ---------------------------------------------------------------------- */
/* Default provider: deterministic stub.                                  */
/* Replace with `createOpenAIProvider()` or similar in v1.1.              */
/* ---------------------------------------------------------------------- */

let cached: AIProvider | null = null;

export function getAI(): AIProvider {
  if (cached) return cached;
  cached = process.env.OPENAI_API_KEY
    ? createOpenAIProvider()
    : createStubProvider();
  return cached;
}

/**
 * Centralised guardrail wrapper — every provider's generateText() funnels
 * through this. It is intentionally a pure function so the stub and any
 * future real provider inherit the same protections.
 */
async function guarded<T extends Pick<AiOutput, never>>(
  input: AiInput,
  fn: () => Promise<T>
): Promise<T> {
  // 1. Reject obviously bad input — fail fast so no provider call is made.
  throwIfDisallowed(input as AiGuardInput);

  // 2. Per-user daily quota ceiling.
  const remaining = remainingDailyTokens(input.userId ?? null);
  const projected = estimateTotalTokens(input as AiGuardInput);
  if (remaining <= 0 || projected > remaining) {
    throw new Error(
      `[ai] daily token quota exhausted for user (${input.userId ?? "anon"}). ` +
      `Projected ${projected} > remaining ${remaining}.`
    );
  }

  // 3. Provider call.
  const out = await fn();

  // 4. Record consumption (input only — v1.1 will refine to include output).
  recordTokens(input.userId ?? null, projected);

  return { ...out, tokensUsed: projected };
}

function createStubProvider(): AIProvider {
  return {
    name: "stub",
    isAvailable: (userId) => remainingDailyTokens(userId ?? null) > 0,
    async generateText(input) {
      return guarded(input, async () => {
        const seed = `${input.capability}:${input.prompt}:${input.context?.length ?? 0}`;
        const text = composeStubAnswer(
          input.capability,
          input.prompt,
          input.context,
        );
        return {
          capability: input.capability,
          text,
          model: "kora-stub-1",
          createdAt: new Date().toISOString(),
          structured: null,
          seed,
        };
      });
    },
  };
}

function composeStubAnswer(
  capability: AiCapability,
  prompt: string,
  context?: AiInput["context"]
): string {
  const ctx = context || [];
  const head =
    ctx.length === 0
      ? prompt
      : `${prompt}\n\nConsidering ${ctx.length} item${ctx.length === 1 ? "" : "s"} in the workspace.`;

  switch (capability) {
    case "summary":
      return [
        "Three observations stand out.",
        "First, the strongest signal in the available material is the opening framing — it sets the tone for everything that follows.",
        "Second, the underlying intent is sharper than the surface language suggests.",
        "Third, there is room to compress two related paragraphs into one without losing fidelity.",
        "A revision pass should focus on these three points before the work is shareable.",
      ].join("\n\n");
    case "outline":
      return [
        "I. Open with a single, anchored claim.",
        "II. Provide two pieces of evidence from the workspace.",
        "III. Surface a tension the audience will recognise.",
        "IV. Resolve it with a tighter ask.",
      ].join("\n");
    case "swot":
      return [
        "Strengths — clarity of intent; a single anchor that survives editing.",
        "Weaknesses — pacing in the middle section; jargon creep on slide 3.",
        "Opportunities — the comparison with competitor copy is an untapped lane.",
        "Threats — the launch window is shorter than the polish cycle.",
      ].join("\n");
    case "critique":
      return [
        "What works: the opening line is unusually specific.",
        "What doesn't: the second paragraph repeats the first, in different words.",
        "Where it's at risk: the supporting evidence is thin.",
        "A revision should keep the opening, cut the repetition, and add a single piece of proof.",
      ].join("\n");
    case "brainstorm":
      return [
        "Lead with the question, not the answer.",
        "Borrow a frame from outside the category (cinematography, cartography, parenting).",
        "Pretend the audience is a curious generalist, not a specialist.",
        "Find the smallest version of the idea that still feels right.",
      ].join("\n");
    case "mind_map":
      return head;
    case "rename":
      return "Untitled";
    case "roadmap":
      return [
        "Now — name the single anchor.",
        "Next — secure one piece of evidence.",
        "Then — make the comparison.",
        "Later — close the loop with the audience.",
      ].join("\n");
    default:
      return head;
  }
}

/* ---------------------------------------------------------------------- */
/* Real provider scaffolding — not wired in v1.0.                         */
/* Drop-in for v1.1.                                                      */
/* ---------------------------------------------------------------------- */

function createOpenAIProvider(): AIProvider {
  // v1.1: hit the OpenAI Responses API here. For now we ship the stub so
  // a deployed app with OPENAI_API_KEY set doesn't accidentally burn
  // tokens in a way we haven't audited. Switching is one file change.
  return createStubProvider();
}
