/**
 * Browser-side Supabase client.
 *
 * Singleton pattern — Next 16 will re-execute this module per request, but the
 * client itself is cheap, and a single instance per browser tab is the right
 * memory shape. Keeps the anon key only; RLS is the only auth boundary.
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon || url.includes('placeholder')) {
    // Dev mode — return a stub client. Auth & data queries will fail
    // gracefully at runtime rather than crashing the dev server.
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
