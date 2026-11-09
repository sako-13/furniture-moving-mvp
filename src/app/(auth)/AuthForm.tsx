"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Mode = "login" | "signup";

const inputClass =
  "rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400";

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
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{isSignup ? "Create your account" : "Log in"}</h1>
        <p className="text-sm text-slate-600">
          {isSignup ? "Save your preferences for next time." : "Welcome back."}
        </p>
      </div>

      {state.message ? (
        <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          {next && <input type="hidden" name="next" value={next} />}
          {isSignup && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-600">Name (optional)</span>
              <input name="displayName" autoComplete="name" maxLength={80} className={inputClass} />
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={state.email}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={isSignup ? 8 : undefined}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className={inputClass}
            />
            {isSignup && <span className="text-xs text-slate-500">At least 8 characters.</span>}
          </label>

          {state.error && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {pending ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-slate-600">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-indigo-600 hover:underline">
          {isSignup ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
