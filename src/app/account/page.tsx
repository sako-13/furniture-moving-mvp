import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../(auth)/actions";
import { getCurrentUser } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = { title: "Account — Will It Fit?" };

export default async function AccountPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const joined = new Date(profile?.created_at ?? user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-12">
      <section className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Your account</h1>
          <p className="text-sm text-slate-600">
            {user.email} · Member since {joined}
          </p>
        </div>
        {profile ? (
          <ProfileForm displayName={profile.display_name ?? ""} preferredUnit={profile.preferred_unit} />
        ) : (
          <p className="text-sm text-amber-800">Your profile couldn&apos;t be loaded. Refresh to try again.</p>
        )}
      </section>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Open the simulator
        </Link>
        <form action={logout}>
          <button type="submit" className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
