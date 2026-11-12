import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { icon } from "@/components/icon";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Will It Fit? Furniture moving simulator",
  description:
    "Enter your doorway, hallway and room measurements, then drag your furniture through a to-scale floor plan to see if it fits before moving day.",
};

const STEPS = [
  {
    title: "Pick the piece",
    body: "Choose a sofa, mattress, dresser or desk for typical sizes, or type in your own. Inches, centimeters or feet.",
  },
  {
    title: "Measure the route",
    body: "Doorway width, hallway width and length, and the room. A tape measure and two minutes.",
  },
  {
    title: "Move it through",
    body: "Drag and rotate it around the corner on a to-scale plan. Any wall it touches turns red.",
  },
];

const LIMITS = [
  "It's an overhead 2D view. Standing a piece on end or tilting it isn't modeled.",
  "Stairs and landings aren't modeled yet.",
  "It checks one piece at a time.",
];

export default async function Home() {
  const { user } = await getCurrentUser();
  if (user) redirect("/simulator");

  return (
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-4 pt-20 pb-28 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:pt-28">
        <div className="flex flex-col items-start gap-8">
          <h1 className="display text-5xl leading-[1.02] sm:text-6xl">Check the sofa fits before you carry it.</h1>
          <p className="max-w-lg text-lg leading-relaxed text-ink-muted">
            Enter your doorway, hallway and room measurements. Drag the piece through a to-scale floor plan. Walls turn
            red wherever it would hit.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-primary px-5 py-3 text-base">
              Create a free account
              <ArrowRight {...icon} />
            </Link>
            <Link href="/login" className="btn-outline px-5 py-3 text-base">
              Log in
            </Link>
          </div>
        </div>
        <PlanFigure />
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-28 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-10">
            <h2 className="display text-4xl leading-tight">Five measurements, one answer.</h2>
            <ol className="flex flex-col">
              {STEPS.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-t border-line py-6 last:border-b">
                  <span className="measure pt-0.5 text-sm text-accent-strong">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="leading-relaxed text-ink-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <figure className="flex flex-col gap-3 self-center">
            <CollisionFigure />
            <figcaption className="text-sm text-ink-muted">
              At 70° the sofa is narrow enough for the doorway, but it sits slightly too far right. It overlaps the door
              frame, so that wall turns red. Nudge it left and the wall clears.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-28 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="display text-3xl leading-tight">What it doesn&apos;t do yet</h2>
          <div className="flex flex-col gap-10">
            <ul className="flex flex-col">
              {LIMITS.map((l) => (
                <li key={l} className="border-t border-line py-4 text-ink-muted last:border-b">
                  {l}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signup" className="btn-dark">
                Create a free account
              </Link>
              <span className="text-sm text-ink-muted">All you need is an email address.</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-ink-muted sm:px-6">
          <span className="display text-base text-ink">Will It Fit?</span>
          <span>A free 2D fit check for furniture, hallways and doorways.</span>
        </div>
      </footer>
    </main>
  );
}

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

/** Dimension line with end ticks and a centered label, drawn like a callout on a floor plan. */
function Dim({ x1, y1, x2, y2, label, color = "var(--color-ink-muted)" }: { x1: number; y1: number; x2: number; y2: number; label: string; color?: string }) {
  const vertical = x1 === x2;
  const t = 5;
  return (
    <g stroke={color} strokeWidth="1" fill={color}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vertical ? (
        <>
          <line x1={x1 - t} y1={y1} x2={x1 + t} y2={y1} />
          <line x1={x2 - t} y1={y2} x2={x2 + t} y2={y2} />
          <text x={x1 - 8} y={(y1 + y2) / 2 + 4} textAnchor="end" fontSize="11" fontFamily={MONO} stroke="none">
            {label}
          </text>
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - t} x2={x1} y2={y1 + t} />
          <line x1={x2} y1={y2 - t} x2={x2} y2={y2 + t} />
          <text x={(x1 + x2) / 2} y={y1 - 8} textAnchor="middle" fontSize="11" fontFamily={MONO} stroke="none">
            {label}
          </text>
        </>
      )}
    </g>
  );
}

/** Hero illustration: the route as the simulator draws it, annotated with the measurements you enter. */
function PlanFigure() {
  return (
    <figure className="card p-4">
      <svg viewBox="0 -30 520 345" className="h-auto w-full" role="img" aria-label="Floor plan of a hallway leading through a 36 inch doorway into a bedroom, with an 84 by 34 inch sofa in the hallway">
        <rect x="0" y="-30" width="520" height="345" fill="var(--color-canvas)" />
        <rect x="180" y="30" width="300" height="190" fill="var(--color-navy-tint)" />
        <rect x="40" y="228" width="440" height="67" fill="#fff" />
        <g fill="var(--color-ink)">
          <rect x="172" y="22" width="316" height="8" />
          <rect x="172" y="22" width="8" height="206" />
          <rect x="480" y="22" width="8" height="281" />
          <rect x="40" y="220" width="320" height="8" />
          <rect x="420" y="220" width="60" height="8" />
          <rect x="40" y="295" width="448" height="8" />
        </g>
        <line x1="360" y1="224" x2="420" y2="224" stroke="var(--color-accent)" strokeWidth="2.5" strokeDasharray="5 4" />

        <rect x="180" y="233" width="140" height="57" fill="var(--color-navy)" />
        <text x="250" y="258" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="var(--font-geist-sans)">Sofa</text>
        <text x="250" y="274" textAnchor="middle" fontSize="10.5" fill="#dbe6ef" fontFamily={MONO}>84 × 34 in</text>

        <path d="M328 262 C 372 262, 392 248, 390 196" fill="none" stroke="var(--color-navy)" strokeWidth="1.25" strokeDasharray="4 4" />
        <path d="M384 204 L390 194 L396 204" fill="none" stroke="var(--color-navy)" strokeWidth="1.25" />

        <Dim x1={180} y1={-6} x2={480} y2={-6} label="ROOM 144 in" />
        <Dim x1={360} y1={208} x2={420} y2={208} label="" color="var(--color-accent-strong)" />
        <text x="350" y="212" textAnchor="end" fontSize="11" fill="var(--color-accent-strong)" fontFamily={MONO}>DOOR 36 in</text>
        <Dim x1={30} y1={228} x2={30} y2={295} label="" />
        <text x="52" y="249" fontSize="10.5" letterSpacing="1" fill="var(--color-ink-muted)" fontFamily={MONO}>HALLWAY</text>
        <text x="52" y="265" fontSize="10.5" fill="var(--color-ink-muted)" fontFamily={MONO}>40 in wide</text>
        <text x="196" y="54" fontSize="10.5" letterSpacing="1" fill="var(--color-ink-muted)" fontFamily={MONO}>BEDROOM</text>
      </svg>
    </figure>
  );
}

/** Close-up of the doorway with the sofa mid-turn, clipping the door frame. */
function CollisionFigure() {
  return (
    <div className="card overflow-hidden">
      <svg viewBox="0 0 520 280" className="h-auto w-full" role="img" aria-label="Close-up of a sofa rotated 70 degrees in a doorway, slightly too far right, so it overlaps the right side of the door frame, which is shown in red">
        <rect width="520" height="280" fill="var(--color-canvas)" />
        <rect x="0" y="0" width="520" height="140" fill="var(--color-navy-tint)" />
        <rect x="0" y="152" width="520" height="108" fill="#fff" />
        <rect x="0" y="140" width="230" height="12" fill="var(--color-ink)" />
        <rect x="320" y="140" width="200" height="12" fill="var(--color-danger)" />
        <rect x="0" y="260" width="520" height="12" fill="var(--color-ink)" />
        <line x1="230" y1="146" x2="320" y2="146" stroke="var(--color-accent)" strokeWidth="2.5" strokeDasharray="5 4" />

        <g transform="translate(287 146) rotate(-70)">
          <rect x="-100" y="-40" width="200" height="80" fill="var(--color-danger)" opacity="0.88" />
          <text x="0" y="5" textAnchor="middle" fontSize="13" fill="#fff" fontFamily="var(--font-geist-sans)">Sofa</text>
        </g>

        <line x1="326" y1="146" x2="420" y2="92" stroke="var(--color-ink)" strokeWidth="1" />
        <circle cx="326" cy="146" r="3" fill="var(--color-ink)" />
        <text x="424" y="88" fontSize="12" fill="var(--color-ink)" fontFamily="var(--font-geist-sans)">Door frame</text>
        <text x="424" y="104" fontSize="11" fill="var(--color-danger)" fontFamily={MONO}>COLLISION</text>
        <text x="20" y="236" fontSize="11" fill="var(--color-ink-muted)" fontFamily={MONO}>ANGLE 70°</text>
      </svg>
    </div>
  );
}
