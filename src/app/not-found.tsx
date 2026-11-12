import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Page not found | Will It Fit?",
  description: "This page doesn't exist.",
};

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-5xl items-center gap-14 px-4 py-24 sm:px-6 md:grid-cols-[1fr_1fr]">
      <div className="flex flex-col items-start gap-6">
        <span className="annotation">Error 404</span>
        <h1 className="display text-5xl leading-[1.05]">This hallway is a dead end.</h1>
        <p className="max-w-md text-lg leading-relaxed text-ink-muted">
          The page you&apos;re looking for doesn&apos;t exist. The link may be old or mistyped.
        </p>
        <Link href="/" className="btn-primary">
          <ArrowLeft {...icon} />
          Back to the home page
        </Link>
      </div>
      <div className="card p-4">
        <svg viewBox="0 0 400 220" className="h-auto w-full" role="img" aria-label="Floor plan of a hallway closed off at the far end, with no door">
          <rect width="400" height="220" fill="var(--color-canvas)" />
          <rect x="20" y="70" width="340" height="80" fill="#fff" />
          <rect x="20" y="62" width="348" height="8" fill="var(--color-ink)" />
          <rect x="20" y="150" width="348" height="8" fill="var(--color-ink)" />
          <rect x="360" y="62" width="8" height="96" fill="var(--color-danger)" />
          <text x="34" y="92" fontSize="11" letterSpacing="1" fill="var(--color-ink-muted)" fontFamily="var(--font-geist-mono), monospace">
            HALLWAY
          </text>
          <text x="352" y="186" textAnchor="end" fontSize="11" fill="var(--color-danger)" fontFamily="var(--font-geist-mono), monospace">
            NO DOOR
          </text>
          <line x1="364" y1="160" x2="364" y2="174" stroke="var(--color-danger)" strokeWidth="1" />
        </svg>
      </div>
    </main>
  );
}
