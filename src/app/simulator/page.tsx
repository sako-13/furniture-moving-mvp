import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MoveSimulator from "@/components/MoveSimulator";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Simulator | Will It Fit?",
  description: "Drag and rotate your furniture through a to-scale hallway and doorway to see if it fits.",
};

export default async function SimulatorPage() {
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/login?next=/simulator");

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="display text-4xl sm:text-5xl">Will it fit?</h1>
        <p className="max-w-2xl text-ink-muted">
          Enter the piece and the route. Then drag and rotate it from the hallway into the room. Walls turn red where
          it would hit.
        </p>
      </header>
      <MoveSimulator initialUnit={profile?.preferred_unit} />
    </main>
  );
}
