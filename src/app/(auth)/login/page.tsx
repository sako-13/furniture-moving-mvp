import type { Metadata } from "next";
import { login } from "../actions";
import AuthForm from "../AuthForm";

export const metadata: Metadata = { title: "Log in — Will It Fit?" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <main className="flex flex-col gap-4 px-4 py-12">
      {error === "confirm" && (
        <p className="mx-auto w-full max-w-sm rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          That confirmation link is invalid or expired. Try logging in, or sign up again.
        </p>
      )}
      <AuthForm mode="login" action={login} next={next} />
    </main>
  );
}
