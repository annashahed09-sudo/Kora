"use client";

import { useActionState } from "react";
import {
  login,
  type AuthActionState,
} from "@/lib/auth/actions";

const AUTH_INITIAL: AuthActionState = { ok: false };

/**
 * `login` server action wrapped in a React 19 `useActionState`. The server
 * action validates via Zod, calls Supabase, and `redirect()`s on success.
 * On failure it returns `{ ok: false, message, fieldErrors }`.
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    login,
    AUTH_INITIAL
  );

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />

      {state.message && !state.fieldErrors ? (
        <p
          role="alert"
          className="rounded-md border border-line bg-bg-soft px-3 py-2 text-[13px] text-fg-muted"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-fg px-5 text-[14px] font-medium text-bg transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
        <span
          aria-hidden
          className="inline-block transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: "email" | "password" | "text";
  autoComplete?: string;
  required?: boolean;
  error?: string;
};

function Field({ label, name, type, autoComplete, required, error }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        className="h-11 rounded-[10px] border border-line bg-bg-soft px-3.5 text-[14px] text-fg placeholder:text-fg-faint transition-colors hover:border-line-strong focus:border-line-strong focus:outline-none"
      />
      {error ? (
        <span className="text-[12px] text-[#e0a89a]">{error}</span>
      ) : null}
    </label>
  );
}
