import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

const STEPS = [
  {
    n: "01",
    title: "Measure the piece",
    body: "Pick a sofa, mattress or dresser for typical sizes, or enter your own in inches, centimeters or feet.",
  },
  {
    n: "02",
    title: "Measure the route",
    body: "Doorway width, hallway width and length, and the room. Five numbers from a tape measure.",
  },
  {
    n: "03",
    title: "Walk it through",
    body: "Drag and rotate it around the corner. Walls light up the moment it would scrape, before your movers do.",
  },
];

export default async function Home() {
  const { user } = await getCurrentUser();
  if (user) redirect("/simulator");

  return (
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div className="flex flex-col items-start gap-7">
          <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
            For renters, students and first apartments
          </span>
          <h1 className="display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
            Know it fits <em className="text-accent">before</em> moving&nbsp;day.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-muted">
            Will It Fit? lays out your hallway, doorway and room to scale, so you can test the sofa around the corner on
            screen instead of on the stairs.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Start for free
            </Link>
            <Link href="/login" className="btn-outline px-6 py-3 text-base">
              Log in
            </Link>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            {["Free to use", "No credit card", "Inches, cm or feet"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <FloorPlanPreview />
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="display max-w-xl text-3xl sm:text-4xl">Three measurements away from an answer.</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col gap-3 border-t border-ink/15 pt-6">
                <span className="font-mono text-sm text-accent-strong">{s.n}</span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="leading-relaxed text-ink-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14">
            <Link href="/signup" className="btn-dark px-6 py-3 text-base">
              Try it with your sofa
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-ink-muted sm:px-6">
          <span className="display text-base">Will It Fit?</span>
          <span>A 2D overhead check. Tilting and stairs aren&apos;t modeled yet.</span>
        </div>
      </footer>
    </main>
  );
}

/** Static illustration of the simulator: an L-shaped route with a sofa mid-turn. */
function FloorPlanPreview() {
  return (
    <div className="relative">
      <div className="card overflow-hidden p-3 shadow-[0_30px_60px_-30px_rgba(15,27,54,0.35)]">
        <svg viewBox="0 0 480 340" className="h-auto w-full" role="img" aria-label="Overhead plan of a sofa turning from a hallway through a doorway into a room">
          <rect x="0" y="0" width="480" height="340" rx="10" fill="var(--color-sand)" />
          {/* room */}
          <rect x="150" y="20" width="310" height="200" fill="var(--color-navy-tint)" />
          {/* hallway */}
          <rect x="20" y="232" width="440" height="76" fill="#fff" />
          {/* walls */}
          <g fill="var(--color-ink)">
            <rect x="142" y="12" width="326" height="8" />
            <rect x="142" y="12" width="8" height="220" />
            <rect x="460" y="12" width="8" height="304" />
            <rect x="20" y="220" width="282" height="12" />
            <rect x="392" y="220" width="68" height="12" />
            <rect x="20" y="308" width="448" height="8" />
          </g>
          {/* door */}
          <line x1="302" y1="226" x2="392" y2="226" stroke="var(--color-accent)" strokeWidth="3" strokeDasharray="6 5" />
          {/* sofa mid-turn */}
          <g transform="translate(347 222) rotate(-55)">
            <rect x="-62" y="-22" width="124" height="44" rx="5" fill="var(--color-navy)" opacity="0.92" />
            <text x="0" y="5" textAnchor="middle" fontSize="13" fill="#fff" fontFamily="var(--font-geist-sans)">
              Sofa
            </text>
          </g>
          <text x="162" y="42" fontSize="11" letterSpacing="1" fill="var(--color-ink-muted)" fontFamily="var(--font-geist-sans)">
            BEDROOM
          </text>
          <text x="32" y="276" fontSize="11" letterSpacing="1" fill="var(--color-ink-muted)" fontFamily="var(--font-geist-sans)">
            HALLWAY · 40 IN
          </text>
        </svg>
      </div>
      <div className="absolute -top-4 right-6 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium shadow-sm">
        Doorway <span className="text-accent-strong">32 in</span>
      </div>
      <div className="absolute -bottom-5 left-6 flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-xs" aria-hidden>
          ✓
        </span>
        Fits at 55°, with 1.5 in to spare
      </div>
    </div>
  );
}
