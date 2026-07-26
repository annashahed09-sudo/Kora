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
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, isAuthed: Boolean(user) };
}
