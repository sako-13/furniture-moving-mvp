import type { Metadata } from "next";
import { ArrowRight, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "../(auth)/actions";
import { icon } from "@/components/icon";
import { getCurrentUser } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const metadata: Metadata = {
  title: "Account | Will It Fit?",
  description: "Your Will It Fit? profile and default measurement unit.",
};

export default async function AccountPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const joined = new Date(profile?.created_at ?? user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="display text-4xl">Your account</h1>
          <p className="text-ink-muted">Member since {joined}</p>
        </div>
        <Link href="/simulator" className="btn-primary">
          Open the simulator
          <ArrowRight {...icon} />
        </Link>
      </div>

      <section className="card divide-y divide-line">
        <div className="flex flex-col gap-1 p-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="field-label">Email</span>
          <span className="break-all text-ink">{user.email}</span>
        </div>
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">Profile</h2>
            <p className="text-sm text-ink-muted">Your default unit is what the simulator opens in.</p>
          </div>
          {profile ? (
            <ProfileForm displayName={profile.display_name ?? ""} preferredUnit={profile.preferred_unit} />
          ) : (
            <p role="alert" className="text-sm text-danger">Your profile couldn&apos;t be loaded. Refresh the page to try again.</p>
          )}
        </div>
      </section>

      <form action={logout}>
        <button type="submit" className="btn-outline">
          <LogOut {...icon} />
          Log out
        </button>
      </form>
    </main>
  );
}
