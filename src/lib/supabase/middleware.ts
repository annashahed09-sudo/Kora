/**
 * Supabase session refresh, used by the root `middleware.ts`.
 *
 * On every request:
 * 1. Read cookies from the incoming NextRequest
 * 2. Build a Supabase server client with that cookie store
 * 3. Refresh the session if it's expiring
 * 4. Propagate any cookies the auth flow set on the response
 *
 * Uses `lib/env` so the placeholder branch only fires when the env is
 * genuinely unconfigured (dev) and not because a typo in a Next preset.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  isAuthed: boolean;
}> {
  let response = NextResponse.next({ request });
  const e = env();

  if (!e.hasSupabase) {
    // Env missing — pass through. The route-level auth guard fires next.
    return { response, isAuthed: false };
  }

  const supabase = createServerClient<Database>(
    e.NEXT_PUBLIC_SUPABASE_URL!,
    e.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          toSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          toSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() is the authoritative check — it validates the JWT against
  // the Supabase Auth server. The middleware uses this to decide whether
  // the request is redirect-worthy.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, isAuthed: Boolean(user) };
}
