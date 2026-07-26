import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const e = env();

  if (!e.hasSupabase) {
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
          }
        },
      },
    }
  );
}
