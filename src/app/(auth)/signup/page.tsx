import type { Metadata } from "next";
import { signup } from "../actions";
import AuthForm from "../AuthForm";

export const metadata: Metadata = { title: "Sign up — Will It Fit?" };

export default function SignupPage() {
  return (
    <main className="px-4 py-12">
      <AuthForm mode="signup" action={signup} />
    </main>
  );
}
