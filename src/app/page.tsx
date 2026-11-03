import MoveSimulator from "@/components/MoveSimulator";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Will It Fit?</h1>
        <p className="text-slate-600">
          Enter your furniture and the route it has to travel, then drag and rotate it through the hallway and into the
          room. Walls turn red wherever it would hit.
        </p>
      </header>
      <MoveSimulator />
    </main>
  );
}
