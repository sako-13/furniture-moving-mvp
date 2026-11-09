import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const { user, profile } = await getCurrentUser();
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Will It Fit?
        </Link>
        {user ? (
          <Link href="/account" className="truncate text-sm text-slate-700 hover:text-indigo-600">
            {profile?.display_name || user.email}
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">
              Log in
            </Link>
            <Link href="/signup" className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
