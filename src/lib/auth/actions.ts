"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { bucket, keyForIp } from "@/lib/rate-limit";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/zod/schemas";

/**
 * Form-action state shape. We never leak server error stack traces; the
 * `message` field holds the user-facing copy only.
 */
export type AuthActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

/**
 * Rate-limit an unauthenticated action by client IP. signup is slower than
 * login because each successful signup writes a row; we cap it harder.
 */
async function enforceIpRateLimit(
  action: "login" | "signup",
  limit: number,
  windowMs: number
): Promise<void> {
  const h = await headers();
  const verdict = bucket({
    key: `${action}:${keyForIp(h)}`,
    limit,
    windowMs,
  });
  if (!verdict.allowed) {
    throw new Error("Too many attempts. Try again in a minute.");
  }
}

/* ----------------------------------------------------------------- signup -- */

export async function signup(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  await enforceIpRateLimit("signup", 5, 60_000);

  const parsed = signupSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  } satisfies SignupInput);

  if (!parsed.success) {
    return fieldErrorsFrom(parsed);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  // Mirror the auth user into public.users so RLS policies downstream have
  // a profile row to key against. 23505 means the trigger already did it.
  if (data.user) {
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: data.user.id,
        email: parsed.data.email,
      } as never);
    if (profileError && profileError.code !== "23505") {
      return {
        ok: false,
        message: "Account created but profile setup failed.",
      };
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/* ------------------------------------------------------------------ login -- */

export async function login(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  await enforceIpRateLimit("login", 10, 60_000);

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  } satisfies LoginInput);

  if (!parsed.success) {
    return fieldErrorsFrom(parsed);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Generic copy — never confirm/deny whether the email exists.
    return { ok: false, message: "Email or password is incorrect." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/* ----------------------------------------------------------------- logout -- */

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/* ---------------------------------------------------------------- helpers -- */

function fieldErrorsFrom(
  parsed: { error: { flatten: () => { fieldErrors: Record<string, string[]> } } }
): AuthActionState {
  const flat = parsed.error.flatten().fieldErrors;
  const fieldErrors: AuthActionState["fieldErrors"] = {};
  if (flat.email?.[0]) fieldErrors.email = flat.email[0];
  if (flat.password?.[0]) fieldErrors.password = flat.password[0];
  return { ok: false, fieldErrors };
}
