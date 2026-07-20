"use client";

import { useActionState } from "react";
import { createProject } from "../actions";

type State = {
  ok: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
};

const INITIAL: State = { ok: true };

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev: State, formData: FormData) => createProject(formData),
    INITIAL
  );

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex items-center justify-between">
        <p className="eyebrow">New project</p>
        <p aria-hidden className="eyebrow">+</p>
      </div>

      <Field
        label="Title"
        name="title"
        type="text"
        error={state.fieldErrors?.title?.[0]}
        required
      />
      <Field
        label="Client"
        name="client_name"
        type="text"
        error={state.fieldErrors?.client_name?.[0]}
        required
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="eyebrow">Open in phase</legend>
        <div className="grid grid-cols-3 gap-px rounded-[10px] bg-line">
          {(["Brief", "Concept", "Delivery"] as const).map((p, i) => (
            <label
              key={p}
              className="flex cursor-pointer items-center justify-center gap-2 bg-bg px-3 py-2.5 text-[12.5px] text-fg-muted transition-colors hover:bg-bg-soft has-[:checked]:bg-bg-card has-[:checked]:text-fg"
            >
              <input
                type="radio"
                name="phase"
                value={p}
                defaultChecked={i === 0}
                className="sr-only"
              />
              {p}
            </label>
          ))}
        </div>
      </fieldset>

      {state.message ? (
        <p
          role="alert"
          className="text-[12.5px] text-[#e0a89a]"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-fg px-5 text-[14px] font-medium text-bg transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create project"}
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
  type: "text" | "email";
  required?: boolean;
  error?: string;
};

function Field({ label, name, type, required, error }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      <input
        name={name}
        type={type}
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
