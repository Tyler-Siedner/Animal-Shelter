"use client";
// Authors: Tyler Siedner and Tyler Harris
import { useActionState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { FormState } from "../types/account";
export default function ActionForm({
  action,
  children,
  buttonLabel,
  className = "",
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: ReactNode;
  buttonLabel: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const values = useRef(new Map<string, string>());
  // React resets uncontrolled forms when an action completes. Preserve ordinary
  // fields after validation errors, but never restore passwords or hidden IDs.
  useEffect(() => {
    if (!state.error || !formRef.current) return;
    for (const [name, value] of values.current) {
      const field = formRef.current.elements.namedItem(name);
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      )
        field.value = value;
    }
  }, [state]);
  return (
    <form
      ref={formRef}
      action={formAction}
      className={`site-form ${className}`}
      onSubmit={(event) => {
        values.current.clear();
        for (const field of Array.from(event.currentTarget.elements)) {
          if (
            (field instanceof HTMLInputElement &&
              !["password", "hidden", "file"].includes(field.type)) ||
            field instanceof HTMLTextAreaElement ||
            field instanceof HTMLSelectElement
          )
            values.current.set(field.name, field.value);
        }
      }}
    >
      <fieldset disabled={pending}>{children}</fieldset>
      {!pending && state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {!pending && state.success && (
        <p className="form-success" role="status">
          {state.success}
        </p>
      )}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Please wait…" : buttonLabel}
      </button>
    </form>
  );
}
