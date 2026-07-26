"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon || url.includes('placeholder')) {
    cached = createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key',
      { auth: { detectSessionInUrl: false, persistSession: false } }
    );
  } else {
    cached = createBrowserClient<Database>(url, anon);
  }
  return cached;
}
