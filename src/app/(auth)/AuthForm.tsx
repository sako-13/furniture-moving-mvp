"use client";

import { CircleAlert, MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { icon, iconLg } from "@/components/icon";
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
    <div className="card mx-auto flex w-full max-w-md flex-col gap-8 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="display text-3xl">{isSignup ? "Create your account" : "Log in"}</h1>
        <p className="text-ink-muted">
          {isSignup ? "It's free. Your account remembers your preferred unit." : "Log in to open the simulator."}
        </p>
      </div>

      {state.message ? (
        <div role="status" className="flex gap-3 rounded-md border border-success/25 bg-success-tint px-4 py-3 text-sm">
          <MailCheck {...iconLg} className="shrink-0 text-success" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-success">Check your inbox</span>
            <span className="text-ink">{state.message}</span>
          </div>
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
            <p role="alert" className="flex items-start gap-2 rounded-md border border-danger/25 bg-danger-tint px-3 py-2.5 text-sm text-danger">
              <CircleAlert {...icon} className="mt-0.5 shrink-0" />
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary mt-1 w-full py-3 text-base">
            {pending ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>
      )}

      <p className="border-t border-line pt-5 text-sm text-ink-muted">
        {isSignup ? "Already have an account? " : "No account yet? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-ink underline underline-offset-4 hover:text-accent-strong">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
