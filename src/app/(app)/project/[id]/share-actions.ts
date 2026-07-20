"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { bucket, keyForUser, keyForIp } from "@/lib/rate-limit";

const SHARE_TOKEN_ALPHABET =
  "0123456789ABCDEFGHJKMNPQRSTVWXYZabcdefghijkmnopqrstuvwxyz";
const mint = customAlphabet(SHARE_TOKEN_ALPHABET, 22);

/**
 * Tokens are 22 chars drawn from a 56-symbol alphabet (~5.4 × 10^36
 * permutations). The alphabet avoids I, L, O, 0 to reduce visual
 * confusion in URLs.
 */
const tokenCharsetRegex = new RegExp(`^[${SHARE_TOKEN_ALPHABET}]{22}$`);

const projectIdSchema = z.object({
  project_id: z.string().uuid(),
});

const SHARE_LINK_TTL_DAYS = 90;

/**
 * shareProject — mints a unique, URL-safe share token, stamps
 * expiry + creator IP for audit, and returns the public read-only URL.
 *
 * Rate-limited per user (5 mints/min) to prevent token-table flooding.
 */
export async function shareProject(projectId: string) {
  const parsed = projectIdSchema.safeParse({ project_id: projectId });
  if (!parsed.success) {
    return { ok: false as const, message: "Invalid project id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Not signed in." };

  const v = bucket({
    key: keyForUser(user.id, "share:mint"),
    limit: 5,
    windowMs: 60_000,
  });
  if (!v.allowed) {
    return { ok: false as const, message: "Too many share links. Try again in a minute." };
  }

  let token = mint();
  for (let i = 0; i < 4; i++) {
    if (!tokenCharsetRegex.test(token)) break;
    const { data: existing } = await supabase
      .from("shares")
      .select("id")
      .eq("token", token)
      .maybeSingle();
    if (!existing) break;
    token = mint();
  }

  const h = await headers();
  const ip = keyForIp(h);
  const expires = new Date(
    Date.now() + SHARE_LINK_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabase.from("shares").insert({
    project_id: parsed.data.project_id,
    token,
    read_only: true,
    expires_at: expires,
    created_by_ip: ip === "unknown" ? null : ip,
  } as never);

  if (error) return { ok: false as const, message: error.message };

  const siteUrl = envSiteUrl();
  revalidatePath(`/project/${parsed.data.project_id}`);
  return {
    ok: true as const,
    token,
    url: `${siteUrl}/share/${token}`,
    expiresAt: expires,
  };
}

/**
 * revokeShare — marks the share as revoked. The owner only. The /share/[token]
 * page's RPC will return NULL on a revoked token, so visitors see 404 instead
 * of stale content.
 */
export async function revokeShare(projectId: string, token: string) {
  const parsed = z
    .object({
      project_id: z.string().uuid(),
      token: z.string().regex(tokenCharsetRegex),
    })
    .safeParse({ project_id: projectId, token });
  if (!parsed.success) {
    return { ok: false as const, message: "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, message: "Not signed in." };

  const v = bucket({
    key: keyForUser(user.id, "share:revoke"),
    limit: 10,
    windowMs: 60_000,
  });
  if (!v.allowed) {
    return { ok: false as const, message: "Too many revokes. Try again in a minute." };
  }

  const { error } = await supabase
    .from("shares")
    .update({ revoked_at: new Date().toISOString() } as never)
    .eq("project_id", parsed.data.project_id)
    .eq("token", parsed.data.token);

  if (error) return { ok: false as const, message: error.message };

  revalidatePath(`/project/${parsed.data.project_id}`);
  return { ok: true as const };
}

/* ------------------------------------------------------------- helpers -- */

function envSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const base =
    raw && raw.length > 0 ? raw : "https://kora.studio";
  return base.replace(/\/$/, "");
}
