"use client";

import { RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { icon } from "@/components/icon";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <span className="annotation">Something went wrong</span>
      <h1 className="display text-4xl leading-tight">This page didn&apos;t load.</h1>
      <p className="text-lg leading-relaxed text-ink-muted">
        It&apos;s usually a short connection problem. Try again. If it keeps happening, wait a minute and reload.
      </p>
      <div className="flex flex-wrap gap-3">
        <button onClick={reset} className="btn-primary">
          <RotateCw {...icon} />
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Go to the home page
        </Link>
      </div>
      {error.digest && <p className="measure text-xs text-ink-muted">Reference: {error.digest}</p>}
    </main>
  );
}
