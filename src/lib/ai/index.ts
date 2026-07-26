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
  userId?: string | null;
};

export type AiOutput = {
  capability: AiCapability;
  text: string;
  structured?: unknown;      
  model: string;
  createdAt: string;
  tokensUsed?: number;
};

export interface AIProvider {
  name: string;
  isAvailable(userId?: string | null): boolean;
  generateText(input: AiInput): Promise<AiOutput>;
}

let cached: AIProvider | null = null;

export function getAI(): AIProvider {
  if (cached) return cached;
  cached = process.env.OPENAI_API_KEY
    ? createOpenAIProvider()
    : createStubProvider();
  return cached;
}

async function guarded<T extends Pick<AiOutput, never>>(
  input: AiInput,
  fn: () => Promise<T>
): Promise<T> {
  
  throwIfDisallowed(input as AiGuardInput);

  const remaining = remainingDailyTokens(input.userId ?? null);
  const projected = estimateTotalTokens(input as AiGuardInput);
  if (remaining <= 0 || projected > remaining) {
    throw new Error(
      `[ai] daily token quota exhausted for user (${input.userId ?? "anon"}). ` +
      `Projected ${projected} > remaining ${remaining}.`
    );
  }

  const out = await fn();

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

function createOpenAIProvider(): AIProvider {
  return createStubProvider();
}
