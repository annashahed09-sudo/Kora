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

export type AuthActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

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
    return { ok: false, message: "Email or password is incorrect." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}


function fieldErrorsFrom(
  parsed: { error: { flatten: () => { fieldErrors: Record<string, string[]> } } }
): AuthActionState {
  const flat = parsed.error.flatten().fieldErrors;
  const fieldErrors: AuthActionState["fieldErrors"] = {};
  if (flat.email?.[0]) fieldErrors.email = flat.email[0];
  if (flat.password?.[0]) fieldErrors.password = flat.password[0];
  return { ok: false, fieldErrors };
}
