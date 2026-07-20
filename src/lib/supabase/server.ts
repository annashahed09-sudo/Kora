/**
 * Server-side Supabase client for React Server Components, Route Handlers,
 * and Server Actions in Next.js 16.
 *
 * Reads validated env through `lib/env` so a misconfigured deploy crashes
 * loudly rather than running with a placeholder that silently 401s every
 * request.
 *
 * `cookies()` from next/headers is async since Next 15 — we await it before
 * handing the reader/writer to the Supabase SSR client.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const e = env();

  if (!e.hasSupabase) {
    // Dev mode (env not configured) — return a minimal proxy so the
    // server still starts. Auth & data queries fail loudly at call site.
    return createServerClient<Database>(
      "https://placeholder.supabase.co",
      "placeholder-key",
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
        auth: { detectSessionInUrl: false, persistSession: false },
      }
    );
  }

  // hasSupabase=true implies the public env vars are present and well-formed.
  return createServerClient<Database>(
    e.NEXT_PUBLIC_SUPABASE_URL!,
    e.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          toSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          try {
            toSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // RSC contexts can't write cookies. The middleware refreshes
            // the session on every request, so this branch is safe.
          }
        },
      },
    }
  );
}
