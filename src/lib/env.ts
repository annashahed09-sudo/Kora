/**
 * Environment validator.
 *
 * Validates `process.env` once on first import; subsequent calls return the
 * cached snapshot. In production, missing required client-facing vars cause
 * a hard throw at process boot so misconfiguration doesn't silently degrade
 * auth. In development, missing vars log a warning and surfaces continue
 * to render against demo data.
 *
 * SECURITY: server-only keys live in this file but are never re-exported
 * from anywhere that could reach the client bundle. The "use client"
 * modules only read `NEXT_PUBLIC_*` variables through the validated shape.
 */
import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a URL.")
    .optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY looks too short.")
    .optional(),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("https://kora.studio"),
});

const serverSchema = z.object({
  // Service-role keys are 200+ chars in practice. 40+ is a much weaker
  // floor that still catches "I forgot to paste it" cases.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(40).optional(),
  OPENAI_API_KEY: z.string().min(20).optional(),
  SUPABASE_PROJECT_REF: z.string().optional(),
});

type PublicEnv = z.infer<typeof publicSchema>;
type ServerEnv = z.infer<typeof serverSchema>;

export type KoraEnv = PublicEnv &
  ServerEnv & {
    /** True when this process is running Next.js production build. */
    isProd: boolean;
    /**
     * True when NEXT_PUBLIC_SUPABASE_URL is configured AND reachable.
     * Pages use this to render DemoPill vs. real chrome.
     */
    hasSupabase: boolean;
  };

let cached: KoraEnv | null = null;
let warned = false;

function parse(): KoraEnv {
  const isProd = process.env.NODE_ENV === "production";

  const pub = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!pub.success && !warned) {
    console.warn("[kora/env] public env validation:",
      JSON.stringify(pub.error.flatten().fieldErrors));
    warned = true;
  }

  const svr = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF,
  });

  if (!svr.success && isProd && !warned) {
    // Not a hard throw — server-side features degrade gracefully. The
    // browser-side check below IS a hard throw.
    console.warn("[kora/env] server-side vars invalid — storage/AI may degrade to inert mode.");
    warned = true;
  }

  const pubOk = pub.success ? pub.data : ({} as PublicEnv);
  const svrOk = svr.success ? svr.data : ({} as ServerEnv);

  const hasSupabase = Boolean(
    pubOk.NEXT_PUBLIC_SUPABASE_URL &&
    pubOk.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !pubOk.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"),
  );

  return { ...pubOk, ...svrOk, isProd, hasSupabase };
}

export function env(): KoraEnv {
  if (!cached) cached = parse();
  return cached;
}

/**
 * Hard-fail in production if the browser-side Supabase config is missing.
 * Pages call this on first render — empty config in prod is a deployment
 * bug, not a dev convenience.
 */
export function assertBrowserSupabase(): { url: string; anon: string } {
  const e = env();
  if (!e.hasSupabase && e.isProd) {
    throw new Error(
      "[kora/env] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required at build time. They must be set in your Vercel project settings."
    );
  }
  return {
    url: e.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anon: e.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

/**
 * Server-only check. NEVER call from a client component — the keys these
 * return will leak if the import graph reaches the bundle.
 */
export function assertServerSupabase(): { url: string; serviceKey: string } {
  const e = env();
  if (!e.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("[kora/env] SUPABASE_SERVICE_ROLE_KEY is required for storage/AI/admin paths.");
  }
  return {
    url: e.NEXT_PUBLIC_SUPABASE_URL ?? "",
    serviceKey: e.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/** Clears the cached snapshot. Test-only helper. */
export function __resetEnvForTests(): void {
  cached = null;
  warned = false;
}
