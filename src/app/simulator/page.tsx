import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MoveSimulator from "@/components/MoveSimulator";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Simulator — Will It Fit?" };

export default async function SimulatorPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/simulator");

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="display text-4xl sm:text-5xl">Will it fit?</h1>
        <p className="max-w-2xl text-ink-muted">
          Enter the piece and the route, then drag and rotate it from the hallway into the room. Walls turn red
          wherever it would hit.
        </p>
      </header>
      <MoveSimulator initialUnit={profile?.preferred_unit} />
    </main>
  );
}
