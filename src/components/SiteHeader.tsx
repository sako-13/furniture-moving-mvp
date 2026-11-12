import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Will It Fit? home">
      <span className="grid h-7 w-7 place-items-center rounded-sm bg-ink" aria-hidden>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="#fff" strokeWidth="1.75">
          <path d="M3 17V8l7-5 7 5v9" />
          <rect x="7" y="11" width="6" height="6" fill="var(--color-accent)" stroke="none" />
        </svg>
      </span>
      <span className="display text-lg">Will It Fit?</span>
    </Link>
  );
}

const navLink = "rounded-md px-3 py-2 text-ink hover:bg-sand";

export default async function SiteHeader() {
  const { user, profile } = await getCurrentUser();
  const name = profile?.display_name || user?.email || "";

  return (
    <header className="border-b border-line bg-canvas">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        {user ? (
          <nav aria-label="Main" className="flex items-center gap-1 text-sm">
            <Link href="/simulator" className={navLink}>
              Simulator
            </Link>
            <Link href="/account" className="flex items-center gap-2 rounded-md py-1 pr-3 pl-1 text-ink hover:bg-sand">
              <span
                className="grid h-7 w-7 place-items-center rounded-full bg-navy text-xs font-semibold text-white uppercase"
                aria-hidden
              >
                {name.charAt(0)}
              </span>
              <span className="hidden max-w-40 truncate sm:inline">{name}</span>
              <span className="sr-only sm:hidden">Account</span>
            </Link>
          </nav>
        ) : (
          <nav aria-label="Main" className="flex items-center gap-1 text-sm">
            <Link href="/login" className={navLink}>
              Log in
            </Link>
            <Link href="/signup" className="btn-primary px-3.5 py-2">
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
