/**
 * AI guardrails — pure defensive helpers that run BEFORE any provider call.
 *
 * Three concrete hard-stops:
 *
 *   1. `estimateTokens` — char-based heuristic before any provider is hit
 *      so we never burn tokens on inputs that would be rejected anyway.
 *   2. `throwIfDisallowed` — input shape + size guard against prompt
 *      injection (oversized payloads, control characters, disallowed
 *      URL/exfil markers).
 *   3. `enforceDailyQuota` — in-process counter that the AI provider checks
 *      before generating. v1.1 swaps this for a Supabase row tally.
 *
 * These are not strict OpenAI limit figures. They are conservative upper
 * bounds so a misconfig'd request never gets within an order of magnitude
 * of the real ceiling.
 */

const MAX_PROMPT_CHARS = 4_000;       // ~1k tokens of explicit prompt
const MAX_CONTEXT_ITEMS = 32;
const MAX_CONTEXT_ITEM_CHARS = 4_000;
const DAILY_TOKEN_BUDGET = 200_000;   // per-user per-day ceiling

/* ----------------------------------------------------------------- input -- */

/** Strips control characters and trims to a hard length cap. */
export function scrub(input: string): string {
  // Control chars 0x00..0x1F except whitespace; remove the lot.
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\u200B-\u200F/g, "")
    .slice(0, MAX_PROMPT_CHARS);
}

/** Block addresses + canonical instruction-overrides that could be exfil. */
const EXFIL_PATTERNS: RegExp[] = [
  /ignore (all|previous|prior) instructions/i,
  /reveal (your|the) system prompt/i,
  /\bid\s*[:=]\s*["']?sk-[A-Za-z0-9]{20,}/i,        // bare OpenAI key
  /(?:https?:\/\/)?[a-z0-9-]+\.openai\.com\/v1\//i,
];

export function looksLikeInjection(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;
  for (const pat of EXFIL_PATTERNS) {
    if (pat.test(trimmed)) return true;
  }
  return false;
}

export type AiGuardInput = {
  capability: string;
  prompt: string;
  context?: Array<{ type: string; title: string; body: string }>;
};

export function throwIfDisallowed(input: AiGuardInput): void {
  if (typeof input.prompt !== "string") {
    throw new Error("[ai] prompt must be a string");
  }
  if (input.prompt.length > MAX_PROMPT_CHARS) {
    throw new Error(`[ai] prompt exceeds ${MAX_PROMPT_CHARS} characters`);
  }
  if (input.context) {
    if (input.context.length > MAX_CONTEXT_ITEMS) {
      throw new Error(`[ai] context exceeds ${MAX_CONTEXT_ITEMS} items`);
    }
    for (const item of input.context) {
      const blob = `${item.title}\n${item.body}`;
      if (blob.length > MAX_CONTEXT_ITEM_CHARS) {
        throw new Error(`[ai] context item "${item.title}" exceeds limit`);
      }
      if (looksLikeInjection(blob)) {
        throw new Error(`[ai] context item "${item.title}" contains disallowed content`);
      }
    }
  }
  if (looksLikeInjection(input.prompt)) {
    throw new Error("[ai] prompt contains disallowed content");
  }
}

/* ----------------------------------------------------------- tokenizing -- */

/** Rough char→token estimate at the 4-chars-per-token ratio. */
export function estimateTokens(input: string): number {
  return Math.ceil(input.length / 4);
}

/** Total tokens for an AI call (prompt + context). */
export function estimateTotalTokens(input: AiGuardInput): number {
  let total = estimateTokens(input.prompt);
  if (input.context) {
    for (const item of input.context) {
      total += estimateTokens(`${item.title}\n${item.body}`);
    }
  }
  return total;
}

/* ----------------------------------------------------------- quota mgmt -- */

/** Per-process counter; not distributed. v1.1 swaps to Supabase row counts. */
const processState = new Map<string, { date: string; usedTokens: number }>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function remainingDailyTokens(userId: string | null): number {
  const k = todayKey();
  const u = processState.get(userId ?? "anon") ?? { date: k, usedTokens: 0 };
  if (u.date !== k) {
    processState.set(userId ?? "anon", { date: k, usedTokens: 0 });
    return DAILY_TOKEN_BUDGET;
  }
  return Math.max(0, DAILY_TOKEN_BUDGET - u.usedTokens);
}

export function recordTokens(userId: string | null, tokens: number): void {
  const key = userId ?? "anon";
  const k = todayKey();
  const u = processState.get(key) ?? { date: k, usedTokens: 0 };
  if (u.date !== k) {
    processState.set(key, { date: k, usedTokens: tokens });
    return;
  }
  processState.set(key, { date: k, usedTokens: u.usedTokens + tokens });
}

/* ------------------------------------------------------------ cost cap -- */

/**
 * Conservative micro-cost ceiling so a runaway loop can't rack up $$$. The
 * stub provider returns 0; the real v1.1 provider will return actual USD.
 */
export function estimateCostCents(input: AiGuardInput): number {
  const tokens = estimateTotalTokens(input);
  const cents = Math.ceil(tokens / 1000); // 1¢ per 1k tokens
  return Math.min(cents, 10); // hard ceiling $0.10 per call
}
