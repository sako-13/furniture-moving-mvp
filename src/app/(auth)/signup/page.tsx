import type { Metadata } from "next";
import { signup } from "../actions";
import AuthForm from "../AuthForm";

export const metadata: Metadata = {
  title: "Sign up | Will It Fit?",
  description: "Create a free Will It Fit? account to test whether your furniture fits through your hallway and doorway.",
};

export default function SignupPage() {
  return (
    <main className="px-4 py-16 sm:py-24">
      <AuthForm mode="signup" action={signup} />
    </main>
  );
}
