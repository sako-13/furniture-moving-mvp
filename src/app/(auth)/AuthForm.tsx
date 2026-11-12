"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Mode = "login" | "signup";

export default function AuthForm({
  mode,
  action,
  next,
}: {
  mode: Mode;
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  return (
    <div className="card mx-auto flex w-full max-w-md flex-col gap-7 p-8 shadow-[0_24px_48px_-32px_rgba(15,27,54,0.35)]">
      <div className="flex flex-col gap-2">
        <h1 className="display text-3xl">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="text-ink-muted">
          {isSignup ? "Free, and it remembers your preferred units." : "Log in to open the simulator."}
        </p>
      </div>

      {state.message ? (
        <div role="status" className="flex flex-col gap-1 rounded-xl bg-success-tint px-4 py-3 text-sm text-success">
          <span className="font-semibold">Check your inbox</span>
          <span className="text-ink">{state.message}</span>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-5">
          {next && <input type="hidden" name="next" value={next} />}
          {isSignup && (
            <label className="flex flex-col gap-1.5">
              <span className="field-label">
                Name <span className="font-normal">(optional)</span>
              </span>
              <input name="displayName" autoComplete="name" maxLength={80} className="input" />
            </label>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="field-label">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={state.email}
              placeholder="you@example.com"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="field-label">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={isSignup ? 8 : undefined}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="input"
            />
            {isSignup && <span className="text-xs text-ink-muted">At least 8 characters.</span>}
          </label>

          {state.error && (
            <p role="alert" className="rounded-xl bg-danger-tint px-4 py-3 text-sm text-danger">
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary mt-1 w-full py-3 text-base">
            {pending ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>
      )}

      <p className="border-t border-line pt-5 text-center text-sm text-ink-muted">
        {isSignup ? "Already have an account? " : "New to Will It Fit? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-ink underline underline-offset-4 hover:text-accent-strong">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
