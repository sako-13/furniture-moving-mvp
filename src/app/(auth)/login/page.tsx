import type { Metadata } from "next";
import { login } from "../actions";
import AuthForm from "../AuthForm";

export const metadata: Metadata = {
  title: "Log in | Will It Fit?",
  description: "Log in to the Will It Fit? furniture moving simulator.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <main className="flex flex-col gap-4 px-4 py-16 sm:py-24">
      {error === "confirm" && (
        <p role="alert" className="mx-auto w-full max-w-md rounded-md border border-accent/30 bg-warning-tint px-4 py-3 text-sm text-ink">
          That confirmation link has expired or was already used. Try logging in. If that fails, sign up again.
        </p>
      )}
      <AuthForm mode="login" action={login} next={next} />
    </main>
  );
}
