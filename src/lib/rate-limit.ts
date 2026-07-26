type Bucket = {

  hits: number[];
  limit: number;
  windowMs: number;
  lastTouchMs: number;
};

const STORE = new Map<string, Bucket>();

const GC_INTERVAL_MS = 60_000;
let gcTimer: ReturnType<typeof setInterval> | null = null;
function ensureGcStarted(): void {
  if (gcTimer) return;
  gcTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, b] of STORE) {
      if (now - b.lastTouchMs > b.windowMs * 4) STORE.delete(k);
    }
  }, GC_INTERVAL_MS);
  if (gcTimer && typeof gcTimer === "object" && typeof gcTimer.unref === "function") {
    gcTimer.unref();
  }
}

export type RateVerdict = {
  allowed: boolean;
  remaining: number;
  retryInMs: number;
};

export function bucket(input: {
  key: string;
  limit: number;
  windowMs: number;
}): RateVerdict {
  ensureGcStarted();
  const now = Date.now();
  const existing = STORE.get(input.key);

  if (!existing) {
    STORE.set(input.key, {
      hits: [now],
      limit: input.limit,
      windowMs: input.windowMs,
      lastTouchMs: now,
    });
    return { allowed: true, remaining: input.limit - 1, retryInMs: 0 };
  }

  const cutoff = now - input.windowMs;
  while (existing.hits.length > 0 && existing.hits[0] < cutoff) {
    existing.hits.shift();
  }
  existing.lastTouchMs = now;

  if (existing.hits.length >= input.limit) {
    const oldest = existing.hits[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      retryInMs: Math.max(0, oldest + input.windowMs - now),
    };
  }

  existing.hits.push(now);
  return {
    allowed: true,
    remaining: input.limit - existing.hits.length,
    retryInMs: 0,
  };
}

export function keyForIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const real = headers.get("x-real-ip");
  return real || "unknown";
}

export function keyForUser(userId: string, action: string): string {
  return `u:${userId}:${action}`;
}

export function keyForAction(action: string, scope: string): string {
  return `a:${action}:${scope}`;
}
